
import { HttpProviderUtils } from './http-provider-utils';


export interface HttpProviderOptions {
    apiKey?: string;
}

export interface EstimateFeeBody {

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

export type StackElement = (
  | ['num', number]
  | ['cell', CellObject]
  | ['slice', SliceObject]

  // @todo: remove this when entire type is fully typed
  | [string, any]
);

export type CellObject = any;
export type SliceObject = any;


// @todo: set `fetch` to "node-fetch" in Node.js via Webpack

const SHARD_ID_ALL = '-9223372036854775808'; // 0x8000000000000000

export const defaultHost = 'https://toncenter.com/api/v2/jsonRPC';


export class HttpProvider {

    public static SHARD_ID_ALL = SHARD_ID_ALL;


    constructor(
      public host = defaultHost,
      public options: HttpProviderOptions = {}
    ) {
    }


    /**
     * @todo: change params type to Array<any>
     */
    public send(method: string, params: any): Promise<Response> {
        return this.sendImpl(
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
    public async getAddressInfo(address: string): Promise<any> {
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
    public async getExtendedAddressInfo(address: string): Promise<any> {
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
    public async getWalletInfo(address: string): Promise<any> {
        return this.send('getWalletInformation', { address });
    }

    /**
     * Use this method to get transaction history of a given address.
     *
     * Returns array of transaction objects.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_transactions_getTransactions_get}
     */
    public async getTransactions(
      address: string,
      limit = 20,
      lt?: number,
      hash?: string,
      to_lt?: number,
      archival?: any

    ): Promise<any> {

        return this.send('getTransactions', {
            address,
            limit,
            lt,
            hash,
            to_lt,
            archival,
        });

    };

    /**
     * Use this method to get balance (in nanograms)
     * of a given address.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_address_balance_getAddressBalance_get}
     */
    public async getBalance(address: string): Promise<any> {
        return this.send('getAddressBalance', { address });
    }

    /**
     * Use this method to send serialized boc file:
     * fully packed and serialized external message.
     *
     * {@link https://toncenter.com/api/v2/#/send/send_boc_sendBoc_post}
     */
    public async sendBoc(
      /**
       * base64 string of boc bytes `Cell.toBoc`
       */
      base64: string

    ): Promise<any> {

        return this.send('sendBoc', { boc: base64 });

    };

    /**
     * Estimates fees required for query processing.
     *
     * {@link https://toncenter.com/api/v2/#/send/estimate_fee_estimateFee_post}
     */
    public async getEstimateFee(query: EstimateFeeBody): Promise<any> {
        return this.send('estimateFee', query);
    };

    /**
     * Invokes get-method of smart contract.
     *
     * @todo: rename to `runGetMethodRaw()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     */
    public async call(
      /**
       * Contract address.
       */
      address: string,

      /**
       * Method name or method ID.
       */
      method: (string | number),

      /**
       * Array of stack elements.
       */
      params: StackElement[] = []

    ): Promise<any> {

        /**
         * @todo: think about throw error
         *        if result.exit_code !== 0
         *        (the change breaks backward compatibility)
         */
        return this.send('runGetMethod', {
            address: address,
            method: method,
            stack: params,
        });

    }

    /**
     * Invokes get-method of smart contract.
     *
     * @todo: rename to `runGetMethod()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     */
    public async call2(
      /**
       * Contract address.
       */
      address: string,
      /**
       * Method name or method ID.
       */
      method: (string | number),
      /**
       * Array of stack elements.
       */
      params: StackElement[] = []

      // @todo: properly type the result
    ): Promise<any> {

        const result = await this.send('runGetMethod', {
            address,
            method,
            stack: params,
        });

        return HttpProviderUtils.parseResponse(result);

    }

    /**
     * Returns ID's of last and init block of masterchain.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_masterchain_info_getMasterchainInfo_get}
     */
    public async getMasterchainInfo(): Promise<any> {
        return this.send('getMasterchainInfo', {});
    }

    /**
     * Returns ID's of shardchain blocks included
     * in this masterchain block.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/shards_shards_get}
     */
    public async getBlockShards(masterchainBlockNumber: number): Promise<any> {
        return this.send('shards', {
            seqno: masterchainBlockNumber,
        });
    }

    /**
     * Returns transactions hashes included in this block.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_block_transactions_getBlockTransactions_get}
     */
    public async getBlockTransactions(
      workchain: number,
      shardId: string,
      shardBlockNumber: number

    ): Promise<any> {

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
    public async getMasterchainBlockTransactions(masterchainBlockNumber: number): Promise<any> {
        return this.getBlockTransactions(-1, SHARD_ID_ALL, masterchainBlockNumber);
    }

    /**
     * Returns block header and his previous blocks ID's.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_block_header_getBlockHeader_get}
     */
    public async getBlockHeader(
      workchain: number,
      shardId: string,
      shardBlockNumber: number

    ): Promise<any> {

        return this.send('getBlockHeader', {
            workchain,
            shard: shardId,
            seqno: shardBlockNumber,
        });

    }

    /**
     * Returns masterchain block header and his previous block ID.
     */
    public async getMasterchainBlockHeader(masterchainBlockNumber: number): Promise<any> {
        return this.getBlockHeader(-1, SHARD_ID_ALL, masterchainBlockNumber);
    }

    /**
     * Sends external message.
     *
     * {@link https://toncenter.com/api/v2/#/send/send_query_cell_sendQuerySimple_post}
     *
     * @deprecated
     */
    public async sendQuery(query: any): Promise<any> {
        return this.send('sendQuerySimple', query);
    };


    /**
     * @private
     */
    private sendImpl(apiUrl: string, request: any): Promise<any> {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.options.apiKey) {
            headers['X-API-Key'] = this.options.apiKey;
        }
        // @todo: use async/await/throw
        return fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(request),
        })
            .then(response => response.json())
            .then(({ result, error }) => (result || Promise.reject(error)))
        ;
    }

}
