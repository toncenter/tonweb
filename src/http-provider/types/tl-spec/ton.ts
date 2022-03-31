
import { Bytes, Int32, Int64, WithType } from './shared';


export namespace Ton {

    type WithNSType<T extends string> = WithType<`ton.${T}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L50
     */
    export interface BlockIdExt extends WithNSType<'blockIdExt'> {
        file_hash: Bytes;
        root_hash: Bytes;
        seqno: Int32;
        shard: Int64;
        workchain: Int32;
    }

}
