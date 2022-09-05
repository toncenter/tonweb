
import { Bit } from '../../common/numbers';
import { bytesToHex } from '../../utils/hex';


// @todo: write tests for these


const completionTag = '_';


/**
 * Reads a bit from the specific offset in the specified
 * array of bytes.
 *
 * @param bytes - An array of bytes representing a bit-string.
 * @param offset - Offset in bits of the bit to set.
 */
export function readBit(bytes: Uint8Array, offset: number): Bit {
    const byteValue = bytes[(offset / 8) | 0];
    const subOffset = (7 - (offset % 8));
    return (byteValue & (1 << subOffset)) > 0;
}

/**
 * Sets bit by the specific offset in bits
 * in the specified array of bytes.
 *
 * @param bytes - An array of bytes representing a bit-string.
 * @param offset - Offset in bits of the bit to set.
 */
export function setBit(bytes: Uint8Array, offset: number) {
    const byteOffset = (offset / 8) | 0;
    const subOffset = 7 - (offset % 8);
    bytes[byteOffset] |= (1 << subOffset);
}

/**
 * Clears bit by the specific offset in bits
 * in the specified array of bytes.
 *
 * @param bytes - An array of bytes representing a bit-string.
 * @param offset - Offset in bits of the bit to clear.
 */
export function clearBit(bytes: Uint8Array, offset: number) {
    const byteOffset = (offset / 8) | 0;
    const subOffset = 7 - (offset % 8);
    bytes[byteOffset] &= ~(1 << subOffset);
}

/**
 * Toggles bit by the specific offset in bits
 * in the specified array of bytes.
 *
 * @param bytes - An array of bytes representing a bit-string.
 * @param offset - Offset in bits of the bit to toggle.
 */
export function toggleBit(bytes: Uint8Array, offset: number) {
    const byteOffset = (offset / 8) | 0;
    const subOffset = 7 - (offset % 8);
    bytes[byteOffset] ^= 1 << subOffset;
}

export function bytesToHexWithCompletion(
    bytes: Uint8Array,
    bitLength: number

): string {

    /**
     * Chapter 1.0.1 of the "Telegram Open Network Virtual Machine":
     * {@link https://ton-blockchain.github.io/docs/tvm.pdf | tvm.pdf}
     */

    bytes = serializeBytes(bytes, bitLength);

    const lastOctetUsed = (
        (bitLength % 8 === 0) ||
        (bitLength % 8 > 4)
    );

    let hexString = bytesToHex(bytes).toUpperCase();

    if (!lastOctetUsed) {
        hexString = hexString.slice(0, (hexString.length - 1));
    }

    const requireCompletion = (bitLength % 4 !== 0);

    return (
        `${hexString}` +
        `${requireCompletion ? completionTag : ''}`
    );

}

/**
 * Truncates the excessive bytes from the array based on the
 * specified bit length and adds the completion if needed.

 * @param bytes - An array of bytes to serialize.
 * @param bitLength - A used number of bits in the array.
 */
export function serializeBytes(
    bytes: Uint8Array,
    bitLength: number

): Uint8Array {

    // Chapter 1.0.4 of the "Telegram Open Network Virtual Machine".
    // {@link https://ton-blockchain.github.io/docs/tvm.pdf}
    //
    // Split the BitString into groups of eight bits.
    // If the length of the BitString is not a multiple
    // of eight, the BitString is augmented by a binary
    // `1` and up to seven binary `0`s before being
    // split into groups.

    const usedBytes = Math.ceil(bitLength / 8);
    bytes = bytes.slice(0, usedBytes);

    // Checking if completion is needed
    if (bitLength % 8 !== 0) {

        // Setting the first completion bit,
        // trailing zeroes are already present
        setBit(bytes, bitLength);

    }

    return bytes;

}

/**
 * @param bytes - An array of bytes to parse.
 *
 * @param hasCompletion - Flag indicating that the specified
 *                        array of bytes has a completion
 *                        bits.
 */
export function determineBitLength(
    bytes: Uint8Array,
    hasCompletion?: boolean

): number {

    /**
     * Chapter 1.0.4 of the "Telegram Open Network Virtual Machine".
     * {@link https://ton-blockchain.github.io/docs/tvm.pdf}
     */

    let length = (bytes.length * 8);

    if (!hasCompletion || !length) {
        return length;

    } else {
        // Parsing bytes with completion
        let foundEndBit = false;
        for (let c = 0; c < 7; c++) {
            const bitValue = readBit(
                bytes,
                (length - 1)
            );
            length -= 1;
            if (bitValue) {
                foundEndBit = true;
                break;
            }
        }
        if (!foundEndBit) {
            throw new Error(
                `Failed to find first bit of the ` +
                `completion in the specified bytes`
            );
        }
    }

    return length;

    // @todo implement support for `0x80` octet?
    //
    // Excerpt from the white paper:
    //
    // In some cases, it is more convenient to assume
    // the completion is enabled by default rather than
    // store an additional completion tag bit separately.
    // Under such conventions, 8n-bit strings are
    // represented by n + 1 octets, with the last octet
    // always equal to 0x80 = 128.

}
