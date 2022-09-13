
import { FetchHttpClient } from '../http-client/fetch-http-client';
import { HttpClient, ParsedJson, RequestHeaders } from '../http-client/http-client';

import {
    expectApiResponse,
    HttpProviderUtils,
    ParseResponseResult,

} from './http-provider-utils';

import {
    EstimateFeeParams,
    EstimateFeeResult,
    GetAddressBalanceResult,
    GetAddressInformationResult,
    GetBlockHeaderResult,
    GetBlockTransactionsResult,
    GetExtendedAddressInformationResult,
    GetMasterchainInfoResult,
    GetTransactionsResult,
    GetWalletInformationResult,
    HttpProviderMethodNoArgsName,
    HttpProviderMethodParams,
    HttpProviderMethodResponse,
    HttpProviderMethodWithArgsName,
    RunGetMethodParamsStackItem,
    RunGetMethodResult,
    SendBocResult,
    SendQuerySimpleParams,
    SendQuerySimpleResult,
    ShardsResult,

} from './types/responses/meta';


export interface HttpProviderOptions {
    apiKey?: string;
    httpClient?: HttpClient;
}

export type ApiResponse = (
    | SuccessApiResponse
    | FailedApiResponse
);

export interface SuccessApiResponse {
    ok: true;
    result?: ParsedJson;
}

export interface FailedApiResponse {
    ok: false;
    error: string;
    code: number;
}


const SHARD_ID_ALL = '-9223372036854775808'; // 0x8000000000000000

export const defaultHost = 'https://toncenter.com/api/v2/jsonRPC';


export class HttpProvider {

    public static SHARD_ID_ALL = SHARD_ID_ALL;


    private readonly httpClient: HttpClient;


    constructor(
      public host = defaultHost,
      public options: HttpProviderOptions = {}
    ) {
        this.httpClient = (
            options.httpClient ||
            new FetchHttpClient()
        );

    }


    public send<Method extends HttpProviderMethodWithArgsName>(
        method: Method,
        params: HttpProviderMethodParams<Method>

    ): Promise<HttpProviderMethodResponse<Method>>

    public send<Method extends HttpProviderMethodNoArgsName>(
        method: Method

    ): Promise<HttpProviderMethodResponse<Method>>;

    public send(
        method: string,
        params: any = {}

    ): Promise<any> {

        return this.sendHttpRequest(
            this.host,
            { id: 1, jsonrpc: '2.0', method, params }
        );

    }

    /**
     * Use this method to get information about address:
     * balance, code, data, last_transaction_id.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_address_information_getAddressInformation_get}
     */
    public getAddressInfo(address: string): Promise<GetAddressInformationResult> {
        return this.send('getAddressInformation', { address });
    }

    /**
     * Similar to previous one but tries to parse additional
     * information for known contract types. This method is
     * based on `generic.getAccountState()` thus number of
     * recognizable contracts may grow. For wallets, we
     * recommend to use `getWalletInformation()`.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_extended_address_information_getExtendedAddressInformation_get}
     */
    public getExtendedAddressInfo(
        address: string

    ): Promise<GetExtendedAddressInformationResult> {

        return this.send('getExtendedAddressInformation', { address });

    }

    /**
     * Use this method to retrieve wallet information.
     *
     * This method parses contract state and currently
     * supports more wallet types than
     * `getExtendedAddressInformation()`: simple wallet,
     * standard wallet and v3 wallet.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_wallet_information_getWalletInformation_get}
     */
    public getWalletInfo(
        address: string

    ): Promise<GetWalletInformationResult> {

        return this.send('getWalletInformation', { address });

    }

    /**
     * Use this method to get transaction history of a given address.
     *
     * Returns array of transaction objects.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_transactions_getTransactions_get}
     */
    public getTransactions(
        address: string,
        limit = 20,
        lt?: number,
        hash?: string,
        toLt?: number,
        archival?: boolean

    ): Promise<GetTransactionsResult> {

        return this.send('getTransactions', {
            address,
            limit,
            lt,
            hash,
            to_lt: toLt,
            archival,
        });

    };

    /**
     * Use this method to get balance (in nanograms)
     * of a given address.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_address_balance_getAddressBalance_get}
     */
    public getBalance(
        address: string

    ): Promise<GetAddressBalanceResult> {

        return this.send('getAddressBalance', { address });

    }

    /**
     * Use this method to send serialized boc file:
     * fully packed and serialized external message.
     *
     * {@link https://toncenter.com/api/v2/#/send/send_boc_sendBoc_post}
     *
     * @param base64 - Base64 string of BOC bytes (`Cell.toBoc`)
     */
    public sendBoc(base64: string): Promise<SendBocResult> {
        return this.send('sendBoc', { boc: base64 });
    };

    /**
     * Estimates fees required for query processing.
     *
     * {@link https://toncenter.com/api/v2/#/send/estimate_fee_estimateFee_post}
     */
    public getEstimateFee(
        query: EstimateFeeParams

    ): Promise<EstimateFeeResult> {

        return this.send('estimateFee', query);

    };

    /**
     * Invokes get-method of smart contract.
     *
     * @todo rename to `runGetMethodRaw()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     *
     * @param address - Contract address
     * @param method - Method name or method ID
     * @param stack - Array of stack elements
     */
    public call(
        address: string,
        method: (string | number),
        stack: RunGetMethodParamsStackItem[] = []

    ): Promise<RunGetMethodResult> {

        /**
         * @todo think about throw error
         *        if result.exit_code !== 0
         *        (the change breaks backward compatibility)
         */
        return this.send('runGetMethod', {
            address,
            method,
            stack,
        });

    }

    /**
     * Invokes get-method of smart contract.
     *
     * @todo rename to `runGetMethod()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     *
     * @param address - Contract address
     * @param method - Method name or method ID
     * @param params - Array of stack elements
     */
    public async call2<
        ParamsType = RunGetMethodParamsStackItem[],
        ResultType = ParseResponseResult
    >(
        address: string,
        method: (string | number),
        params: RunGetMethodParamsStackItem[] = []

    ): Promise<ResultType> {

        const result = await this.send('runGetMethod', {
            address,
            method,
            stack: params,
        });

        return HttpProviderUtils.parseResponse<ResultType>(
            result
        );

    }

    /**
     * Returns ID's of last and init block of masterchain.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_masterchain_info_getMasterchainInfo_get}
     */
    public getMasterchainInfo(): Promise<GetMasterchainInfoResult> {
        return this.send('getMasterchainInfo');
    }

    /**
     * Returns ID's of shardchain blocks included
     * in this masterchain block.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/shards_shards_get}
     */
    public getBlockShards(
        masterchainBlockNumber: number

    ): Promise<ShardsResult> {

        return this.send('shards', {
            seqno: masterchainBlockNumber,
        });

    }

    /**
     * Returns transactions hashes included in this block.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_block_transactions_getBlockTransactions_get}
     */
    public getBlockTransactions(
        workchain: number,
        shardId: string,
        shardBlockNumber: number

    ): Promise<GetBlockTransactionsResult> {

        return this.send('getBlockTransactions', {
            workchain,
            shard: shardId,
            seqno: shardBlockNumber,
        });

    }

    /**
     * Returns transactions hashes included
     * in this masterchain block.
     */
    public getMasterchainBlockTransactions(
        masterchainBlockNumber: number

    ): Promise<GetBlockTransactionsResult> {

        return this.getBlockTransactions(
            -1, SHARD_ID_ALL, masterchainBlockNumber
        );

    }

    /**
     * Returns block header and his previous blocks ID's.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_block_header_getBlockHeader_get}
     */
    public getBlockHeader(
        workchain: number,
        shardId: string,
        shardBlockNumber: number

    ): Promise<GetBlockHeaderResult> {

        return this.send('getBlockHeader', {
            workchain,
            shard: shardId,
            seqno: shardBlockNumber,
        });

    }

    /**
     * Returns masterchain block header and his previous block ID.
     */
    public getMasterchainBlockHeader(
        masterchainBlockNumber: number

    ): Promise<GetBlockHeaderResult> {

        return this.getBlockHeader(
            -1, SHARD_ID_ALL, masterchainBlockNumber
        );

    }

    /**
     * Sends external message.
     *
     * {@link https://toncenter.com/api/v2/#/send/send_query_cell_sendQuerySimple_post}
     *
     * @deprecated
     */
    public sendQuery(
        query: SendQuerySimpleParams

    ): Promise<SendQuerySimpleResult> {

        return this.send('sendQuerySimple', query);

    };


    private async sendHttpRequest(
        apiUrl: string,
        request: any

    ): Promise<any> {

        const headers: RequestHeaders = {};

        if (this.options.apiKey) {
            headers['X-API-Key'] = this.options.apiKey;
        }

        const response = (await this.httpClient
            .sendRequest({
                url: apiUrl,
                method: 'POST',
                body: request,
                headers,
            })
        );

        return this.processApiResponseOrThrow(
            response.payload
        );

    }

    private processApiResponseOrThrow(serverResponse: any) {

        const response = expectApiResponse(serverResponse);

        if (response.ok === true) {
            return response.result;

        } else {
            const errorCode = (response.code || 0);
            const errorMessage = response.error;
            throw new Error(
                `API error: [${errorCode}] ${errorMessage}`
            );

        }

    }

}
