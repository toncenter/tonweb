
import { BitString } from './bit-string';


type BitStringMethods<U extends keyof BitString> = U;

type IndexMethods = BitStringMethods<
    | 'get'
    | 'on'
    | 'off'
    | 'toggle'
>;


const B = (...bytes: number[]) => new Uint8Array(bytes);


describe('BitString', () => {

    describe('constructor()', () => {

        it('reserves a correct number of bytes', async () => {

            let bitString: BitString;

            bitString = new BitString(0);
            expect(bitString.array.length).toEqual(0);

            bitString = new BitString(1);
            expect(bitString.array.length).toEqual(1);

            bitString = new BitString(8);
            expect(bitString.array.length).toEqual(1);

            bitString = new BitString(3 * 8);
            expect(bitString.array.length).toEqual(3);

            bitString = new BitString(10 * 8 + 3);
            expect(bitString.array.length).toEqual(11);

        });

    });

    describe('getFreeBits()', () => {

        it('calculates free bits', async () => {

            let bitString: BitString;

            bitString = new BitString(0);
            expect(bitString.getFreeBits()).toEqual(0);

            bitString = new BitString(1);
            expect(bitString.getFreeBits()).toEqual(1);

            bitString = new BitString(10);
            expect(bitString.getFreeBits()).toEqual(10);

            bitString = new BitString(3);
            expect(bitString.getFreeBits()).toEqual(3);
            bitString.writeBit(1);
            expect(bitString.getFreeBits()).toEqual(2);
            bitString.writeBit(0);
            expect(bitString.getFreeBits()).toEqual(1);
            bitString.writeBit(1);
            expect(bitString.getFreeBits()).toEqual(0);

            bitString = new BitString(9);
            expect(bitString.getFreeBits()).toEqual(9);
            bitString.writeUint8(0);
            expect(bitString.getFreeBits()).toEqual(1);

            bitString = new BitString(18);
            expect(bitString.getFreeBits()).toEqual(18);
            bitString.writeString('AB');
            expect(bitString.getFreeBits()).toEqual(2);

            bitString = new BitString(3 * 8);
            expect(bitString.getFreeBits()).toEqual(24);
            bitString.writeBytes(B(1, 2, 3));
            expect(bitString.getFreeBits()).toEqual(0);

        });

    });

    describe('getUsedBits()', () => {

        it('calculates used bits', async () => {

            let bitString: BitString;

            bitString = new BitString(0);
            expect(bitString.getUsedBits()).toEqual(0);

            bitString = new BitString(1);
            expect(bitString.getUsedBits()).toEqual(0);

            bitString = new BitString(10);
            expect(bitString.getUsedBits()).toEqual(0);

            bitString = new BitString(3);
            expect(bitString.getUsedBits()).toEqual(0);
            bitString.writeBit(1);
            expect(bitString.getUsedBits()).toEqual(1);
            bitString.writeBit(0);
            expect(bitString.getUsedBits()).toEqual(2);
            bitString.writeBit(1);
            expect(bitString.getUsedBits()).toEqual(3);

            bitString = new BitString(9);
            expect(bitString.getUsedBits()).toEqual(0);
            bitString.writeUint8(0);
            expect(bitString.getUsedBits()).toEqual(8);

            bitString = new BitString(18);
            expect(bitString.getUsedBits()).toEqual(0);
            bitString.writeString('AB');
            expect(bitString.getUsedBits()).toEqual(16);

            bitString = new BitString(3 * 8 + 1);
            expect(bitString.getUsedBits()).toEqual(0);
            bitString.writeBytes(B(1, 2, 3));
            expect(bitString.getUsedBits()).toEqual(24);

        });

    });

    describe('getUsedBytes()', () => {

        it('calculates used bytes', async () => {

            let bitString: BitString;

            bitString = new BitString(0);
            expect(bitString.getUsedBytes()).toEqual(0);

            bitString = new BitString(1);
            expect(bitString.getUsedBytes()).toEqual(0);

            bitString = new BitString(10);
            expect(bitString.getUsedBytes()).toEqual(0);

            bitString = new BitString(9);
            expect(bitString.getUsedBytes()).toEqual(0);
            bitString.writeBit(1);
            expect(bitString.getUsedBytes()).toEqual(1);
            bitString.writeBit(0);
            bitString.writeBit(1);
            bitString.writeBit(0);
            bitString.writeBit(1);
            bitString.writeBit(0);
            bitString.writeBit(1);
            bitString.writeBit(0);
            expect(bitString.getUsedBytes()).toEqual(1);
            bitString.writeBit(1);
            expect(bitString.getUsedBytes()).toEqual(2);

            bitString = new BitString(9);
            expect(bitString.getUsedBytes()).toEqual(0);
            bitString.writeUint8(0);
            expect(bitString.getUsedBytes()).toEqual(1);

            bitString = new BitString(18);
            expect(bitString.getUsedBytes()).toEqual(0);
            bitString.writeString('AB');
            expect(bitString.getUsedBytes()).toEqual(2);
            bitString.writeBit(1);
            expect(bitString.getUsedBytes()).toEqual(3);

            bitString = new BitString(3 * 8 + 1);
            expect(bitString.getUsedBytes()).toEqual(0);
            bitString.writeBytes(B(1, 2, 3));
            expect(bitString.getUsedBytes()).toEqual(3);

        });

    });

    describe('get()', () => {

        it('returns bit by index', async () => {

            // 1010 1010 (AA)
            // 1110 0111 (E7)
            // 0101 ----

            const bitString = new BitString(20);
            bitString.writeBytes(B(0xAA, 0xE7));
            bitString.writeBit(0);
            bitString.writeBit(1);
            bitString.writeBit(0);
            bitString.writeBit(1);

            const expected = ('1010 1010 1110 0111 0101')
                .replace(/\s+/g, '')
            ;

            expectBits(bitString, expected);

            let bits = '';
            for (let i = 0; i < 20; i++) {
                bits += (bitString.get(i) ? '1' : '0');
            }

            expect(bits).toEqual(expected);

        });

        it('should throw error on incorrect index', async () => {
            testWrongIndex('get');
        });

    });

    describe('on()', () => {

        it('sets the bit by index', async () => {

            //   0000 1111 (initial, 0xF)
            // + 1101 0101 (set bits)
            //   1101 1111 (result)

            const bitString = new BitString(8);
            bitString.writeUint8(0xF);

            bitString.on(0);
            bitString.on(1);
            bitString.on(3);
            bitString.on(5);
            bitString.on(7);

            const expected = ('1101 1111')
                .replace(/\s+/g, '')
            ;

            expectBits(bitString, expected);

        });

        it('throws on overflow', async () => {
            testWrongIndex('on');
        });

    });

    describe('off()', () => {

        it('clears the bit by index', async () => {

            //   1111 1001 (initial, 0xF9)
            // - 1101 0111 (clear bits)
            //   0010 1000 (result)

            const bitString = new BitString(8);
            bitString.writeUint8(0xF9);

            bitString.off(0);
            bitString.off(1);
            bitString.off(3);
            bitString.off(5);
            bitString.off(6);
            bitString.off(7);

            const expected = ('0010 1000')
                .replace(/\s+/g, '')
            ;

            expectBits(bitString, expected);

        });

        it('throws on overflow', async () => {
            testWrongIndex('off');
        });

    });

    describe('toggle()', () => {

        it('toggles the bits by index', async () => {

            //   1111 0000 (initial, 0xF0)
            // ^ 1101 1001 (toggle bits)
            //   0010 1001 (result)

            const bitString = new BitString(8);
            bitString.writeUint8(0xF0);

            bitString.toggle(0);
            bitString.toggle(1);
            bitString.toggle(3);
            bitString.toggle(4);
            bitString.toggle(7);

            const expected = ('0010 1001')
                .replace(/\s+/g, '')
            ;

            expectBits(bitString, expected);

        });

        it('throws on overflow', async () => {
            testWrongIndex('toggle');
        });

    });

    describe('forEach()', () => {

        it('iterates the bits', async () => {

            // 1010 1010 (AA)
            // 1110 0111 (E7)
            // 0101 ----

            const bitString = new BitString(20);
            bitString.writeBytes(B(0xAA, 0xE7));
            bitString.writeBit(0);
            bitString.writeBit(1);
            bitString.writeBit(0);
            bitString.writeBit(1);

            const expected = ('1010 1010 1110 0111 0101')
                .replace(/\s+/g, '')
            ;

            let bits = '';
            bitString.forEach(
                bit => bits += (bit ? '1' : '0')
            );

            expect(bits).toEqual(expected);

        });

    });

    describe('writeBit()', () => {

        it('writes the specified bit', async () => {

            // 1010 1010 (AA)
            // 1110 01--

            const bitString = new BitString(14);
            bitString.writeBytes(B(0xAA));
            bitString.writeBit(true);
            bitString.writeBit(1);
            bitString.writeBit(1);
            bitString.writeBit(false);
            bitString.writeBit(0);
            bitString.writeBit(1);

            const expected = ('1010 1010 1110 01')
                .replace(/\s+/g, '')
            ;

            expectBits(bitString, expected);

        });

        it('throws on incorrect value', async () => {

            const values = [
                -100, -10, -2, -1,
                2, 3, 10, 100, Number.MAX_SAFE_INTEGER,
                'true', 'false', '1', '0',
            ];

            const bitString = new BitString(1);

            for (const value of values) {
                expect(() => bitString.writeBit(value as any))
                    .toThrow('Incorrect bit value specified')
                ;
            }

        });

        it('throws on overflow', async () => {

            const bitString = new BitString(1);

            bitString.writeBit(0);

            expect(() => bitString.writeBit(1))
                .toThrow('BitString overflow')
            ;

        });

    });

    describe('writeBitArray()', () => {

        it('writes the specified bits', async () => {

            // 1010 1010 (AA)
            // 1110 01--

            const bitString = new BitString(14);
            bitString.writeBytes(B(0xAA));
            bitString.writeBitArray([
                true, 1, 1, false,
                0, 1,
            ]);

            const expected = ('1010 1010 1110 01')
                .replace(/\s+/g, '')
            ;

            expectBits(bitString, expected);

        });

        it('throws on incorrect values', async () => {

            const values = [
                -100, -10, -2, -1,
                2, 3, 10, 100, Number.MAX_SAFE_INTEGER,
                'true', 'false', '1', '0',
            ];

            const bitString = new BitString(1);

            for (const value of values) {
                expect(() => bitString.writeBitArray([value as any]))
                    .toThrow('Incorrect bit value specified')
                ;
            }

        });

        it('throws on overflow', async () => {

            const bitString = new BitString(1);

            expect(() => bitString.writeBitArray([1, 0]))
                .toThrow('BitString overflow')
            ;

        });

        it('handles empty arrays', async () => {

            // 1010 1010 (AA)
            // --

            const bitString = new BitString(10);
            bitString.writeBytes(B(0xAA));
            bitString.writeBitArray([]);

            const expected = ('1010 1010')
                .replace(/\s+/g, '')
            ;

            expectBits(bitString, expected);

            expect(bitString.getUsedBits()).toEqual(8);

        });

        it('throws on incorrect value', async () => {

            const values = [
                {}, new Date(), Symbol(), 'array',
                () => {}, 100, Promise.resolve(),
            ];

            const bitString = new BitString(1);

            for (const value of values) {
                expect(() => bitString.writeBitArray(value as any))
                    .toThrow('must be an array of bits')
                ;
            }

        });

    });

    describe('getTopUppedArray()', () => {

        it('no leftovers, without completion', async () => {
            const bitString = new BitString(3 * 8);
            bitString.writeBytes(B(4, 8, 15));
            expect(bitString.getTopUppedArray())
                .toEqual(B(4, 8, 15))
            ;
        });

        it('with leftovers, without completion', async () => {
            const bitString = new BitString(10 * 8);
            bitString.writeBytes(B(4, 8, 15));
            expect(bitString.getTopUppedArray())
                .toEqual(B(4, 8, 15))
            ;
        });

        it('with completion', async () => {
            //   0000 0100 (4)
            //   0000 1000 (8)
            //   1010 0000 (A0)
            // + 0001 0000 (completion)
            // = 1011 0000 (B0)
            //
            const bitString = new BitString(3 * 8);
            bitString.writeBytes(B(4, 8));
            bitString.writeBit(1);
            bitString.writeBit(0);
            bitString.writeBit(1);
            expect(bitString.getTopUppedArray())
                .toEqual(B(4, 8, 0xB0))
            ;
        });

        it('not multiple of eight', async () => {
            //   0000 0100 (4)
            //   00-- ---- (2 zero bits)
            // + 0010 0000 (completion)
            // = 0010 0000 (0x20)
            //
            const bitString = new BitString(10);
            bitString.writeUint8(4);
            bitString.writeBit(0);
            bitString.writeBit(0);
            expect(bitString.getTopUppedArray())
                .toEqual(B(4, 0x20))
            ;
        });

    });

    describe('setTopUppedArray()', () => {

        it('without completion', () => {

            //   0000 0100 (4)
            //   0000 1000 (8)
            //   0000 1111 (15)
            //
            const bitString = new BitString(0);
            bitString.setTopUppedArray(
                B(4, 8, 15)
            );
            expectBits(bitString,
                '0000 0100 0000 1000 0000 1111'
            );

        });

        it('with completion (1)', () => {

            //   0000 0100 (4)
            //   0000 1000 (8)
            //   1011 0000 (B0)
            // - 0001 0000 (completion)
            // = 101- ---- (A0)
            //
            const bitString = new BitString(0);
            bitString.setTopUppedArray(
                B(4, 8, 0xB0), false
            );
            expectBits(bitString,
                '0000 0100 0000 1000 101'
            );

        });

        it('with completion (2)', () => {

            //   0000 0100 (4)
            //   0000 1000 (8)
            //   1111 1111 (FF)
            // - 0000 0001 (completion)
            // = 1111 111- (FE)
            //
            const bitString = new BitString(0);
            bitString.setTopUppedArray(
                B(4, 8, 0xFF), false
            );
            expectBits(bitString,
                '0000 0100 0000 1000 1111 111'
            );

        });

        it('with completion (3)', () => {

            //   0000 0100 (4)
            //   0000 1000 (8)
            //   0100 0000 (0x40)
            // - 0100 0000 (completion)
            // = 0--- ----
            //
            const bitString = new BitString(0);
            bitString.setTopUppedArray(
                B(4, 8, 0x40), false
            );
            expectBits(bitString,
                '0000 0100 0000 1000 0'
            );

        });

    });

    describe('writeString()', () => {

        it('should write multibyte string', () => {

            const text = '1B: A, 2B: Ω, 3B: ಄, 4B: 𓅱';
            const textLength = new TextEncoder()
                .encode(text)
                .length
            ;

            const bitString = new BitString(
                8 * textLength
            );

            bitString.writeString(text);
            expect(bitString.getFreeBits()).toEqual(0);

            const decodedText = new TextDecoder()
                .decode(bitString.array)
            ;

            expect(decodedText).toEqual(text);

        });

    });

});


function testWrongIndex(method: IndexMethods) {

    const bitString = new BitString(0);

    const indices = [
        -100, -10, -2, -1,
        0, 1, 2, 3, 10, 100,
        Number.MAX_SAFE_INTEGER,
    ];

    for (const index of indices) {
        expect(() => bitString[method](index)).toThrow(
            /(Incorrect BitString index|BitString overflow)/
        );
    }

}


function expectBits(
    bitString: BitString,
    expectedBits: string
) {
    let bits = '';
    bitString.forEach(
        bit => bits += (bit ? '1' : '0')
    );
    expect(bits).toEqual(
        expectedBits.replace(/\s+/g, '')
    );
}
