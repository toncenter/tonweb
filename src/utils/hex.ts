
// HEX look up tables.
const hexByteToChar: Record<number, string> = {};
const hexCharToByte: Record<string, number> = {};
for (let ord = 0; ord <= 0xff; ord++) {
    let char = ord.toString(16);
    if (char.length < 2) {
        char = '0' + char;
    }
    hexByteToChar[ord] = char;
    hexCharToByte[char] = ord;
}


/**
 * Converts the specified bytes array to hex string
 * using lookup table.
 */
export function bytesToHex(buffer: Uint8Array): string {
    const hexArray: string[] = [];
    for (let i = 0; i < buffer.byteLength; i++) {
        hexArray.push(
            hexByteToChar[
                buffer[i]
            ]
        );
    }
    return hexArray.join('');
}

/**
 * Converts the specified hex string to bytes array
 * using lookup table.
 */
export function hexToBytes(hex: string): Uint8Array {
    hex = hex.toLowerCase();
    const length2 = hex.length;
    if (length2 % 2 !== 0) {
        throw new Error('HEX string must have length a multiple of 2');
    }
    const length = length2 / 2;
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        const i2 = i * 2;
        const b = hex.substring(i2, i2 + 2);
        if (!hexCharToByte.hasOwnProperty(b)) {
            throw new Error(`Invalid HEX character: ${b}`);
        }
        result[i] = hexCharToByte[b];
    }
    return result;
}
