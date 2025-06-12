const { Cell } = require("../../boc/index.js");
const { Contract } = require("../index.js");
const { Address, bytesToHex, BN, toNano, nacl } = require("../../utils/index.js");
const { WalletContract } = require("./WalletContract.js");
const { parseWalletV3TransferQuery, parseWalletV3TransferBody } = require("./WalletQueryParser.js");

const Opcodes = {
    action_send_msg: 0x0ec3c86d,
    action_set_code: 0xad4de08e,
    action_extended_set_data: 0x1ff8ea0b,
    action_extended_add_extension: 0x02,
    action_extended_remove_extension: 0x03,
    action_extended_set_signature_auth_allowed: 0x04,
    auth_extension: 0x6578746e,
    auth_signed_external: 0x7369676e,
    auth_signed_internal: 0x73696e74
};

const AuthTypes = { internal: 'internal', external: 'external', extension: 'extension' };
const walletV5BetaVersionsSerialisation = {
    v5R1: 0
};

/**
 * @function getWalletIdV5R1
 * @param   walletId {object}
 * @param   walletId.networkGlobalId   {number}
 * @param   walletId.workChain   {number}
 * @param   walletId.walletVersion {number}
 * @param   walletId.subwalletNumber {number}
 * @return {BigInt}
 */
function getWalletIdV5R1(walletId) {
    const cell = new Cell();
    cell.bits.writeUint(1, 1);
    cell.bits.writeInt(walletId.workChain, 8);
    cell.bits.writeUint(walletV5BetaVersionsSerialisation[walletId.walletVersion], 8);
    cell.bits.writeUint(walletId.subwalletNumber, 16);
    const slice = cell.beginParse()
    const ctx = slice.loadInt(32);
    const bnValue = BigInt(walletId.networkGlobalId) ^ BigInt(ctx)
    return bnValue;
}

class WalletId {
    static versionsSerialisation = {
        v5R1: 0
    };

    walletVersion = 'v5R1';
    networkGlobalId //  -239 is mainnet, -3 is testnet
    workChain // 0 or -1;
    subwalletNumber // default 0;
    serialized // calculated bigint;

    constructor({
        networkGlobalId,
        workChain,
        subwalletNumber,
        walletVersion
    }) {
        this.networkGlobalId = networkGlobalId ?? -239;
        this.workChain = workChain ?? 0;
        this.subwalletNumber = subwalletNumber ?? 0;
        this.walletVersion = walletVersion ?? 'v5R1';

        this.serialized = getWalletIdV5R1(this)
    }
}

class WalletV5Contract extends WalletContract {

    /**
     * @param provider    {HttpProvider}
     * @param options {any}
     */
    constructor(provider, options = {}) {
        options.code = Cell.oneFromBoc("b5ee9c7241021401000281000114ff00f4a413f4bcf2c80b01020120020d020148030402dcd020d749c120915b8f6320d70b1f2082106578746ebd21821073696e74bdb0925f03e082106578746eba8eb48020d72101d074d721fa4030fa44f828fa443058bd915be0ed44d0810141d721f4058307f40e6fa1319130e18040d721707fdb3ce03120d749810280b99130e070e2100f020120050c020120060902016e07080019adce76a2684020eb90eb85ffc00019af1df6a2684010eb90eb858fc00201480a0b0017b325fb51341c75c875c2c7e00011b262fb513435c280200019be5f0f6a2684080a0eb90fa02c0102f20e011e20d70b1f82107369676ebaf2e08a7f0f01e68ef0eda2edfb218308d722028308d723208020d721d31fd31fd31fed44d0d200d31f20d31fd3ffd70a000af90140ccf9109a28945f0adb31e1f2c087df02b35007b0f2d0845125baf2e0855036baf2e086f823bbf2d0882292f800de01a47fc8ca00cb1f01cf16c9ed542092f80fde70db3cd81003f6eda2edfb02f404216e926c218e4c0221d73930709421c700b38e2d01d72820761e436c20d749c008f2e09320d74ac002f2e09320d71d06c712c2005230b0f2d089d74cd7393001a4e86c128407bbf2e093d74ac000f2e093ed55e2d20001c000915be0ebd72c08142091709601d72c081c12e25210b1e30f20d74a111213009601fa4001fa44f828fa443058baf2e091ed44d0810141d718f405049d7fc8ca0040048307f453f2e08b8e14038307f45bf2e08c22d70a00216e01b3b0f2d090e2c85003cf1612f400c9ed54007230d72c08248e2d21f2e092d200ed44d0d2005113baf2d08f54503091319c01810140d721d70a00f2e08ee2c8ca0058cf16c9ed5493f2c08de20010935bdb31e1d74cd0b4d6c35e");
        const walletIdBn = new WalletId(options).serialized; // 2147483409 prod, 2147483645 testnet
        options.walletId = walletIdBn
        super(provider, options);

        this.methods.getPublicKey = this.getPublicKey.bind(this);
        this.methods.getWalletId = this.getWalletId.bind(this);
    }

    getName() {
        return 'v5R1';
    }

    /**
 * @override
 * @return {Cell} cell contains wallet data
 */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeBit(1); // signatureAllowed: true by default
        cell.bits.writeUint(0, 32); // seqno
        cell.bits.writeUint(Number(this.options.walletId.toString()), 32);
        cell.bits.writeBytes(this.options.publicKey);
        cell.bits.writeUint(0, 1); // plugins/extensions dict empty
        return cell;
    }

    /**
     * @override
     * @private
     * @param   seqno?   {number}
     * @param   expireAt? {number}
     * @param   authType? {string} 'internal' or 'external'
     * @return {Cell}
     */
    createSigningMessage(seqno, expireAt, authType = AuthTypes.external) {
        seqno = seqno || 0;
        expireAt = expireAt || (Math.floor(Date.now() / 1e3) + 60);
        const message = new Cell();
        if (authType === AuthTypes.extension) {
            message.bits.writeUint(Opcodes.auth_extension, 32)
            message.bits.writeUint(0, 64)
            return message;
        }
        message.bits.writeUint(authType === AuthTypes.internal
            ? Opcodes.auth_signed_internal
            : Opcodes.auth_signed_external, 32)

        message.bits.writeUint(Number(this.options.walletId), 32);
        if (seqno === 0) {
            for (let i = 0; i < 32; i++) {
                message.bits.writeBit(1);
            }
        } else {
            message.bits.writeUint(expireAt, 32);
        }
        message.bits.writeUint(seqno, 32);
        return message;
    }

    /**
 * @override
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
        body.writeCell(signingMessage);
        body.bits.writeBytes(signature);

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
        const resultMessage = Contract.createCommonMsgInfo(header, stateInit, body, true);

        return {
            address: selfAddress,
            message: resultMessage,

            body: body,
            signature: signature,
            signingMessage: signingMessage,

            stateInit,
            code,
            data,
        };
    }

    /**
    * @override
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
        signingMessage.bits.writeBit(1) // has basic actions

        const msgCell = Contract.createOutMsg(address, amount, payload, stateInit);
        const actionsCell = this.createOutBasicAction(sendMode, msgCell);
        signingMessage.refs.push(actionsCell);

        signingMessage.bits.writeBit(0); // no extended actions

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
        signingMessage.bits.writeBit(1); // has basic actions

        const actionsCell = this.createOutBasicActions(messages);
        signingMessage.refs.push(actionsCell);

        signingMessage.bits.writeBit(0); // no extended actions
        return this.createExternalMessage(signingMessage, secretKey, seqno, dummySignature);
    }

    /**
     * @param sendMode {number}
     * @param msgCell {Cell}
     * @param innerCell? {Cell}
     * @return {Cell}
     */
    createOutBasicAction(sendMode, msgCell, innerCell) {
        const cell = new Cell();
        cell.bits.writeUint(Opcodes.action_send_msg, 32);
        cell.bits.writeUint8(sendMode);
        const _innerCell = innerCell || new Cell()
        cell.refs.push(_innerCell);
        cell.refs.push(msgCell);
        return cell;
    }

    /**
     * @param messages {[{toAddress: Address | string, amount: BN, payload?: string | Uint8Array | Cell, sendMode?: number, stateInit?: Cell }]} up to 4 messages
     * @return {Cell}
     */
    createOutBasicActions(messages) {
        const cell = messages.reverse().reduce((acc, msg) => {
            let msgSendMode = msg.sendMode;
            if (msgSendMode === null || msgSendMode === undefined) {
                msgSendMode = 3;
            }
            const msgCell = Contract.createOutMsg(msg.toAddress, msg.amount, msg.payload, msg.stateInit);
            const actionMsgCell = this.createOutBasicAction(msgSendMode, msgCell, acc);
            return actionMsgCell;
        }, new Cell())
        return cell;
    }

    /**
     * create message from an extension (v5 standard)
     * @param {object} opts - { value: BN, body: Cell }
     */
    async messageFromExtension(opts) {
        return {
            value: opts.value,
            sendMode: 64, // SendMode.PAY_GAS_SEPARATELY
            body: (() => {
                const cell = new Cell();
                cell.bits.writeUint(Opcodes.auth_extension, 32); // Opcodes.auth_extension
                cell.bits.writeUint(0, 64); // query id
                cell.writeCell(opts.body);
                return cell;
            })()
        }
    }

    /**
     * @return {Promise<string>}
     */
    async getWalletId() {
        const myAddress = await this.getAddress();
        const id = await this.provider.call2(myAddress.toString(), 'get_subwallet_id');
        return id.toString();
    }

    /**
     * @return {Promise<string>}
     */
    async getPublicKey() {
        const myAddress = await this.getAddress();
        const publicKey = await this.provider.call2(myAddress.toString(), 'get_public_key');
        return publicKey.toString();
    }

    /**
     * @return {Promise<number>} seqno
     */
    async getSeqno() {
        const myAddress = await this.getAddress();
        const state = await this.provider.call2(myAddress.toString(), 'seqno');
        return state.toNumber();
    }

    /**
     * @return {Promise<number>} 1 if signature auth allowed, 0 if not, -1 if not active
     */
    async getIsSignatureAuthAllowed() {
        const myAddress = await this.getAddress();
        try {
            const state = await this.provider.call2(myAddress.toString(), 'is_signature_allowed');
            return state.toNumber();
        } catch (e) {
            return -1;
        }
    }

    /**
     * @return {Promise<Cell>} raw extensions dict cell
     */
    async getExtensions() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_extensions');
        return result;
    }

    /**
     * @return {Promise<string[]>} list of extension addresses
     */
    async getExtensionsList() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_extensions');
        // Parse dict if needed, here just return as is for compatibility
        return result;
    }
    /* TODO: add createAddExtension, createRemoveExtension */
}

WalletV5Contract.parseTransferQuery = parseWalletV3TransferQuery;
WalletV5Contract.parseTransferBody = parseWalletV3TransferBody;
WalletV5Contract.Opcodes = Opcodes;

module.exports = { WalletV5Contract };
