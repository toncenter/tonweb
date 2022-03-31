
import { Bytes, Vector, WithType } from './shared';


export namespace Tvm {

    type WithNSType<T extends string> = WithType<`tvm.${T}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L160
     */
    export interface Slice extends WithNSType<'slice'> {
        bytes: Bytes;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L161
     */
    export interface Cell extends WithNSType<'cell'> {
        bytes: Bytes;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L162
     */
    export interface NumberDecimal extends WithNSType<'numberDecimal'> {
        number: string;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L163
     */
    export interface Tuple extends WithNSType<'tuple'> {
        elements: Vector<Tvm.StackEntry>;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L164
     */
    export interface List extends WithNSType<'list'> {
        elements: Vector<Tvm.StackEntry>;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L166
     */
    export interface StackEntrySlice extends WithNSType<'stackEntrySlice'> {
        slice: Tvm.Slice;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L167
     */
    export interface StackEntryCell extends WithNSType<'stackEntryCell'> {
        cell: Tvm.Cell;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L168
     */
    export interface StackEntryNumber extends WithNSType<'stackEntryNumber'> {
        number: Tvm.Number;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L169
     */
    export interface StackEntryTuple extends WithNSType<'stackEntryTuple'> {
        tuple: TupleType;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L170
     */
    export interface StackEntryList extends WithNSType<'stackEntryList'> {
        list: ListType;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L171
     */
    export interface StackEntryUnsupported extends WithNSType<'stackEntryUnsupported'> {
    }

    export type TupleType = Tvm.Tuple;
    export type ListType = Tvm.List;
    export type Number = Tvm.NumberDecimal;

    export type StackEntry = (
        | Tvm.StackEntrySlice
        | Tvm.StackEntryCell
        | Tvm.StackEntryNumber
        | Tvm.StackEntryTuple
        | Tvm.StackEntryList
        | Tvm.StackEntryUnsupported
    );

}
