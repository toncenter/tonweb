const {Cell} = require("../../boc");
const {Address, BN, toNano, bytesToHex, hexToBytes, nacl, stringToBytes, bytesToBase64} = require("../../utils");
const {Contract} = require("../index.js");

function createCell(code) {
    return Cell.fromBoc(hexToBytes(code))[0];
}

async function queryWrapper(queryPromise) {
    const query = await queryPromise;
    const legacyQuery = query.code ? // deploy
        {
            address: query.address.toString(true, true, false),
            body: query.body.toObject(),
            init_code: query.code.toObject(),
            init_data: query.data.toObject(),
        } : {
            address: query.address.toString(true, true, true),
            body: query.body.toObject(),
        }

    return {query, legacyQuery};
}

function methodWrapper(provider, createQueryPromise) {
    return {
        getQuery: async () => {
            return (await createQueryPromise).query.message;
        },
        send: async () => {
            const query = (await createQueryPromise).query;
            const boc = bytesToBase64(await query.message.toBoc(false));
            return provider.sendBoc(boc);
        },
        estimateFee: async () => {
            const legacyQuery = (await createQueryPromise).legacyQuery;
            return provider.getEstimateFee(legacyQuery); // todo: get fee by boc
        }
    }
}

/**
 * Abstract standard wallet class
 */
class WalletContract extends Contract {
    /**
     * @param provider    {HttpProvider}
     * @param options?    {{code: Uint8Array, publicKey?: Uint8Array, address?: Address | string, wc?: number}}
     */
    constructor(provider, options) {
        if (!options.publicKey && !options.address) throw new Error('WalletContract required publicKey or address in options')
        super(provider, options);

        this.methods = {
            /**
             * @param   params {{secretKey: Uint8Array, toAddress: Address | string, amount: BN | number, seqno: number, payload: string | Uint8Array, sendMode: number}}
             */
            transfer: (params) => {

                const createQuery = async () => {
                    const query = await this.createTransferMessage(params.secretKey, params.toAddress, params.amount, params.seqno, params.payload, params.sendMode, !Boolean(params.secretKey));
                    const legacyQuery = query.code ? // deploy
                        {
                            address: query.address.toString(true, true, false),
                            body: query.body.toObject(),
                            init_code: query.code.toObject(),
                            init_data: query.data.toObject(),
                        } : {
                            address: query.address.toString(true, true, true),
                            body: query.body.toObject(),
                        }

                    return {query, legacyQuery};
                }

                const promise = createQuery();

                return {
                    getQuery: async () => {
                        return (await promise).query.message;
                    },
                    send: async () => {
                        const query = (await promise).query;
                        const boc = bytesToBase64(await query.message.toBoc(false));
                        return provider.sendBoc(boc);
                    },
                    estimateFee: async () => {
                        const legacyQuery = (await promise).legacyQuery;
                        return provider.getEstimateFee(legacyQuery); // todo: get fee by boc
                    }
                }
            },
            seqno: () => {
                return {
                    /**
                     * @return {Promise<number>}
                     */
                    call: async () => {
                        const address = await this.getAddress();
                        const result = await provider.call(address.toString(false), 'seqno', []);
                        let n = null;
                        try {
                            if (result.exit_code !== 0) throw new Error(result);
                            n = parseInt(result.stack[0][1], 16);
                        } catch (e) {

                        }
                        return n;
                    }
                }
            }
        }
    }

    getName() {
        throw new Error('override me');
    }

    /**
     * @override
     * @private
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
     * @override
     * @private
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
     * @param amount    {BN | number} in nanograms
     * @param seqno {number}
     * @param payload   {string | Uint8Array}
     * @param sendMode?  {number}
     * @param dummySignature?    {boolean}
     * @return {Promise<{address: Address, signature: Uint8Array, message: Cell, cell: Cell, body: Cell, resultMessage: Cell}>}
     */
    async createTransferMessage(
        secretKey,
        address,
        amount,
        seqno,
        payload = "",
        sendMode = 3,
        dummySignature = false
    ) {
        const payloadCell = new Cell();
        if (payload) {
            if (typeof payload === 'string') {
                if (payload.length > 0) {
                    payloadCell.bits.writeUint(0, 32);
                    payloadCell.bits.writeBytes(stringToBytes(payload));
                }
            } else {
                payloadCell.bits.writeBytes(payload)
            }
        }

        const orderHeader = Contract.createInternalMessageHeader(new Address(address), new BN(amount));
        const order = Contract.createCommonMsgInfo(orderHeader, null, payloadCell);
        const signingMessage = this.createSigningMessage(seqno);
        signingMessage.bits.writeUint8(sendMode);
        signingMessage.refs.push(order);

        return this.createExternalMessage(signingMessage, secretKey, seqno, dummySignature);
    }
}

// SIMPLE WALLET

// attention: no seqno get-method in this wallet
class SimpleWalletContractR1 extends WalletContract {
    /**
     * @param provider    {HttpProvider}
     * @param options? {any}
     */
    constructor(provider, options) {
        options.code = createCell("B5EE9C72410101010044000084FF0020DDA4F260810200D71820D70B1FED44D0D31FD3FFD15112BAF2A122F901541044F910F2A2F80001D31F3120D74A96D307D402FB00DED1A4C8CB1FCBFFC9ED5441FDF089");
        super(provider, options);
    }

    getName() {
        return 'simpleR1';
    }
}

class SimpleWalletContractR2 extends WalletContract {
    /**
     * @param provider    {HttpProvider}
     * @param options? {any}
     */
    constructor(provider, options) {
        options.code = createCell("B5EE9C724101010100530000A2FF0020DD2082014C97BA9730ED44D0D70B1FE0A4F260810200D71820D70B1FED44D0D31FD3FFD15112BAF2A122F901541044F910F2A2F80001D31F3120D74A96D307D402FB00DED1A4C8CB1FCBFFC9ED54D0E2786F");
        super(provider, options);
    }

    getName() {
        return 'simpleR2';
    }
}

class SimpleWalletContractR3 extends WalletContract {
    /**
     * @param provider    {HttpProvider}
     * @param options? {any}
     */
    constructor(provider, options) {
        options.code = createCell("B5EE9C7241010101005F0000BAFF0020DD2082014C97BA218201339CBAB19C71B0ED44D0D31FD70BFFE304E0A4F260810200D71820D70B1FED44D0D31FD3FFD15112BAF2A122F901541044F910F2A2F80001D31F3120D74A96D307D402FB00DED1A4C8CB1FCBFFC9ED54B5B86E42");
        super(provider, options);
    }

    getName() {
        return 'simpleR3';
    }
}

// WALLET V2

class WalletV2ContractBase extends WalletContract {
    /**
     * @override
     * @private
     * @param   seqno?   {number}
     * @return {Cell}
     */
    createSigningMessage(seqno) {
        seqno = seqno || 0;
        const message = new Cell();
        message.bits.writeUint(seqno, 32);
        if (seqno === 0) {
            // message.bits.writeInt(-1, 32);// todo: dont work
            for (let i = 0; i < 32; i++) {
                message.bits.writeBit(1);
            }
        } else {
            const date = new Date();
            const timestamp = Math.floor(date.getTime() / 1e3);
            message.bits.writeUint(timestamp + 60, 32);
        }
        return message;
    }
}

class WalletV2ContractR1 extends WalletV2ContractBase {
    /**
     * @param provider    {HttpProvider}
     * @param options? {any}
     */
    constructor(provider, options) {
        options.code = createCell("B5EE9C724101010100570000AAFF0020DD2082014C97BA9730ED44D0D70B1FE0A4F2608308D71820D31FD31F01F823BBF263ED44D0D31FD3FFD15131BAF2A103F901541042F910F2A2F800029320D74A96D307D402FB00E8D1A4C8CB1FCBFFC9ED54A1370BB6");
        super(provider, options);
    }

    getName() {
        return 'v2R1';
    }
}

class WalletV2ContractR2 extends WalletV2ContractBase {
    /**
     * @param provider    {HttpProvider}
     * @param options? {any}
     */
    constructor(provider, options) {
        options.code = createCell("B5EE9C724101010100630000C2FF0020DD2082014C97BA218201339CBAB19C71B0ED44D0D31FD70BFFE304E0A4F2608308D71820D31FD31F01F823BBF263ED44D0D31FD3FFD15131BAF2A103F901541042F910F2A2F800029320D74A96D307D402FB00E8D1A4C8CB1FCBFFC9ED54044CD7A1");
        super(provider, options);
    }

    getName() {
        return 'v2R2';
    }
}

// WALLET V3

class WalletV3ContractBase extends WalletContract {

    /**
     * @override
     * @private
     * @param   seqno?   {number}
     * @return {Cell}
     */
    createSigningMessage(seqno) {
        seqno = seqno || 0;
        const message = new Cell();
        message.bits.writeUint(this.options.walletId, 32);
        if (seqno === 0) {
            // message.bits.writeInt(-1, 32);// todo: dont work
            for (let i = 0; i < 32; i++) {
                message.bits.writeBit(1);
            }
        } else {
            const date = new Date();
            const timestamp = Math.floor(date.getTime() / 1e3);
            message.bits.writeUint(timestamp + 60, 32);
        }
        message.bits.writeUint(seqno, 32);
        return message;
    }

    /**
     * @override
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeUint(0, 32);
        cell.bits.writeUint(this.options.walletId, 32);
        cell.bits.writeBytes(this.options.publicKey);
        return cell;
    }
}

class WalletV3ContractR1 extends WalletV3ContractBase {
    /**
     * @param provider    {HttpProvider}
     * @param options {any}
     */
    constructor(provider, options) {
        options.code = createCell("B5EE9C724101010100620000C0FF0020DD2082014C97BA9730ED44D0D70B1FE0A4F2608308D71820D31FD31FD31FF82313BBF263ED44D0D31FD31FD3FFD15132BAF2A15144BAF2A204F901541055F910F2A3F8009320D74A96D307D402FB00E8D101A4C8CB1FCB1FCBFFC9ED543FBE6EE0");
        super(provider, options);
        if (!this.options.walletId) this.options.walletId = 698983191 + this.options.wc;
    }

    getName() {
        return 'v3R1';
    }
}

class WalletV3ContractR2 extends WalletV3ContractBase {
    /**
     * @param provider    {HttpProvider}
     * @param options {any}
     */
    constructor(provider, options) {
        options.code = createCell("B5EE9C724101010100710000DEFF0020DD2082014C97BA218201339CBAB19F71B0ED44D0D31FD31F31D70BFFE304E0A4F2608308D71820D31FD31FD31FF82313BBF263ED44D0D31FD31FD3FFD15132BAF2A15144BAF2A204F901541055F910F2A3F8009320D74A96D307D402FB00E8D101A4C8CB1FCB1FCBFFC9ED5410BD6DAD");
        super(provider, options);
        if (!this.options.walletId) this.options.walletId = 698983191 + this.options.wc;
    }

    getName() {
        return 'v3R2';
    }
}

// WALLET V4

class WalletV4ContractR1 extends WalletContract {

    /**
     * @param provider    {HttpProvider}
     * @param options {any}
     */
    constructor(provider, options) {
        options.code = createCell("B5EE9C7241021201000290000114FF00F4A413F4BCF2C80B010201200203020148040503D0F28308D71820D31FD31FD31F02F823BBF263ED44D0D31FD31FD3FFF404D15143BAF2A15151BAF2A205F901541064F910F2A3F80001D30721C0009C9320D74A96D307D402FB00E8DE21C001E30021C002E30001C0039130E30D03A4C8CB1F12CB1FCBFFF400C9ED540F101103F8D001D0D3030171B0915BE021D749C12002D31F018210706C7567BD13B1915BE0FA403020FA44ED44D0810140D71831F4043002C8CA07CBFFC9D001810108F40A6FA131F2A8F80001FA00F40430F8276F225313B9708AE630C801B38E1D6C218210706C75677080185003CB055005CF165003FA02F400CB69CB1FE30E060708020120090A0074048020F4966FA58E2101FA0430208E1751148020F40E6FA199FA043001B9927F32DE935B7F32E2915BE2915BE204A420C210927F32DE246E22B1004C33338210F06C75677080185004CB055005CF16821005F5E100FA0212CB6A13CB1F58FA02F4000008C971FB000201200B0C005BBD242B6F6A2684080A06B8C18FA0218470D4080847A4937D29910CE6903E9FF9837812801B7810148987159F31840201580D0E0011B8C97ED44D0D70B1F8003FB29DFB513420405035C60C7D010C00B23281F2FFF274006040423D029BE84C600017B0E73B513434CFCC75C2FFE0006ED207FA00D4D422F90005C8CA0715CBFFC9D077748018C8CB05CB0222CF165005FA0214CB6B12CCCCC971FB00C84014810108F451F2A702006C810108D718C8542025810108F451F2A782106E6F746570748018C8CB05CB025004CF16821005F5E100FA0213CB6A12CB1FC971FB00020068810108D718305202810108F459F2A78210DE51120170748018C8CB05CB025004CF16821005F5E100FA0213CB6A12CB1FC971FB0096E977D6");
        super(provider, options);
        if (!this.options.walletId) this.options.walletId = 698983191 + this.options.wc;

        this.methods.installPlugin = (params) => methodWrapper(provider, queryWrapper(this.installPlugin(params)));
        this.methods.removePlugin = (params) => methodWrapper(provider, queryWrapper(this.removePlugin(params)));
        this.methods.getPublicKey = this.getPublicKey.bind(this);
        this.methods.isPluginInstalled = this.isPluginInstalled.bind(this);
        this.methods.getPluginsList = this.getPluginsList.bind(this);
    }

    getName() {
        return 'v4R1';
    }

    /**
     * @override
     * @private
     * @param   seqno?   {number}
     * @param   withoutOp? {boolean}
     * @return {Cell}
     */
    createSigningMessage(seqno, withoutOp) {
        seqno = seqno || 0;
        const message = new Cell();
        message.bits.writeUint(this.options.walletId, 32);
        if (seqno === 0) {
            // message.bits.writeInt(-1, 32);// todo: dont work
            for (let i = 0; i < 32; i++) {
                message.bits.writeBit(1);
            }
        } else {
            const date = new Date();
            const timestamp = Math.floor(date.getTime() / 1e3);
            message.bits.writeUint(timestamp + 60, 32);
        }
        message.bits.writeUint(seqno, 32);
        if (!withoutOp) {
            message.bits.writeUint(0, 32); // op
        }
        return message;
    }

    /**
     * @override
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeUint(0, 32);
        cell.bits.writeUint(this.options.walletId, 32);
        cell.bits.writeBytes(this.options.publicKey);
        cell.bits.writeUint(0, 1); // plugins dict empty
        return cell;
    }

    async deployAndInstallPlugin(pluginAddress) {
        // todo
    }

    /**
     * @private
     * @param   params {{secretKey: Uint8Array, seqno: number, pluginAddress: string | Address}}
     * @param   isInstall {boolean} install or uninstall
     */
    async _setPlugin(params, isInstall) {
        const {secretKey, seqno} = params;
        const pluginAddress = new Address(params.pluginAddress);

        const signingMessage = this.createSigningMessage(seqno, true);
        signingMessage.bits.writeUint(isInstall ? 2 : 3, 8); // op
        signingMessage.bits.writeUint(pluginAddress.wc, 8);
        signingMessage.bits.writeBytes(pluginAddress.hashPart);

        return this.createExternalMessage(signingMessage, secretKey, seqno, false);
    }

    /**
     * @param   params {{secretKey: Uint8Array, seqno: number, pluginAddress: string | Address}}
     */
    async installPlugin(params) {
        return this._setPlugin(params, true);
    }

    /**
     * @param   params {{secretKey: Uint8Array, seqno: number, pluginAddress: string | Address}}
     */
    async removePlugin(params) {
        return this._setPlugin(params, false);
    }

    /**
     * @return {Promise<string>}
     */
    async getPublicKey() {
        const result = await this.provider.call((await this.getAddress()).toString(), 'get_public_key', []);
        if (result.exit_code !== 0) throw new Error(result);
        return result.stack[0][1];
    }

    /**
     * @param pluginAddress {string | Address}
     * @return {Promise<boolean>}
     */
    async isPluginInstalled(pluginAddress) {
        pluginAddress = new Address(pluginAddress);
        const hashPart = '0x' + bytesToHex(pluginAddress.hashPart)
        const result = await this.provider.call((await this.getAddress()).toString(), 'is_plugin_installed', [['num', pluginAddress.wc], ['num', hashPart]]);
        if (result.exit_code !== 0) throw new Error(result);
        return result.stack[0][1] !== '0x0';
    }

    /**
     * @return {Promise<string[]>}
     */
    async getPluginsList() {
        function parseTuple(x) {
            const arr = x.tuple.elements;
            return arr[0].number.number + ':' + new BN(arr[1].number.number, 10).toString(16);
        }

        const result = await this.provider.call((await this.getAddress()).toString(), 'get_plugin_list', []);
        if (result.exit_code !== 0) throw new Error(result);
        return result.stack[0][1].elements.map(parseTuple);
    }
}

// WALLETS

class Wallets {
    /**
     * @param provider    {HttpProvider}
     */
    constructor(provider) {
        this.provider = provider;
        this.all = {
            'simpleR1': SimpleWalletContractR1,
            'simpleR2': SimpleWalletContractR2,
            'simpleR3': SimpleWalletContractR3,
            'v2R1': WalletV2ContractR1,
            'v2R2': WalletV2ContractR2,
            'v3R1': WalletV3ContractR1,
            'v3R2': WalletV3ContractR2,
            'v4R1': WalletV4ContractR1
        };
        this.list = [SimpleWalletContractR1, SimpleWalletContractR2, SimpleWalletContractR3, WalletV2ContractR1, WalletV2ContractR2, WalletV3ContractR1, WalletV3ContractR2, WalletV4ContractR1];
        this.defaultVersion = 'v3R1';
        this.default = this.all[this.defaultVersion];
    }

    create(options) {
        return new this.default(this.provider, options);
    }
}

module.exports.default = Wallets;
