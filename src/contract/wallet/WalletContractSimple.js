const {Cell} = require("../../boc");
const {WalletContract} = require("./WalletContract");

// attention: no seqno get-method in this wallet

class SimpleWalletContractR1 extends WalletContract {
    /**
     * @param provider    {HttpProvider}
     * @param options? {any}
     */
    constructor(provider, options) {
        options.code = Cell.oneFromBoc("B5EE9C72410101010044000084FF0020DDA4F260810200D71820D70B1FED44D0D31FD3FFD15112BAF2A122F901541044F910F2A2F80001D31F3120D74A96D307D402FB00DED1A4C8CB1FCBFFC9ED5441FDF089");
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
        options.code = Cell.oneFromBoc("B5EE9C724101010100530000A2FF0020DD2082014C97BA9730ED44D0D70B1FE0A4F260810200D71820D70B1FED44D0D31FD3FFD15112BAF2A122F901541044F910F2A2F80001D31F3120D74A96D307D402FB00DED1A4C8CB1FCBFFC9ED54D0E2786F");
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
        options.code = Cell.oneFromBoc("B5EE9C7241010101005F0000BAFF0020DD2082014C97BA218201339CBAB19C71B0ED44D0D31FD70BFFE304E0A4F260810200D71820D70B1FED44D0D31FD3FFD15112BAF2A122F901541044F910F2A2F80001D31F3120D74A96D307D402FB00DED1A4C8CB1FCBFFC9ED54B5B86E42");
        super(provider, options);
    }

    getName() {
        return 'simpleR3';
    }
}

module.exports = {SimpleWalletContractR1, SimpleWalletContractR2, SimpleWalletContractR3};

