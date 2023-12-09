const {Cell} = require("../boc");
const {Address, bytesToBase64, bytesToHex, BN} = require("../utils");

class Contract {
    /**
     * @param provider    {HttpProvider}
     * @param options    {{code?: Cell, address?: Address | string, wc?: number}}
     */
    constructor(provider, options) {
        this.provider = provider;
        this.options = options;
        this.address = options.address ? new Address(options.address) : null;
        if (!options.wc) options.wc = this.address ? this.address.wc : 0;
        this.methods = {};
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
     * @return {Cell} cell contains contact code
     */
    createCodeCell() {
        if (!this.options.code) throw new Error('Contract: options.code is not defined')
        return this.options.code;
    }

    /**
     * Method to override
     * @protected
     * @return {Cell} cell contains contract data
     */
    createDataCell() {
        return new Cell();
    }

    /**
     * @protected
     * @return {Promise<{stateInit: Cell, address: Address, code: Cell, data: Cell}>}
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

    /**
     * @param address {Address | string}
     * @param amount {BN} in nanotons
     * @param payload   {string | Uint8Array | Cell}
     * @param stateInit? {Cell}
     * @return {Cell}
     */
    static createOutMsg(address, amount, payload, stateInit = null) {
        let payloadCell = new Cell();
        if (payload) {
            if (payload.refs) { // is Cell
                payloadCell = payload;
            } else if (typeof payload === 'string') {
                if (payload.length > 0) {
                    payloadCell.bits.writeUint(0, 32);
                    payloadCell.bits.writeString(payload);
                }
            } else {
                payloadCell.bits.writeBytes(payload)
            }
        }

        const orderHeader = Contract.createInternalMessageHeader(new Address(address), new BN(amount));
        const order = Contract.createCommonMsgInfo(orderHeader, stateInit, payloadCell);
        return order;
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
            // TODO: temporary always push in ref because WalletQueryParser can parse only ref
            if (false && (commonMsgInfo.bits.getFreeBits() - 1 >= stateInit.bits.getUsedBits())) {
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
            if ((commonMsgInfo.bits.getFreeBits() >= body.bits.getUsedBits()) && (commonMsgInfo.refs.length + body.refs.length <= 4)) {
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

    static createMethod(provider, queryPromise) {
        return {
            /**
             * @return {Promise<Cell>}
             */
            getBody: async () => {
                return (await queryPromise).body;
            },

            /**
             * @return {Promise<Cell>}
             */
            getQuery: async () => {
                return (await queryPromise).message;
            },
            send: async () => {
                const query = await queryPromise;
                const boc = bytesToBase64(await query.message.toBoc(false));
                return provider.sendBoc(boc);
            },
            estimateFee: async () => {
                const query = await queryPromise;
                const serialized = query.code ? // deploy
                    {
                        address: query.address.toString(true, true, false),
                        body: bytesToBase64(await query.body.toBoc(false)),
                        init_code: bytesToBase64(await query.code.toBoc(false)),
                        init_data: bytesToBase64(await query.data.toBoc(false)),
                    } : {
                        address: query.address.toString(true, true, true),
                        body: bytesToBase64(await query.body.toBoc(false)),
                    };

                return provider.getEstimateFee(serialized);
            }
        }
    }
}

module.exports = {Contract};
