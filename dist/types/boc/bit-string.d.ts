import BN from 'bn.js';
import { Address } from '../utils/address';
export declare class BitString {
    /**
     * A length of bit string in bits.
     *
     * @todo: length shouldn't be public and mutable,
     *        but this is required by clone() method
     */
    length: number;
    array: Uint8Array;
    cursor: number;
    private textEncoder;
    constructor(
    /**
     * A length of bit string in bits.
     *
     * @todo: length shouldn't be public and mutable,
     *        but this is required by clone() method
     */
    length: number);
    /**
     * Returns number of unfilled bits in the bit-string.
     */
    getFreeBits(): number;
    /**
     * Returns number of filled bits in the bit-string.
     */
    getUsedBits(): number;
    /**
     * Returns number of bytes actually used by the bit-string.
     * Rounds up to a whole byte.
     */
    getUsedBytes(): number;
    /**
     * Returns the bit value at the specified index
     * in the bit-string.
     */
    get(index: number): boolean;
    /**
     * Sets the bit value to one at the specified index.
     *
     * @todo: should rename this method to `set()`
     */
    on(index: number): void;
    /**
     * Sets the bit value to zero at the specified index.
     *
     * @todo: should rename this method to `clear()`
     */
    off(index: number): void;
    /**
     * Toggles the bit value at the specified index,
     * turns one into zero and zero into one.
     */
    toggle(index: number): void;
    /**
     * Iterates the bit-string and calls the specified
     * user function for each bit, passing in the bit value.
     *
     * @todo: implement the iterator protocol
     *        by using the generator function
     */
    forEach(callback: (bitValue: boolean) => void): void;
    /**
     * Writes the specified bit value to the bit-string
     * at the current index and advances the current index
     * cursor.
     */
    writeBit(value: (boolean | number)): void;
    /**
     * Writes the specified array of bit values to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeBitArray(values: Array<boolean | number>): void;
    /**
     * Writes the specified unsigned integer of the specified
     * length in bits to the bit-string, starting at the
     * current index and advances the current index cursor
     * by the number of bits written.
     */
    writeUint(value: (number | BN), bitLength: number): void;
    /**
     * Writes the specified signed integer of the specified
     * length in bits to the bit-string, starting at the
     * current index and advances the current index cursor
     * by the number of bits written.
     */
    writeInt(value: (number | BN), bitLength: number): void;
    /**
     * Writes the specified unsigned 8-bit integer to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeUint8(value: number): void;
    /**
     * Writes the specified array of the unsigned 8-bit integers
     * to the bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeBytes(values: Uint8Array): void;
    /**
     * Represents the specified multibyte string as bytes and writes
     * them to the bit-string, starting at the current index and
     * advances the current index cursor by the number of bits written.
     */
    writeString(value: string): void;
    /**
     * Writes the specified amount in nanograms to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeGrams(nanograms: (number | BN)): void;
    /**
     * Writes the specified TON amount in nanotons to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeCoins(nanotons: (number | BN)): void;
    /**
     * Writes the specified address to the bit-string,
     * starting at the current index and advances the
     * current index cursor by the number of bits written.
     */
    writeAddress(address?: Address): void;
    /**
     * Appends the specified bit-string to the bit-string,
     * starting at the current index and advances the
     * current index cursor by the number of bits written.
     */
    writeBitString(bitString: BitString): void;
    /**
     * Creates a cloned instance of the bit-string.
     */
    clone(): BitString;
    /**
     * Returns the bit-string represented as HEX-string.
     */
    toString(): string;
    /**
     * @todo: provide meaningful method description
     */
    getTopUppedArray(): Uint8Array;
    /**
     * Returns the bit-string represented as HEX-string (like in Fift).
     */
    toHex(): string;
    /**
     * Sets this cell data to match provided topUppedArray.
     *
     * @todo: provide a more meaningful method description
     */
    setTopUppedArray(bytes: Uint8Array, fulfilledBytes?: boolean): void;
    /**
     * Checks if the specified index is allowed for
     * the bit string, throws error in case of overflow.
     */
    private checkIndexOrThrow;
}
