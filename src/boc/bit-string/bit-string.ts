
import BN from 'bn.js';

import { stringToBytes } from '../../utils/text-encoding';
import { Address, AddressType, AddressTypes } from '../../utils/address';
import { CellSlice } from '../cell/cell-slice';

import {
    bytesToHexWithCompletion,
    clearBit,
    determineBitLength,
    readBit,
    setBit,
    toggleBit,

} from './utils';

import {
    BigIntInput,
    Bit,
    BitInput,
    checkUintBitLengthOrThrow,
    expectBit,
    expectSafeInteger,
    parseBigIntInput,

} from '../../common/numbers';


export interface RawBitString {
    bytes: Uint8Array;
    usedBits: number;
}


/**
 * Represents an array of bits of the fixed length. Allows
 * to serialize various data types to bits and supports
 * single-bit operations. Serves as a data container for
 * {@link Cell | Cells}.
 */
export class BitString {

    /**
     * Maximum number of bits that this bit-string should hold.
     */
    private maxLength = 1023;

    /**
     * Internal representation of the stored bit data.
     * Special bit arithmetic is used to operate on individual
     * bits inside of bytes.
     */
    private bytes: Uint8Array;

    /**
     * Internal counter to store the number of bits
     * that are actually used.
     */
    private usedBits = 0;


    /**
     * Returns maximum available length of the bit-string.
     */
    public get length(): number {
        return this.maxLength;
    }


    /**
     * @param maxLength - A maximum length of the bit-string
     *                    in bits, can't be changed after
     *                    creation.
     */
    constructor(maxLength?: number);

    /**
     * Creates a bit-string using the specified array of
     * bytes.
     *
     * @param bytes - An array of bytes to parse.
     *
     * @param hasCompletion - Flag indicating that the specified
     *                        array of bytes doesn't have a
     *                        completion bits.
     */
    constructor(bytes: Uint8Array, hasCompletion: boolean);

    /**
     * Creates a bit-string using the specified array of
     * bytes and the bit length.
     *
     * @param bytes - An array of bytes to parse.
     *
     * @param bitLength - Length of the bit string in bits.
     *
     * @param maxLength - Maximum available length of the
     *                    bit-string.
     */
    constructor(
        bytes: Uint8Array,
        bitLength: number,
        maxLength: number
    );

    constructor(
        arg1?: (number | Uint8Array),
        arg2?: (boolean | number),
        arg3?: number,
    ) {

        // @todo hard-limit max number of bits to 1023

        if (arg1 !== undefined) {

            if (typeof arg1 === 'number') {

                // constructor(maxLength?: number);

                expectSafeInteger(arg1, 'maxLength');

                if (arg2 || arg3) {
                    throw new Error(
                        `Invalid constructor arguments`
                    );
                }

                this.maxLength = arg1;
                this.allocateBytes(arg1);

            } else if (arg1 instanceof Uint8Array) {

                // constructor(
                //   bytes: Uint8Array,
                //   noCompletion: boolean
                // );

                const bytes = arg1;

                if (typeof arg2 === 'boolean') {

                    // constructor(bytes: Uint8Array, hasCompletion?: boolean);

                    const hasCompletion = arg2;

                    this.setBytes(bytes, hasCompletion);

                } else if (
                    (typeof arg2 === 'number') &&
                    (typeof arg3 === 'number')
                ) {

                    // constructor(
                    //     bytes: Uint8Array,
                    //     bitLength: number,
                    //     maxLength: number
                    // );

                    const bitLength = arg2;
                    const maxLength = arg3;

                    expectSafeInteger(bitLength, 'bitLength');
                    expectSafeInteger(maxLength, 'maxLength');

                    const bytesRequired = (
                        Math.ceil(maxLength / 8)
                    );

                    if (bytes.length < bytesRequired) {
                        throw new Error(
                            `Specified byte array is not ` +
                            `big enough to contain ` +
                            `${maxLength} bits`
                        );
                    }

                    this.bytes = bytes;
                    this.usedBits = bitLength;
                    this.maxLength = maxLength;

                } else {
                    throw new Error(
                        `Invalid constructor arguments`
                    );

                }

            } else {
                throw new Error(
                    `Invalid constructor arguments`
                );

            }

        } else {

            // constructor();

            if (arg2 || arg3) {
                throw new Error(
                    `Invalid constructor arguments`
                );
            }

            // Allocating with default max length
            this.allocateBytes(this.maxLength);

        }

    }


    /**
     * Returns number of unfilled bits in the bit-string.
     */
    public getFreeBits(): number {
        return (this.maxLength - this.usedBits);
    }

    /**
     * Returns number of filled bits in the bit-string.
     */
    public getUsedBits(): number {
        return this.usedBits;
    }

    /**
     * Returns number of bytes actually used by the bit-string.
     * Rounds up to a whole byte.
     */
    public getUsedBytes(): number {
        return Math.ceil(this.getUsedBits() / 8);
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

        const offset = this.usedBits;

        this.allocateBits(1);

        if (bit) {
            this.setBit(offset);
        } else {
            this.clearBit(offset);
        }

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

        expectSafeInteger(bitLength);
        checkUintBitLengthOrThrow(bitLength);

        if (
            bitLength === 0 || (value.bitLength() > bitLength)
        ) {
            throw Error(
                `Specified bit-length (${bitLength}) is ` +
                `too small for the specified number (${value})`
            );
        }

        // @todo: write whole bytes when possible for
        //        performance optimization.

        const numberString = value.toString(2, bitLength);
        for (let i = 0; i < bitLength; i++) {
            this.writeBit(numberString[i] === '1');
        }

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

        expectSafeInteger(bitLength);
        checkUintBitLengthOrThrow(bitLength);

        value = parseBigIntInput(value);

        const powered = new BN(2).pow(
            (new BN(bitLength).subn(1))
        );

        const maxValue = powered.subn(1);
        const minValue = powered.muln(-1);

        if (value.gt(maxValue) || value.lt(minValue)) {
            throw new Error(
                `Specified signed integer can't be represented ` +
                `using the specified amount of bits`
            );
        }

        this.writeUint(
            value.toTwos(bitLength),
            bitLength
        );

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
            this.writeUint(value, 8);
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
     * Writes the specified TON amount in nanotons to the
     * bit-string.
     *
     * @param coins - Unsigned integer value as `number`,
     *                `BN` or `string`, representing the
     *                number of coins to append to the
     *                bit-string.
     */
    public writeCoins(coins: BigIntInput): void {

        coins = parseBigIntInput(coins);

        if (coins.isNeg()) {
            throw new Error(
                `coins value must be equal to ` +
                `or greater than zero`
            )
        }

        if (coins.isZero()) {
            this.writeUint(0, 4);

        } else {
            const byteLength = coins.byteLength();
            this.writeUint(byteLength, 4);
            this.writeUint(coins, byteLength * 8);
        }

    }

    /**
     * Appends the specified standard internal address
     * to the bit-string.
     *
     * @param address - An instance of
     *                  {@link Address | Address} to append.
     */
    public writeAddress(address?: AddressType): void {

        // Writing empty address
        if (address === undefined || address === null) {

            /**
             * addr_none$00 = MsgAddressExt;
             */

            // addr_none$00
            this.writeUint(AddressTypes.None, 2);

            return;

        }

        if (
            !(address instanceof Address) &&
            !(typeof address === 'string')
        ) {
            throw new Error(
                `Specified address must be ` +
                `a string or an instance of Address`
            );
        }

        address = new Address(address);

        /**
         * addr_std$10
         *   anycast:(Maybe Anycast)
         *   workchain_id:int8
         *   address:bits256
         *
         * = MsgAddressInt;
         */

        // addr_std$10
        this.writeUint(AddressTypes.InternalStandard, 2);

        // Anycast is not supported
        // anycast:(Maybe Anycast)
        this.writeUint(0, 1);

        // workchain_id:int8
        this.writeInt(address.wc, 8);

        // address:bits256
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

        // @todo: copy whole bytes when possible
        //        for optimal performance.

        for (let offset = 0; offset < bitString.usedBits; offset++) {
            this.writeBit(bitString.readBit(offset));
        }

    }

    /**
     * Creates a cloned instance of the bit-string.
     *
     * @returns Returns a new {@link BitString | BitString}
     *          that is exact copy of this one.
     */
    public clone(): BitString {

        return new BitString(
            this.bytes.slice(0),
            this.usedBits,
            this.maxLength
        );

    }

    /**
     * Returns the bit-string represented as HEX-string.
     */
    public toString(): string {
        return this.toHex();
    }

    /**
     * Returns the bit-string represented as a HEX-string
     * (like in Fift).
     */
    public toHex(): string {

        return bytesToHexWithCompletion(
            this.bytes,
            this.usedBits
        );

    }

    /**
     * Serializes bit-string into a sequence of bytes (octets).
     * The completion bits are added if the number of used
     * bits is not divisible by eight.
     */
    public getTopUppedArray(): Uint8Array {

        // Chapter 1.0.4 of the "Telegram Open Network Virtual Machine".
        // {@link https://ton-blockchain.github.io/docs/tvm.pdf}
        //
        // Split the BitString into groups of eight bits.
        // If the length of the BitString is not a multiple
        // of eight, the BitString is augmented by a binary
        // `1` and up to seven binary `0`s before being
        // split into groups.

        const usedBits = this.getUsedBits();
        const bytes = this.bytes.slice(0, this.getUsedBytes());

        // Checking if completion is needed
        if (usedBits % 8 !== 0) {
            // Setting the first completion bit,
            // trailing zeroes are already present
            setBit(bytes, usedBits);

        }

        return bytes;

    }

    /**
     * @internal
     *
     * Returns raw bytes data from the bit-string. Used
     * internally for Slice construction.
     */
    public getRawData(): RawBitString {

        return {
            bytes: this.bytes,
            usedBits: this.usedBits,
        };

    }


    //================//
    // DEPRECATED API //
    //================//

    /**
     * @deprecated - Don't access the underlying bytes directly,
     *               use the {@link CellSlice} instead to parse the
     *               bit-string.
     *
     * This getter is available only for backward-compatibility.
     *
     * @todo remove this getter
     */
    public get array(): Uint8Array {

        // Returning a copy of the original bytes
        // to prevent them from being mutated.
        return this.bytes.slice(0);

    }

    /**
     * @deprecated: don't use internal cursor directly,
     *              use {@link BitString.getUsedBits | getUsedBits()}
     *              instead.
     *
     * This getter is available only for backward-compatibility.
     *
     * @todo remove this getter
     */
    public get cursor(): number {
        return this.getUsedBits();
    }

    /**
     * Returns the bit value at the specified index
     * in the bit-string.
     *
     * @param offset - An offset of the bit to read.
     *
     * @deprecated - Use the
     *               {@link CellSlice.loadBit() | loadBit()}
     *               instead.
     *
     * @todo: remove this method
     */
    public get(offset: number): Bit {
        return this.readBit(offset);
    }


    /**
     * Sets the bit at the specified offset.
     *
     * @param offset - A bit offset of the bit to set.
     *
     * @deprecated Don't manipulate the bits directly,
     *             use `write*` methods instead.
     *
     * @todo: remove this method
     */
    public on(offset: number): void {
        this.setBit(offset);
    }

    /**
     * Clears the bit at the specified index.
     *
     * @param offset - A bit offset of the bit to clear.
     *
     * @deprecated Don't manipulate the bits directly,
     *             use `write*` methods instead.
     *
     * @todo: remove this method
     */
    public off(offset: number): void {
        this.clearBit(offset);
    }

    /**
     * Toggles the bit at the specified offset.
     *
     * @param offset - A bit offset of the bit to toggle.
     *
     * @deprecated Don't manipulate the bits directly,
     *             use `write*` methods instead.
     *
     * @todo: remove this method
     */
    public toggle(offset: number): void {
        this.toggleBit(offset);
    }

    /**
     * Iterates the bits of the bit-string and calls the
     * specified user function for each bit, passing in
     * the value.
     *
     * @param callback - A callback function to execute
     *                   for each sequential bit.
     *
     * @deprecated Use the native Slice iterator
     *             to iterate over bits instead.
     *
     * @todo: remove this method
     */
    public forEach(callback: (bit: Bit) => void): void {
        if (typeof callback !== 'function') {
            throw new Error(
                `Specified callback must be a function`
            );
        }
        for (let offset = 0; offset < this.usedBits; offset++) {
            callback(this.readBit(offset));
        }
    }

    /**
     * Appends the specified unsigned 8-bit integer to the
     * bit-string.
     *
     * @param value - Unsigned integer value as `number`,
     *                `BN` or `string`. Shouldn't occupy
     *                more than 8 bits.
     *
     * @deprecated Use the
     *             {@link BitString.writeUint() | writeUint(value, 8)}
     *             instead.
     */
    public writeUint8(value: BigIntInput): void {
        this.writeUint(value, 8);
    }

    /**
     * Appends the specified amount of nanograms to the
     * bit-string.
     *
     * @param nanograms - Unsigned integer value as `number`,
     *                    `BN` or `string`, representing the
     *                    number of nanograms to append to the
     *                    bit-string.
     *
     * @deprecated: Use the
     *              {@link BitString.writeCoins() | writeCoins()}
     *              instead.
     */
    public writeGrams(nanograms: BigIntInput): void {
        this.writeCoins(nanograms);
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
     * @deprecated Use the constructor with bytes argument.
     */
    public setTopUppedArray(
        bytes: Uint8Array,
        noCompletion = true

    ): void {

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

        this.setBytes(bytes, !noCompletion);

    }


    //=================//
    // PRIVATE METHODS //
    //=================//

    /**
     * Sets the bit at the specified offset
     * in the used bounds of the bit-string.
     *
     * @param offset - An offset of the bit to set.
     */
    private setBit(offset: number): void {
        this.checkOffsetOrThrow(offset);
        setBit(this.bytes, offset);
    }

    /**
     * Clears the bit at the specified index
     * in the used bounds of the bit-string.
     *
     * @param offset - A bit offset of the bit to clear.
     */
    private clearBit(offset: number): void {
        this.checkOffsetOrThrow(offset);
        clearBit(this.bytes, offset);
    }

    /**
     * Toggles the bit at the specified offset
     * in the used bounds of the bit-string.
     *
     * @param offset - A bit offset of the bit to toggle.
     */
    private toggleBit(offset: number): void {
        this.checkOffsetOrThrow(offset);
        toggleBit(this.bytes, offset);
    }

    /**
     * Returns value of the bit at the specified offset
     * in the used bounds of the bit-string.
     *
     * @param offset - Offset in bits from which to start
     *                 reading data.
     */
    private readBit(offset: number): Bit {
        this.checkOffsetOrThrow(offset);
        return readBit(this.bytes, offset);
    }

    private allocateBytes(bitLength: number) {

        // @todo: do not allocate all the bytes in front,
        //        instead we should dynamically allocate
        //        more bytes when necessary using some
        //        smart heuristics.

        this.bytes = new Uint8Array(
            Math.ceil(bitLength / 8)
        );

    }

    /**
     * Increases used bits by the specified amount of bits.
     *
     * @throws Error
     * Throws error when maximum BitString length is exceeded.
     */
    private allocateBits(bitLength: number): void {

        const freeBits = this.getFreeBits();

        if (bitLength > freeBits) {
            throw new Error(
                `BitString overflow: can't allocate ` +
                `${bitLength} more bits, only ${freeBits} ` +
                `bits are available`
            );
        }

        this.usedBits += bitLength;

    }

    /**
     * Checks if the specified offset is in used bounds
     * of the bit-string.
     *
     * @throws Error
     * Throws errors when offset is invalid
     * or is out of used bounds.
     */
    private checkOffsetOrThrow(offset: number): void {

        expectSafeInteger(offset, (
            'Incorrect BitString offset, ' +
            'specified value must be a valid integer'
        ));

        if (offset < 0) {
            throw Error(
                'Incorrect BitString offset, ' +
                'must be greater than zero'
            );
        }

        if (offset >= this.usedBits) {
            throw Error('BitString offset is out of bounds');
        }

    }

    /**
     * Parses the specified array of bytes and replaces
     * bit-string data with it.
     *
     * @param bytes - An array of bytes to parse.
     *
     * @param hasCompletion - Flag indicating that the specified
     *                       array of bytes doesn't have a
     *                       completion bits.
     */
    private setBytes(
        bytes: Uint8Array,
        hasCompletion: boolean

    ): void {

        this.bytes = bytes;
        this.maxLength = (bytes.length * 8);

        this.usedBits = determineBitLength(
            bytes,
            hasCompletion
        );

    }

}
