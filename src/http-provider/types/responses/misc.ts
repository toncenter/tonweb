
import { TonLib } from '@ton.js/types';


/**
 * Known address states.
 */
export type AddressState = (
    | 'uninitialized'
    | 'frozen'
    | 'active'
);

/**
 * Known wallet types.
 */
export type WalletType = (
    | 'wallet v1 r1'
    | 'wallet v1 r2'
    | 'wallet v1 r3'
    | 'wallet v2 r1'
    | 'wallet v2 r2'
    | 'wallet v3 r1'
    | 'wallet v3 r2'
    | 'wallet v4 r1'
    | 'wallet v4 r2'
);

export interface CellSerialized {
    data: { b64: string, len: number };
    refs: CellSerialized[];
}

export type Cell = {
    bytes: TonLib.Combinators.Tvm.StackEntryCell['cell']['bytes'];
    object: CellSerialized;
};

export type Slice = Cell;
