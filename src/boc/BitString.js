const {BN, bytesToHex} = require("../utils");

class BitString {
    /**
     * @param length {number}    length of BitString in bits
     */
    constructor(length) {
        this.array = Uint8Array.from({length: Math.ceil(length / 8)}, () => 0);
        this.cursor = 0;
        this.length = length;
        this.mode = undefined; //"reading"/"writing"/undefined
    }

    /**
     * @return {number}
     */
    getFreeBits() {
        return this.length - this.cursor;
    }

    /**
     * @return {number}
     */
    getUsedBits() {
        return this.cursor;
    }

    /**
     * @return {number}
     */
    getUsedBytes() {
        return Math.ceil(this.cursor / 8);
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
        const max = this.length;
        for (let x = 0; x < max; x++) {
            callback(this.get(x));
        }
    }

    /**
     * Write bit and increase cursor
     * @param b  {boolean | number}
     */
    writeBit(b) {
        if(this.mode && this.mode!="writing")
          throw Error("Try write to bitstring in " + this.mode+ " mode");
        this.mode = "writing";
        if (b && b > 0) {
            this.on(this.cursor);
        } else {
            this.off(this.cursor);
        }
        this.cursor = this.cursor + 1;
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
     * @param s {string}
     */
    writeString(s) {
        for (let i = 0; i < s.length; i++) {
            this.writeUint8(s.charCodeAt(i));
        }
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

    clone() {
        const result = new BitString(this.length);
        result.array = this.array.slice(0);
        result.length = this.length
        result.cursor = this.cursor;
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
        ret.cursor = ret.length;
        ret.length += 8 - (ret.length % 8);
        let tu = Math.ceil(ret.cursor / 8) * 8 - ret.cursor;
        if (tu > 0) {
            tu = tu - 1;
            ret.writeBit(true);
            while (tu > 0) {
                tu = tu - 1;
                ret.writeBit(false);
            }
        }
        ret.array = ret.array.slice(0, Math.ceil(ret.cursor / 8));
        return ret.array;
    }

    /**
     * like Fift
     * @return {string}
     */
    toHex() {
        if (this.length % 4 === 0) {
            const s = bytesToHex(this.array.slice(0, Math.ceil(this.length / 8))).toUpperCase();
            if (this.length % 8 === 0) {
                return s;
            } else {
                return s.substr(0, s.length - 1);
            }
        } else {
            const temp = this.clone();
            temp.cursor = temp.length;
            temp.length += 4 - (temp.length % 4);
            temp.writeBit(1);
            while (temp.cursor % 4 !== 0) {
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
        this.cursor = this.length;
        if (fullfilledBytes || !this.length) {
            return;
        } else {
            let foundEndBit = false;
            for (let c = 0; c < 7; c++) {
                this.cursor -= 1;
                if (this.get(this.cursor)) {
                    foundEndBit = true;
                    this.off(this.cursor);
                    break;
                }
            }
            this.length = this.cursor;
            if (!foundEndBit) {
                console.log(array, fullfilledBytes);
                throw new Error("Incorrect TopUppedArray");
            }
        }
    }

    /**
     * set cursor to 0 and drop read/write mode
     */
    dropMode() {
      this.cursor = 0;
      delete this.mode;
    }


    /**
     * read next bit from bitString and return it
     * @return {boolean}
     */
    readBit() {
        if(this.mode && this.mode!="reading")
          throw Error("Try read to bitstring in " + this.mode+ " mode");
        this.mode="reading";
        const result = this.get(this.cursor);
        this.cursor = this.cursor + 1;
        return result;
    }

    /**
     * Read unsigned int and move cursor
     * @param bitLength  {number}  size of int in bits
     * @return {number | BN}
     */
    readUint(bitLength) {
      let result = new BN(0);
      const b = new BN(2);
      for(let i=0; i<bitLength; i++) {
        let nextBit = this.readBit() | 0;
        result = result.mul(b).add(new BN(nextBit));
      }
      return result;
    }

    /**
     * Read signed int and move cursor
     * @param bitLength  {number}  size of int in bits
     * @return {number | BN}
     */
    readInt(bitLength) {
      const b = new BN(2);
      const threshold = b.pow(new BN(bitLength-1));
      let result = this.readUint(bitLength);
      if(result>=threshold){
        result = result.sub(threshold).sub(threshold);
      }
      return result;
    }

    /**
     * return part of this bitstring
     * @param [start=0]  {number}
     * @param [end=bitstring.length]  {number}
     * @returns {BitString} - slice of the bitstring (cursor at 0, no mode set)
     */
    slice(start = 0, end = this.length) {
        if(this.mode && this.mode!="reading")
          throw Error("Try slice bitstring in " + this.mode+ " mode");
        if(start < 0 || end<start || end > this.length)
          throw Error("Wrong indicies during slice creation: "+ String(start)+" "+String(end));
        const result = new BitString(end-start);
        for (let x = start; x < end; x++) {
            if(this.get(x))
              result.on(x-start);
        }
        return result;
    }

    /**
     * Read array of bits and return them as bitstring
     * @param bitLength  {number}
     * @returns {BitString} - slice of the bitstring (cursor at 0, no mode set)
     */
    readBitstring(bitLength) {
        let result = this.slice(this.cursor, this.cursor+bitLength);
        this.cursor = this.cursor + bitLength;
        return result;
    }

}

module.exports = {BitString};
