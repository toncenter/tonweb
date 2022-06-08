const {BN, bytesToHex} = require("../utils");

class BitString {
    /**
     * @param length {number}    length of BitString in bits
     */
    constructor(length) {
        this.array = Uint8Array.from({length: Math.ceil(length / 8)}, () => 0);
        this.writeCursor = 0;
        this.readCursor = 0;
        this.length = length;
    }

    /**
     * @return {number}
     */
    getFreeBits() {
        return this.length - this.writeCursor;
    }

    /**
     * @return {number}
     */
    getUsedBits() {
        return this.writeCursor;
    }

    /**
     * @return {number}
     */
    getUsedBytes() {
        return Math.ceil(this.writeCursor / 8);
    }

    /**
     * @param n {number}
     * @return {boolean}    bit value at position `n`
     */
    get(n) {
        return (this.array[(n / 8) | 0] & (1 << (7 - (n % 8)))) > 0;
    }

    /**
     * @private
     * @param n {number}
     */
    checkRange(n) {
        if (n > this.length) {
            throw Error("BitString overflow");
        }
    }

    /**
     * Set bit value to 1 at position `n`
     * @param n {number}
     */
    on(n) {
        this.checkRange(n);
        this.array[(n / 8) | 0] |= 1 << (7 - (n % 8));
    }

    /**
     * Set bit value to 0 at position `n`
     * @param n {number}
     */
    off(n) {
        this.checkRange(n);
        this.array[(n / 8) | 0] &= ~(1 << (7 - (n % 8)));
    }

    /**
     * Toggle bit value at position `n`
     * @param n {number}
     */
    toggle(n) {
        this.checkRange(n);
        this.array[(n / 8) | 0] ^= 1 << (7 - (n % 8));
    }

    /**
     * forEach every bit
     * @param callback  {function(boolean): void}
     */
    forEach(callback) {
        const max = this.writeCursor;
        for (let x = 0; x < max; x++) {
            callback(this.get(x));
        }
    }

    /**
     * Write bit and increase writeCursor
     * @param b  {boolean | number}
     */
    writeBit(b) {
        if (b && b > 0) {
            this.on(this.writeCursor);
        } else {
            this.off(this.writeCursor);
        }
        this.writeCursor = this.writeCursor + 1;
    }

    /**
     * @param ba  {Array<boolean | number>}
     */
    writeBitArray(ba) {
        for (let i = 0; i < ba.length; i++) {
            this.writeBit(ba[i]);
        }
    }

    /**
     * Write unsigned int
     * @param number  {number | BN}
     * @param bitLength  {number}  size of uint in bits
     */
    writeUint(number, bitLength) {
        number = new BN(number);
        if (
            bitLength == 0 ||
            (number.toString(2).length > bitLength)
        ) {
            if (number == 0) return;
            throw Error("bitLength is too small for number, got number=" + number + ",bitLength=" + bitLength);
        }
        const s = number.toString(2, bitLength);
        for (let i = 0; i < bitLength; i++) {
            this.writeBit(s[i] == 1);
        }
    }

    /**
     * Write signed int
     * @param number  {number | BN}
     * @param bitLength  {number}  size of int in bits
     */
    writeInt(number, bitLength) {
        number = new BN(number);
        if (bitLength == 1) {
            if (number == -1) {
                this.writeBit(true);
                return;
            }
            if (number == 0) {
                this.writeBit(false);
                return;
            }
            throw Error("Bitlength is too small for number");
        } else {
            if (number.isNeg()) {
                this.writeBit(true);
                const b = new BN(2);
                const nb = b.pow(new BN(bitLength - 1));
                this.writeUint(nb.add(number), bitLength - 1);
            } else {
                this.writeBit(false);
                this.writeUint(number, bitLength - 1);
            }
        }
    }

    /**
     * Write unsigned 8-bit int
     * @param ui8 {number}
     */
    writeUint8(ui8) {
        this.writeUint(ui8, 8);
    }

    /**
     * Write array of unsigned 8-bit ints
     * @param ui8 {Uint8Array}
     */
    writeBytes(ui8) {
        for (let i = 0; i < ui8.length; i++) {
            this.writeUint8(ui8[i]);
        }
    }

    /**
     * Write UTF-8 string
     *
     * @param value {string}
     */
    writeString(value) {
        this.writeBytes(
            new TextEncoder().encode(value)
        );
    }

    /**
     * @param amount  {number | BN} in nanograms
     */
    writeGrams(amount) {
        if (amount == 0) {
            this.writeUint(0, 4);
        } else {
            amount = new BN(amount);
            const l = Math.ceil((amount.toString(16).length) / 2);
            this.writeUint(l, 4);
            this.writeUint(amount, l * 8);
        }
    }


    /**
     * @param amount  {number | BN} in nanotons
     */
    writeCoins(amount) {
        this.writeGrams(amount);
    }

    //addr_none$00 = MsgAddressExt;
    //addr_std$10 anycast:(Maybe Anycast)
    // workchain_id:int8 address:uint256 = MsgAddressInt;
    /**
     * @param address {Address | null}
     */
    writeAddress(address) {
        if (address == null) {
            this.writeUint(0, 2);
        } else {
            this.writeUint(2, 2);
            this.writeUint(0, 1); // TODO split addresses (anycast)
            this.writeInt(address.wc, 8);
            this.writeBytes(address.hashPart);
        }
    }

    /**
     * write another BitString to this BitString
     * @param anotherBitString  {BitString}
     */
    writeBitString(anotherBitString) {
        anotherBitString.forEach(x => {
            this.writeBit(x);
        });
    }

    /**
     * @return {boolean}    bit value at position `n`
     */
    readBit() {
        var result = this.get(this.readCursor);
        this.readCursor++;
        if(this.readCursor > this.writeCursor) {
          throw "Parse error: not enough bits";
        }
        return result;
    }

    /**
     * @param n {number}
     * @return {BitString} Bitstring with length n read from original Bitstring
     */
    readBits(n) {
        var result = new BitString(n);
        for(var i = 0; i < n; i++) {
          result.writeBit(this.readBit());
        }
        return result;
    }


    /**
     * Reads unsigned int
     *
     * @param {number} bitLength Size of uint in bits
     * @returns {BN} number
     */
    readUint(bitLength) {
        if (bitLength < 1) {
            throw "Incorrect bitLength";
        }
        let s = "";
        for (let i = 0; i < bitLength; i++) {
            let b = this.readBit();
            if (b && b > 0) {
                s += '1';
            } else {
                s += '0';
            }
        }
        return new BN(s, 2);
    }

    /**
     * Reads signed int
     *
     * @param {number} bitLength Size of uint in bits
     * @returns {BN} number
     */
    readInt(bitLength) {
        if (bitLength < 1) {
            throw "Incorrect bitLength";
        }
        var sign = this.readBit();
        if (bitLength == 1) {
          return sign ? new BN(-1) : new BN(0);
        }
        var number = this.readUint(bitLength - 1);
        if(sign) {
          const b = new BN(2);
          const nb = b.pow(new BN(bitLength - 1));
          number -= nb;
        }
        return number;
    }

    /**
     * Reads Uint8
     *
     * @returns {number}
     */
    readUint8() {
        return this.readUint(start, 8).toNumber();
    }

    /**
     * Reads Uint16
     *
     * @returns {number}
     */
    readUint16() {
        return this.readUint(start, 16).toNumber();
    }

    /**
     * Reads Uint32
     *
     * @returns {number}
     */
    readUint32() {
        return this.readUint(start, 32).toNumber();
    }

    /**
     * Reads Uint64
     *
     * @returns {BN}
     */
    readUint64() {
        return this.readUint(start, 64);
    }

    /**
     * Reads Int8
     *
     * @returns {number}
     */
    readInt8() {
        return this.readInt(8);
    }

    /**
     * Reads Int16
     *
     * @returns {number}
     */
    readInt16(start) {
        return this.readInt(16);
    }

    /**
     * Reads Int32
     *
     * @returns {number}
     */
    readInt32(start) {
        return this.readInt(32);
    }


    clone() {
        const result = new BitString(0);
        result.array = this.array.slice(0);
        result.length = this.length
        result.writeCursor = this.writeCursor;
        result.readCursor = this.readCursor;
        return result;
    }

    /**
     * @return {string} hex
     */
    toString() {
        return this.toHex();
    }

    /**
     * @return {Uint8Array}
     */
    getTopUppedArray() {
        const ret = this.clone();

        let tu = Math.ceil(ret.writeCursor / 8) * 8 - ret.writeCursor;
        if (tu > 0) {
            tu = tu - 1;
            ret.writeBit(true);
            while (tu > 0) {
                tu = tu - 1;
                ret.writeBit(false);
            }
        }
        ret.array = ret.array.slice(0, Math.ceil(ret.writeCursor / 8));
        return ret.array;
    }

    /**
     * like Fift
     * @return {string}
     */
    toHex() {
        if (this.writeCursor % 4 === 0) {
            const s = bytesToHex(this.array.slice(0, Math.ceil(this.writeCursor / 8))).toUpperCase();
            if (this.writeCursor % 8 === 0) {
                return s;
            } else {
                return s.substr(0, s.length - 1);
            }
        } else {
            const temp = this.clone();
            temp.writeBit(1);
            while (temp.writeCursor % 4 !== 0) {
                temp.writeBit(0);
            }
            const hex = temp.toHex().toUpperCase();
            return hex + '_';
        }
    }

    /**
     * set this cell data to match provided topUppedArray
     * @param array  {Uint8Array}
     * @param fullfilledBytes  {boolean}
     */
    setTopUppedArray(array, fullfilledBytes = true) {
        this.length = array.length * 8;
        this.array = array;
        this.writeCursor = this.length;
        if (fullfilledBytes || !this.length) {
            return;
        } else {
            let foundEndBit = false;
            for (let c = 0; c < 7; c++) {
                this.writeCursor -= 1;
                if (this.get(this.writeCursor)) {
                    foundEndBit = true;
                    this.off(this.writeCursor);
                    break;
                }
            }
            if (!foundEndBit) {
                console.log(array, fullfilledBytes);
                throw new Error("Incorrect TopUppedArray");
            }
        }
    }
}

module.exports = {BitString};
