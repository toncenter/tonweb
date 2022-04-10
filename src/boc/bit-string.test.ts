
import { BitString } from './bit-string';


type BitStringMethods<U extends keyof BitString> = U;

type IndexMethods = BitStringMethods<
    | 'on'
    | 'off'
    | 'toggle'
>;


const B = (...bytes: number[]) => new Uint8Array(bytes);


describe('BitString', () => {

    describe('on()', () => {
        it('throws on overflow', async () => {
            testIndexOverflow('on');
        });
    });

    describe('off()', () => {
        it('throws on overflow', async () => {
            testIndexOverflow('off');
        });
    });

    describe('toggle()', () => {
        it('throws on overflow', async () => {
            testIndexOverflow('toggle');
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


function testIndexOverflow(method: IndexMethods) {

    const bitString = new BitString(1);

    const indices = [1, 2, 3, 10, 100];

    for (const index of indices) {
        expect(() => bitString[method](index))
            .toThrow('BitString overflow')
        ;
    }

}
