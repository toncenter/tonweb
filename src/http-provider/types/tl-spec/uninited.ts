
import { Bytes, WithType } from './shared';


export namespace Uninited {

    type WithNSType<T extends string> = WithType<`uninited.${T}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L83
     */
    export interface AccountState extends WithNSType<'accountState'> {
        frozen_hash: Bytes;
    }

}
