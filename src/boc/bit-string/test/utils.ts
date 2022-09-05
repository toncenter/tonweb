
import TonWeb from '__tonweb__';
import type { BitString } from '__tonweb__';

const { BitString } = TonWeb.boc;


export function createFromBits(bits: string): BitString {
    bits = bits.replace(/\s+/g, '');
    const bitString = new BitString(bits.length);
    writeBits(bitString, bits);
    return bitString;
}

export function writeBits(bitString: BitString, bits: string) {
    bits = bits.replace(/\s+/g, '');
    for (const bit of bits) {
        bitString.writeBit(bit === '1');
    }
}

export function expectEqualBits(
    testString: (BitString | Uint8Array | string),
    expectedString: (BitString | Uint8Array | string)
) {

    testString = prepare(testString);
    expectedString = prepare(expectedString);

    expect(testString).toEqual(expectedString);


    function prepare(
        value: (BitString | Uint8Array | string)

    ): string {

        if (value instanceof BitString) {
            value = toStringOfBits(value);

        } else if (value instanceof Uint8Array) {
            const bitString = new BitString(value.byteLength * 8);
            bitString.writeBytes(value);
            return prepare(bitString);

        } else if (typeof value !== 'string') {
            throw new Error(`Unknown input type`);

        }

        return value.replace(/\s+/g, '');

    }

}


function toStringOfBits(
    bitString: BitString

): string {

    let bits = '';
    bitString.forEach(bit => bits += (bit ? '1' : '0'));
    return bits;

}
