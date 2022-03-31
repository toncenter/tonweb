
import { Bytes, Int53, Int64, Vector, WithType } from './shared';
import { Ton } from './ton';
import { Internal } from './internal';
import { AccountAddress } from './no-namespace';
import { Msg } from './msg';


export namespace Raw {

    type WithNSType<Type extends string> = WithType<`raw.${Type}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L71
     */
    export interface AccountState extends WithNSType<'accountState'> {
        code: Bytes;
        data: Bytes;
        frozen_hash: Bytes;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L52
     */
    export interface FullAccountState extends WithNSType<'fullAccountState'> {
        balance: Int64;
        code: Bytes;
        data: Bytes;
        last_transaction_id: Internal.TransactionId;
        block_id: Ton.BlockIdExt;
        frozen_hash: Bytes;
        sync_utime: Int53;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L53
     */
    export interface Message extends WithNSType<'message'> {
        source: AccountAddress;
        destination: AccountAddress;
        value: Int64;
        fwd_fee: Int64;
        ihr_fee: Int64;
        created_lt: Int64;
        body_hash: Bytes;
        msg_data: Msg.Data;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L54
     */
    export interface Transaction extends WithNSType<'transaction'> {
        utime: Int53;
        data: Bytes;
        transaction_id: Internal.TransactionId;
        fee: Int64;
        storage_fee: Int64;
        other_fee: Int64;
        in_msg: Raw.Message;
        out_msgs: Vector<Raw.Message>;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L55
     */
    export interface Transactions extends WithNSType<'transactions'> {
        transactions: Vector<Raw.Transaction>;
        previous_transaction_id: Internal.TransactionId;
    }

}
