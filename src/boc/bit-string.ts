
import BN from 'bn.js';

import { stringToBytes } from '../utils/text-encoding';
import { bytesToHex } from '../utils/common';
import { Address } from '../utils/address';

import {
    BigIntInput,
    Bit,
    BitInput,
    expectBit,
    expectSafeInteger,
    parseBigIntInput,

} from '../common/numbers';


const completionTag = '_';


/**
 * Represents an array of bits of the fixed length. Allows
 * to serialize various data types to bits and supports
 * single-bit operations. Serves as a data container for
 * {@link Cell | Cells}.
 */
export class BitString {

    /**
     * @internal
     * @todo: rename to `bytes` and make this private
     */
    public array: Uint8Array;

    /**
     * @internal
     * @todo: make this private
     */
    public cursor = 0;

    /**
     * @internal
     * @todo: make this private
     */
    public length: number;


    /**
     * @param length - A length of the bit-string in bits,
     *                 can't be changed after creation.
     */
    constructor(length: number) {

        this.length = length;

        this.array = new Uint8Array(
            Math.ceil(length / 8)
        );

    }


    /**
     * Returns number of unfilled bits in the bit-string.
     */
    public getFreeBits(): number {
        return (this.length - this.cursor);
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
     *
     * @todo: rename to `getUsedBytesCount()`
     * @todo: implement `getUsedBytes(): Uint8Array`
     */
    public getUsedBytes(): number {
        return Math.ceil(this.getUsedBits() / 8);
    }

    /**
     * Returns the bit value at the specified index
     * in the bit-string.
     *
     * @param index - An index of the bit to read.
     */
    public get(index: number): Bit {
        this.checkIndexOrThrow(index);
        const byteValue = this.array[(index / 8) | 0];
        const offset = (7 - (index % 8));
        return (byteValue & (1 << offset)) > 0;
    }

    /**
     * Sets the bit at the specified index.
     *
     * @param index - An index of the bit to set.
     *
     * @todo: should rename this method to `setBit()`
     */
    public on(index: number): void {
        this.checkIndexOrThrow(index);
        setBit(this.array, index);
    }

    /**
     * Clears the bit at the specified index.
     *
     * @param index - An index of the bit to clear.
     *
     * @todo: should rename this method to `clearBit()`
     */
    public off(index: number): void {
        this.checkIndexOrThrow(index);
        this.array[(index / 8) | 0] &= ~(1 << (7 - (index % 8)));
    }

    /**
     * Toggles the bit at the specified index.
     *
     * @param index - An index of the bit to toggle.
     *
     * @todo: should rename this method to `toggleBit()`
     */
    public toggle(index: number): void {
        this.checkIndexOrThrow(index);
        this.array[(index / 8) | 0] ^= 1 << (7 - (index % 8));
    }

    /**
     * Iterates the bits of the bit-string and calls the
     * specified user function for each bit, passing in
     * the value.
     *
     * @param callback - A callback function to execute
     *                   for each sequential bit.
     *
     * @todo: implement iteration protocol
     */
    public forEach(callback: (bit: Bit) => void): void {
        if (typeof callback !== 'function') {
            throw new Error(
                `Specified callback must be a function`
            );
        }
        const max = this.cursor;
        for (let i = 0; i < max; i++) {
            callback(this.get(i));
        }
    }

    /**
     * Appends the specified bit value to the end
     * of the bit-string.
     *
     * @param bit - Bit value
     *              (a boolean or a number: `0` or `1`).
     */
    public writeBit(bit: BitInput): void {

        expectBit(bit);

        if (bit) {
            this.on(this.cursor);
        } else {
            this.off(this.cursor);
        }

        this.cursor++;

    }

    /**
     * Appends the specified array of bit values
     * to the end of the bit-string.
     *
     * @param values - An array of individual bits.
     *                 Each bit should a boolean or
     *                 a number: `0` or `1`.
     */
    public writeBitArray(values: BitInput[]): void {
        if (!Array.isArray(values)) {
            throw new Error(
                `Specified value must be an array of bits`
            );
        }
        for (let i = 0; i < values.length; i++) {
            this.writeBit(values[i]);
        }
    }

    /**
     * Appends the specified unsigned integer of the
     * specified length in bits to the bit-string.
     *
     * @param value - Unsigned integer value as `number`,
     *                `BN` or `string`. Shouldn't occupy
     *                more bits than specified in
     *                the `bitLength` argument.
     *
     * @param bitLength - The number of bits that should be
     *                    occupied by the specified integer
     *                    in the bit-string.
     */
    public writeUint(
        value: BigIntInput,
        bitLength: number

    ): void {

        value = parseBigIntInput(value);

        if (value.isNeg()) {
            throw new Error(
                `Specified value must be positive`
            );
        }

        this.checkBitLengthOrThrow(bitLength);

        if (
            bitLength === 0 || (value.bitLength() > bitLength)
        ) {
            throw Error(
                `Specified bit-length (${bitLength}) is ` +
                `too small for the specified number (${value})`
            );
        }
        const numberString = value.toString(2, bitLength);
        for (let i = 0; i < bitLength; i++) {
            this.writeBit(numberString[i] === '1');
        }
    }

    /**
     * Appends the specified unsigned 8-bit integer to the
     * bit-string.
     *
     * @param value - Unsigned integer value as `number`,
     *                `BN` or `string`. Shouldn't occupy
     *                more than 8 bits.
     */
    public writeUint8(value: BigIntInput): void {
        this.writeUint(value, 8);
    }

    /**
     * Appends the specified signed integer of the specified
     * length in bits to the bit-string.
     *
     * @param value - Integer value as `number`, `BN` or
     *                `string`. Shouldn't occupy
     *                more bits than specified in
     *                the `bitLength` argument.
     *
     * @param bitLength - The number of bits that should be
     *                    occupied by the specified integer
     *                    in the bit-string.
     */
    public writeInt(
        value: BigIntInput,
        bitLength: number

    ): void {

        this.checkBitLengthOrThrow(bitLength);

        value = parseBigIntInput(value);

        if (bitLength === 1) {
            if (value.eqn(-1)) {
                this.writeBit(true);
                return;

            } else if (value.isZero()) {
                this.writeBit(false);
                return;

            } else {
                throw new Error(
                    'Specified bit-length is too small ' +
                    'for the specified negative number'
                );
            }
        }

        if (value.isNeg()) {

            // Using two's complement method to represent negative integers
            // {$link https://en.wikipedia.org/wiki/Two%27s_complement}

            // Negative sign bit
            this.writeBit(true);

            // Most significant bit value
            const msb = new BN(2).pow(
                new BN(bitLength - 1)
            );

            // the value is already negative,
            // so we can just add it to find complement
            const complement = msb.add(value);

            if (complement.ltn(0)) {
                throw new Error(
                    'Specified bit-length is too small ' +
                    'for the specified negative number'
                );
            }

            this.writeUint(complement, bitLength - 1);

        } else {

            // Positive sign bit
            this.writeBit(false);

            this.writeUint(value, bitLength - 1);

        }

    }

    /**
     * Appends the specified array of the unsigned 8-bit
     * integers to the bit-string.
     *
     * @param bytes - An `Uint8Array` representing an array
     *                of bytes to append.
     */
    public writeBytes(bytes: Uint8Array): void {
        if (!(bytes instanceof Uint8Array)) {
            throw new Error(
                'Specified value must be a Uint8Array'
            );
        }
        for (const value of bytes) {
            this.writeUint8(value);
        }
    }

    /**
     * Represents the specified multibyte string as bytes
     * and appends them to the end of the bit-string.
     *
     * @param text - A multibyte string to append
     *               to the bit-string. UTF-8 values are
     *               supported.
     */
    public writeString(text: string): void {

        if (typeof text !== 'string') {
            throw new Error(
                `Specified value must be a string`
            );
        }

        this.writeBytes(
            stringToBytes(text)
        );

    }

    /**
     * Appends the specified amount of nanograms to the
     * bit-string.
     *
     * @param nanograms - Unsigned integer value as `number`,
     *                    `BN` or `string`, representing the
     *                    number of nanograms to append to the
     *                    bit-string.
     */
    public writeGrams(nanograms: BigIntInput): void {

        nanograms = parseBigIntInput(nanograms);

        if (nanograms.isNeg()) {
            throw new Error(
                `Nanograms value must be equal to ` +
                `or greater than zero`
            )
        }

        if (nanograms.isZero()) {
            this.writeUint(0, 4);

        } else {
            const byteLength = nanograms.byteLength();
            this.writeUint(byteLength, 4);
            this.writeUint(nanograms, byteLength * 8);
        }

    }

    /**
     * Writes the specified TON amount in nanotons to the
     * bit-string.
     *
     * @param nanotons - Unsigned integer value as `number`,
     *                   `BN` or `string`, representing the
     *                   number of nanotons to append to the
     *                   bit-string.
     *
     * @todo: why do we have a duplicate method?
     */
    public writeCoins(nanotons: BigIntInput): void {

        return this.writeGrams(nanotons);

    }

    /**
     * Appends the specified address to the bit-string.
     *
     * @param address - An instance of
     *                  {@link Address | Address} to append.
     *
     * @todo: allow to specify address as a string
     */
    public writeAddress(address?: Address): void {

        // Writing empty address
        if (address === undefined || address === null) {
            this.writeUint(0, 2);
            return;
        }

        if (!(address instanceof Address)) {
            throw new Error(
                `Specified address must be ` +
                `an instance of Address`
            );
        }

        // addr_none$00 = MsgAddressExt;
        this.writeUint(2, 2);

        // addr_std$10 anycast:(Maybe Anycast)
        // @todo: split addresses (anycast)
        this.writeUint(0, 1);

        // workchain_id:int8
        this.writeInt(address.wc, 8);

        // address:uint256 = MsgAddressInt;
        this.writeBytes(address.hashPart);

    }

    /**
     * Appends the specified bit-string to this bit-string.
     *
     * @param bitString - An instance of another
     *                    {@link BitString | BitString}
     *                    to append.
     */
    public writeBitString(bitString: BitString): void {

        if (!(bitString instanceof BitString)) {
            throw new Error(
                `Specified value must be ` +
                `an instance of BitString`
            );
        }

        bitString.forEach(bit => this.writeBit(bit));

    }

    /**
     * Creates a cloned instance of the bit-string.
     *
     * @returns Returns new {@link BitString | BitString}
     *          with exactly the same content and length
     *          as this one.
     */
    public clone(): BitString {

        // @todo: this should be implemented as a constructor
        //        to prevent from public accessing the
        //        properties that should be private

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
     * Serializes bit-string into as a sequence of bytes (octets).
     * The completion bits are added if the number of used
     * bits is not divisible by eight.
     *
     * @todo: rename this method to `getBytes()` for clarity
     */
    public getTopUppedArray(): Uint8Array {

        // Chapter 1.0.4 of the "Telegram Open Network Virtual Machine".
        // ${link https://ton-blockchain.github.io/docs/tvm.pdf}
        //
        // Split the BitString into groups of eight bits.
        // If the length of the BitString is not a multiple
        // of eight, the BitString is augmented by a binary
        // `1` and up to seven binary `0`s before being
        // split into groups.

        const usedBits = this.getUsedBits();
        const bytes = this.array.slice(0, this.getUsedBytes());

        // Checking if completion is needed
        if (usedBits % 8 !== 0) {
            // Setting the first completion bit,
            // trailing zeroes are already present
            setBit(bytes, usedBits);

            // @todo: check the case when array of bytes
            //        is set externally

        }

        return bytes;

    }

    /**
     * Parses the specified array of bytes and replaces
     * bit-string data with it.
     *
     * @param bytes - An array of bytes to parse.
     *
     * @param noCompletion - Flag indicating that the specified
     *                       array of bytes doesn't have a
     *                       completion bits.
     *
     * @todo: replace with `static createFromBytes()`
     */
    public setTopUppedArray(
        bytes: Uint8Array,
        noCompletion = true

    ): void {

        // Chapter 1.0.4 of the "Telegram Open Network Virtual Machine".
        // ${link https://ton-blockchain.github.io/docs/tvm.pdf}

        if (!(bytes instanceof Uint8Array)) {
            throw new Error(
                `Specified "bytes" value must be ` +
                `an instance of Uint8Array`
            );
        }

        if (typeof noCompletion !== 'boolean') {
            throw new Error(
                `Specified "noCompletion" flag ` +
                `must be a boolean`
            );
        }

        this.length = (bytes.length * 8);
        this.array = bytes;
        this.cursor = this.length;

        if (noCompletion || !this.length) {
            return;

        } else {
            // Parsing bytes with completion
            let foundEndBit = false;
            for (let c = 0; c < 7; c++) {
                this.cursor -= 1;
                if (this.get(this.cursor) === true) {
                    foundEndBit = true;
                    break;
                }
            }
            if (!foundEndBit) {
                throw new Error(
                    `Failed to find first bit of the ` +
                    `completion in the specified bit-string bytes`
                );
            }
        }

        // @todo: implement support for `0x80` octet?
        //
        // In some cases, it is more convenient to assume
        // the completion is enabled by default rather than
        // store an additional completion tag bit separately.
        // Under such conventions, 8n-bit strings are
        // represented by n + 1 octets, with the last octet
        // always equal to 0x80 = 128.

    }

    /**
     * Returns the bit-string represented as a HEX-string
     * (like in Fift).
     */
    public toHex(): string {

        // Chapter 1.0.1 of the "Telegram Open Network Virtual Machine".
        // ${link https://ton-blockchain.github.io/docs/tvm.pdf}
        //

        const usedBits = this.getUsedBits();
        const bytes = this.array.slice(0, this.getUsedBytes());

        const requireCompletion = (usedBits % 4 !== 0);

        const lastByteUsed = (
            (usedBits % 8 === 0) ||
            (usedBits % 8 > 4)
        );

        if (requireCompletion) {
            // Setting the first completion bit,
            // trailing zeroes are already present
            setBit(bytes, usedBits);

            // @todo: check the case when array of bytes
            //        is set externally

        }

        let hexString = bytesToHex(bytes).toUpperCase();

        if (!lastByteUsed) {
            hexString = hexString.slice(0, (hexString.length - 1));
        }

        return (
            `${hexString}` +
            `${requireCompletion ? completionTag : ''}`
        );

    }


    /**
     * Checks if the specified index is allowed for
     * the bit string, throws error in case of overflow.
     */
    private checkIndexOrThrow(index: number): void {

        expectSafeInteger(index, (
            'Incorrect BitString index, ' +
            'specified value must be a valid integer'
        ));

        if (index < 0) {
            throw Error(
                'Incorrect BitString index, ' +
                'must be greater than zero'
            );
        }

        if (index >= this.length) {
            throw Error('BitString overflow');
        }

    }

    /**
     * Checks if the specified bit length is valid in TVM,
     * throws error in case it's not.
     */
    private checkBitLengthOrThrow(bitLength: number): void {

        expectSafeInteger(bitLength, (
            'Specified bit-length must be a valid integer'
        ));

        // Chapter 1.5 of the "Telegram Open Network Virtual Machine".
        // ${link https://ton-blockchain.github.io/docs/tvm.pdf}

        if (bitLength <= 0 || bitLength > 256) {
            throw new Error(
                `Bit length must be greater than zero ` +
                `and less or equal to 256`
            );
        }

    }

}


/**
 * @todo: extract all bit-related functionality
 */

/**
 * Sets bit by the specific index in the specified array of bytes.
 *
 * @param bytes - An array of bytes representing a bit-string.
 * @param index - Absolute index of the bit to set.
 */
function setBit(bytes: Uint8Array, index: number) {
    bytes[(index / 8) | 0] |= 1 << (7 - (index % 8));
}
