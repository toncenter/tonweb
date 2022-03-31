
import { Int32, Int64, WithType } from './shared';


export namespace Wallet {

    export namespace V3 {

        type WithNSType<T extends string> = WithType<`wallet.v3.${T}`>;

        /**
         * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L72
         */
        export interface AccountState extends WithNSType<'accountState'> {
            wallet_id: Int64;
            seqno: Int32;
        }

    }

    export namespace Highload {

        export namespace V1 {

            type WithNSType<T extends string> = WithType<`wallet.highload.v1.${T}`>;

            /**
             * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L73
             */
            export interface AccountState extends WithNSType<'accountState'> {
                wallet_id: Int64;
                seqno: Int32;
            }

        }

        export namespace V2 {

            type WithNSType<T extends string> = WithType<`wallet.highload.v2.${T}`>;

            /**
             * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L74
             */
            export interface AccountState extends WithNSType<'accountState'> {
                wallet_id: Int64;
            }

        }

    }

}
