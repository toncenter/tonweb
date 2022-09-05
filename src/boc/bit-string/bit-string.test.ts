
import TonWeb from '__tonweb__';
import type { AddressType, BitString } from '__tonweb__';

import { BigIntInput } from '../../common/numbers';
import { BadIntegers, NonNumbers } from '../../test/common';
import { expectEqualBits, writeBits } from './test/utils';

const { BN } = TonWeb.utils;
const { BitString } = TonWeb.boc;


type BitStringMethods<Method extends keyof BitString> = Method;

/**
 * List of methods that contain a single argument — offset.
 */
type OffsetMethods = BitStringMethods<
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


// Shorthand helper that creates bytes array
const B = (...bytes: number[]) => new Uint8Array(bytes);


describe('BitString', () => {

  describe('get length()', () => {

    it('should return maximum length', () => {

      const bitString = new BitString(150);

      expect(bitString.length).toEqual(150);

    });

  });

  describe('constructor', () => {

    describe('()', () => {

      it('sets default max length', async () => {

        (expect((new BitString()).getFreeBits())
          .toEqual(1023)
        );

      });

      it('disallows second argument', async () => {

        expect(
          () => new (BitString as any)(undefined, true)

        ).toThrow(/invalid.*arguments/i);

      });

      it('disallows third argument', async () => {

        expect(
          () => new (BitString as any)(undefined, undefined, true)

        ).toThrow(/invalid.*arguments/i);

      });

    });

    describe('(maxLength)', () => {

      it('sets specified max length', async () => {

        let bitString: BitString;

        bitString = new BitString(0);
        expect(bitString.length).toEqual(0);

        bitString = new BitString(1);
        expect(bitString.length).toEqual(1);

        bitString = new BitString(8);
        expect(bitString.length).toEqual(8);

        bitString = new BitString(24);
        expect(bitString.length).toEqual(24);

        bitString = new BitString(83);
        expect(bitString.length).toEqual(83);

      });

      { // throws error on incorrect first argument

        const cases = [
          ...NonNumbers,
          ...BadIntegers

        ].filter(([_, value]) => (
          (value !== undefined) &&
          (!(value instanceof Uint8Array))
        ));

        for (const [label, value] of cases) {

          const description = (
            `throws error on incorrect first argument: ${label}`
          );

          it(description, async () => {

            expect(
              () => new BitString(value as number)

            ).toThrow(/(invalid.*arguments|expected.*valid.*integer|to be a safe integer)/i);

          });

        }

      }

      it('disallows second argument', async () => {

        expect(
          () => new (BitString as any)(1, true)

        ).toThrow(/invalid.*arguments/i);

      });

      it('disallows third argument', async () => {

        expect(
          () => new (BitString as any)(1, undefined, 100)

        ).toThrow(/invalid.*arguments/i);

      });

    });

    describe('(bytes, hasCompletion)', () => {

      testSetBytes(
        (bytes, hasCompletion) => (
          new BitString(bytes, hasCompletion)
        ),
        true
      );

    });

    describe('(bytes, bitLength, maxLength)', () => {

      it('should create BitString from the provided data', () => {

        // 1010 1010 (AA)
        // 1110 0111 (E7)
        // 010- ---- (40)

        const bitString = new BitString(
          B(0xAA, 0xE7, 0x40),
          19,
          24
        );

        expectEqualBits(bitString, '1010 1010 1110 0111 010');
        expect(bitString.getUsedBits()).toEqual(19);
        expect(bitString.length).toEqual(24);
        expect(bitString.getFreeBits()).toEqual(5);

      });

      it('should create empty BitString', () => {

        const bitString = new BitString(
          new Uint8Array(1),
          0, 8
        );

        expectEqualBits(bitString, '');
        expect(bitString.getUsedBits()).toEqual(0);
        expect(bitString.length).toEqual(8);
        expect(bitString.getFreeBits()).toEqual(8);

      });

      it('should throw if provided bytes are not enough', () => {

        (expect(() => new BitString(B(0, 0), 0, 17))
          .toThrow(/byte array is not big enough/i)
        );

      });

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

  describe('getUsedBits() / cursor', () => {

    it('calculates used bits', async () => {

      let bitString: BitString;

      bitString = new BitString(0);
      expectUsedBits(0);

      bitString = new BitString(1);
      expectUsedBits(0);

      bitString = new BitString(10);
      expectUsedBits(0);

      bitString = new BitString(3);
      expectUsedBits(0);
      bitString.writeBit(1);
      expectUsedBits(1);
      bitString.writeBit(0);
      expectUsedBits(2);
      bitString.writeBit(1);
      expectUsedBits(3);

      bitString = new BitString(9);
      expectUsedBits(0);
      bitString.writeUint8(0);
      expectUsedBits(8);

      bitString = new BitString(18);
      expectUsedBits(0);
      bitString.writeString('AB');
      expectUsedBits(16);

      bitString = new BitString(3 * 8 + 1);
      expectUsedBits(0);
      bitString.writeBytes(B(1, 2, 3));
      expectUsedBits(24);


      function expectUsedBits(count: number) {
        expect(bitString.getUsedBits()).toEqual(count);
        expect(bitString.cursor).toEqual(count);
      }

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

  { // get()

    const methods = ['get'] as const;

    for (const method of methods) {

      describe(`${method}()`, () => {

        it('returns bit by index', async () => {

          // 1010 1010 (AA)
          // 1110 0111 (E7)
          // 0101 ----

          const bitString = new BitString(24);
          bitString.writeBytes(B(0xAA, 0xE7));
          writeBits(bitString, '0101')

          const expected = (('1010 1010 1110 0111 0101')
            .replace(/\s/g, '')
          );

          expectEqualBits(bitString, expected);

          let bits = '';
          for (let offset = 0; offset < 20; offset++) {
            bits += (bitString[method](offset) ? '1' : '0');
          }

          expect(bits).toEqual(expected);

        });

        it('should throw error on incorrect index', async () => {
          testWrongOffset(method);
        });

      });

    }

  }

  { // on()

    const methods = ['on'] as const;

    for (const method of methods) {

      describe(`${method}()`, () => {

        it('sets the bit by offset', async () => {

          //   0000 1111 (initial, 0xF)
          // + 1101 0101 (set bits)
          //   1101 1111 (result)

          const bitString = new BitString(8);
          bitString.writeUint8(0xF);

          bitString[method](0);
          bitString[method](1);
          bitString[method](3);
          bitString[method](5);
          bitString[method](7);

          const expected = (('1101 1111')
            .replace(/\s+/g, '')
          );

          expectEqualBits(bitString, expected);

        });

        it('throws on overflow', async () => {
          testWrongOffset(method);
        });

      });

    }

  }

  { // off()

    const methods = ['off'] as const;

    for (const method of methods) {

      describe(`${method}()`, () => {

        it('clears the bit by index', async () => {

          //   1111 1001 (initial, 0xF9)
          // - 1101 0111 (clear bits)
          //   0010 1000 (result)

          const bitString = new BitString(8);
          bitString.writeUint8(0xF9);

          bitString[method](0);
          bitString[method](1);
          bitString[method](3);
          bitString[method](5);
          bitString[method](6);
          bitString[method](7);

          const expected = (('0010 1000')
            .replace(/\s+/g, '')
          );

          expectEqualBits(bitString, expected);

        });

        it('throws on overflow', async () => {
          testWrongOffset(method);
        });

      });

    }

  }

  { // toggle()

    const methods = ['toggle'] as const;

    for (const method of methods) {

      describe(`${method}()`, () => {

        it('toggles the bits by offset', async () => {

          //   1111 0000 (initial, 0xF0)
          // ^ 1101 1001 (toggle bits)
          //   0010 1001 (result)

          const bitString = new BitString(8);
          bitString.writeUint8(0xF0);

          bitString[method](0);
          bitString[method](1);
          bitString[method](3);
          bitString[method](4);
          bitString[method](7);

          const expected = (('0010 1001')
            .replace(/\s+/g, '')
          );

          expectEqualBits(bitString, expected);

        });

        it('throws on overflow', async () => {
          testWrongOffset(method);
        });

      });

    }

  }

  describe('forEach()', () => {

    it('iterates the bits', async () => {

      // 1010 1010 (AA)
      // 1110 0111 (E7)
      // 0101 ----

      const bitString = new BitString(24);
      bitString.writeBytes(B(0xAA, 0xE7));
      bitString.writeBit(0);
      bitString.writeBit(1);
      bitString.writeBit(0);
      bitString.writeBit(1);

      const expected = (('1010 1010 1110 0111 0101')
        .replace(/\s+/g, '')
      );

      let bits = '';
      bitString.forEach(
        bit => bits += (bit ? '1' : '0')
      );

      expect(bits).toEqual(expected);

    });

    it('throws on incorrect argument', async () => {

      const values = [
        [], {}, new Date(), Symbol(),
        0, 100, Promise.resolve(),
        new Map(), new Set(),
        '', 'hello', true, NaN, undefined, null,
      ];

      const bitString = new BitString(1);

      for (const value of values) {
        expect(() => bitString.forEach(value as any))
          .toThrow('must be a function')
        ;
      }

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

      const expected = (('1010 1010 1110 01')
        .replace(/\s+/g, '')
      );

      expectEqualBits(bitString, expected);

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
          .toThrow('Expected value to be a bit')
        ;
      }

    });

    it('throws on overflow', async () => {

      const bitString = new BitString(1);

      bitString.writeBit(0);

      (expect(() => bitString.writeBit(1))
        .toThrow('BitString overflow')
      );

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

      expectEqualBits(bitString, expected);

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
          .toThrow('Expected value to be a bit')
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

      const expected = (('1010 1010')
        .replace(/\s+/g, '')
      );

      expectEqualBits(bitString, expected);

      expect(bitString.getUsedBits()).toEqual(8);

    });

    it('throws on incorrect value', async () => {

      const values = [
        {}, new Date(), Symbol(), 'array',
        () => {}, 100, Promise.resolve(), true, false,
        NaN, undefined, null, '', 0,
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

      const inputValue = (value: number): BigIntInput => {
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

              expectEqualBits(
                bitString,
                expectedBits.replace(/\s+/g, '')
              );

            });

          }

        }

        it('throws on BitString overflow', async () => {

          const bitString = new BitString(4);

          expect(() => bitString.writeUint(inputValue(16), 5))
            .toThrow('BitString overflow')
          ;

        });

        it('throws on negative values', async () => {

          const bitString = new BitString(0);

          expect(() => bitString.writeUint(inputValue(-1), 8))
            .toThrow('Specified value must be positive')
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

    it('throws error on incorrect value type', () => {
      const bitString = new BitString(0);
      testBigIntInput((value: BigIntInput) =>
        bitString.writeUint(value, 8)
      );
    });

    it('throws error on incorrect bit-length', () => {

      const invalidTypeValues = [
        [], {}, new Date(), Symbol(),
        () => {}, Promise.resolve(),
        new Map(), new Set(),
        '', 'hello', NaN, null,
      ];

      const invalidRangeValues = [
        -10, -2, -1, 0, 257, 258, 300,
      ];

      const bitString = new BitString(1023);

      for (const bitLength of invalidTypeValues) {
        expect(() => bitString.writeUint(100500, bitLength as any))
          .toThrow(/expected value to be a valid integer/i)
        ;
      }

      for (const bitLength of invalidRangeValues) {
        expect(() => bitString.writeUint(100500, bitLength as any))
          .toThrow('must be greater than zero and less or equal to 256')
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

      const inputValue = (value: number): BigIntInput => {
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

              expectEqualBits(
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

      it('throws on negative values', async () => {

        const bitString = new BitString(0);

        expect(() => bitString.writeUint(inputValue(-1), 8))
          .toThrow('Specified value must be positive')
        ;

      });

    }

    it('throws error on incorrect value type', () => {
      const bitString = new BitString(0);
      testBigIntInput(
        (value => bitString.writeUint8(value))
      );
    });

  });

  describe('writeInt()', () => {

    const inputTypes: InputType[] = [
      'number',
      'string',
      'BN',
    ];

    for (const inputType of inputTypes) {

      const inputValue = (value: number): BigIntInput => {
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
          // value, bit-length, expected bits
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

              expectEqualBits(
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

              (expect(() => bitString.writeInt(inputValue(value), bitLength))
                .toThrow(/integer can't be represented/i)
              );

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

    it('throws error on incorrect value type', () => {
      const bitString = new BitString(0);
      testBigIntInput((value: BigIntInput) =>
        bitString.writeInt(value, 16)
      );
    });

  });

  describe('writeBytes()', () => {

    //==============//
    // writes bytes //
    //==============//

    {
      type Case = [Uint8Array, string];

      const cases: Case[] = [
        [ B(0),       '0000 0000'],
        [ B(1),       '0000 0001'],
        [ B(1, 136),    '0000 0001 1000 1000'],
        [ B(1, 136, 240), '0000 0001 1000 1000 1111 0000'],
      ];

      for (const [index, values] of Object.entries(cases)) {

        const [bytes, expectedBits] = values;

        it(`writes bytes (${index + 1})`, async () => {

          const bitString = new BitString(24);
          bitString.writeBytes(bytes);

          expectEqualBits(
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

      expectEqualBits(
        bitString,
        ('0000 1111 1010 0101 1111 0000 1001')
          .replace(/\s+/g, '')
      );

    });

    it('handles empty arrays', () => {

      const bitString = new BitString(8);
      bitString.writeBytes(B());

      expect(bitString.getUsedBits()).toEqual(0);
      expectEqualBits(bitString, '');

    });

    it('throws on incorrect value', async () => {

      const values = [
        {}, new Date(), Symbol(), 'array',
        () => {}, 100, Promise.resolve(),
        [], new Map(), new Set(), true, false,
        NaN, undefined, null,
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

          expectEqualBits(
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

  describe('writeGrams()', () => testWriteCoins('writeGrams'));

  describe('writeCoins()', () => testWriteCoins('writeCoins'));

  describe('writeAddress()', () => {

    //==============================//
    // writes the address in format //
    //==============================//

    const inputTypes = ['string', 'address-instance'] as const;

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

    for (const inputType of inputTypes) {

      describe(`type = ${inputType}`, () => {

        for (const [format, address] of Object.entries(addresses)) {

          it(`writes the address in ${format} format`, () => {

            const bitString = new BitString(3 + 8 + 256);

            let input: (AddressType | undefined);

            switch (inputType) {
              case 'string': {
                input = address;
                break;
              }
              case 'address-instance': {
                input = address;
                break;
              }
            }

            bitString.writeAddress(input);

            expectEqualBits(bitString, expectedBits);

          });

        }

      });

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

          expectEqualBits(bitString, '00');

        });

      }

    }

    it('throws on incorrect value', async () => {

      const values = [
        [], {}, new Date(), Symbol(),
        () => {}, 100, Promise.resolve(),
        new Map(), new Set(),
        0, true, false,
        NaN,
      ];

      const bitString = new BitString(1);

      for (const value of values) {
        (expect(() => bitString.writeAddress(value as any))
          .toThrow(/must be a string or an instance of address/i)
        );
      }

    });

    describe('throws on incorrect string value', () => {

      const cases = {
        'empty': '',
        'not-address': 'foo',
        'address-typo': 'EQAs9VlT6S776tq3unJcP5Ogsj-ALLunLXuOb1EKcOQi4wJB',
      };

      const bitString = new BitString(3 + 8 + 256);

      for (const [label, value] of Object.entries(cases)) {

        it(label, async () => {

          (expect(() => bitString.writeAddress(value))
            .toThrow(/(empty address specified|should contain strictly 48 characters|wrong.*checksum)/i)
          );

        });

      }

    });

  });

  describe('writeBitString()', () => {

    it('writes the bit-string', () => {

      const refBitString = new BitString(32);
      refBitString.writeUint(100, 16);
      refBitString.writeUint(500, 16);

      const bitString = new BitString(32);
      bitString.writeUint(100, 16);

      const srcBitString = new BitString(16);
      srcBitString.writeUint(500, 16);

      bitString.writeBitString(srcBitString);

      expectEqualBits(bitString, refBitString);

    });

    it('writes empty bit-string', () => {

      const refBitString = new BitString(32);
      refBitString.writeUint(100, 16);

      const bitString = new BitString(32);
      bitString.writeUint(100, 16);

      const emptyBitString = new BitString(32);

      bitString.writeBitString(emptyBitString);

      expectEqualBits(bitString, refBitString);

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
        0, '', 'hello', true, false,
        NaN, undefined, null,
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

    it('clones the bit-string', () => {

      const bitString = new BitString(10);
      bitString.writeUint8(100);

      const clonedBitString = bitString.clone();

      expectEqualBits(clonedBitString, bitString);

      expect(clonedBitString.getUsedBits()).toEqual(8);
      expect(clonedBitString.getFreeBits()).toEqual(2);

    });

    it('cursor position should be preserved', () => {

      const bitString = new BitString(10);
      bitString.writeBit(0);
      bitString.writeBit(1);
      bitString.writeBit(1);

      const clonedBitString = bitString.clone();
      clonedBitString.writeBit(0);
      clonedBitString.writeBit(0);
      clonedBitString.writeBit(1);

      expectEqualBits(clonedBitString, '011 001');

    });

    it(`mutation shouldn't propagate to clones`, () => {

      const bitString = new BitString(10);
      bitString.writeBit(1);
      bitString.writeBit(0);
      bitString.writeBit(1);

      const clonedBitString = bitString.clone();

      bitString.writeBit(0);
      bitString.writeBit(1);
      bitString.writeBit(0);

      expectEqualBits(bitString, '101 010');
      expectEqualBits(clonedBitString, '101');

    });

  });

  describe('toString()', () => testToHex('toString'));

  { // getTopUppedArray()

    const methods = ['getTopUppedArray'] as const;

    for (const method of methods) {

      describe(`${method}()`, () => {

        it('no leftovers, without completion', async () => {
          const bitString = new BitString(3 * 8);
          bitString.writeBytes(B(4, 8, 15));
          (expect(bitString[method]())
            .toEqual(B(4, 8, 15))
          );
        });

        it('with leftovers, without completion', async () => {
          const bitString = new BitString(10 * 8);
          bitString.writeBytes(B(4, 8, 15));
          (expect(bitString[method]())
            .toEqual(B(4, 8, 15))
          );
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
          (expect(bitString[method]())
            .toEqual(B(4, 8, 0xB0))
          );
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
          (expect(bitString[method]())
            .toEqual(B(4, 0x20))
          );
        });

        //==============================//
        // converts bit-string to bytes //
        //==============================//

        {
          const cases = [
            [           '', ''],
            [          '1', '1100 0000'],
            [         '11', '1110 0000'],
            [        '111', '1111 0000'],
            [         '1111', '1111 1000'],
            [       '1111 0', '1111 0100'],
            [      '1111 00', '1111 0010'],
            [       '1111 000', '1111 0001'],
            [      '1111 0000', '1111 0000'],
            [    '1111 0000 1', '1111 0000 1100 0000'],
            [     '1111 0000 10', '1111 0000 1010 0000'],
            [    '1111 0000 101', '1111 0000 1011 0000'],
            [   '1111 0000 1010', '1111 0000 1010 1000'],
            [   '1111 0000 1010 1', '1111 0000 1010 1100'],
            [  '1111 0000 1010 11', '1111 0000 1010 1110'],
            [ '1111 0000 1010 110', '1111 0000 1010 1101'],
            ['1111 0000 1010 1100', '1111 0000 1010 1100'],
          ];

          for (const caseData of cases) {
            const [bits, expectedBits] = caseData;

            it(`converts bit-string to bytes (${bits})`, () => {

              const bitString = new BitString(16);

              writeBits(bitString, bits);

              expectEqualBits(
                bitString[method](),
                expectedBits
              );

            });

          }

        }

      });

    }

  }

  describe('setTopUppedArray()', () => {

    testSetBytes((bytes, hasCompletion) => {
      const bitString = new BitString(0);
      const noCompletion = (
        typeof hasCompletion === 'boolean'
          ? !hasCompletion
          // Passing non-bool values "as is" to enable
          // test with invalid argument type.
          : hasCompletion
      );
      bitString.setTopUppedArray(bytes, noCompletion);
      return bitString;
    });

  });

  describe('toHex()', () => testToHex('toHex'));

  it('internal: writeBits()', () => {

    const bitString = new BitString(12);
    writeBits(bitString, '10 1100 0111');
    expectEqualBits(bitString, '1011 0001 11');

  });

  it('internal: bitsToBytes()', () => {

    expect(bitsToBytes(
      '0001 0001 1010 1011 0000 0000'

    )).toEqual(B(0x11, 0xAB, 0x00))

  });

});


function testToHex(funcName: ('toHex' | 'toString')) {

  //===================================//
  // converts bit-string to HEX-string //
  //===================================//

  {
    const cases = [
      ['', ''],
      ['1', 'C_'],
      ['11', 'E_'],
      ['111', 'F_'],
      ['1111', 'F'],
      ['1111 0', 'F4_'],
      ['1111 00', 'F2_'],
      ['1111 000', 'F1_'],
      ['1111 0000', 'F0'],
      ['1111 0000 1', 'F0C_'],
      ['1111 0000 10', 'F0A_'],
      ['1111 0000 101', 'F0B_'],
      ['1111 0000 1010', 'F0A'],
    ];

    for (const caseData of cases) {
      const [bits, hex] = caseData;

      it(`converts bit-string to HEX-string (${hex})`, () => {

        const bitString = new BitString(12);

        writeBits(bitString, bits);

        expect(bitString[funcName]()).toEqual(hex);

      });

    }
  }

  it(`shouldn't overflow`, () => {

    const bitString = new BitString(7);

    writeBits(bitString, '1010 101');

    expect(bitString[funcName]()).toEqual('AB_');

  });

}

function testWrongOffset(method: OffsetMethods) {

  const bitString = new BitString(0);

  const invalidIndices = [
    -100, -10, -2, -1,
    NaN, [], {}, new Date(), Symbol(),
    () => {}, Promise.resolve(),
    new Map(), new Set(),
    '', 'hello', null,
  ];

  const overflowIndices = [
    0, 1, 2, 3, 10, 100,
    Number.MAX_SAFE_INTEGER,
  ];

  for (const index of invalidIndices) {
    (expect(() => bitString[method](index as any))
      .toThrow('Incorrect BitString offset')
    );
  }

  for (const index of overflowIndices) {
    (expect(() => bitString[method](index as any))
      .toThrow('offset is out of bounds')
    );
  }

}

function testBigIntInput(
  func: (value: BigIntInput) => void
) {

  const invalidIntegers = [
    NaN, 100.5, Math.PI,
  ];

  const unsafeIntegers = [
    Number.MAX_VALUE,
    (Number.MAX_SAFE_INTEGER + 1),
  ];

  const invalidStrings = [
    '100.5', '100 5', 'hello',
  ];

  const invalidTypes = [
    [], {}, new Date(), Symbol(),
    () => {}, Promise.resolve(),
    new Map(), new Set(),
    null, undefined,
  ];

  for (const value of invalidIntegers) {
    expect(() => func(value as any))
      .toThrow(/Expected.*value to be a valid integer/)
    ;
  }

  for (const value of unsafeIntegers) {
    expect(() => func(value as any))
      .toThrow(/Expected.*value to be a safe integer/)
    ;
  }

  expect(() => func(''))
    .toThrow(`Specified string shouldn't be empty`)
  ;

  for (const value of invalidStrings) {
    expect(() => func(value as any))
      .toThrow('Specified string contains invalid characters')
    ;
  }

  for (const value of invalidTypes) {
    expect(() => func(value as any))
      .toThrow('Specified value has an incorrect type')
    ;
  }

}

function testWriteCoins(funcName: ('writeGrams' | 'writeCoins')) {

  const inputTypes: InputType[] = [
    'number',
    'string',
    'BN',
  ];

  for (const inputType of inputTypes) {

    const inputValue = (value: number): BigIntInput => {
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
          [       0, '0000'],
          [       1, '0001 0000 0001'],
          [     100, '0001 0110 0100'],
          [ 15123456789, '0101 0000 0011 1000' +
          '0101 0110 1101 1010' +
          '0011 0001 0101'
          ],
        ];

        for (const values of cases) {

          const [value, expectedBits] = values;

          it(`writes the grams: ${value}`, async () => {

            const bitString = new BitString(44);
            bitString[funcName](inputValue(value));

            expectEqualBits(
              bitString,
              expectedBits.replace(/\s+/g, '')
            );

          });

        }

      }

      it('throws error on BitString overflow', async () => {

        const bitString = new BitString(1);

        expect(() => bitString[funcName](inputValue(16)))
          .toThrow('BitString overflow')
        ;

      });

      it('throws error on negative values', async () => {

        const bitString = new BitString(16);

        (expect(() => bitString[funcName](inputValue(-1)))
          .toThrow('coins value must be equal to or greater than zero')
        );

      });

    });

  }

  it('throws error on incorrect value type', () => {
    const bitString = new BitString(0);
    testBigIntInput(
      (value => bitString[funcName](value))
    );
  });

}

type SetBytesTestFunction = (
  bytes: Uint8Array,
  hasCompletion?: boolean

) => BitString;

function testSetBytes(
  setBytes: SetBytesTestFunction,
  isConstructor?: boolean
) {

  it('without completion', () => {

    //   0000 0100 (4)
    //   0000 1000 (8)
    //   0000 1111 (15)
    //
    const bitString = setBytes(
      B(4, 8, 15),
      false
    );

    expectEqualBits(bitString,
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
    const bitString = setBytes(
      B(4, 8, 0xB0), true
    );
    expectEqualBits(bitString,
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
    const bitString = setBytes(
      B(4, 8, 0xFF), true
    );
    expectEqualBits(bitString,
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
    const bitString = setBytes(
      B(4, 8, 0x40), true
    );
    expectEqualBits(bitString,
      '0000 0100 0000 1000 0'
    );

  });

  //==============================//
  // parses bit-string from bytes //
  //==============================//

  {
    const cases: Array<[string, string, boolean]> = [
      [           '', '', false],
      [          '1', '1100 0000', true],
      [         '11', '1110 0000', true],
      [        '111', '1111 0000', true],
      [         '1111', '1111 1000', true],
      [       '1111 0', '1111 0100', true],
      [      '1111 00', '1111 0010', true],
      [       '1111 000', '1111 0001', true],
      [      '1111 0000', '1111 0000', false],
      [    '1111 0000 1', '1111 0000 1100 0000', true],
      [     '1111 0000 10', '1111 0000 1010 0000', true],
      [    '1111 0000 101', '1111 0000 1011 0000', true],
      [   '1111 0000 1010', '1111 0000 1010 1000', true],
      [   '1111 0000 1010 1', '1111 0000 1010 1100', true],
      [  '1111 0000 1010 11', '1111 0000 1010 1110', true],
      [ '1111 0000 1010 110', '1111 0000 1010 1101', true],
      ['1111 0000 1010 1100', '1111 0000 1010 1100', false],
    ];

    for (const caseData of cases) {
      const [expectedBits, bits, hasCompletion] = caseData;

      it(`parses bit-string from bytes (${expectedBits})`, () => {

        const bitString = setBytes(
          bitsToBytes(bits),
          hasCompletion
        );

        expectEqualBits(bitString, expectedBits);

      });

    }

  }

  it(`throws error when completion first bit can't be found`, () => {

    (expect(() => setBytes(
      bitsToBytes('0000 0000'),
      true
    ))
      .toThrow('Failed to find first bit of the completion')
    );

  });

  it('throws on incorrect "bytes" value', async () => {

    const values = [
      [], {}, new Date(), Symbol(),
      () => {}, Promise.resolve(),
      new Map(), new Set(),
      '', 'hello', true, null,
    ];

    if (!isConstructor) {
      // Numbers are allowed as the
      // constructor's first argument.
      values.push(NaN, 0, 100);
    }

    for (const value of values) {
      (expect(() => setBytes(value as any))
        .toThrow(/(invalid.*arguments|must be.*Uint8Array)/i)
      );
    }

  });

  it('throws on incorrect "noCompletion" flag', async () => {

    const values = [
      [], {}, new Date(), Symbol(),
      () => {}, 100, Promise.resolve(),
      new Map(), new Set(), 0,
      '', 'hello', NaN, null,
    ];

    if (isConstructor) {
      // Constructor requires the flag
      // to be explicitly set.
      values.push(undefined);
    }

    for (const value of values) {
      (expect(() => setBytes(B(0x00), value as any))
        .toThrow(/(invalid constructor arguments|must be a boolean)/i)
      );
    }

  });

}


//==============//
// TEST HELPERS //
//==============//

function bitsToBytes(bits: string): Uint8Array {
  bits = bits.replace(/\s+/g, '');
  if (bits.length % 8 !== 0) {
    throw new Error(`Number of bits must be divisible by 8`);
  }
  const bytes: number[] = [];
  let count = 0;
  let octet = '';
  for (const bit of bits) {
    octet += bit;
    count++;
    if (count === 8) {
      bytes.push(new BN(octet, 2).toNumber());
      count = 0;
      octet = '';
    }
  }
  // const bytes = new Uint8Array(bits.length / 8);
  return new Uint8Array(bytes);
}
