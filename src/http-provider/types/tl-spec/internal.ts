
import { Bytes, Int64, WithType } from './shared';


export namespace Internal {

    type WithNSType<T extends string> = WithType<`internal.${T}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L47
     */
    export interface TransactionId extends WithNSType<'transactionId'> {
        lt: Int64;
        hash: Bytes;
    }

}
