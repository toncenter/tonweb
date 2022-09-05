
import BN from 'bn.js';

import { Bit, checkUintBitLengthOrThrow, expectSafeInteger } from '../../common/numbers';
import { Address, AddressTypes } from '../../utils/address';
import { bytesToString } from '../../utils/text-encoding';
import { readBit } from '../bit-string/utils';
import { Cell } from './cell';


/**
 * @alpha
 * @experimental
 *
 * A cell reading utility that allows to deserialize cell
 * content.
 */
export class CellSlice {

    /**
     * Internal representation of the stored bit data.
     * Special bit arithmetic is used to operate on individual
     * bits inside of byte array.
     */
    private readonly bytes: Uint8Array;

    readonly #length: number = 0;

    private readonly refs: Cell[] = [];

    /**
     * Current (fixed) reading offset.
     */
    private cursor = 0;

    /**
     * Number of bits read by the pending operation.
     */
    private bitsRead = 0;

    private get offset(): number {
        return (this.cursor + this.bitsRead);
    }


    /**
     * Creates slice from the specified cell.
     *
     * @param cell - A cell to parse.
     */
    constructor(private readonly cell: Cell) {

        const { bytes, usedBits } = cell.bits.getRawData();

        // No need to copy the bytes, because we are not
        // going to mutate them, this is a read-only utility
        // after all.

        this.bytes = bytes;

        this.#length = usedBits;

        this.refs = cell.refs;

    }


    /**
     * Returns number of unloaded bits left in the slice.
     */
    public getBitsCount(): number {

        return (this.#length - this.cursor);

    }

    /**
     * Tells whether the slice is completely empty,
     * i.e. doesn't have unloaded bits and cell references.
     */
    public isEmpty(): boolean {

        return (
            this.isDataEmpty() &&
            this.isRefsEmpty()
        );

    }

    /**
     * Tells whether the slice doesn't have unloaded bits.
     */
    public isDataEmpty() {

        return (this.getBitsCount() === 0);

    }

    /**
     * Returns value of the next bit in the slice.
     */
    public loadBit(): Bit {

        return this.handleLoading(
            () => this.readBit()
        );

    }

    /**
     * Returns value of the next bit in the slice without
     * removing it from the slice.
     */
    public preloadBit(): Bit {

        return this.handlePreloading(
            () => this.readBit()
        );

    }

    /**
     * Loads an unsigned integer of the specified
     * length from the slice.
     *
     * @param bitLength - Length in bits of the unsigned
     *                    integer to read.
     */
    public loadUint(bitLength: number): BN {

        expectSafeInteger(bitLength, 'bitLength');

        return this.handleLoading(
            () => this.readUint(bitLength)
        );

    }

    /**
     * Loads an unsigned integer of the specified
     * length from the slice without removing it
     * from the slice.
     *
     * @param bitLength - Length in bits of the unsigned
     *                    integer to read.
     */
    public preloadUint(bitLength: number): BN {

        expectSafeInteger(bitLength, 'bitLength');

        return this.handlePreloading(
            () => this.readUint(bitLength)
        );

    }

    /**
     * Loads a signed integer of the specified
     * length from the slice.
     *
     * @param bitLength - Length in bits of the signed
     *                    integer to read.
     */
    public loadInt(bitLength: number): BN {

        expectSafeInteger(bitLength, 'bitLength');

        return this.handleLoading(
            () => this.readInt(bitLength)
        );

    }

    /**
     * Loads a signed integer of the specified
     * bit length from the slice without removing it
     * from the slice.
     *
     * @param bitLength - Length in bits of the signed
     *                    integer to read.
     */
    public preloadInt(bitLength: number): BN {

        expectSafeInteger(bitLength, 'bitLength');

        return this.handlePreloading(
            () => this.readInt(bitLength)
        );

    }

    /**
     * Loads an array of bytes from the slice.
     *
     * @param bitLength - Number of bits to load, must be
     *                    a factor of 8. Loads all bytes
     *                    from the slice if omitted.
     */
    public loadBytes(bitLength?: number): Uint8Array {

        return this.handleLoading(
            () => this.readBytes(bitLength)
        );

    }

    /**
     * Loads an array of bytes from the slice without removing
     * loaded data from the slice.
     *
     * @param bitLength - Number of bits to load, must be
     *                    a factor of 8. Loads all bytes
     *                    from the slice if omitted.
     */
    public preloadBytes(bitLength?: number): Uint8Array {

        return this.handlePreloading(
            () => this.readBytes(bitLength)
        );

    }

    /**
     * Reads an address from the slice.
     */
    public loadAddress(): (Address | null) {

        return this.handleLoading(
            () => this.readAddress()
        );

    }

    /**
     * Reads an address from the slice without removing
     * the read data.
     */
    public preloadAddress(): (Address | null) {

        return this.handlePreloading(
            () => this.readAddress()
        );

    }

    /**
     * Loads a UTF-8 multibyte string from the slice.
     *
     * @returns A UTF-8 string loaded from the slice or
     *          an empty string if the slice is empty.
     *
     * @throws Error
     * Throws on parsing errors.
     */
    public loadString(): string {

        return this.handleLoading(
            () => this.readString()
        );

    }

    /**
     * Loads a UTF-8 multibyte string from the slice without
     * removing it from the slice.
     *
     * @returns A UTF-8 string read from the slice or
     *          an empty string if the slice is empty.
     *
     * @throws Error
     * Throws on parsing errors.
     */
    public preloadString(): string {

        return this.handlePreloading(
            () => this.readString()
        );

    }


    //============//
    // SNAKE DATA //
    //============//

    /**
     * Returns byte data encoded in the snake data format.
     *
     * @throws Error
     * Throws errors on incorrect snake data format.
     */
    public loadSnakeData(): Uint8Array {

        // @todo: optimize this
        const bytes: number[] = [];

        let slice: CellSlice = this;

        while (slice) {

            if (slice.getRefsCount() > 1) {
                throw new Error(
                    `Snake data cell can't have more ` +
                    `than one referenced cell`
                );
            }

            bytes.push(...slice.loadBytes());

            // Advancing reference to the next
            // ref cell if available.
            slice = slice.refs[0]?.parse();

        }

        return Uint8Array.of(...bytes);

    }

    /**
     * Returns a UTF-8 string encoded in the snake data format.
     *
     * @throws Error
     * Throws errors on incorrect snake data format.
     */
    public loadSnakeDataString(): string {

        return bytesToString(
            this.loadSnakeData()
        );

    }


    //=================//
    // SLICING METHODS //
    //=================//

    /**
     * Skips the specified amount of bits from the slice.
     *
     * @param bitLength - Number of bits to skip reading from
     *                    the slice.
     *
     * @returns The same slice instance back to the caller
     *          so the method calls could be chained.
     */
    public skipBits(bitLength: number): this {

        expectSafeInteger(bitLength, 'bitLength');

        this.handleLoading(() => {

            this.checkBoundsOrThrow(bitLength);

            this.bitsRead = bitLength;

        });

        return this;

    }


    //====================//
    // REFERENCES METHODS //
    //====================//

    /**
     * Returns `true` if there are no more cell references
     * in the slice, `false` otherwise.
     */
    public isRefsEmpty(): boolean {

        return (this.refs.length === 0);

    }

    /**
     * Returns number of referenced cells available
     * for reading from the slice.
     */
    public getRefsCount(): number {

        return this.refs.length;

    }

    /**
     * Returns next referenced cell from the list of
     * cell references.
     *
     * @throws Error
     * Throws when no more referenced cells are available.
     */
    public loadRef(): Cell {

        const refCell = this.readRef();

        this.refs.shift();

        return refCell;

    }

    /**
     * Returns next referenced cell from the list of
     * references without removing the reference
     * from the slice.
     *
     * @throws Error
     * Throws when no more referenced cells are available.
     */
    public preloadRef(): Cell {

        return this.readRef();

    }

    /**
     * @internal
     * @alpha
     * @experimental
     *
     * Implementation of the iterator protocol
     * that return each bit sequentially. Doesn't
     * affect the reading cursor.
     *
     * @example
     * Usage example:
     * ```
     * for (const bit of slice) {
     *     console.log(bit); // true/false
     * }
     * ```
     */
    public *[Symbol.iterator](): IterableIterator<boolean> {
        for (
            let offset = 0;
            offset < this.#length;
            offset++
        ) {
            yield this.readBit();
        }
    }


    //=================//
    // PRIVATE METHODS //
    //=================//

    /**
     * Checks if the specified offset is in the bounds
     * of the bit-string.
     *
     * @throws Error
     * Throws errors when offset is invalid
     * or is out of bounds.
     */
    private checkBoundsOrThrow(length: number): void {

        if (length < 1) {
            throw Error(
                'Incorrect slice reading length, ' +
                'must be greater than zero'
            );
        }

        if ((this.offset + length) > this.#length) {
            throw Error('Slice offset is out of bounds');
        }

    }

    /**
     * A helper function used for loading data from the slice.
     * Updates the cursor automatically after reading.
     */
    private handleLoading<Type = any>(
        callback: () => Type

    ): Type {

        // Resetting the counter
        this.bitsRead = 0;

        // Calling user function to actually read
        // data from slice.
        const value = callback();

        // Updating the fixed cursor
        this.cursor += this.bitsRead;

        return value;

    }

    /**
     * A helper function used for preloading data from the
     * slice. Resets the pending counter before reading.
     */
    private handlePreloading<Type = any>(
        callback: () => Type

    ): Type {

        // Resetting the counter
        this.bitsRead = 0;

        // Calling user function to actually read
        // data from slice.
        return callback();

    }

    /**
     * Returns value of the next bit in the slice.
     */
    private readBit(): Bit {

        this.checkBoundsOrThrow(1);

        const value = readBit(this.bytes, this.offset);

        this.bitsRead++;

        return value;

    }

    /**
     * Reads an unsigned integer of the specified
     * bit length from the slice.
     *
     * @param bitLength - Length in bits of the unsigned
     *                    integer to read.
     */
    private readUint(bitLength: number): BN {

        expectSafeInteger(bitLength);
        checkUintBitLengthOrThrow(bitLength);

        if (
            (this.offset % 8 === 0) &&
            (bitLength % 8 === 0)
        ) {

            // Reading bytes directly when possible for
            // performance optimization.
            // -----

            this.checkBoundsOrThrow(bitLength);

            const bytesOffset = (this.offset / 8);
            const bytesLength = (bitLength / 8);

            this.bitsRead += bitLength;

            return new BN(
                this.bytes.slice(
                    bytesOffset,
                    (bytesOffset + bytesLength)
                )
            );

        } else {

            // Reading data bit-by-bit (sub-optimal).
            // -----

            // @todo: optimize this

            let bitsStr = '';
            for (
                let count = 0;
                count < bitLength;
                count++
            ) {
                // readBit() will update cursor for us
                // and will check the bounds.
                bitsStr += (this.readBit() ? '1' : '0');
            }

            return new BN(bitsStr, 2);

        }

    }

    /**
     * Reads a signed integer of the specified
     * bit length from the slice.
     *
     * @param bitLength - Length in bits of the signed
     *                    integer to read.
     */
    private readInt(bitLength: number): BN {

        // readUint() will check the bounds for us and will
        // update the bits counter.
        const value = this.readUint(
            bitLength
        );

        return value.fromTwos(bitLength);

    }

    /**
     * Reads an array of bytes from the slice.
     *
     * @param bitLength - Number of bits to load, must be
     *                    a factor of 8. Loads all bytes
     *                    from the slice if omitted.
     */
    private readBytes(bitLength?: number): Uint8Array {

        if (bitLength !== undefined) {
            expectSafeInteger(bitLength, 'bitLength');

            if (bitLength % 8 !== 0) {
                throw new Error(
                    `Bit length must be a factor of bytes`
                );
            }

            this.checkBoundsOrThrow(bitLength);

        } else {
            bitLength = this.getBitsCount();

            if (bitLength % 8 !== 0) {
                throw new Error(
                    `Number of bits left in the slice ` +
                    `is not aligned to bytes`
                );
            }

        }

        const byteLength = (bitLength / 8);
        const bytes = new Uint8Array(byteLength);
        const endOffset = (byteLength - 1);

        for (let offset = 0; offset <= endOffset; offset++) {
            bytes[offset] = this.readUint(8).toNumber();
        }

        return bytes;

    }

    /**
     * Reads an address from the slice.
     */
    private readAddress(): (Address | null) {

        const type = (this.readUint(2)
            .toNumber()
        );

        switch (type) {

            case AddressTypes.None: {
                return null;
            }

            case AddressTypes.External: {
                throw new Error(
                    `Parsing of external addresses ` +
                    `is not supported`
                );
            }

            case AddressTypes.InternalStandard: {
                return this.readStandardInternalAddress();
            }

            case AddressTypes.InternalVariable: {
                throw new Error(
                    `Parsing of internal variable addresses ` +
                    `is not supported`
                );
            }

        }

    }

    /**
     * Reads standard internal address from the slice
     * and returns it.
     *
     * @throws Error
     * Throws error if address can't be parsed.
     */
    private readStandardInternalAddress(): Address {

        /**
         * addr_std$10
         *   anycast:(Maybe Anycast)
         *   workchain_id:int8
         *   address:bits256
         * = MsgAddressInt;
         */

        // anycast:(Maybe Anycast)
        // skipping the anycast flag
        this.bitsRead++;

        // workchain_id:int8
        const workchainId = this.readInt(8);

        // address:bits256
        const hash = this.readUint(256);

        return new Address(
            workchainId.toString() + ':' +
            hash.toString(16, 64)
        );

    }

    /**
     * Reads UTF-8 multibyte string from the slice.
     *
     * @returns A UTF-8 string read from the slice or
     *          an empty string if the slice is empty.
     *
     * @throws Error
     * Throws on parsing errors.
     */
    private readString(): string {

        if (this.getBitsCount() === 0) {
            return '';
        }

        return bytesToString(this.readBytes());

    }

    /**
     * Returns next referenced cell from the list of references.
     *
     * @throws Error
     * Throws when no more referenced cells are available.
     */
    private readRef(): Cell {

        if (this.refs.length === 0) {
            throw new Error(
                `No more referenced cells to load from slice`
            );
        }

        return this.refs[0];

    }

}
