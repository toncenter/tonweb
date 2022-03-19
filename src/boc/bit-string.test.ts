
import { BitString } from './bit-string';


describe('BitString', () => {

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
