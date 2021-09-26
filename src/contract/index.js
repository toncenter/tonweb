const {Cell} = require("../boc");
const {Address, bytesToBase64, bytesToHex, nacl} = require("../utils");

class Contract {
    /**
     * @param provider    {HttpProvider}
     * @param options    {{code?: Cell, address?: Address, wc?: number}}
     */
    constructor(provider, options) {
        this.provider = provider;
        this.options = options;
        this.address = options.address ? new Address(options.address) : null;
        if (!options.wc) options.wc = this.address ? this.address.wc : 0;
        this.methods = {};

        /**
         * @param secretKey {Uint8Array}
         */
        this.deploy = (secretKey) => {
            const createQuery = async () => {
                const query = await this.createInitExternalMessage(secretKey);
                const legacyQuery = {
                    address: query.address.toString(true, true, false),
                    body: query.body.toObject(),
                    init_code: query.code.toObject(),
                    init_data: query.data.toObject(),
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
        }
    }

    /**
     * @return {Promise<Address>}
     */
    async getAddress() {
        if (!this.address) {
            this.address = (await this.createStateInit()).address;
        }
        return this.address;
    }

    /**
     * @private
     * @return {Cell} cell contains wallet code
     */
    createCodeCell() {
        if (!this.options.code) throw new Error('Contract: options.code is not defined')
        return this.options.code;
    }

    /**
     * Method to override
     * @protected
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
        return new Cell();
    }

    /**
     * Method to override
     * @protected
     * @param  options?
     * @return {Cell} cell contains message data
     */
    createSigningMessage(options) {
        return new Cell();
    }

    /**
     * @private
     * @return {{stateInit: Cell, address: Address, code: Cell, data: Cell}}
     */
    async createStateInit() {
        const codeCell = this.createCodeCell();
        const dataCell = this.createDataCell();
        const stateInit = Contract.createStateInit(codeCell, dataCell);
        const stateInitHash = await stateInit.hash();
        const address = new Address(this.options.wc + ":" + bytesToHex(stateInitHash));
        return {
            stateInit: stateInit,
            address: address,
            code: codeCell,
            data: dataCell,
        }
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

    // _ split_depth:(Maybe (## 5)) special:(Maybe TickTock)
    // code:(Maybe ^Cell) data:(Maybe ^Cell)
    // library:(Maybe ^Cell) = StateInit;
    /**
     * @param code  {Cell}
     * @param data  {Cell}
     * @param library {null}
     * @param splitDepth {null}
     * @param ticktock  {null}
     * @return {Cell}
     */
    static createStateInit(code,
                           data,
                           library = null,
                           splitDepth = null,
                           ticktock = null) {
        if (library)
            throw "Library in state init is not implemented";
        if (splitDepth)
            throw "Split depth in state init is not implemented";
        if (ticktock)
            throw "Ticktock in state init is not implemented";

        const stateInit = new Cell();

        stateInit.bits.writeBitArray([Boolean(splitDepth), Boolean(ticktock), Boolean(code), Boolean(data), Boolean(library)]);
        if (code)
            stateInit.refs.push(code);
        if (data)
            stateInit.refs.push(data);
        if (library)
            stateInit.refs.push(library);
        return stateInit;
    }

    // extra_currencies$_ dict:(HashmapE 32 (VarUInteger 32))
    // = ExtraCurrencyCollection;
    // currencies$_ grams:Grams other:ExtraCurrencyCollection
    // = CurrencyCollection;

    //int_msg_info$0 ihr_disabled:Bool bounce:Bool
    //src:MsgAddressInt dest:MsgAddressInt
    //value:CurrencyCollection ihr_fee:Grams fwd_fee:Grams
    //created_lt:uint64 created_at:uint32 = CommonMsgInfo;
    /**
     * @param dest  {Address | string}
     * @param gramValue  {number | BN}
     * @param ihrDisabled  {boolean}
     * @param bounce  {null | boolean}
     * @param bounced {boolean}
     * @param src  {Address | string}
     * @param currencyCollection  {null}
     * @param ihrFees  {number | BN}
     * @param fwdFees  {number | BN}
     * @param createdLt  {number | BN}
     * @param createdAt  {number | BN}
     * @return {Cell}
     */
    static createInternalMessageHeader(dest,
                                       gramValue = 0,
                                       ihrDisabled = true,
                                       bounce = null,
                                       bounced = false,
                                       src = null,
                                       currencyCollection = null,
                                       ihrFees = 0,
                                       fwdFees = 0,
                                       createdLt = 0,
                                       createdAt = 0) {
        const message = new Cell();
        message.bits.writeBit(false);
        message.bits.writeBit(ihrDisabled);
        if (!(bounce === null)) {
            message.bits.writeBit(bounce);
        } else {
            message.bits.writeBit((new Address(dest)).isBounceable);
        }
        message.bits.writeBit(bounced);
        message.bits.writeAddress(src ? new Address(src) : null);
        message.bits.writeAddress(new Address(dest));
        message.bits.writeGrams(gramValue);
        if (currencyCollection) {
            throw "Currency collections are not implemented yet";
        }
        message.bits.writeBit(Boolean(currencyCollection));
        message.bits.writeGrams(ihrFees);
        message.bits.writeGrams(fwdFees);
        message.bits.writeUint(createdLt, 64);
        message.bits.writeUint(createdAt, 32);
        return message;
    }

    //ext_in_msg_info$10 src:MsgAddressExt dest:MsgAddressInt
    //import_fee:Grams = CommonMsgInfo;
    /**
     * @param dest  {Address | string}
     * @param src  {Address | string}
     * @param importFee  {number | BN}
     * @return {Cell}
     */
    static createExternalMessageHeader(dest,
                                       src = null,
                                       importFee = 0) {
        const message = new Cell();
        message.bits.writeUint(2, 2);
        message.bits.writeAddress(src ? new Address(src) : null);
        message.bits.writeAddress(new Address(dest));
        message.bits.writeGrams(importFee);
        return message;
    }

    //tblkch.pdf, page 57
    /**
     * Create CommonMsgInfo contains header, stateInit, body
     * @param header {Cell}
     * @param stateInit?  {Cell}
     * @param body?  {Cell}
     * @return {Cell}
     */
    static createCommonMsgInfo(header, stateInit = null, body = null) {
        const commonMsgInfo = new Cell();
        commonMsgInfo.writeCell(header);

        if (stateInit) {
            commonMsgInfo.bits.writeBit(true);
            //-1:  need at least one bit for body
            // TODO we also should check for free refs here
            if (commonMsgInfo.bits.getFreeBits() - 1 >= stateInit.bits.getUsedBits()) {
                commonMsgInfo.bits.writeBit(false);
                commonMsgInfo.writeCell(stateInit);
            } else {
                commonMsgInfo.bits.writeBit(true);
                commonMsgInfo.refs.push(stateInit);
            }
        } else {
            commonMsgInfo.bits.writeBit(false);
        }
        // TODO we also should check for free refs here
        if (body) {
            if (commonMsgInfo.bits.getFreeBits() >= body.bits.getUsedBits()) {
                commonMsgInfo.bits.writeBit(false);
                commonMsgInfo.writeCell(body);
            } else {
                commonMsgInfo.bits.writeBit(true);
                commonMsgInfo.refs.push(body);
            }
        } else {
            commonMsgInfo.bits.writeBit(false);
        }
        return commonMsgInfo;
    }
}

// const Contract = (jsonInterface, address, options) => {
//     return new TonContract(address, options);
// }

module.exports = {Contract};
