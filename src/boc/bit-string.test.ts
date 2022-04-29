
import BN from 'bn.js';

import { AnyBN } from '../common/numbers';
import { Address } from '../utils/address';
import { BitString } from './bit-string';


type BitStringMethods<Method extends keyof BitString> = Method;

type IndexMethods = BitStringMethods<
    | 'get'
    | 'on'
    | 'off'
    | 'toggle'
>;

type InputType = (
    | 'number'
    | 'string'
    | 'BN'
);



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

            expectEqual(bitString, expected);

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

            expectEqual(bitString, expected);

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

            expectEqual(bitString, expected);

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

            expectEqual(bitString, expected);

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

            expectEqual(bitString, expected);

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

            expectEqual(bitString, expected);

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

            expectEqual(bitString, expected);

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

    describe('writeUint()', () => {

        const inputTypes: InputType[] = [
            'number',
            'string',
            'BN',
        ];

        for (const inputType of inputTypes) {

            const inputValue = (value: number): AnyBN => {
                switch (inputType) {
                    case 'number':
                        return value;
                    case 'string':
                        return value.toString();
                    case 'BN':
                        return new BN(value);
                }
            }

            describe(`${inputType} input`, () => {

                //=============================//
                // writes the unsigned integer //
                //=============================//

                {
                    type Case = [number, number, string];

                    const cases: Case[] = [
                        [0, 1, '0'],
                        [1, 1, '1'],
                        [10, 4, '1010'],
                        [255, 8, '1111 1111'],
                        [2290649224, 32, '1000 1000 1000 1000 1000 1000 1000 1000'],
                    ];

                    for (const values of cases) {

                        const [value, bitLength, expectedBits] = values;

                        it(`writes the unsigned integer: ${value}`, async () => {

                            const bitString = new BitString(bitLength);
                            bitString.writeUint(inputValue(value), bitLength);

                            expectEqual(
                                bitString,
                                expectedBits.replace(/\s+/g, '')
                            );

                        });

                    }

                }

                it('throws error on BitString overflow', async () => {

                    const bitString = new BitString(4);

                    expect(() => bitString.writeUint(inputValue(16), 5))
                        .toThrow('BitString overflow')
                    ;

                });


                //===========================================//
                // throws error when bit-length is too small //
                //===========================================//

                {
                    type Case = [number, number];

                    const cases: Case[] = [
                        [2, 1],
                        [16, 4],
                        [4294967296, 32],
                    ];

                    for (const values of cases) {

                        const [value, bitLength] = values;

                        it(`throws error when bit-length is too small for value: ${value}`, async () => {

                            const bitString = new BitString(64);

                            expect(() => bitString.writeUint(inputValue(value), bitLength))
                                .toThrow(/Specified bit-length.*is too small/)
                            ;

                        });

                    }

                }

            });

        }

        it('throws error on incorrect bit-length', () => {

            const cases = [-10, -2, -1, 0, 257, 258, 300];

            for (const bitLength of cases) {

                const bitString = new BitString(1023);

                expect(() => bitString.writeUint(100500, bitLength))
                    .toThrow(/Bit length must be/)
                ;

            }

        });

    });

    describe('writeUint8()', () => {

        const inputTypes: InputType[] = [
            'number',
            'string',
            'BN',
        ];

        for (const inputType of inputTypes) {

            const inputValue = (value: number): AnyBN => {
                switch (inputType) {
                    case 'number':
                        return value;
                    case 'string':
                        return value.toString();
                    case 'BN':
                        return new BN(value);
                }
            }

            describe(`${inputType} input`, () => {

                //===================================//
                // writes the 8-bit unsigned integer //
                //===================================//

                {
                    type Case = [number, string];

                    const cases: Case[] = [
                        [  0, '0000 0000'],
                        [  1, '0000 0001'],
                        [ 10, '0000 1010'],
                        [165, '1010 0101'],
                        [255, '1111 1111'],
                    ];

                    for (const values of cases) {

                        const [value, expectedBits] = values;

                        it(`writes the 8-bit unsigned integer: ${value}`, async () => {

                            const bitString = new BitString(8);
                            bitString.writeUint8(inputValue(value));

                            expectEqual(
                                bitString,
                                expectedBits.replace(/\s+/g, '')
                            );

                        });

                    }

                }

                it('throws error on BitString overflow', async () => {

                    const bitString = new BitString(4);

                    expect(() => bitString.writeUint8(inputValue(16)))
                        .toThrow('BitString overflow')
                    ;

                });

            });

        }

        it('throws error on incorrect bit-length', () => {

            const cases = [-10, -2, -1, 0, 257, 258, 300];

            for (const bitLength of cases) {

                const bitString = new BitString(1023);

                expect(() => bitString.writeUint(100500, bitLength))
                    .toThrow(/Bit length must be/)
                ;

            }

        });

    });

    describe('writeInt()', () => {

        const inputTypes: InputType[] = [
            'number',
            'string',
            'BN',
        ];

        for (const inputType of inputTypes) {

            const inputValue = (value: number): AnyBN => {
                switch (inputType) {
                    case 'number':
                        return value;
                    case 'string':
                        return value.toString();
                    case 'BN':
                        return new BN(value);
                }
            }

            describe(`${inputType} input`, () => {

                //====================//
                // writes the integer //
                //====================//

                {
                    type Case = [number, number, string];

                    const cases: Case[] = [
                        [ 127, 8, '0111 1111'],
                        [  16, 8, '0001 0000'],
                        [  10, 8, '0000 1010'],
                        [   2, 8, '0000 0010'],
                        [   1, 8, '0000 0001'],
                        [   0, 8, '0000 0000'],
                        [   1, 2, '01'],
                        [   0, 1, '0'],
                        [  -1, 1, '1'],
                        [  -1, 8, '1111 1111'],
                        [  -2, 8, '1111 1110'],
                        [ -10, 8, '1111 0110'],
                        [ -16, 8, '1111 0000'],
                        [-127, 8, '1000 0001'],
                        [-128, 8, '1000 0000'],
                    ];

                    for (const values of cases) {

                        const [value, bitLength, expectedBits] = values;

                        it(`writes the integer: ${value}/${bitLength}`, async () => {

                            const bitString = new BitString(bitLength);
                            bitString.writeInt(inputValue(value), bitLength);

                            expectEqual(
                                bitString,
                                expectedBits.replace(/\s+/g, '')
                            );

                        });

                    }

                }

                it('throws error on BitString overflow', async () => {

                    const bitString = new BitString(1);

                    expect(() => bitString.writeUint(inputValue(16), 8))
                        .toThrow('BitString overflow')
                    ;

                });


                //===========================================//
                // throws error when bit-length is too small //
                //===========================================//

                {
                    type Case = [number, number];

                    const cases: Case[] = [
                        [ 129, 8],
                        [ 128, 8],
                        [  -2, 1],
                        [   1, 1],
                        [   2, 2],
                        [-129, 8],
                        [-130, 8],
                    ];

                    for (const values of cases) {

                        const [value, bitLength] = values;

                        it(`throws error when bit-length is too small for value: ${value}`, async () => {

                            const bitString = new BitString(64);

                            expect(() => bitString.writeInt(inputValue(value), bitLength))
                                .toThrow(/Specified bit-length.*is too small/)
                            ;

                        });

                    }

                }

            });

        }

        it('throws error on incorrect bit-length', () => {

            const cases = [-10, -2, -1, 0, 257, 258, 300];

            for (const bitLength of cases) {

                const bitString = new BitString(1023);

                expect(() => bitString.writeInt(100500, bitLength))
                    .toThrow(/Bit length must be/)
                ;

            }

        });

    });

    describe('writeBytes()', () => {

        //==============//
        // writes bytes //
        //==============//

        {
            type Case = [Uint8Array, string];

            const cases: Case[] = [
                [ B(0),           '0000 0000'],
                [ B(1),           '0000 0001'],
                [ B(1, 136),      '0000 0001 1000 1000'],
                [ B(1, 136, 240), '0000 0001 1000 1000 1111 0000'],
            ];

            for (const [index, values] of Object.entries(cases)) {

                const [bytes, expectedBits] = values;

                it(`writes bytes (${index + 1})`, async () => {

                    const bitString = new BitString(24);
                    bitString.writeBytes(bytes);

                    expectEqual(
                        bitString,
                        expectedBits.replace(/\s+/g, '')
                    );

                });

            }

        }

        it('appends to the existing bits', () => {

            const bitString = new BitString(28);
            bitString.writeBitArray([0, 0, 0, 0, 1, 1, 1, 1]);
            bitString.writeBytes(B(165));
            bitString.writeBytes(B(240));
            bitString.writeBitArray([1, 0, 0, 1]);

            expectEqual(
                bitString,
                ('0000 1111 1010 0101 1111 0000 1001')
                    .replace(/\s+/g, '')
            );

        });

        it('handles empty arrays', () => {

            const bitString = new BitString(8);
            bitString.writeBytes(B());

            expect(bitString.getUsedBits()).toEqual(0);
            expectEqual(bitString, '');

        });

        it('throws on incorrect value', async () => {

            const values = [
                {}, new Date(), Symbol(), 'array',
                () => {}, 100, Promise.resolve(),
                [], new Map(), new Set()
            ];

            const bitString = new BitString(1);

            for (const value of values) {
                expect(() => bitString.writeBytes(value as any))
                    .toThrow('Specified value must be a Uint8Array')
                ;
            }

        });

        it('throws error on BitString overflow', async () => {

            const bitString = new BitString(15);

            expect(() => bitString.writeBytes(B(1, 2)))
                .toThrow('BitString overflow')
            ;

        });

    });

    describe('writeString()', () => {

        //===============//
        // writes string //
        //===============//

        {
            type Case = [string, string];

            const cases: Case[] = [
                [ 'A',   '0100 0001'],
                [ 'AB',  '0100 0001 0100 0010'],
                [ 'ABZ', '0100 0001 0100 0010 0101 1010'],
                [ 'Ω',   '1100 1110 1010 1001'],
                [ '಄',  '1110 0000 1011 0010 1000 0100'],
                [ '𓅱',  '1111 0000 1001 0011 1000 0101 1011 0001'],
                [ 'ТОН', '1101 0000 1010 0010 1101 0000 1001 1110 1101 0000 1001 1101'],
            ];

            for (const values of cases) {

                const [string, expectedBits] = values;

                it(`writes string (${string})`, async () => {

                    const bitString = new BitString(48);
                    bitString.writeString(string);

                    expectEqual(
                        bitString,
                        expectedBits.replace(/\s+/g, '')
                    );

                });

            }

        }

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

        it('throws on incorrect value', async () => {

            const values = [
                [], {}, new Date(), Symbol(),
                () => {}, 100, Promise.resolve(),
                new Map(), new Set(),
            ];

            const bitString = new BitString(1);

            for (const value of values) {
                expect(() => bitString.writeString(value as any))
                    .toThrow('must be a string')
                ;
            }

        });

    });

    describe('writeGrams()', () => {

        const inputTypes: InputType[] = [
            'number',
            'string',
            'BN',
        ];

        for (const inputType of inputTypes) {

            const inputValue = (value: number): AnyBN => {
                switch (inputType) {
                    case 'number':
                        return value;
                    case 'string':
                        return value.toString();
                    case 'BN':
                        return new BN(value);
                }
            }

            describe(`${inputType} input`, () => {

                //==================//
                // writes the grams //
                //==================//

                {
                    type Case = [number, string];

                    const cases: Case[] = [
                        [           0, '0000'],
                        [           1, '0001 0000 0001'],
                        [         100, '0001 0110 0100'],
                        [ 15123456789, '0101 0000 0011 1000' +
                                       '0101 0110 1101 1010' +
                                       '0011 0001 0101'
                        ],
                    ];

                    for (const values of cases) {

                        const [value, expectedBits] = values;

                        it(`writes the grams: ${value}`, async () => {

                            const bitString = new BitString(44);
                            bitString.writeGrams(inputValue(value));

                            expectEqual(
                                bitString,
                                expectedBits.replace(/\s+/g, '')
                            );

                        });

                    }

                }

                it('throws error on BitString overflow', async () => {

                    const bitString = new BitString(1);

                    expect(() => bitString.writeGrams(inputValue(16)))
                        .toThrow('BitString overflow')
                    ;

                });

                it('throws error on negative values', async () => {

                    const bitString = new BitString(16);

                    expect(() => bitString.writeGrams(inputValue(-1)))
                        .toThrow(/positive number.*must be specified/)
                    ;

                });

            });

        }

    });

    describe('writeCoins()', () => {

        const inputTypes: InputType[] = [
            'number',
            'string',
            'BN',
        ];

        for (const inputType of inputTypes) {

            const inputValue = (value: number): AnyBN => {
                switch (inputType) {
                    case 'number':
                        return value;
                    case 'string':
                        return value.toString();
                    case 'BN':
                        return new BN(value);
                }
            }

            describe(`${inputType} input`, () => {

                //==================//
                // writes the coins //
                //==================//

                {
                    type Case = [number, string];

                    const cases: Case[] = [
                        [           0, '0000'],
                        [           1, '0001 0000 0001'],
                        [         100, '0001 0110 0100'],
                        [ 15123456789, '0101 0000 0011 1000' +
                                       '0101 0110 1101 1010' +
                                       '0011 0001 0101'
                        ],
                    ];

                    for (const values of cases) {

                        const [value, expectedBits] = values;

                        it(`writes the coins: ${value}`, async () => {

                            const bitString = new BitString(44);
                            bitString.writeCoins(inputValue(value));

                            expectEqual(
                                bitString,
                                expectedBits.replace(/\s+/g, '')
                            );

                        });

                    }

                }

                it('throws error on BitString overflow', async () => {

                    const bitString = new BitString(1);

                    expect(() => bitString.writeCoins(inputValue(16)))
                        .toThrow('BitString overflow')
                    ;

                });

                it('throws error on negative values', async () => {

                    const bitString = new BitString(16);

                    expect(() => bitString.writeCoins(inputValue(-1)))
                        .toThrow(/positive number.*must be specified/)
                    ;

                });

            });

        }

    });

    describe('writeAddress()', () => {

        //==============================//
        // writes the address in format //
        //==============================//

        {
            const addresses = {
                'NF': '0:2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422e3',
                'F_NS_NB_NT': 'UQAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi41+E',
                'F_S_NB_NT': 'UQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi41-E',
                'F_NS_NB_T': '0QAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi4+QO',
                'F_S_NB_T': '0QAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4-QO',
                'F_NS_B_NT': 'EQAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi4wJB',
                'F_S_B_NT': 'EQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4wJB',
                'F_NS_B_T': 'kQAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi47nL',
                'F_S_B_T': 'kQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi47nL'
            };

            const expectedBits = (
                '1000000000000101100111101010101100101010011111010010010111011111' +
                '0111110101011011010101101111011101001110010010111000011111110010' +
                '0111010000010110010001111111000010000101100101110111010011100101' +
                '1010111101110001110011011110101000100001010011100001110010000100' +
                '01011100011'
            );

            for (const [format, address] of Object.entries(addresses)) {

                it(`writes the address in ${format} format`, () => {

                    const bitString = new BitString(267);

                    bitString.writeAddress(
                        new Address(address)
                    );

                    expectEqual(bitString, expectedBits);

                });

            }

        }


        //======================//
        // writes empty address //
        //======================//

        {
            const emptyValues = [undefined, null];

            for (const emptyValue of emptyValues) {

                it(`writes empty address (${emptyValue})`, () => {

                    const bitString = new BitString(2);

                    bitString.writeAddress(emptyValue);

                    expectEqual(bitString, '00');

                });

            }

        }

        it('throws on incorrect value', async () => {

            const values = [
                [], {}, new Date(), Symbol(),
                () => {}, 100, Promise.resolve(),
                new Map(), new Set(),
                0, '', 'hello',
            ];

            const bitString = new BitString(1);

            for (const value of values) {
                expect(() => bitString.writeAddress(value as any))
                    .toThrow('must be an instance of Address')
                ;
            }

        });

    });

    describe.only('writeBitString()', () => {

        it('writes the bit-string', () => {

            const refBitString = new BitString(32);
            refBitString.writeUint(100, 16);
            refBitString.writeUint(500, 16);

            const bitString = new BitString(32);
            bitString.writeUint(100, 16);

            const srcBitString = new BitString(16);
            srcBitString.writeUint(500, 16);

            bitString.writeBitString(srcBitString);

            expectEqual(bitString, refBitString);

        });

        it('writes empty bit-string', () => {

            const refBitString = new BitString(32);
            refBitString.writeUint(100, 16);

            const bitString = new BitString(32);
            bitString.writeUint(100, 16);

            const emptyBitString = new BitString(32);

            bitString.writeBitString(emptyBitString);

            expectEqual(bitString, refBitString);

        });

        it('throws error on overflow', () => {

            const bitString = new BitString(17);
            bitString.writeUint(100, 16);

            const srcBitString = new BitString(2);
            srcBitString.writeBit(0);
            srcBitString.writeBit(1);

            expect(() => bitString.writeBitString(srcBitString))
                .toThrow('BitString overflow')
            ;

        });

        it('throws on incorrect value', async () => {

            const values = [
                [], {}, new Date(), Symbol(),
                () => {}, 100, Promise.resolve(),
                new Map(), new Set(),
                0, '', 'hello',
            ];

            const bitString = new BitString(1);

            for (const value of values) {
                expect(() => bitString.writeBitString(value as any))
                    .toThrow('must be an instance of BitString')
                ;
            }

        });

    });

    describe('clone()', () => {
    });

    describe('toString()', () => {
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
            expectEqual(bitString,
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
            expectEqual(bitString,
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
            expectEqual(bitString,
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
            expectEqual(bitString,
                '0000 0100 0000 1000 0'
            );

        });

    });

    describe('toHex()', () => {
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


function expectEqual(
    testString: (BitString | string),
    expectedString: (BitString | string)
) {

    testString = prepare(testString);
    expectedString = prepare(expectedString);

    expect(testString).toEqual(expectedString);


    function prepare(value: (BitString | string)): string {
        if (value instanceof BitString) {
            value = toStringOfBits(value);
        } else if (typeof value !== 'string') {
            throw new Error(`Unknown input type`);
        }
        return value.replace(/\s+/g, '')
    }
}

function toStringOfBits(
    bitString: BitString

): string {
    let bits = '';
    bitString.forEach(
        bit => bits += (bit ? '1' : '0')
    );
    return bits;
}
