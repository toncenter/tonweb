const {Cell} = require("../../boc");
const {WalletContract} = require("./WalletContract");

class WalletV2ContractBase extends WalletContract {
    /**
     * @override
     * @private
     * @param   seqno?   {number}
     * @param   expireAt? {number}
     * @return {Cell}
     */
    createSigningMessage(seqno, expireAt) {
        seqno = seqno || 0;
        expireAt = expireAt || (Math.floor(Date.now() / 1e3) + 60);
        const message = new Cell();
        message.bits.writeUint(seqno, 32);
        if (seqno === 0) {
            // message.bits.writeInt(-1, 32);// todo: dont work
            for (let i = 0; i < 32; i++) {
                message.bits.writeBit(1);
            }
        } else {
            message.bits.writeUint(expireAt, 32);
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
        options.code = Cell.oneFromBoc("B5EE9C724101010100570000AAFF0020DD2082014C97BA9730ED44D0D70B1FE0A4F2608308D71820D31FD31F01F823BBF263ED44D0D31FD3FFD15131BAF2A103F901541042F910F2A2F800029320D74A96D307D402FB00E8D1A4C8CB1FCBFFC9ED54A1370BB6");
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
        options.code = Cell.oneFromBoc("B5EE9C724101010100630000C2FF0020DD2082014C97BA218201339CBAB19C71B0ED44D0D31FD70BFFE304E0A4F2608308D71820D31FD31F01F823BBF263ED44D0D31FD3FFD15131BAF2A103F901541042F910F2A2F800029320D74A96D307D402FB00E8D1A4C8CB1FCBFFC9ED54044CD7A1");
        super(provider, options);
    }

    getName() {
        return 'v2R2';
    }
}

module.exports = {WalletV2ContractR1, WalletV2ContractR2};
