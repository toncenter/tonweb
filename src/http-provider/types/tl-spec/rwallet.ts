
import { Int32, Int53, Int64, Vector, WithType } from './shared';


export namespace Rwallet {

    type WithNSType<T extends string> = WithType<`rwallet.${T}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L64
     */
    export interface Limit extends WithNSType<'limit'> {
        seconds: Int32;
        value: Int64;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L65
     */
    export interface Config extends WithNSType<'config'> {
        start_at: Int53;
        limits: Vector<Rwallet.Limit>;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L76
     */
    export interface AccountState extends WithNSType<'accountState'> {
        wallet_id: Int64;
        seqno: Int32;
        unlocked_balance: Int64;
        config: Rwallet.Config;
    }

}
