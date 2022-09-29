const {hexToBytes, bytesToHex} = require("./Utils");

class AdnlAddress {
    /**
     * @param anyForm {string | Uint8Array | AdnlAddress}
     */
    static isValid(anyForm) {
        try {
            new AdnlAddress(anyForm);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @param anyForm {string | Uint8Array | AdnlAddress}
     */
    constructor(anyForm) {
        if (anyForm == null) {
            throw "Invalid address";
        }

        if (anyForm instanceof AdnlAddress) {
            this.bytes = anyForm.bytes;
        } else if (anyForm instanceof Uint8Array) {
            if (anyForm.length !== 32) {
                throw new Error('invalid adnl bytes length');
            }
            this.bytes = anyForm;
        } else if (typeof anyForm === 'string') {
            if (anyForm.length !== 64) {
                throw new Error('invalid adnl hex length');
            }
            this.bytes = hexToBytes(anyForm);
        } else {
            throw new Error('unsupported type')
        }
    }

    toHex() {
        let hex = bytesToHex(this.bytes);
        while (hex.length < 64) {
            hex = '0' + hex;
        }
        return hex;
    }
}

module.exports.default = AdnlAddress;
