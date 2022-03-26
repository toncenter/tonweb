
import BN from 'bn.js';

import { stringToBytes } from '../utils/text-encoding';
import { bytesToHex } from '../utils/common';
import { Address } from '../utils/address';


export class BitString {

    // @todo: rename and make this private
    public array = Uint8Array.from({
        length: Math.ceil(this.length / 8)
    }, () => 0);

    // @todo: make this private
    public cursor = 0;


    constructor(
        /**
         * A length of bit string in bits.
         *
         * @todo: length shouldn't be public and mutable,
         *        but this is required by clone() method
         */
        public length: number
    ) {
    }


    /**
     * Returns number of unfilled bits in the bit-string.
     */
    public getFreeBits(): number {
        return this.length - this.cursor;
    }

    /**
     * Returns number of filled bits in the bit-string.
     */
    public getUsedBits(): number {
        return this.cursor;
    }

    /**
     * Returns number of bytes actually used by the bit-string.
     * Rounds up to a whole byte.
     */
    public getUsedBytes(): number {
        return Math.ceil(this.cursor / 8);
    }

    /**
     * Returns the bit value at the specified index
     * in the bit-string.
     */
    public get(index: number): boolean {
        return (this.array[(index / 8) | 0] & (1 << (7 - (index % 8)))) > 0;
    }

    /**
     * Sets the bit value to one at the specified index.
     *
     * @todo: should rename this method to `set()`
     */
    public on(index: number): void {
        this.checkIndexOrThrow(index);
        this.array[(index / 8) | 0] |= 1 << (7 - (index % 8));
    }

    /**
     * Sets the bit value to zero at the specified index.
     *
     * @todo: should rename this method to `clear()`
     */
    public off(index: number): void {
        this.checkIndexOrThrow(index);
        this.array[(index / 8) | 0] &= ~(1 << (7 - (index % 8)));
    }

    /**
     * Toggles the bit value at the specified index,
     * turns one into zero and zero into one.
     */
    public toggle(index: number): void {
        this.checkIndexOrThrow(index);
        this.array[(index / 8) | 0] ^= 1 << (7 - (index % 8));
    }

    /**
     * Iterates the bit-string and calls the specified
     * user function for each bit, passing in the bit value.
     *
     * @todo: implement the iterator protocol
     *        by using the generator function
     */
    public forEach(callback: (bitValue: boolean) => void) {
        const max = this.cursor;
        for (let i = 0; i < max; i++) {
            callback(this.get(i));
        }
    }

    /**
     * Writes the specified bit value to the bit-string
     * at the current index and advances the current index
     * cursor.
     */
    public writeBit(value: (boolean | number)) {
        if (value && value > 0) {
            this.on(this.cursor);
        } else {
            this.off(this.cursor);
        }
        this.cursor++;
    }

    /**
     * Writes the specified array of bit values to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    public writeBitArray(values: Array<boolean | number>) {
        for (let i = 0; i < values.length; i++) {
            this.writeBit(values[i]);
        }
    }

    /**
     * Writes the specified unsigned integer of the specified
     * length in bits to the bit-string, starting at the
     * current index and advances the current index cursor
     * by the number of bits written.
     */
    public writeUint(
        value: (number | BN),
        bitLength: number
    ) {
        value = new BN(value);
        if (
            bitLength === 0 ||
            (value.toString(2).length > bitLength)
        ) {
            if (value.isZero())
                return;
            throw Error(
                `Specified bit-length: ${bitLength} is ` +
                `too small for the specified number: ${value}`
            );
        }
        const numberString = value.toString(2, bitLength);
        for (let i = 0; i < bitLength; i++) {
            this.writeBit(numberString[i] === '1');
        }
    }

    /**
     * Writes the specified signed integer of the specified
     * length in bits to the bit-string, starting at the
     * current index and advances the current index cursor
     * by the number of bits written.
     */
    public writeInt(value: (number | BN), bitLength: number) {
        value = new BN(value);
        if (bitLength === 1) {
            if (value.eqn(-1)) {
                this.writeBit(true);
                return;
            }
            if (value.isZero()) {
                this.writeBit(false);
                return;
            }
            throw Error(
                'Specified bit-length is too small ' +
                'for the specified number'
            );
        } else {
            if (value.isNeg()) {
                this.writeBit(true);
                const b = new BN(2);
                const nb = b.pow(new BN(bitLength - 1));
                this.writeUint(nb.add(value), bitLength - 1);
            } else {
                this.writeBit(false);
                this.writeUint(value, bitLength - 1);
            }
        }
    }

    /**
     * Writes the specified unsigned 8-bit integer to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    public writeUint8(value: number) {
        this.writeUint(value, 8);
    }

    /**
     * Writes the specified array of the unsigned 8-bit integers
     * to the bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    public writeBytes(values: Uint8Array) {
        for (const value of values) {
            this.writeUint8(value);
        }
    }

    /**
     * Represents the specified multibyte string as bytes and writes
     * them to the bit-string, starting at the current index and
     * advances the current index cursor by the number of bits written.
     */
    public writeString(text: string) {
        this.writeBytes(
            stringToBytes(text)
        );
    }

    /**
     * Writes the specified amount in nanograms to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    public writeGrams(nanograms: (number | BN)): void {
        nanograms = new BN(nanograms);
        if (nanograms.isZero()) {
            this.writeUint(0, 4);
        } else {
            const length = Math.ceil((nanograms.toString(16).length) / 2);
            this.writeUint(length, 4);
            this.writeUint(nanograms, length * 8);
        }
    }

    /**
     * Writes the specified TON amount in nanotons to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    public writeCoins(nanotons: (number | BN)) {
        return this.writeGrams(nanotons);
    }

    /**
     * Writes the specified address to the bit-string,
     * starting at the current index and advances the
     * current index cursor by the number of bits written.
     */
    public writeAddress(address?: Address) {

        // addr_none$00 = MsgAddressExt;
        // addr_std$10 anycast:(Maybe Anycast)
        // workchain_id:int8 address:uint256 = MsgAddressInt;

        if (!address) {
            this.writeUint(0, 2);
        } else {
            this.writeUint(2, 2);
            this.writeUint(0, 1); // TODO split addresses (anycast)
            this.writeInt(address.wc, 8);
            this.writeBytes(address.hashPart);
        }

    }

    /**
     * Appends the specified bit-string to the bit-string,
     * starting at the current index and advances the
     * current index cursor by the number of bits written.
     */
    public writeBitString(bitString: BitString) {
        bitString.forEach(bit => this.writeBit(bit));
    }

    /**
     * Creates a cloned instance of the bit-string.
     */
    public clone() {
        const bitString = new BitString(0);
        bitString.array = this.array.slice(0);
        bitString.length = this.length
        bitString.cursor = this.cursor;
        return bitString;
    }

    /**
     * Returns the bit-string represented as HEX-string.
     */
    public toString(): string {
        return this.toHex();
    }

    /**
     * @todo: provide meaningful method description
     */
    public getTopUppedArray(): Uint8Array {
        const ret = this.clone();

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
     * Returns the bit-string represented as HEX-string (like in Fift).
     */
    public toHex(): string {
        if (this.cursor % 4 === 0) {
            const s = bytesToHex(this.array.slice(0, Math.ceil(this.cursor / 8))).toUpperCase();
            if (this.cursor % 8 === 0) {
                return s;
            } else {
                // @todo: don't use non-standard `substr()` function,
                //        use slice() instead?
                return s.substr(0, s.length - 1);
            }
        } else {
            const temp = this.clone();
            temp.writeBit(1);
            while (temp.cursor % 4 !== 0) {
                temp.writeBit(0);
            }
            const hex = temp.toHex().toUpperCase();
            return hex + '_';
        }
    }

    /**
     * Sets this cell data to match provided topUppedArray.
     *
     * @todo: provide a more meaningful method description
     */
    public setTopUppedArray(bytes: Uint8Array, fulfilledBytes = true) {
        this.length = bytes.length * 8;
        this.array = bytes;
        this.cursor = this.length;
        if (fulfilledBytes || !this.length) {
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
            if (!foundEndBit) {
                throw new Error('Incorrect TopUppedArray');
            }
        }
    }


    /**
     * Checks if the specified index is allowed for
     * the bit string, throws error in case of overflow.
     */
    private checkIndexOrThrow(index: number) {
        // @todo: probably off-by-one error
        if (index > this.length) {
            throw Error('BitString overflow');
        }
    }

}
