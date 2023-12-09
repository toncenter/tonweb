const {Contract} = require("../index.js");
const {Cell} = require("../../boc");
const {nacl, stringToBytes, Address, BN} = require("../../utils");

/**
 * Abstract standard wallet class
 */
class WalletContract extends Contract {
    /**
     * @param provider    {HttpProvider}
     * @param options?    {{code: Cell, publicKey?: Uint8Array, address?: Address | string, wc?: number}}
     */
    constructor(provider, options) {
        if (!options.publicKey && !options.address) throw new Error('WalletContract required publicKey or address in options')
        super(provider, options);

        this.methods = {
            /**
             * @param   params {{secretKey: Uint8Array, seqno: number, expireAt?: number, toAddress: Address | string, amount: BN, payload?: string | Uint8Array | Cell, sendMode?: number, stateInit?: Cell }}
             */
            transfer: (params) => Contract.createMethod(provider, this.createTransferMessage(params.secretKey, params.toAddress, params.amount, params.seqno, params.payload, params.sendMode, !Boolean(params.secretKey), params.stateInit, params.expireAt)),

            /**
             * @param   params {{secretKey: Uint8Array, seqno: number, expireAt?: number, messages: [{toAddress: Address | string, amount: BN, payload?: string | Uint8Array | Cell, sendMode?: number, stateInit?: Cell }]}}
             */
            transfers: (params) => Contract.createMethod(provider, this.createTransferMessages(params.secretKey, params.seqno, params.messages, !Boolean(params.secretKey), params.expireAt)),

            seqno: () => {
                return {
                    /**
                     * @return {Promise<number|null>}
                     */
                    call: async () => {
                        const address = await this.getAddress();
                        let n = null;
                        try {
                            n = (await provider.call2(address.toString(), 'seqno')).toNumber();
                        } catch (e) {
                        }
                        return n;
                    }
                }
            }
        }

        /**
         * @param secretKey {Uint8Array}
         */
        this.deploy = (secretKey) => Contract.createMethod(provider, this.createInitExternalMessage(secretKey));
    }

    getName() {
        throw new Error('override me');
    }

    /**
     * @override
     * @protected
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
        // 4 byte seqno, 32 byte publicKey
        const cell = new Cell();
        cell.bits.writeUint(0, 32); // seqno
        cell.bits.writeBytes(this.options.publicKey);
        return cell;
    }

    /**
     * @protected
     * @param   seqno?   {number}
     * @return {Cell}
     */
    createSigningMessage(seqno) {
        seqno = seqno || 0;
        const cell = new Cell();
        cell.bits.writeUint(seqno, 32);
        return cell;
    }

    /**
     * External message for initialization
     * @param secretKey  {Uint8Array} nacl.KeyPair.secretKey
     * @return {{address: Address, message: Cell, body: Cell, sateInit: Cell, code: Cell, data: Cell}}
     */
    async createInitExternalMessage(secretKey) {
        if (!this.options.publicKey) {
            const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey)
            this.options.publicKey = keyPair.publicKey;
        }
        const {stateInit, address, code, data} = await this.createStateInit();

        const signingMessage = this.createSigningMessage();
        const signature = nacl.sign.detached(await signingMessage.hash(), secretKey);

        const body = new Cell();
        body.bits.writeBytes(signature);
        body.writeCell(signingMessage);

        const header = Contract.createExternalMessageHeader(address);
        const externalMessage = Contract.createCommonMsgInfo(header, stateInit, body);

        return {
            address: address,
            message: externalMessage,

            body,
            signingMessage,
            stateInit,
            code,
            data,
        };
    }

    /**
     * @protected
     * @param signingMessage {Cell}
     * @param secretKey {Uint8Array}  nacl.KeyPair.secretKey
     * @param seqno {number}
     * @param dummySignature?    {boolean}
     * @return {Promise<{address: Address, signature: Uint8Array, message: Cell, cell: Cell, body: Cell, resultMessage: Cell}>}
     */
    async createExternalMessage(
        signingMessage,
        secretKey,
        seqno,
        dummySignature = false
    ) {
        const signature = dummySignature ? new Uint8Array(64) : nacl.sign.detached(await signingMessage.hash(), secretKey);

        const body = new Cell();
        body.bits.writeBytes(signature);
        body.writeCell(signingMessage);

        let stateInit = null, code = null, data = null;

        if (seqno === 0) {
            if (!this.options.publicKey) {
                const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey)
                this.options.publicKey = keyPair.publicKey;
            }
            const deploy = await this.createStateInit();
            stateInit = deploy.stateInit;
            code = deploy.code;
            data = deploy.data;
        }

        const selfAddress = await this.getAddress();
        const header = Contract.createExternalMessageHeader(selfAddress);
        const resultMessage = Contract.createCommonMsgInfo(header, stateInit, body);

        return {
            address: selfAddress,
            message: resultMessage, // old wallet_send_generate_external_message

            body: body,
            signature: signature,
            signingMessage: signingMessage,

            stateInit,
            code,
            data,
        };
    }

    /**
     * @param secretKey {Uint8Array}  nacl.KeyPair.secretKey
     * @param address   {Address | string}
     * @param amount    {BN | number} in nanotons
     * @param seqno {number}
     * @param payload?   {string | Uint8Array | Cell}
     * @param sendMode?  {number}
     * @param dummySignature?    {boolean}
     * @param stateInit? {Cell}
     * @param expireAt? {number}
     * @return {Promise<{address: Address, signature: Uint8Array, message: Cell, cell: Cell, body: Cell, resultMessage: Cell}>}
     */
    async createTransferMessage(
        secretKey,
        address,
        amount,
        seqno,
        payload = "",
        sendMode = 3,
        dummySignature = false,
        stateInit = null,
        expireAt = undefined
    ) {
        if (seqno === null || seqno === undefined || seqno < 0) {
            throw new Error('seqno must be number >= 0')
        }
        const signingMessage = this.createSigningMessage(seqno, expireAt);
        if (sendMode === null || sendMode === undefined) {
            sendMode = 3;
        }
        signingMessage.bits.writeUint8(sendMode);
        signingMessage.refs.push(Contract.createOutMsg(address, amount, payload, stateInit));

        return this.createExternalMessage(signingMessage, secretKey, seqno, dummySignature);
    }

    /**
     * @param secretKey {Uint8Array}  nacl.KeyPair.secretKey
     * @param seqno {number}
     * @param messages {[{toAddress: Address | string, amount: BN, payload?: string | Uint8Array | Cell, sendMode?: number, stateInit?: Cell }]} up to 4 messages
     * @param dummySignature?    {boolean}
     * @param expireAt? {number}
     * @return {Promise<{address: Address, signature: Uint8Array, message: Cell, cell: Cell, body: Cell, resultMessage: Cell}>}
     */
    async createTransferMessages(
        secretKey,
        seqno,
        messages,
        dummySignature = false,
        expireAt = undefined,
    ) {
        if (seqno === null || seqno === undefined || seqno < 0) {
            throw new Error('seqno must be number >= 0')
        }
        const signingMessage = this.createSigningMessage(seqno, expireAt);
        if (messages.length < 1 || messages.length > 4) {
            throw new Error('put 1-4 messages');
        }
        for (const msg of messages) {
            let sendMode = msg.sendMode;
            if (sendMode === null || sendMode === undefined) {
                sendMode = 3;
            }
            signingMessage.bits.writeUint8(sendMode);
            signingMessage.refs.push(Contract.createOutMsg(msg.toAddress, msg.amount, msg.payload, msg.stateInit));
        }
        return this.createExternalMessage(signingMessage, secretKey, seqno, dummySignature);
    }
}

module.exports = {WalletContract};
