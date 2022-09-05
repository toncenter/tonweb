
import type { Cell } from '__tonweb__';

import TonWeb from '__tonweb__';

import { NonNumbers } from '../../test/common';
import { stringToBytes } from '../../utils/text-encoding';
import { writeBits } from '../bit-string/test/utils';
import { CellSlice } from './cell-slice';

const { Address } = TonWeb.utils;
const { Cell } = TonWeb.boc;


describe('CellSlice', () => {

  describe('constructor()', () => {

    it('creates slice from the cell', () => {

      const rootCell = new Cell();

      rootCell.bits.writeUint('100500', 32);

      const subCell = new Cell();
      rootCell.refs.push(subCell);

      const slice = new CellSlice(rootCell);

      expect(slice).toBeInstanceOf(CellSlice);

      (expect(slice.loadUint(32).toString())
        .toEqual('100500')
      );

      expect(slice.loadRef()).toEqual(subCell);

    });

  });

  describe('getBitsCount()', () => {

    it('returns zero when empty', () => {

      const slice = new CellSlice(new Cell());

      (expect(slice.getBitsCount())
        .toEqual(0)
      );

    });

    it('returns bits count', () => {

      const cell = new Cell();

      cell.bits.writeUint('100500', 32);
      cell.bits.writeUint('15', 4);

      const slice = new CellSlice(cell);

      (expect(slice.getBitsCount()).toEqual(36));

    });

    it('decreases bits count after loading data', () => {

      const cell = new Cell();

      cell.bits.writeUint('100500', 32);
      cell.bits.writeUint('15', 4);

      const slice = new CellSlice(cell);

      (expect(slice.getBitsCount()).toEqual(36));

      slice.loadUint(32);

      (expect(slice.getBitsCount()).toEqual(4));

      slice.loadUint(4);

      (expect(slice.getBitsCount()).toEqual(0));

    });

  });

  describe('isEmpty()', () => {

    it('returns "true" when empty', () => {

      const slice = new CellSlice(new Cell());

      (expect(slice.isEmpty())
        .toEqual(true)
      );

    });

    it('returns "false" when have unloaded bits', () => {

      const cell = new Cell();

      cell.bits.writeUint('100500', 32);

      const slice = new CellSlice(cell);

      (expect(slice.isEmpty())
        .toEqual(false)
      );

    });

    it('returns "false" when have ref cells', () => {

      const rootCell = new Cell();

      const subCell = new Cell();
      rootCell.refs.push(subCell);

      const slice = new CellSlice(rootCell);

      (expect(slice.isEmpty())
        .toEqual(false)
      );

    });

    it('returns "true" when all ref cells are loaded', () => {

      const rootCell = new Cell();

      const subCell = new Cell();
      rootCell.refs.push(subCell);

      const slice = new CellSlice(rootCell);

      (expect(slice.isEmpty())
        .toEqual(false)
      );

      slice.loadRef();

      (expect(slice.isEmpty())
        .toEqual(true)
      );

    });

    it('returns "true" when all bits are loaded', () => {

      const cell = new Cell();

      cell.bits.writeUint('100500', 32);
      cell.bits.writeUint('15', 4);

      const slice = new CellSlice(cell);

      (expect(slice.isEmpty())
        .toEqual(false)
      );

      slice.loadUint(32);
      slice.loadUint(4);

      (expect(slice.isEmpty())
        .toEqual(true)
      );

    });

  });

  describe('isDataEmpty()', () => {

    it('returns "true" when empty', () => {

      const slice = new CellSlice(new Cell());

      (expect(slice.isDataEmpty())
        .toEqual(true)
      );

    });

    it('returns "true" when have unloaded ref cells', () => {

      const rootCell = new Cell();

      const subCell = new Cell();
      rootCell.refs.push(subCell);

      const slice = new CellSlice(rootCell);

      (expect(slice.isDataEmpty())
        .toEqual(true)
      );

    });

    it('returns "false" when have unloaded bits', () => {

      const cell = new Cell();

      cell.bits.writeUint('100500', 32);

      const slice = new CellSlice(cell);

      (expect(slice.isDataEmpty())
        .toEqual(false)
      );

    });

    it('returns "true" when all bits are loaded', () => {

      const cell = new Cell();

      cell.bits.writeUint('100500', 32);
      cell.bits.writeUint('15', 4);

      const slice = new CellSlice(cell);

      (expect(slice.isDataEmpty())
        .toEqual(false)
      );

      slice.loadUint(32);
      slice.loadUint(4);

      (expect(slice.isDataEmpty())
        .toEqual(true)
      );

    });

  });

  describe('preloadBit() / loadBit()', () => {

    it('should load and preload bits', () => {

      const cell = new Cell();

      cell.bits.writeBit(1);
      cell.bits.writeBit(0);
      cell.bits.writeBit(1);

      const slice = new CellSlice(cell);

      // Is not empty
      expect(slice.isEmpty()).toEqual(false);
      expect(slice.isDataEmpty()).toEqual(false);

      // Have three bits
      expect(slice.getBitsCount()).toEqual(3);

      // Pre-loading "1"
      expect(slice.preloadBit()).toEqual(true);
      expect(slice.getBitsCount()).toEqual(3);

      // Pre-loading "1" again
      expect(slice.preloadBit()).toEqual(true);
      expect(slice.getBitsCount()).toEqual(3);

      // Loading "1"
      expect(slice.loadBit()).toEqual(true);
      expect(slice.getBitsCount()).toEqual(2);

      // Pre-loading "0"
      expect(slice.preloadBit()).toEqual(false);
      expect(slice.getBitsCount()).toEqual(2);

      // Pre-loading "0" again
      expect(slice.preloadBit()).toEqual(false);
      expect(slice.getBitsCount()).toEqual(2);

      // Loading "0"
      expect(slice.loadBit()).toEqual(false);
      expect(slice.getBitsCount()).toEqual(1);

      // Loading "1"
      expect(slice.loadBit()).toEqual(true);
      expect(slice.getBitsCount()).toEqual(0);

      // Is now empty
      expect(slice.isEmpty()).toEqual(true);
      expect(slice.isDataEmpty()).toEqual(true);

      // Should throw further
      (expect(() => slice.preloadBit())
        .toThrow(/out of bounds/i)
      );
      (expect(() => slice.loadBit())
        .toThrow(/out of bounds/i)
      );

    });

  });

  describe('preloadUint() / loadUint()', () => {

    {

      const methods = [
        'preloadUint',
        'loadUint',

      ] as const;

      for (const method of methods) {

        //============================//
        // reads the unsigned integer //
        //============================//

        describe(`${method}() reads the unsigned integer`, () => {

          const cases: Array<
            // bits  // length  // expected value
            [string, number, string]

            > = [
            ['0', 1, '0'],
            ['1', 1, '1'],
            ['0000', 4,  '0'],
            ['1010', 4, '10'],
            ['1111', 4, '15'],
            ['0000 0000', 8,   '0'],
            ['1010 0101', 8, '165'],
            ['1111 1111', 8, '255'],
            ['1010 0100 1111 010', 15, '21114'],
            ['1000 1000 1000 1000 1000 1000 1000 1000', 32, '2290649224'],
            ['101110100101100101010011111100100011011011011110000011100010', 60, '839241003984347362'],
            ['1000010111111000110111100011011000100100001111011101110000110101001011100001111010011100010100000110110000100001100010001100101', 127, '89039760022389739759691047987332564069'],
            ['1110100111111010011100111111011110101100100010100000101011010000000011010100110110001100001011110011000011010011111101011100011001101011000000011000110000011110010100110001100101010100110001111011010110011111000010101110010101110100010000011001000010000101', 256, '105831405864202873723987145906483362399712148033445864676016423455266323927173'],
          ];

          for (const values of cases) {

            const [bits, bitLength, expectedValue] = values;

            it(`${bitLength} / ${expectedValue}`, async () => {

              const cell = new Cell();

              writeBits(cell.bits, bits);

              const slice = new CellSlice(cell);

              const value = slice[method](bitLength);

              expect(value.toString()).toEqual(expectedValue);

            });

          }

        });

        it(`${method}() should throw on incorrect bit-length (overflow)`, () => {

          const cell = new Cell();

          cell.bits.writeUint('100500', 32);

          const slice = new CellSlice(cell);

          (expect(() => slice[method](33))
            .toThrow(/out of bounds/i)
          );

        });

        describe(`${method}() should throw on incorrect bit-length (range)`, () => {

          const bitLengths = [
            -1_000, -100, -10, -1, 0, 257, 258, 512, 1023,
          ];

          for (const bitLength of bitLengths) {

            it(`${bitLength}`, () => {

              const cell = new Cell();
              writeBits(cell.bits, '0'.repeat(1023));

              const slice = new CellSlice(cell);

              (expect(() => slice[method](bitLength))
                .toThrow(/greater than zero.*less or equal to 256/i)
              );

            });

          }

        });

        describe(`${method}() should throw on incorrect bit-length (non-number)`, () => {

          for (const [label, bitLength] of NonNumbers) {

            it(label, () => {

              const slice = new CellSlice(new Cell());

              (expect(() => slice[method](bitLength as any))
                .toThrow(/expected.*to be a valid integer/i)
              );

            });

          }

        });

      }

    }

    it('should load and preload unsigned integers', () => {

      const cell = new Cell();

      cell.bits.writeUint('100500', 32);
      cell.bits.writeUint('15', 4);
      cell.bits.writeUint('2184', 12);

      const slice = new CellSlice(cell);

      // Is not empty
      expect(slice.isEmpty()).toEqual(false);
      expect(slice.isDataEmpty()).toEqual(false);

      // Have three uints
      expect(slice.getBitsCount()).toEqual(32 + 4 + 12);

      // Pre-loading "100500"
      (expect(slice.preloadUint(32).toString())
        .toEqual('100500')
      );
      expect(slice.getBitsCount()).toEqual(32 + 4 + 12);

      // Pre-loading "100500" again
      (expect(slice.preloadUint(32).toString())
        .toEqual('100500')
      );
      expect(slice.getBitsCount()).toEqual(32 + 4 + 12);

      // Loading "100500"
      (expect(slice.loadUint(32).toString())
        .toEqual('100500')
      );
      expect(slice.getBitsCount()).toEqual(4 + 12);

      // Pre-loading "15"
      (expect(slice.preloadUint(4).toString())
        .toEqual('15')
      );
      expect(slice.getBitsCount()).toEqual(4 + 12);

      // Pre-loading "15" again
      (expect(slice.preloadUint(4).toString())
        .toEqual('15')
      );
      expect(slice.getBitsCount()).toEqual(4 + 12);

      // Loading "15"
      (expect(slice.loadUint(4).toString())
        .toEqual('15')
      );
      expect(slice.getBitsCount()).toEqual(12);

      // Loading "2184"
      (expect(slice.loadUint(12).toString())
        .toEqual('2184')
      );
      expect(slice.getBitsCount()).toEqual(0);

      // Is now empty
      expect(slice.isEmpty()).toEqual(true);
      expect(slice.isDataEmpty()).toEqual(true);

      // Should throw further
      (expect(() => slice.preloadUint(1))
        .toThrow(/out of bounds/i)
      );
      (expect(() => slice.loadUint(1))
        .toThrow(/out of bounds/i)
      );

    });

  });

  describe('preloadInt() / loadInt()', () => {

    it('should load and preload signed integers', () => {

      const cell = new Cell();

      cell.bits.writeInt(100500, 32);
      cell.bits.writeInt(-15, 5);
      cell.bits.writeInt(0, 1);
      cell.bits.writeInt(2184, 13);

      const slice = new CellSlice(cell);

      // Is not empty
      expect(slice.isEmpty()).toEqual(false);
      expect(slice.isDataEmpty()).toEqual(false);

      // Have four ints
      expect(slice.getBitsCount()).toEqual(32 + 5 + 1 + 13);

      // Pre-loading "100500"
      (expect(slice.preloadInt(32).toString())
        .toEqual('100500')
      );
      expect(slice.getBitsCount()).toEqual(32 + 5 + 1 + 13);

      // Pre-loading "100500" again
      (expect(slice.preloadInt(32).toString())
        .toEqual('100500')
      );
      expect(slice.getBitsCount()).toEqual(32 + 5 + 1 + 13);

      // Loading "100500"
      (expect(slice.loadInt(32).toString())
        .toEqual('100500')
      );
      expect(slice.getBitsCount()).toEqual(5 + 1 + 13);

      // Pre-loading "-15"
      (expect(slice.preloadInt(5).toString())
        .toEqual('-15')
      );
      expect(slice.getBitsCount()).toEqual(5 + 1 + 13);

      // Pre-loading "-15" again
      (expect(slice.preloadInt(5).toString())
        .toEqual('-15')
      );
      expect(slice.getBitsCount()).toEqual(5 + 1 + 13);

      // Loading "-15"
      (expect(slice.loadInt(5).toString())
        .toEqual('-15')
      );
      expect(slice.getBitsCount()).toEqual(1 + 13);

      // Loading "0"
      (expect(slice.loadInt(1).toString())
        .toEqual('0')
      );
      expect(slice.getBitsCount()).toEqual(13);

      // Loading "2184"
      (expect(slice.loadInt(13).toString())
        .toEqual('2184')
      );
      expect(slice.getBitsCount()).toEqual(0);

      // Is now empty
      expect(slice.isEmpty()).toEqual(true);
      expect(slice.isDataEmpty()).toEqual(true);

      // Should throw further
      (expect(() => slice.preloadInt(1))
        .toThrow(/out of bounds/i)
      );
      (expect(() => slice.loadInt(1))
        .toThrow(/out of bounds/i)
      );

    });

    {

      const methods = [
        'preloadInt',
        'loadInt',

      ] as const;

      for (const method of methods) {

        describe(`${method}() reads the signed integer`, () => {

          // bits,  bit-length,  expected value
          const cases: Array<[string, number, string]> = [
            ['000', 3,  '0'],
            ['001', 3,  '1'],
            ['010', 3,  '2'],
            ['011', 3,  '3'],
            ['100', 3, '-4'],
            ['101', 3, '-3'],
            ['110', 3, '-2'],
            ['111', 3, '-1'],
            ['0000 0000', 8, '0'],
            ['0000 0001', 8, '1'],
            ['0111 1111', 8, '127'],
            ['1000 0000', 8, '-128'],
            ['1000 0001', 8, '-127'],
            ['1111 1111', 8, '-1'],
            ['1011 0111 1011 001', 15, '-9255'],
            ['00000000 00000000 00000000 00000000', 32,           '0'],
            ['00000000 00000000 00000000 00010000', 32,          '16'],
            ['10000000 00000000 00000000 00000000', 32, '-2147483648'],
            ['10000000 10000001 11111111 00000000', 32, '-2138964224'],
            ['01111111 11111111 11111111 11111111', 32,  '2147483647'],
            ['11111111 11111111 11111111 11111111', 32,          '-1'],
            ['011111000110001100011010101100011010010101011010110011111010010001', 66, '35852148134732578449'],
            ['110110101001111110101100010010010111101001111111111011111011111010', 66, '-10772978482225889542'],
            ['0100101011111101010000111110110110001010110110000111100100000010111000100101101001111111101100100011000100001001101100000001110111', 130, '398711602139126709277588545327264612471'],
            ['1000001001000110110101000100110010110110011010101110011101101010100010000001100110000111111101100011010101011010000100010001110011', 130, '-668459842960680504229918535475506166669'],
            ['1000000110011110100110100101000100110110100000100000110101011000011001111001110101101001010101101101000110110010101110111100001101101010000111101100001001111000101001100011000001110111000100110100111101100011111111000001110001101110011010101000110011100100', 256, '-57163504875406396719977733983754225095798266007551514299866278342107078161180'],
            ['0000010101010110111010100110001100101110111101011110011011101100011110001110111000111010010111111111111000001001000110101111010010110100101110000000111110011110011001000000010000110111111011111001111011010000001101101010101000111110010011011000111111110111', 256, '2415130773112665685051336518429489235110677131923305088856812946496208867319'],
          ];

          for (const values of cases) {

            const [bits, bitLength, expectedValue] = values;

            it(`${expectedValue} / ${bitLength}`, async () => {

              const cell = new Cell();

              writeBits(cell.bits, bits);

              const slice = new CellSlice(cell);

              const value = slice[method](bitLength);

              expect(value.toString()).toEqual(expectedValue);

            });

          }

        });

        it(`${method}() should throw on incorrect bit-length (overflow)`, () => {

          const cell = new Cell();

          cell.bits.writeInt('100500', 32);

          const slice = new CellSlice(cell);

          (expect(() => slice[method](33))
            .toThrow(/out of bounds/i)
          );

        });

        describe(`${method}() should throw on incorrect bit-length (range)`, () => {

          const bitLengths = [
            -1_000, -100, -10, -1, 0, 257, 258, 512, 1023,
          ];

          for (const bitLength of bitLengths) {

            it(`${bitLength}`, () => {

              const cell = new Cell();
              writeBits(cell.bits, '0'.repeat(1023));

              const slice = new CellSlice(cell);

              (expect(() => slice[method](bitLength))
                .toThrow(/greater than zero.*less or equal to 256/i)
              );

            });

          }

        });

        describe(`${method}() should throw on incorrect bit-length (non-number)`, () => {

          for (const [label, bitLength] of NonNumbers) {

            it(label, () => {

              const slice = new CellSlice(new Cell());

              (expect(() => slice[method](bitLength as any))
                .toThrow(/expected.*to be a valid integer/i)
              );

            });

          }

        });

      }

    }

  });

  describe('preloadAddress() / loadAddress()', () => {

    {

      const methods = [
        'preloadAddress',
        'loadAddress',

      ] as const;

      for (const method of methods) {

        it(`${method}() reads the address correctly`, () => {

          const addressBits = (
            '1000000000000101100111101010101100101010011111010010010111011111' +
            '0111110101011011010101101111011101001110010010111000011111110010' +
            '0111010000010110010001111111000010000101100101110111010011100101' +
            '1010111101110001110011011110101000100001010011100001110010000100' +
            '01011100011'
          );

          const cell = new Cell();

          writeBits(cell.bits, addressBits);

          const slice = new CellSlice(cell);

          const address = slice[method]();

          (expect(address.toString())
            .toEqual('0:2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422e3')
          );

        });

        it(`${method}() reads the NONE address correctly`, () => {

          const cell = new Cell();

          writeBits(cell.bits, '00');

          const slice = new CellSlice(cell);

          const address = slice[method]();

          expect(address).toBeNull();

        });

        it(`${method}() throws error on external address`, () => {

          const cell = new Cell();

          writeBits(cell.bits, '01');

          const slice = new CellSlice(cell);

          (expect(() => slice[method]())
            .toThrow(/external.*not supported/i)
          );

        });

        it(`${method}() throws error on internal variable address`, () => {

          const cell = new Cell();

          writeBits(cell.bits, '11');

          const slice = new CellSlice(cell);

          (expect(() => slice[method]())
            .toThrow(/internal variable.*not supported/i)
          );

        });

      }

    }

    it('preloads and loads address', () => {

      const cell = new Cell();

      const address1 = (
        '0:83dfd552e63729b472fcbcc8c45ebcc6691702558b68ec7527e1ba403a0f31a8'
      );

      const address2 = (
        '0:b0b9cabf70dc24d8068c1d714aa58c2dc440a969b1347716389c4ea20fa172ea'
      );

      const address3 = (
        '-1:3333333333333333333333333333333333333333333333333333333333333333'
      );

      cell.bits.writeAddress(new Address(address1));
      cell.bits.writeAddress(new Address(address2));
      cell.bits.writeAddress(null);
      cell.bits.writeAddress(new Address(address3));

      const slice = new CellSlice(cell);

      // Is not empty
      expect(slice.isEmpty()).toEqual(false);
      expect(slice.isDataEmpty()).toEqual(false);

      // Have four addresses
      expect(slice.getBitsCount()).toEqual((267 * 3) + 2);

      // Preloading address #1
      expect(slice.preloadAddress().toString(false)).toEqual(address1);
      expect(slice.getBitsCount()).toEqual((267 * 3) + 2);

      // Preloading address #1 again
      expect(slice.preloadAddress().toString(false)).toEqual(address1);
      expect(slice.getBitsCount()).toEqual((267 * 3) + 2);

      // Loading address #1
      expect(slice.loadAddress().toString(false)).toEqual(address1);
      expect(slice.getBitsCount()).toEqual((267 * 2) + 2);

      // Preloading address #2
      expect(slice.preloadAddress().toString(false)).toEqual(address2);
      expect(slice.getBitsCount()).toEqual((267 * 2) + 2);

      // Preloading address #2 again
      expect(slice.preloadAddress().toString(false)).toEqual(address2);
      expect(slice.getBitsCount()).toEqual((267 * 2) + 2);

      // Loading address #2
      expect(slice.loadAddress().toString(false)).toEqual(address2);
      expect(slice.getBitsCount()).toEqual(267 + 2);

      // Preloading address #3
      expect(slice.preloadAddress()).toEqual(null);
      expect(slice.getBitsCount()).toEqual(267 + 2);

      // Preloading address #3 again
      expect(slice.preloadAddress()).toEqual(null);
      expect(slice.getBitsCount()).toEqual(267 + 2);

      // Loading address #3
      expect(slice.loadAddress()).toEqual(null);
      expect(slice.getBitsCount()).toEqual(267);

      // Loading address #4
      expect(slice.loadAddress()?.toString(false)).toEqual(address3);
      expect(slice.getBitsCount()).toEqual(0);

      // Is now empty
      expect(slice.isEmpty()).toEqual(true);
      expect(slice.isDataEmpty()).toEqual(true);

      // Should throw further
      (expect(() => slice.preloadInt(1))
        .toThrow(/out of bounds/i)
      );
      (expect(() => slice.loadInt(1))
        .toThrow(/out of bounds/i)
      );

    });

  });

  describe('preloadString() / loadString()', () => {

    //======================//
    // should decode string //
    //======================//

    {

      const methods = [
        'preloadString',
        'loadString',

      ] as const;

      for (const method of methods) {

        describe(`${method}() should decode string`, () => {

          // offset,  expected,  bits
          const cases: Array<[number, string, string]> = [];

          for (const offset of [0, 16, 3]) {
            cases.push(
              [
                offset,
                '1B: A, 2B: Ω, 3B: ಄, 4B: 𓅱',
                '0011000101000010001110100010000001000001001011000010000000110010010000100011101000100000110011101010100100101100001000000011001101000010001110100010000011100000101100101000010000101100001000000011010001000010001110100010000011110000100100111000010110110001',
              ],
            );
          }

          for (const [offset, expected, bits] of cases) {

            it(`${expected} (${offset})`, () => {

              const cell = new Cell();

              if (offset > 0) {
                writeBits(cell.bits, '0'.repeat(offset));
              }

              writeBits(cell.bits, bits);

              const slice = new CellSlice(cell);

              if (offset > 0) {
                slice.skipBits(offset);
              }

              const value = slice[method]();

              expect(value).toEqual(expected);

            });

          }

        });

        it('should throw when slice is not aligned to bytes', () => {

          const cell = new Cell();

          cell.bits.writeString('hello');

          writeBits(cell.bits, '101');

          const slice = new CellSlice(cell);

          (expect(() => slice[method]())
            .toThrow(/not aligned to bytes/i)
          );

        });

      }

    }

    it('should be empty after loading string', () => {

      const cell = new Cell();

      cell.bits.writeString('hello world');

      const slice = new CellSlice(cell);

      // Is not empty initially
      expect(slice.isEmpty()).toEqual(false);
      expect(slice.isDataEmpty()).toEqual(false);

      (expect(slice.getBitsCount())
        .toEqual(11 * 8)
      );

      // Loading string
      (expect(slice.loadString().toString())
        .toEqual('hello world')
      );

      (expect(slice.getBitsCount())
        .toEqual(0)
      );

      // Is now empty
      expect(slice.isEmpty()).toEqual(true);
      expect(slice.isDataEmpty()).toEqual(true);

    });

    it('should return empty string when slice is empty', () => {

      const slice = new CellSlice(
        new Cell()
      );

      // Is empty initially
      expect(slice.isEmpty()).toEqual(true);
      expect(slice.isDataEmpty()).toEqual(true);

      (expect(slice.getBitsCount())
        .toEqual(0)
      );

      (expect(slice.preloadString().toString())
        .toEqual('')
      );

      (expect(slice.loadString().toString())
        .toEqual('')
      );

    });

    it(`preloading shouldn't change the slice`, () => {

      const cell = new Cell();

      cell.bits.writeString('hello world');

      const slice = new CellSlice(cell);

      (expect(slice.getBitsCount())
        .toEqual(11 * 8)
      );

      // Preloading string
      (expect(slice.preloadString().toString())
        .toEqual('hello world')
      );

      (expect(slice.getBitsCount())
        .toEqual(11 * 8)
      );

      // Preloading string again
      (expect(slice.preloadString().toString())
        .toEqual('hello world')
      );

      (expect(slice.getBitsCount())
        .toEqual(11 * 8)
      );

    });

  });

  describe('loadBytes() / preloadBytes()', () => {

    {

      const methods = ['loadBytes', 'preloadBytes'] as const;

      for (const method of methods) {

        describe(`${method}()`, () => {

          it('loads bytes correctly', () => {

            const cell = new Cell();

            writeBits(
              cell.bits,
              '111 10000101 10100000 10'
              //   133      160
            );

            const slice = new CellSlice(cell);

            slice.skipBits(3);

            const bytes = slice[method](8 * 2);

            expect(bytes).toBeInstanceOf(Uint8Array);

            expect(bytes.length).toEqual(2);

            expect(bytes[0]).toEqual(133);
            expect(bytes[1]).toEqual(160);

            if (method === 'loadBytes') {

              expect(slice.getBitsCount()).toEqual(2);

            } else if (method === 'preloadBytes') {

              (expect(slice.getBitsCount())
                .toEqual((8 * 2) + 2)
              );

            }

          });

          it('loads all the bytes from the slice', () => {

            const cell = new Cell();

            const origBytes = new Uint8Array([
              0xAA, 0xBB, 0xCC, 0x01, 0x02,
            ]);

            cell.bits.writeBytes(origBytes);

            const slice = new CellSlice(cell);

            const bytes = slice[method]();

            expect(bytes).toEqual(origBytes);

            if (method === 'loadBytes') {

              expect(slice.getBitsCount()).toEqual(0);

              expect(slice.isEmpty()).toEqual(true);
              expect(slice.isDataEmpty()).toEqual(true);

            }

          });

          it('loads bytes from empty slice', () => {

            const cell = new Cell();
            const slice = new CellSlice(cell);

            const bytes = slice[method]();

            expect(bytes).toBeInstanceOf(Uint8Array);
            expect(bytes.length).toEqual(0);

          });

          it('throws on incorrect bit-length (factor of bytes)', () => {

            const cell = new Cell();

            writeBits(cell.bits, '0000 0000');

            const slice = new CellSlice(cell);

            (expect(() => slice[method](7))
              .toThrow(/must be a factor of bytes/i)
            );

          });

          it('throws when slice is not aligned to bytes', () => {

            const cell = new Cell();

            cell.bits.writeBytes(new Uint8Array([
              0xAA, 0xBB, 0xCC,
            ]));

            writeBits(cell.bits, '101');

            const slice = new CellSlice(cell);

            expect(slice.getBitsCount()).toEqual((3 * 8) + 3);

            (expect(() => slice[method]())
              .toThrow(/is not aligned to bytes/i)
            );

          });

        });

        it(`should throw on incorrect bit-length (overflow)`, () => {

          const cell = new Cell();

          cell.bits.writeBytes(new Uint8Array([
            0xAA, 0xBB,
          ]));

          const slice = new CellSlice(cell);

          (expect(() => slice[method](8 * 3))
            .toThrow(/out of bounds/i)
          );

        });

        describe(`${method}() should throw on incorrect bit-length (range)`, () => {

          const bitLengths = [
            -1_024, -128, -16, -8, 0,
          ];

          for (const bitLength of bitLengths) {

            it(`${bitLength}`, () => {

              const cell = new Cell();
              writeBits(cell.bits, '0'.repeat(1023));

              const slice = new CellSlice(cell);

              (expect(() => slice[method](bitLength))
                .toThrow(/must be greater than zero/i)
              );

            });

          }

        });

        describe(`should throw on incorrect bit-length (non-number)`, () => {

          for (const [label, bitLength] of NonNumbers) {

            // Skipping the "undefined" values,
            // because the argument can't be omitted.
            if (bitLength === undefined) {
              continue;
            }

            it(label, () => {

              const slice = new CellSlice(new Cell());

              (expect(() => slice[method](bitLength as any))
                .toThrow(/expected.*to be a valid integer/i)
              );

            });

          }

        });

      }

    }

  });

  describe('loadSnakeData()', () => {

    it('loads snake data correctly', () => {

      const origBytes = new Uint8Array([
        0xAA, 0xBB, 0xCC,
        0x01, 0x02, 0x03,
        0xA1, 0xB2,
      ]);

      const cell = createSnakeData(origBytes, 3);

      const slice = new CellSlice(cell);

      const bytes = slice.loadSnakeData();

      expect(bytes).toEqual(origBytes);

    });

    it('supports skipping', () => {

      const cell = createSnakeData(new Uint8Array([
        0xAA, 0xBB, 0xCC,
        0x01, 0x02, 0x03,
        0xA1, 0xB2,

      ]), 3);

      const slice = new CellSlice(cell);

      slice.skipBits(8 * 2);

      const bytes = slice.loadSnakeData();

      expect(bytes).toEqual(new Uint8Array([
        0xCC,
        0x01, 0x02, 0x03,
        0xA1, 0xB2,
      ]));

    });

    it('throws when slice is not aligned to bytes', () => {

      const cell = createSnakeData(new Uint8Array([
        0xAA, 0xBB, 0xCC,
        0x01, 0x02, 0x03,
        0xA1, 0xB2,

      ]), 3);

      writeBits(cell.bits, '101');

      const slice = new CellSlice(cell);

      expect(slice.getBitsCount()).toEqual((3 * 8) + 3);

      (expect(() => slice.loadSnakeData())
        .toThrow(/is not aligned to bytes/i)
      );

    });

    it('throws when slice is not aligned to bytes (deeper)', () => {

      const cell = createSnakeData(new Uint8Array([
        0xAA, 0xBB, 0xCC,
        0x01, 0x02, 0x03,
        0xA1, 0xB2,

      ]), 3);

      const lastCell = cell.refs[0].refs[0];

      writeBits(lastCell.bits, '101');

      (expect(lastCell.bits.getUsedBits())
        .toEqual((2 * 8) + 3)
      );

      const slice = new CellSlice(cell);

      (expect(() => slice.loadSnakeData())
        .toThrow(/is not aligned to bytes/i)
      );

    });

    it('throws when slice has more than one referenced cell', () => {

      const cell = createSnakeData(new Uint8Array([
        0xAA, 0xBB, 0xCC,
        0x01, 0x02, 0x03,
        0xA1, 0xB2,

      ]), 3);

      cell.refs.push(new Cell());

      expect(cell.refs.length).toEqual(2);

      const slice = new CellSlice(cell);

      (expect(() => slice.loadSnakeData())
        .toThrow(/more than one referenced cell/i)
      );

    });

    it('throws when slice has more than one referenced cell (deeper)', () => {

      const cell = createSnakeData(new Uint8Array([
        0xAA, 0xBB, 0xCC,
        0x01, 0x02, 0x03,
        0xA1, 0xB2,

      ]), 3);

      const secondCell = cell.refs[0];

      secondCell.refs.push(new Cell());

      expect(secondCell.refs.length).toEqual(2);

      const slice = new CellSlice(cell);

      (expect(() => slice.loadSnakeData())
        .toThrow(/more than one referenced cell/i)
      );

    });

  });

  describe('loadSnakeDataString()', () => {

    it('decodes multibyte string correctly', async () => {

      const slice = new CellSlice(Cell.oneFromBoc(
        'b5ee9c7201010401002b00011431423a20412c2032423a01011420cea92c2033423a20e0020114b2842c2034423a20f09303000485b1'
      ));

      (expect(slice.loadSnakeDataString())
        .toEqual('1B: A, 2B: Ω, 3B: ಄, 4B: 𓅱')
      );

    });

    it('supports skipping', () => {

      const origString = (
        'ABC' +
        'DEF' +
        '01'
      );

      const cell = createSnakeData(
        stringToBytes(origString),
        3
      );

      const slice = new CellSlice(cell);

      slice.skipBits(8 * 2); // Skips "AB"

      const string = slice.loadSnakeDataString();

      expect(string).toEqual('CDEF01');

    });

    it('throws when slice is not aligned to bytes', () => {

      const cell = createSnakeData(
        stringToBytes(
          'ABC' +
          'DEF' +
          '01'
        ), 3
      );

      writeBits(cell.bits, '101');

      const slice = new CellSlice(cell);

      expect(slice.getBitsCount()).toEqual((3 * 8) + 3);

      (expect(() => slice.loadSnakeDataString())
        .toThrow(/is not aligned to bytes/i)
      );

    });

    it('throws when slice is not aligned to bytes (deeper)', () => {

      const cell = createSnakeData(
        stringToBytes(
          'ABC' +
          'DEF' +
          '01'
        ), 3
      );

      const lastCell = cell.refs[0].refs[0];

      writeBits(lastCell.bits, '101');

      (expect(lastCell.bits.getUsedBits())
        .toEqual((2 * 8) + 3)
      );

      const slice = new CellSlice(cell);

      (expect(() => slice.loadSnakeDataString())
        .toThrow(/is not aligned to bytes/i)
      );

    });

    it('throws when slice has more than one referenced cell', () => {

      const cell = createSnakeData(
        stringToBytes(
          'ABC' +
          'DEF' +
          '01'
        ), 3
      );

      cell.refs.push(new Cell());

      expect(cell.refs.length).toEqual(2);

      const slice = new CellSlice(cell);

      (expect(() => slice.loadSnakeDataString())
        .toThrow(/more than one referenced cell/i)
      );

    });

    it('throws when slice has more than one referenced cell (deeper)', () => {

      const cell = createSnakeData(
        stringToBytes(
          'ABC' +
          'DEF' +
          '01'
        ), 3
      );

      const secondCell = cell.refs[0];

      secondCell.refs.push(new Cell());

      expect(secondCell.refs.length).toEqual(2);

      const slice = new CellSlice(cell);

      (expect(() => slice.loadSnakeDataString())
        .toThrow(/more than one referenced cell/i)
      );

    });

  });

  describe('skipBits()', () => {

    it('should return the same slice instance', () => {

      const cell = new Cell();
      cell.bits.writeBit(1);

      const slice = new CellSlice(cell);

      const result = slice.skipBits(1);

      expect(result).toBe(slice);

    });

    it('should skip the bits', () => {

      const cell = new Cell();

      cell.bits.writeUint('100500', 32);
      cell.bits.writeUint('0', 3);
      cell.bits.writeUint('15', 4);
      cell.bits.writeUint('0', 5);
      cell.bits.writeInt('-15', 5);
      cell.bits.writeUint('0', 32);

      const slice = new CellSlice(cell);

      (expect(slice.getBitsCount())
        .toEqual(32 + 3 + 4 + 5 + 5 + 32)
      );

      expect(slice.loadUint(32).toString()).toEqual('100500');

      (expect(slice.getBitsCount())
        .toEqual(3 + 4 + 5 + 5 + 32)
      );

      slice.skipBits(3);

      (expect(slice.getBitsCount())
        .toEqual(4 + 5 + 5 + 32)
      );

      expect(slice.loadUint(4).toString()).toEqual('15');

      (expect(slice.getBitsCount())
        .toEqual(5 + 5 + 32)
      );

      slice.skipBits(5);

      (expect(slice.getBitsCount()).toEqual(5 + 32));

      expect(slice.loadInt(5).toString()).toEqual('-15');

      (expect(slice.getBitsCount()).toEqual(32));

      slice.skipBits(32);
      (expect(slice.getBitsCount()).toEqual(0));

      // Is now empty
      expect(slice.isEmpty()).toEqual(true);
      expect(slice.isDataEmpty()).toEqual(true);

      // Should throw further
      (expect(() => slice.skipBits(1))
        .toThrow(/out of bounds/i)
      );
      (expect(() => slice.preloadInt(1))
        .toThrow(/out of bounds/i)
      );
      (expect(() => slice.loadInt(1))
        .toThrow(/out of bounds/i)
      );

    });

  });

  describe('isRefsEmpty()', () => {

    it('should return "true" when refs are empty', () => {

      const slice = new CellSlice(new Cell());

      (expect(slice.isRefsEmpty()).toEqual(true));

    });

    it('should return "false" when have unloaded refs', () => {

      const cell = new Cell();

      cell.refs.push(new Cell());

      const slice = new CellSlice(cell);

      (expect(slice.isRefsEmpty()).toEqual(false));

    });

    it('should return "true" when all refs are loaded', () => {

      const cell = new Cell();

      cell.refs.push(new Cell());
      cell.refs.push(new Cell());

      const slice = new CellSlice(cell);

      (expect(slice.isRefsEmpty()).toEqual(false));

      slice.loadRef();

      (expect(slice.isRefsEmpty()).toEqual(false));

      slice.loadRef();

      (expect(slice.isRefsEmpty()).toEqual(true));

    });

  });

  describe('getRefsCount()', () => {

    it('should return zero when refs are empty', () => {

      const slice = new CellSlice(new Cell());

      (expect(slice.getRefsCount()).toEqual(0));

    });

    it('returns the correct amount of unloaded refs', () => {

      const cell = new Cell();

      cell.refs.push(new Cell());
      cell.refs.push(new Cell());
      cell.refs.push(new Cell());

      const slice = new CellSlice(cell);

      (expect(slice.isRefsEmpty()).toEqual(false));
      (expect(slice.getRefsCount()).toEqual(3));

      slice.loadRef();
      (expect(slice.getRefsCount()).toEqual(2));

      slice.loadRef();
      (expect(slice.getRefsCount()).toEqual(1));

      slice.loadRef();
      (expect(slice.isRefsEmpty()).toEqual(true));
      (expect(slice.getRefsCount()).toEqual(0));

    });

  });

  describe('preloadRef() / loadRef()', () => {

    it('preloads and loads the refs', () => {

      const rootCell = new Cell();

      const subCell1 = new Cell();
      const subCell2 = new Cell();
      const subCell3 = new Cell();

      rootCell.refs.push(subCell1, subCell2, subCell3);

      const slice = new CellSlice(rootCell);

      expect(slice.isRefsEmpty()).toEqual(false);
      expect(slice.getRefsCount()).toEqual(3);

      // Preloading ref #1
      expect(slice.preloadRef()).toEqual(subCell1);
      expect(slice.getRefsCount()).toEqual(3);

      // Preloading ref #1 again
      expect(slice.preloadRef()).toEqual(subCell1);
      expect(slice.getRefsCount()).toEqual(3);

      // Loading ref #1
      expect(slice.loadRef()).toEqual(subCell1);
      expect(slice.getRefsCount()).toEqual(2);

      // Preloading ref #2
      expect(slice.preloadRef()).toEqual(subCell2);
      expect(slice.getRefsCount()).toEqual(2);

      // Preloading ref #2 again
      expect(slice.preloadRef()).toEqual(subCell2);
      expect(slice.getRefsCount()).toEqual(2);

      // Loading ref #2
      expect(slice.loadRef()).toEqual(subCell2);
      expect(slice.getRefsCount()).toEqual(1);

      // Loading ref #3
      expect(slice.loadRef()).toEqual(subCell3);
      expect(slice.isRefsEmpty()).toEqual(true)
      expect(slice.getRefsCount()).toEqual(0);

      (expect(() => slice.preloadRef())
        .toThrow(/no more referenced cells/i)
      );
      (expect(() => slice.loadRef())
        .toThrow(/no more referenced cells/i)
      );

    });

  });

});


//==================//
// HELPER FUNCTIONS //
//==================//

/**
 * Serializes the specified bytes into a Cell using
 * snake data format.
 *
 * @param bytes - The bytes to serialize
 * @param segmentLength - Maximum length of the segment
 */
function createSnakeData(
  bytes: Uint8Array,
  segmentLength: number

): Cell {

  const cellsCount = Math.ceil(
    (bytes.length / segmentLength)
  );

  const rootCell = new Cell();

  let cell = rootCell;

  for (let i = 0; i < cellsCount; i++) {

    const slice = bytes.slice(
      (segmentLength * i),
      (segmentLength * (i + 1))
    );

    cell.bits.writeBytes(slice);

    if ((i + 1) < cellsCount) {
      const subCell = new Cell();
      cell.refs.push(subCell);
      cell = subCell;
    }

  }

  return rootCell;

}
