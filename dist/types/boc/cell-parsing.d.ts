
import BN from 'bn.js';

import { Cell } from './cell';


export type RefParser<Type> = (
  (slice: Cell) => Type
);


/**
 * Loads a bit.
 *
 * @param slice - Slice object to parse.
 */
export declare function loadBit(slice: Cell): boolean;

/**
 * Loads unsigned integer from the specified slice.
 *
 * @param slice - Slice object to parse.
 * @param bitLength - Size of the unsigned integer in bits.
 */
export declare function loadUint(
  slice: Cell,
  bitLength: number

): BN;

/**
 * Loads signed integer from the specified slice.
 *
 * @param slice - Slice object to parse.
 * @param bitLength - Size of the integer in bits.
 */
export declare function loadInt(
  slice: Cell,
  bitLength: number

): BN;

/**
 * Loads unsigned integer less or equal the specified number
 * by reading minimum number of bits encoding the specified
 * number.
 *
 * ```
 * #<= p
 * ```
 *
 * @param slice - Slice object to parse.
 * @param maxValue - Maximum value of the number to read.
 */
export declare function loadUintLEQ(
  slice: Cell,
  maxValue: number

): BN;

/**
 * Loads `VarUInteger` from the specified slice.
 *
 * ```tlb
 * var_uint$_ {n:#} len:(#< n) value:(uint (len * 8)) = VarUInteger n;
 * ```
 *
 * @param slice - Slice object to parse.
 * @param bitLength - Size of the unsigned integer in bits.
 */
export declare function loadVarUInteger(
  slice: Cell,
  bitLength: number

): BN;

/**
 * Loads coins amount.
 *
 * ```tlb
 * nanograms$_ amount:(VarUInteger 16) = Grams;
 * ```
 *
 * @param slice - Slice object to parse.
 */
export declare function loadCoins(slice: Cell): BN;

/**
 * Loads `^X`.
 *
 * @param slice - Slice object to parse.
 * @param parser - A function to parse `X`.
 */
export declare function loadRefX<Type>(
  slice: Cell,
  parser: RefParser<Type>

): Type;

/**
 * Loads Maybe X.
 *
 * ```tlb
 * nothing$0 {X:Type} = Maybe X;
 * just$1 {X:Type} value:X = Maybe X;
 * ```
 *
 * @param slice - Slice object to parse.
 * @param parser - A function to parse `X`.
 */
export declare function loadMaybeX<Type>(
  slice: Cell,
  parser: RefParser<Type>

): Type;

/**
 * Loads `Maybe ^X`.
 *
 * ```tlb
 * Maybe ^X;
 * ```
 *
 * @param slice - Slice object to parse.
 * @param parser - A function to parse `X`.
 */
export declare function loadMaybeRefX<Type>(
  slice: Cell,
  parser: RefParser<Type>

): Type;

/**
 * Loads `Either X Y`.
 *
 * ```tlb
 * left$0 {X:Type} {Y:Type} value:X = Either X Y;
 * right$1 {X:Type} {Y:Type} value:Y = Either X Y;
 * ```
 *
 * @param slice - Slice object to parse.
 * @param parserX - A function to parse `X`.
 * @param parserY - A function to parse `Y`.
 */
export declare function loadEither<TypeX, TypeY>(
  slice: Cell,
  parserX: RefParser<TypeX>,
  parserY: RefParser<TypeY>

): (TypeX | TypeY);

/**
 * Loads `Either X ^X`.
 *
 * @param slice - Slice object to parse.
 * @param parser - A function to parse `X`.
 */
export declare function loadEitherXorRefX<Type>(
  slice: Cell,
  parser: RefParser<Type>

): Type;

/**
 * Loads `Unary`.
 *
 * ```tlb
 * unary_zero$0 = Unary ~0;
 * unary_succ$1 {n:#} x:(Unary ~n) = Unary ~(n + 1);
 * ```
 *
 * @param slice - Slice object to parse.
 */
export declare function loadUnary(slice: Cell): number;

/**
 * Loads hash-map's label.
 *
 * ```tlb
 * hml_short$0 {m:#} {n:#} len:(Unary ~n) {n <= m} s:(n * Bit) = HmLabel ~n m;
 * hml_long$10 {m:#} n:(#<= m) s:(n * Bit) = HmLabel ~n m;
 * hml_same$11 {m:#} v:Bit n:(#<= m) = HmLabel ~n m;
 * ```
 *
 * @param slice - Slice object to parse.
 * @param m
 *
 * @returns A bit-string prefix part.
 */
export declare function loadHmLabel(
  slice: Cell,
  m: number

): Bitstring;

/**
 * Checks whether slice was read to the end.
 *
 * @param slice - Slice object to parse.
 */
export declare function isSliceEmpty(slice: Cell): boolean;
