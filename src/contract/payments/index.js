const {PaymentChannel} = require("./PaymentChannel");

class Payments {
    /**
     * @param provider    {HttpProvider}
     */
    constructor(provider) {
        this.provider = provider;
    }

    createChannel(options) {
        return new PaymentChannel(this.provider, options);
    }
}

module.exports = {Payments, PaymentChannel};