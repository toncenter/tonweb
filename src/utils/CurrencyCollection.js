const { BN } = require('./Utils');

class CurrencyCollection {

    /**
     * @param value {number | BN} value in nanotons
     * @param extra {{id: number, value: number | BN} | {null}}
     */
    constructor(value, extra = null) {
        this.value = new BN(value);
        if(extra) {
            if(typeof extra.id !== 'number') {
                throw Error(`Invalid extra.id type: ${typeof extra.id}. number expected`);
            }
            if(typeof extra.value !== 'number' && !BN.isBN(extra.value)) {
                throw Error(`Invalid extra value type. number or BN expected!`);
            }
            this.extra = extra;
        } else {
            this.extra = null;
        }
    }
}

module.exports.default = CurrencyCollection;
