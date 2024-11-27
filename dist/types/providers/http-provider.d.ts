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
export declare type StackElement = (['num', number] | ['cell', CellObject] | ['slice', SliceObject] | [string, any]);
export declare type CellObject = any;
export declare type SliceObject = any;
export declare const defaultHost = "https://toncenter.com/api/v2/jsonRPC";
export declare class HttpProvider {
    host: string;
    options: HttpProviderOptions;
    static SHARD_ID_ALL: string;
    constructor(host?: string, options?: HttpProviderOptions);
    /**
     * @todo: change params type to Array<any>
     */
    send(method: string, params: any): Promise<Response>;
    /**
     * Use this method to get information about address:
     * balance, code, data, last_transaction_id.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_address_information_getAddressInformation_get}
     */
    getAddressInfo(address: string): Promise<any>;
    /**
     * Similar to previous one but tries to parse additional
     * information for known contract types. This method is
     * based on `generic.getAccountState()` thus number of
     * recognizable contracts may grow. For wallets, we
     * recommend to use `getWalletInformation()`.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_extended_address_information_getExtendedAddressInformation_get}
     */
    getExtendedAddressInfo(address: string): Promise<any>;
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
    getWalletInfo(address: string): Promise<any>;
    /**
     * Use this method to get transaction history of a given address.
     *
     * Returns array of transaction objects.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_transactions_getTransactions_get}
     */
    getTransactions(address: string, limit?: number, lt?: number | string, hash?: string, to_lt?: number | string, archival?: any): Promise<any>;
    /**
     * Use this method to get balance (in nanograms)
     * of a given address.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_address_balance_getAddressBalance_get}
     */
    getBalance(address: string): Promise<any>;
    /**
     * Use this method to send serialized boc file:
     * fully packed and serialized external message.
     *
     * {@link https://toncenter.com/api/v2/#/send/send_boc_sendBoc_post}
     */
    sendBoc(
    /**
     * base64 string of boc bytes `Cell.toBoc`
     */
    base64: string): Promise<any>;
    /**
     * Estimates fees required for query processing.
     *
     * {@link https://toncenter.com/api/v2/#/send/estimate_fee_estimateFee_post}
     */
    getEstimateFee(query: EstimateFeeBody): Promise<any>;
    /**
     * Invokes get-method of smart contract.
     *
     * @todo: rename to `runGetMethodRaw()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     */
    call(
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
    params?: StackElement[]): Promise<any>;
    /**
     * Invokes get-method of smart contract.
     *
     * @todo: rename to `runGetMethod()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     */
    call2(
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
    params?: StackElement[]): Promise<any>;
    /**
     * Returns ID's of last and init block of masterchain.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_masterchain_info_getMasterchainInfo_get}
     */
    getMasterchainInfo(): Promise<any>;
    /**
     * Returns ID's of shardchain blocks included
     * in this masterchain block.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/shards_shards_get}
     */
    getBlockShards(masterchainBlockNumber: number): Promise<any>;
    /**
     * Returns transactions hashes included in this block.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_block_transactions_getBlockTransactions_get}
     */
    getBlockTransactions(workchain: number, shardId: string, shardBlockNumber: number, limit?: number, afterLt?: number | string, addressHash?: string): Promise<any>;
    /**
     * Returns transactions hashes included
     * in this masterchain block.
     */
    getMasterchainBlockTransactions(masterchainBlockNumber: number): Promise<any>;
    /**
     * Returns block header and his previous blocks ID's.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_block_header_getBlockHeader_get}
     */
    getBlockHeader(workchain: number, shardId: string, shardBlockNumber: number): Promise<any>;
    /**
     * Returns masterchain block header and his previous block ID.
     */
    getMasterchainBlockHeader(masterchainBlockNumber: number): Promise<any>;
    /**
     * Sends external message.
     *
     * {@link https://toncenter.com/api/v2/#/send/send_query_cell_sendQuerySimple_post}
     *
     * @deprecated
     */
    sendQuery(query: any): Promise<any>;
    /**
     * @private
     */
    private sendImpl;
}
