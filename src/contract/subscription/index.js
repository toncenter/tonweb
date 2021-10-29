const {Contract} = require("../index.js");
const {Cell} = require("../../boc");

class SubscriptionContract extends Contract {
    constructor(provider, options) {

        super(provider, options);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.payerAddress);
        cell.bits.writeAddress(this.options.payeeAddress);
        cell.bits.writeUint(this.options.amount, 120);
        cell.bits.writeUint(this.options.subsPeriod, 32);
        cell.bits.writeUint(0, 32); // last_payment
        cell.bits.writeUint(0, 32); // request_timeout
        cell.bits.writeUint(0, 32); // last_request
        return cell;
    }
}

module.exports = {SubscriptionContract};
