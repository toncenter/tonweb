
import { Int32, Int53, Int64, WithType } from './shared';
import { Internal } from './internal';
import { Ton } from './ton';
import { Raw } from './raw';
import { Wallet } from './wallet';
import { Dns } from './dns';
import { Rwallet } from './rwallet';
import { Pchan } from './pchan';
import { Uninited } from './uninited';


/**
 * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L43
 */
export interface AccountAddress extends WithType<'accountAddress'> {
    account_address: string;
}

/**
 * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L85
 */
export interface FullAccountState extends WithType<'fullAccountState'> {
    address: AccountAddress;
    balance: Int64;
    last_transaction_id: Internal.TransactionId;
    block_id: Ton.BlockIdExt;
    sync_utime: Int53;
    account_state: AccountState;
    revision: Int32;
}

/**
 * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L155
 */
export interface Fees extends WithType<'fees'> {
    in_fwd_fee: Int53;
    storage_fee: Int53;
    gas_fee: Int53;
    fwd_fee: Int53;
}

export type AccountState = (
    | Raw.AccountState
    | Wallet.V3.AccountState
    | Wallet.Highload.V1.AccountState
    | Wallet.Highload.V2.AccountState
    | Dns.AccountState
    | Rwallet.AccountState
    | Pchan.AccountState
    | Uninited.AccountState
);
