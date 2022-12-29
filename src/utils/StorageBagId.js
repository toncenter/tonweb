const {hexToBytes, bytesToHex} = require("./Utils");

class StorageBagId {
    /**
     * @param anyForm {string | Uint8Array | StorageBagId}
     */
    static isValid(anyForm) {
        try {
            new StorageBagId(anyForm);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * @param anyForm {string | Uint8Array | StorageBagId}
     */
    constructor(anyForm) {
        if (anyForm == null) {
            throw "Invalid address";
        }

        if (anyForm instanceof StorageBagId) {
            this.bytes = anyForm.bytes;
        } else if (anyForm instanceof Uint8Array) {
            if (anyForm.length !== 32) {
                throw new Error('invalid bag id bytes length');
            }
            this.bytes = anyForm;
        } else if (typeof anyForm === 'string') {
            if (anyForm.length !== 64) {
                throw new Error('invalid bag id hex length');
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

module.exports.default = StorageBagId;
