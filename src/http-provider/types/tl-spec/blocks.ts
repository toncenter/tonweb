
import { Ton } from './ton';

import {
    Bool,
    Bytes,
    Hashtag,
    Int32,
    Int64,
    Vector,
    WithType,

} from './shared';


export namespace Blocks {

    type WithNSType<T extends string> = WithType<`blocks.${T}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L206
     */
    export interface MasterchainInfo extends WithNSType<'masterchainInfo'> {
        init: Ton.BlockIdExt;
        last: Ton.BlockIdExt;
        state_root_hash: string;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L211
     */
    export interface Header extends WithNSType<'header'> {
        id: Ton.BlockIdExt;
        global_id: Int32;
        version: Int32;
        after_merge: Bool;
        after_split: Bool;
        before_split: Bool;
        want_merge: Bool;
        want_split: Bool;
        validator_list_hash_short: Int32;
        catchain_seqno: Int32;
        min_ref_mc_seqno: Int32;
        is_key_block: Bool;
        prev_key_block_seqno: Int32;
        start_lt: Int64;
        end_lt: Int64;
        vert_seqno: Hashtag;
        prev_blocks: Vector<Ton.BlockIdExt>;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L207
     */
    export interface Shards extends WithNSType<'shards'> {
        shards: Vector<Ton.BlockIdExt>; // TODO: Check if it is right.
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L209
     */
    export interface ShortTxId extends WithNSType<'shortTxId'> {
        mode: Hashtag;
        account: Bytes;
        lt: Int64;
        hash: Bytes;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L210
     */
    export interface Transactions extends WithNSType<'transactions'> {
        id: Ton.BlockIdExt;
        req_count: Int32;
        incomplete: Bool;
        transactions: Vector<Blocks.ShortTxId>;
    }

}
