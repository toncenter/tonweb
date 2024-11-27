const {Cell} = require("../../boc");
const {Contract} = require("../index.js");
const {Address, BN, nacl} = require("../../utils");

// https://github.com/ton-blockchain/highload-wallet-contract-v3, tag 'v3.00'
const CODE_HEX = "b5ee9c7241021001000228000114ff00f4a413f4bcf2c80b01020120020d02014803040078d020d74bc00101c060b0915be101d0d3030171b0915be0fa4030f828c705b39130e0d31f018210ae42e5a4ba9d8040d721d74cf82a01ed55fb04e030020120050a02027306070011adce76a2686b85ffc00201200809001aabb6ed44d0810122d721d70b3f0018aa3bed44d08307d721d70b1f0201200b0c001bb9a6eed44d0810162d721d70b15800e5b8bf2eda2edfb21ab09028409b0ed44d0810120d721f404f404d33fd315d1058e1bf82325a15210b99f326df82305aa0015a112b992306dde923033e2923033e25230800df40f6fa19ed021d721d70a00955f037fdb31e09130e259800df40f6fa19cd001d721d70a00937fdb31e0915be270801f6f2d48308d718d121f900ed44d0d3ffd31ff404f404d33fd315d1f82321a15220b98e12336df82324aa00a112b9926d32de58f82301de541675f910f2a106d0d31fd4d307d30cd309d33fd315d15168baf2a2515abaf2a6f8232aa15250bcf2a304f823bbf2a35304800df40f6fa199d024d721d70a00f2649130e20e01fe5309800df40f6fa18e13d05004d718d20001f264c858cf16cf8301cf168e1030c824cf40cf8384095005a1a514cf40e2f800c94039800df41704c8cbff13cb1ff40012f40012cb3f12cb15c9ed54f80f21d0d30001f265d3020171b0925f03e0fa4001d70b01c000f2a5fa4031fa0031f401fa0031fa00318060d721d300010f0020f265d2000193d431d19130e272b1fb00b585bf03";
const HIGHLOAD_WALLET_SUBWALLET_ID = 0x10ad;

const checkTimeout = (seconds) => {
    if (!seconds) throw new Error('invalid timeout');
    if (seconds < 60 * 10) throw new Error('minimum timeout 10 minute');
    if (seconds > 60 * 60 * 24 * 30) throw new Error('maximum timeout 30 days');
}

class HighloadWalletContractV3 extends Contract {

    /**
     * @param provider    {HttpProvider}
     * @param options
     * @param options.[publicKey] {Uint8Array}
     * @param options.[timeout] {number}
     * @param options.[walletId] {number}
     * @param options.[address] {Address | string}
     */
    constructor(provider, options) {
        if (options.wc) throw new Error('only basechain (wc = 0) supported');
        options.wc = 0;
        if (!options.address) {
            if (!options.publicKey) throw new Error('no publicKey');
            if (!(options.publicKey instanceof Uint8Array)) throw new Error('publicKey not Uint8Array');
            checkTimeout(options.timeout);
        }
        options.code = Cell.oneFromBoc(CODE_HEX);
        super(provider, options);
        if (!this.options.walletId) this.options.walletId = HIGHLOAD_WALLET_SUBWALLET_ID;

        this.methods = {
            /**
             * @param   params {{secretKey: Uint8Array, queryId: HighloadQueryId, createdAt: number, toAddress: Address | string, amount: BN, payload?: string | Uint8Array | Cell, sendMode?: number, needDeploy?: boolean }}
             */
            transfer: (params) => Contract.createMethod(provider, this.createTransferMessage(params.secretKey, params.toAddress, params.amount, params.queryId, params.payload, params.sendMode, params.createdAt, params.needDeploy)),
        }

        this.methods.getPublicKey = this.getPublicKey.bind(this);
        this.methods.getWalletId = this.getWalletId.bind(this);
        this.methods.getLastCleanTime = this.getLastCleanTime.bind(this);
        this.methods.getTimeout = this.getTimeout.bind(this);
        this.methods.isProcessed = this.isProcessed.bind(this);
    }

    getName() {
        return 'highload-3';
    }

    /**
     * @override
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
        if (this.options.walletId !== 0 && !this.options.walletId) throw new Error('no walletId');
        if (!this.options.publicKey) throw new Error('no publicKey');
        if (!(this.options.publicKey instanceof Uint8Array)) throw new Error('publicKey not Uint8Array');
        checkTimeout(this.options.timeout);

        const cell = new Cell();
        cell.bits.writeBytes(this.options.publicKey);
        cell.bits.writeUint(this.options.walletId, 32);
        cell.bits.writeUint(0, 1); // empty old_queries
        cell.bits.writeUint(0, 1); // empty queries
        cell.bits.writeUint(0, 64); // last_clean_time
        cell.bits.writeUint(this.options.timeout, 22);
        return cell;
    }

    /**
     * @private
     * @param queryId   {HighloadQueryId}
     * @param createdAt {number}
     * @param sendMode  {number}
     * @param messageToSend {Cell}
     * @return {Cell}
     */
    createSigningMessage(queryId, createdAt, sendMode, messageToSend) {
        if (isNaN(sendMode) || sendMode === undefined || sendMode === null) throw new Error('invalid sendMode');
        if (isNaN(createdAt) || createdAt === undefined || createdAt === null) throw new Error('invalid createdAt');
        checkTimeout(this.options.timeout);

        const cell = new Cell();
        cell.bits.writeUint(this.options.walletId, 32);
        cell.refs.push(messageToSend);
        cell.bits.writeUint(sendMode, 8);
        cell.bits.writeUint(Number(queryId.getShift()), 13);
        cell.bits.writeUint(Number(queryId.getBitNumber()), 10);
        cell.bits.writeUint(createdAt, 64);
        cell.bits.writeUint(this.options.timeout, 22);
        return cell;
    }

    /**
     * @param secretKey {Uint8Array}  nacl.KeyPair.secretKey
     * @param address   {Address | string}
     * @param amount    {BN | number} in nanotons
     * @param queryId {HighloadQueryId}
     * @param [payload]   {string | Uint8Array | Cell}
     * @param [sendMode]  {number}
     * @param createAt {number}
     * @param [needDeploy] {boolean}
     * @return {Promise<{address: Address, signature: Uint8Array, message: Cell, cell: Cell, body: Cell, signingMessage: Cell}>}
     */
    async createTransferMessage(
        secretKey,
        address,
        amount,
        queryId,
        payload = "",
        sendMode = 3,
        createAt,
        needDeploy = false
    ) {
        if (queryId === null || queryId === undefined) {
            throw new Error('queryId must be number >= 0')
        }
        if (createAt === null || createAt === undefined || createAt < 0) {
            throw new Error('createAt must be number >= 0')
        }
        if (sendMode === null || sendMode === undefined) {
            sendMode = 3;
        }
        const messageToSend = Contract.createOutMsg(address, amount, payload);
        const signingMessage = this.createSigningMessage(queryId, createAt, sendMode, messageToSend);

        return this.createExternalMessage(signingMessage, secretKey, needDeploy);
    }

    /**
     * @protected
     * @param signingMessage {Cell}
     * @param secretKey {Uint8Array}  nacl.KeyPair.secretKey
     * @param needDeploy {boolean}
     * @return {Promise<{address: Address, signature: Uint8Array, message: Cell, cell: Cell, body: Cell, signingMessage: Cell}>}
     */
    async createExternalMessage(
        signingMessage,
        secretKey,
        needDeploy
    ) {
        const signature = nacl.sign.detached(await signingMessage.hash(), secretKey);

        const body = new Cell();
        body.bits.writeBytes(signature);
        body.refs.push(signingMessage);

        let stateInit = null, code = null, data = null;

        if (needDeploy) {
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
     * @return {Promise<number>}
     */
    async getWalletId() {
        const myAddress = await this.getAddress();
        const id = await this.provider.call2(myAddress.toString(), 'get_subwallet_id');
        return id.toNumber();
    }

    /**
     * @return {Promise<BN>}
     */
    async getPublicKey() {
        const myAddress = await this.getAddress();
        return this.provider.call2(myAddress.toString(), 'get_public_key');
    }

    /**
     * @return {Promise<number>}
     */
    async getLastCleanTime() {
        const myAddress = await this.getAddress();
        const id = await this.provider.call2(myAddress.toString(), 'get_last_clean_time');
        return id.toNumber();
    }

    /**
     * @return {Promise<number>}
     */
    async getTimeout() {
        const myAddress = await this.getAddress();
        const id = await this.provider.call2(myAddress.toString(), 'get_timeout');
        return id.toNumber();
    }

    /**
     * @param queryId {HighloadQueryId}
     * @param needClean {boolean}
     * @return {Promise<boolean>}
     */
    async isProcessed(queryId, needClean) {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'processed?', [['num', queryId.getQueryId().toString()], ['num', needClean ? '-1' : '0']]);
        return !result.isZero();
    }

}

HighloadWalletContractV3.WALLET_ID_BASE = HIGHLOAD_WALLET_SUBWALLET_ID;
HighloadWalletContractV3.codeHex = CODE_HEX;

module.exports = {HighloadWalletContractV3};
