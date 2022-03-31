
import { Blocks } from '../tl-spec/blocks';
import { FullAccountState } from '../tl-spec/no-namespace';
import { Query } from '../tl-spec/query';
import { Raw } from '../tl-spec/raw';
import { Bytes, Int32, Ok } from '../tl-spec/shared';
import { Smc } from '../tl-spec/smc';
import { Tvm } from '../tl-spec/tvm';

import {
    AddressState,
    Cell,
    CellSerialized,
    Slice,
    WalletType,

} from './misc';


/**
 * Creates metadata for API method.
 */
interface MethodMeta<ParamsType, ResponseType> {
    params: ParamsType;
    response: ResponseType;
}

/**
 * Object with specified address.
 */
interface AddressParam {
    address: string;
}

/* estimateFee */
export interface EstimateFeeParams {

    /**
     * Address in any format.
     */
    address: string;

    /**
     * base64-encoded cell with message body.
     */
    body: string;

    /**
     * base64-encoded cell with init-code.
     */
    init_code?: string;

    /**
     * base64-encoded cell with init-data.
     */
    init_data?: string;

    /**
     * If true during test query processing assume
     * that all chksig operations return True.
     *
     * default: `true`
     */
    ignore_chksig?: boolean;

}

export type EstimateFeeResult = Query.Fees;

type EstimateFeeMeta = MethodMeta<
    EstimateFeeParams,
    EstimateFeeResult
>;

/* getAddressInformation */
export interface GetAddressInformationResult extends Raw.FullAccountState {
    state: AddressState;
}

type GetAddressInformationMeta = MethodMeta<
    AddressParam,
    GetAddressInformationResult
>;

/* getAddressBalance */
export type GetAddressBalanceResult = Raw.FullAccountState['balance'];

type GetAddressBalanceMeta = MethodMeta<
    AddressParam,
    GetAddressBalanceResult
>;

/* getBlockHeader */
export type GetBlockHeaderResult = Blocks.Header;

type GetBlockHeaderMeta = MethodMeta<{
    workchain: number;
    shard: string;
    seqno: number;

}, GetBlockHeaderResult>;

/* getBlockTransactions */
export interface GetBlockTransactionsResult extends Blocks.Transactions {
    account?: string;
}

type GetBlockTransactionsMeta = MethodMeta<{
    workchain: number;
    shard: string;
    seqno: number;
    root_hash?: string;
    file_hash?: string;
    after_lt?: number;
    after_hash?: string;
    count?: number;

}, GetBlockTransactionsResult>;

/* getExtendedAddressInformation */
export type GetExtendedAddressInformationResult = FullAccountState;

type GetExtendedAddressInformationMeta = MethodMeta<
    AddressParam,
    GetExtendedAddressInformationResult
>;

/* getMasterchainInfo */
export type GetMasterchainInfoResult = Blocks.MasterchainInfo;

type GetMasterchainInfoMeta = MethodMeta<
    never,
    GetMasterchainInfoResult
>;

/* getTransactions */
type GetTransactionsResultTransactionMessage = (
    Omit<Raw.Transaction['in_msg'], 'source' | 'destination'> & {
        source: Raw.Transaction['in_msg']['source']['account_address'];
        destination: Raw.Transaction['in_msg']['destination']['account_address'];
        message?: string;
    }
)

type GetTransactionsResultTransaction = Omit<Raw.Transaction, 'in_msg'> & {
    in_msg: GetTransactionsResultTransactionMessage;
    out_msgs: GetTransactionsResultTransactionMessage[];
}

export type GetTransactionsResult = (
    GetTransactionsResultTransaction[]
);

type GetTransactionsMeta = MethodMeta<{
    address: string;
    limit?: number;
    lt?: number;
    hash?: string;
    to_lt?: number;
    archival?: boolean;

}, GetTransactionsResult>;

/* getWalletInformation */
export type GetWalletInformationResult = {
    account_state: AddressState;
    balance: string;
    last_transaction_id?: Raw.FullAccountState['last_transaction_id'];
} & ({
    wallet: false;
} | {
    wallet: true;
    wallet_type: WalletType;
    wallet_id: Int32;
    seqno: Int32;
});

type GetWalletInformationMeta = MethodMeta<
    AddressParam,
    GetWalletInformationResult
>;

/* runGetMethod */
/**
 * Currently, list of provided stack items is restricted by API.
 */
export type RunGetMethodParamsStackItem = (
    | ['num', (number | string)]
    | ['cell', Cell]
    | ['slice', Slice]
    | ['tvm.Cell', Bytes]
    | ['tvm.Slice', Bytes]
)

/**
 * Unlike RunGetMethodParamsStackItem, API returns strict types.
 */
export type RunGetMethodResultStackItem = (
    | ['num', string]
    | ['cell', Cell]
    | ['tuple', Tvm.StackEntryTuple['tuple']]
    | ['list', Tvm.StackEntryList['list']]
)

export interface RunGetMethodParams {
    address: string;
    method: (string | number);
    stack?: RunGetMethodParamsStackItem[];
}

export interface RunGetMethodResult
    extends Omit<Smc.RunResult, '@type' | 'stack'>
{
    stack: RunGetMethodResultStackItem[];
}

type RunGetMethodMeta = MethodMeta<
    RunGetMethodParams,
    RunGetMethodResult
>;

/* shards */
export type ShardsResult = Blocks.Shards;
type ShardsMeta = MethodMeta<{ seqno: number }, ShardsResult>;

/* sendBoc */
export type SendBocResult = Ok;
type SendBocMeta = MethodMeta<{ boc: string }, SendBocResult>;

/* sendQuerySimple */
export interface SendQuerySimpleParams {
    address: string;
    body: string;
    init_code?: CellSerialized;
    init_data?: CellSerialized;
}

export type SendQuerySimpleResult = Ok;

type SendQuerySimpleMeta = MethodMeta<
    SendQuerySimpleParams,
    SendQuerySimpleResult
>;

/**
 * Map, where key is a name of method in TON API and value is a description
 * of returned response type.
 *
 * @link https://toncenter.com/api/v2/
 */
export interface HttpProviderMethodMetaMap {
    estimateFee: EstimateFeeMeta;
    getAddressInformation: GetAddressInformationMeta;
    getAddressBalance: GetAddressBalanceMeta;
    getBlockHeader: GetBlockHeaderMeta;
    getBlockTransactions: GetBlockTransactionsMeta;
    getExtendedAddressInformation: GetExtendedAddressInformationMeta;
    getMasterchainInfo: GetMasterchainInfoMeta;
    getTransactions: GetTransactionsMeta;
    getWalletInformation: GetWalletInformationMeta;
    runGetMethod: RunGetMethodMeta;
    shards: ShardsMeta;
    sendBoc: SendBocMeta;
    sendQuerySimple: SendQuerySimpleMeta;
}

/**
 * API methods which don't require any arguments to call.
 */
export type HttpProviderMethodNoArgsName = {
    [MethodType in keyof HttpProviderMethodMetaMap]:
    // This hack with never in tuple is required to detect of value is equal
    // to never.
    [HttpProviderMethodMetaMap[MethodType]['params']] extends [never] ? MethodType : never;

}[keyof HttpProviderMethodMetaMap];

/**
 * Available HttpProvider web methods.
 */
export type HttpProviderMethodName = keyof HttpProviderMethodMetaMap;

/**
 * API methods which required arguments to call.
 */
export type HttpProviderMethodWithArgsName = (
    Exclude<HttpProviderMethodName, HttpProviderMethodNoArgsName>
);

/**
 * Returns type of parameters for specified API method.
 */
export type HttpProviderMethodParams<MethodType extends HttpProviderMethodName> = (
    HttpProviderMethodMetaMap[MethodType]['params']
);

/**
 * Returns type of response for specified API method.
 */
export type HttpProviderMethodResponse<MethodType extends HttpProviderMethodName> = (
    HttpProviderMethodMetaMap[MethodType]['response']
);
