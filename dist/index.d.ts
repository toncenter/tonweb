/// <reference types="ledgerhq__hw-transport" />
/// <reference types="node" />

import $BN from 'bn.js';
import { default as BN_2 } from 'bn.js';
import { default as nacl_2 } from 'tweetnacl';
import { TonLib } from '@ton.js/types';
import Transport from '@ledgerhq/hw-transport';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

export declare type Address = Address_2;

declare class Address_2 {
    static isValid(anyForm: AddressType): boolean;
    wc: Workchain;
    hashPart: Uint8Array;
    isTestOnly: boolean;
    isUserFriendly: boolean;
    isBounceable: boolean;
    isUrlSafe: boolean;
    constructor(address: AddressType);
    toString(isUserFriendly?: boolean, isUrlSafe?: boolean, isBounceable?: boolean, isTestOnly?: boolean): string;
    /**
     * Copies the address data from the specified Address
     * instance to this instance.
     */
    private initFromInstance;
    private initFromString;
    private parseFriendlyAddress;
    private checkWorkchainOrThrow;
}

/**
 * Object with specified address.
 */
declare interface AddressParam {
    address: string;
}

/**
 * Known address states.
 */
declare type AddressState = ('uninitialized' | 'frozen' | 'active');

export declare type AddressType = (Address_2 | string);

export declare interface AppConfiguration {
    version: string;
}

declare class AppTon {
    /**
     * @ledgerhq compatible transport.
     */
    readonly transport: Transport;
    readonly ton: TonWeb;
    readonly ADDRESS_FORMAT_HEX = 0;
    readonly ADDRESS_FORMAT_USER_FRIENDLY = 1;
    readonly ADDRESS_FORMAT_URL_SAFE = 2;
    readonly ADDRESS_FORMAT_BOUNCEABLE = 4;
    readonly ADDRESS_FORMAT_TEST_ONLY = 8;
    constructor(
    /**
     * @ledgerhq compatible transport.
     */
    transport: Transport, ton: TonWeb);
    /***
     * Returns application configuration that includes version.
     */
    getAppConfiguration(): Promise<AppConfiguration>;
    /**
     * Returns public key for the specified account number.
     * If `isDisplay` is set then it displays the public key
     * and confirms before returning.
     */
    getPublicKey(accountNumber: number, isDisplay: boolean): Promise<GetPublicKeyResult>;
    /**
     * Returns wallet v3R1 address for the specified account number.
     * If `isDisplay` is set, then it displays address and
     * confirms before returning. `addressFormat` is a sum
     * of `ADDRESS_FORMAT_*` instance property constants.
     */
    getAddress(accountNumber: number, isDisplay: boolean, addressFormat: number): Promise<GetAddressResult>;
    /**
     * Signs the specified buffer of bytes using the
     * specified account number.
     */
    sign(accountNumber: number, buffer: Buffer): Promise<SignResult>;
    /**
     * Signs the transfer coins message
     * (same with TonWeb.WalletContract.createTransferMessage).
     * If `seqno` is zero, then it will be "deploy wallet + transfer coins" message.
     * `addressFormat` is a sum of `ADDRESS_FORMAT_*` instance property constants.
     */
    transfer(accountNumber: number, wallet: WalletContract_2, toAddress: AddressType, nanograms: (BN_2 | number), seqno: number, addressFormat: number): Promise<Method>;
}

declare function base64ToBytes(base64: string): Uint8Array;

/**
 * @deprecated this function is no longer used by the library
 *             and will be removed in the future
 */
declare function base64toString(base64: string): string;

export declare type BitString = BitString_2;

declare class BitString_2 {
    /**
     * A length of bit string in bits.
     *
     * @todo: length shouldn't be public and mutable,
     *        but this is required by clone() method
     */
    length: number;
    array: Uint8Array;
    cursor: number;
    constructor(
    /**
     * A length of bit string in bits.
     *
     * @todo: length shouldn't be public and mutable,
     *        but this is required by clone() method
     */
    length: number);
    /**
     * Returns number of unfilled bits in the bit-string.
     */
    getFreeBits(): number;
    /**
     * Returns number of filled bits in the bit-string.
     */
    getUsedBits(): number;
    /**
     * Returns number of bytes actually used by the bit-string.
     * Rounds up to a whole byte.
     */
    getUsedBytes(): number;
    /**
     * Returns the bit value at the specified index
     * in the bit-string.
     */
    get(index: number): boolean;
    /**
     * Sets the bit value to one at the specified index.
     *
     * @todo: should rename this method to `set()`
     */
    on(index: number): void;
    /**
     * Sets the bit value to zero at the specified index.
     *
     * @todo: should rename this method to `clear()`
     */
    off(index: number): void;
    /**
     * Toggles the bit value at the specified index,
     * turns one into zero and zero into one.
     */
    toggle(index: number): void;
    /**
     * Iterates the bit-string and calls the specified
     * user function for each bit, passing in the bit value.
     *
     * @todo: implement the iterator protocol
     *        by using the generator function
     */
    forEach(callback: (bitValue: boolean) => void): void;
    /**
     * Writes the specified bit value to the bit-string
     * at the current index and advances the current index
     * cursor.
     */
    writeBit(value: (boolean | number)): void;
    /**
     * Writes the specified array of bit values to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeBitArray(values: Array<boolean | number>): void;
    /**
     * Writes the specified unsigned integer of the specified
     * length in bits to the bit-string, starting at the
     * current index and advances the current index cursor
     * by the number of bits written.
     */
    writeUint(value: (number | BN_2), bitLength: number): void;
    /**
     * Writes the specified signed integer of the specified
     * length in bits to the bit-string, starting at the
     * current index and advances the current index cursor
     * by the number of bits written.
     */
    writeInt(value: (number | BN_2), bitLength: number): void;
    /**
     * Writes the specified unsigned 8-bit integer to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeUint8(value: number): void;
    /**
     * Writes the specified array of the unsigned 8-bit integers
     * to the bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeBytes(values: Uint8Array): void;
    /**
     * Represents the specified multibyte string as bytes and writes
     * them to the bit-string, starting at the current index and
     * advances the current index cursor by the number of bits written.
     */
    writeString(text: string): void;
    /**
     * Writes the specified amount in nanograms to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeGrams(nanograms: (number | BN_2)): void;
    /**
     * Writes the specified TON amount in nanotons to the
     * bit-string, starting at the current index and advances
     * the current index cursor by the number of bits written.
     */
    writeCoins(nanotons: (number | BN_2)): void;
    /**
     * Writes the specified address to the bit-string,
     * starting at the current index and advances the
     * current index cursor by the number of bits written.
     */
    writeAddress(address?: Address_2): void;
    /**
     * Appends the specified bit-string to the bit-string,
     * starting at the current index and advances the
     * current index cursor by the number of bits written.
     */
    writeBitString(bitString: BitString_2): void;
    /**
     * Creates a cloned instance of the bit-string.
     */
    clone(): BitString_2;
    /**
     * Returns the bit-string represented as HEX-string.
     */
    toString(): string;
    /**
     * @todo: provide meaningful method description
     */
    getTopUppedArray(): Uint8Array;
    /**
     * Returns the bit-string represented as HEX-string (like in Fift).
     */
    toHex(): string;
    /**
     * Sets this cell data to match provided topUppedArray.
     *
     * @todo: provide a more meaningful method description
     */
    setTopUppedArray(bytes: Uint8Array, fulfilledBytes?: boolean): void;
    /**
     * Checks if the specified index is allowed for
     * the bit string, throws error in case of overflow.
     */
    private checkIndexOrThrow;
}

export declare type BlockHandler = ((blockHeader: any, blockShards?: any) => (Promise<void> | void));

/**
 * A storage for processed block numbers with
 * useful query functions.
 *
 * Used by `BlockSubscription`.
 */
export declare interface BlockStorage {
    /**
     * Inserts new processed masterchain block number and
     * new unprocessed shardchain blocks numbers.
     *
     * Must be in single DB transaction.
     */
    insertBlocks(mcBlockNumber: number, shardBlocks: ShardBlock[]): Promise<void>;
    /**
     * Returns last processed masterchain block number.
     */
    getLastMasterchainBlockNumber(): (Promise<number | undefined>);
    /**
     * Marks the specified shardchain block number as processed and
     * inserts new unprocessed shardchain blocks numbers.
     *
     * Must be in single DB transaction.
     */
    setBlockProcessed(workchain: number, shardId: string, shardBlockNumber: number, prevShardBlocks: ShardBlock[]): Promise<void>;
    /**
     * Returns any unprocessed shard block numbers
     * (order is not important).
     */
    getUnprocessedShardBlock(): (Promise<ShardBlock | undefined>);
}

export declare type BlockSubscription = BlockSubscription_2;

declare class BlockSubscription_2 {
    /**
     * TonWeb HTTP provider.
     */
    private readonly provider;
    /**
     * Persistent storage for storing block numbers
     * that we have already processed.
     */
    private readonly storage;
    /**
     * Callback which is called for each block.
     *
     * Callback may throw an error, in this case the block
     * processing will be interrupted and block will not
     * be saved in the storage as processed.
     *
     * Shardchain blocks are processed OUT of chronological order.
     * Masterchain blocks are processed in chronological order.
     *
     * For masterchain `workchain === -1` and
     * `shardId === -9223372036854775808`
     */
    private readonly onBlock;
    /**
     * Start masterchain block number from which we start to process blocks.
     * if not specified, the subscription starts from the last block of the network at the time of launch.
     */
    private readonly options?;
    private startMcBlockNumber;
    private readonly mcInterval;
    private readonly shardsInterval;
    private startLT?;
    private mcIntervalId?;
    private shardsIntervalId?;
    constructor(
    /**
     * TonWeb HTTP provider.
     */
    provider: HttpProvider_2, 
    /**
     * Persistent storage for storing block numbers
     * that we have already processed.
     */
    storage: BlockStorage, 
    /**
     * Callback which is called for each block.
     *
     * Callback may throw an error, in this case the block
     * processing will be interrupted and block will not
     * be saved in the storage as processed.
     *
     * Shardchain blocks are processed OUT of chronological order.
     * Masterchain blocks are processed in chronological order.
     *
     * For masterchain `workchain === -1` and
     * `shardId === -9223372036854775808`
     */
    onBlock: BlockHandler, 
    /**
     * Start masterchain block number from which we start to process blocks.
     * if not specified, the subscription starts from the last block of the network at the time of launch.
     */
    options?: BlockSubscriptionOptions);
    start(): Promise<void>;
    stop(): void;
}

export declare interface BlockSubscriptionOptions {
    /**
     * Start masterchain block number from which we start
     * to process blocks. If not specified, the subscription
     * starts from the last block of the network at the
     * time of launch.
     */
    startMcBlockNumber?: number;
    mcInterval?: number;
    shardsInterval?: number;
}

export declare type BN = $BN;

declare interface BurnBodyParams {
    queryId?: number;
    tokenAmount: BN_2;
    responseAddress: Address_2;
}

declare function bytesToBase64(bytes: Uint8Array): string;

export declare type Cell = Cell_3;

declare type Cell_2 = {
    bytes: TonLib.Combinators.Tvm.StackEntryCell['cell']['bytes'];
    object: CellSerialized;
};

declare class Cell_3 {
    readonly bits: BitString_2;
    isExotic: (number | false);
    refs: Cell_3[];
    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns root cells.
     */
    static fromBoc(serializedBoc: (string | Uint8Array)): Cell_3[];
    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns one root cells. Throws an
     * error if BOC contains multiple root cells.
     */
    static oneFromBoc(serializedBoc: (string | Uint8Array)): Cell_3;
    /**
     * Writes the specified cell to this cell.
     */
    writeCell(cell: Cell_3): void;
    /**
     * Returns cell max level.
     */
    getMaxLevel(): number;
    /**
     * @todo: add description
     */
    isExplicitlyStoredHashes(): number;
    /**
     * Returns the cell's max depth, by inspecting
     * its children.
     */
    getMaxDepth(): number;
    /**
     * @todo: add description
     */
    getRefsDescriptor(): Uint8Array;
    /**
     * @todo: add description
     */
    getBitsDescriptor(): Uint8Array;
    /**
     * @todo: add description
     */
    getDataWithDescriptors(): Uint8Array;
    /**
     * @todo: add description
     */
    getRepr(): Promise<Uint8Array>;
    /**
     * @todo: add description
     */
    hash(): Promise<Uint8Array>;
    /**
     * Recursively prints cell's content like in Fift.
     */
    print(indent?: string): string;
    /**
     * Creates BOC byte-array.
     */
    toBoc(hasIdx?: boolean, hashCrc32?: boolean, hasCacheBits?: boolean, flags?: number): Promise<Uint8Array>;
    private getMaxDepthAsArray;
    private treeWalk;
    private serializeForBoc;
    private bocSerializationSize;
}

declare interface CellSerialized {
    data: {
        b64: string;
        len: number;
    };
    refs: CellSerialized[];
}

export declare interface CollectionData {
    nextItemIndex: number;
    ownerAddress: Address_2;
    collectionContentUri: string;
}

export declare type Contract = Contract_2;

declare class Contract_2<OptionsType extends ContractOptions = ContractOptions, MethodsType extends ContractMethods = ContractMethods> {
    readonly provider: HttpProvider_2;
    readonly options: OptionsType;
    static createStateInit(code: Cell_3, data: Cell_3, library?: undefined, splitDepth?: undefined, ticktock?: undefined): Cell_3;
    static createInternalMessageHeader(dest: AddressType, nanograms?: (number | BN_2), ihrDisabled?: boolean, bounce?: boolean, bounced?: boolean, src?: AddressType, currencyCollection?: undefined, ihrFees?: (number | BN_2), fwdFees?: (number | BN_2), createdLt?: (number | BN_2), createdAt?: (number | BN_2)): Cell_3;
    static createExternalMessageHeader(dest: AddressType, src?: AddressType, importFee?: (number | BN_2)): Cell_3;
    /**
     * Creates CommonMsgInfo cell that contains specified
     * header, stateInit and body.
     */
    static createCommonMsgInfo(header: Cell_3, stateInit?: Cell_3, body?: Cell_3): Cell_3;
    static createMethod(provider: HttpProvider_2, queryPromise: Promise<Query>): Method;
    address?: Address_2;
    methods: MethodsType;
    constructor(provider: HttpProvider_2, options?: OptionsType);
    getAddress(): Promise<Address_2>;
    createStateInit(): Promise<StateInit>;
    /**
     * Return cell that contains contract data.
     */
    protected createDataCell(): Cell_3;
    /**
     * Returns cell that contains contact code.
     */
    private createCodeCell;
}

export declare interface ContractMethods {
}

export declare interface ContractOptions {
    code?: Cell_3;
    address?: AddressType;
    wc?: number;
}

export declare interface CreateCancelBodyParams {
    queryId?: number;
}

export declare interface CreateChangeOwnerBodyParams {
    queryId?: number;
    newOwnerAddress: Address_2;
}

export declare interface CreateGetRoyaltyParamsBodyParams {
    queryId?: number;
}

export declare interface CreateGetStaticDataBodyParams {
    queryId?: number;
}

export declare interface CreateTransferBodyParams {
    newOwnerAddress: Address_2;
    responseAddress: Address_2;
    queryId?: number;
    forwardAmount?: BN_2;
    forwardPayload?: Uint8Array;
}

export declare interface DeployAndInstallPluginParams {
    secretKey: Uint8Array;
    seqno: number;
    pluginWc: number;
    amount: BN_2;
    stateInit: Cell_3;
    body: Cell_3;
}

declare type EstimateFeeMeta = MethodMeta<EstimateFeeParams, EstimateFeeResult>;

declare interface EstimateFeeParams {
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

declare type EstimateFeeResult = TonLib.Types.Query.Fees;

export declare interface ExternalMessage {
    address: Address_2;
    signature: Uint8Array;
    message: Cell_3;
    body: Cell_3;
    signingMessage: Cell_3;
    stateInit?: Cell_3;
    code?: Cell_3;
    data?: Cell_3;
}

export declare type FetchHttpClient = FetchHttpClient_2;

declare class FetchHttpClient_2 implements HttpClient {
    private readonly options;
    constructor(options?: FetchHttpClientOptions);
    sendRequest<ResponsePayloadType>(request: HttpRequest): Promise<HttpResponse<ResponsePayloadType>>;
    private createHeaders;
}

export declare interface FetchHttpClientOptions {
    /**
     * Request timeout in milliseconds.
     */
    timeout?: number;
}

/**
 * Formats TON transfer URL from the specified individual parts.
 *
 * @todo: pass all the parts as a single argument of `ParsedTransferUrl` type
 */
declare function formatTransferUrl(address: string, amount?: string, text?: string): string;

declare type GetAddressBalanceMeta = MethodMeta<AddressParam, GetAddressBalanceResult>;

declare type GetAddressBalanceResult = TonLib.Types.Raw.FullAccountState['balance'];

declare type GetAddressInformationMeta = MethodMeta<AddressParam, GetAddressInformationResult>;

declare interface GetAddressInformationResult extends TonLib.Types.Raw.FullAccountState {
    state: AddressState;
}

export declare interface GetAddressResult {
    address: Address_2;
}

declare type GetBlockHeaderMeta = MethodMeta<{
    workchain: number;
    shard: string;
    seqno: number;
}, GetBlockHeaderResult>;

declare type GetBlockHeaderResult = TonLib.Types.Blocks.Header;

declare type GetBlockTransactionsMeta = MethodMeta<{
    workchain: number;
    shard: string;
    seqno: number;
    root_hash?: string;
    file_hash?: string;
    after_lt?: number;
    after_hash?: string;
    count?: number;
}, GetBlockTransactionsResult>;

declare interface GetBlockTransactionsResult extends TonLib.Types.Blocks.Transactions {
    account?: string;
}

declare type GetExtendedAddressInformationMeta = MethodMeta<AddressParam, GetExtendedAddressInformationResult>;

declare type GetExtendedAddressInformationResult = TonLib.Types.FullAccountState;

declare type GetMasterchainInfoMeta = MethodMeta<never, GetMasterchainInfoResult>;

declare type GetMasterchainInfoResult = TonLib.Types.Blocks.MasterchainInfo;

export declare interface GetPublicKeyResult {
    publicKey: Uint8Array;
}

declare type GetTransactionsMeta = MethodMeta<{
    address: string;
    limit?: number;
    lt?: number;
    hash?: string;
    to_lt?: number;
    archival?: boolean;
}, GetTransactionsResult>;

declare type GetTransactionsResult = (GetTransactionsResultTransaction[]);

declare type GetTransactionsResultTransaction = Omit<TonLib.Types.Raw.Transaction, 'in_msg'> & {
    in_msg: GetTransactionsResultTransactionMessage;
    out_msgs: GetTransactionsResultTransactionMessage[];
};

declare type GetTransactionsResultTransactionMessage = (Omit<TonLib.Types.Raw.Transaction['in_msg'], 'source' | 'destination'> & {
    source: TonLib.Types.Raw.Transaction['in_msg']['source']['account_address'];
    destination: TonLib.Types.Raw.Transaction['in_msg']['destination']['account_address'];
    message?: string;
});

declare type GetWalletInformationMeta = MethodMeta<AddressParam, GetWalletInformationResult>;

declare type GetWalletInformationResult = {
    account_state: AddressState;
    balance: string;
    last_transaction_id?: TonLib.Types.Raw.FullAccountState['last_transaction_id'];
} & ({
    wallet: false;
} | {
    wallet: true;
    wallet_type: WalletType;
    wallet_id: number;
    seqno: number;
});

export declare interface HttpClient {
    sendRequest<ResponsePayloadType = ParsedJson>(request: HttpRequest): (Promise<HttpResponse<ResponsePayloadType>>);
}

export declare type HttpProvider = HttpProvider_2;

declare class HttpProvider_2 {
    host: string;
    options: HttpProviderOptions;
    static SHARD_ID_ALL: string;
    private readonly httpClient;
    constructor(host?: string, options?: HttpProviderOptions);
    send<Method extends HttpProviderMethodWithArgsName>(method: Method, params: HttpProviderMethodParams<Method>): Promise<HttpProviderMethodResponse<Method>>;
    send<Method extends HttpProviderMethodNoArgsName>(method: Method): Promise<HttpProviderMethodResponse<Method>>;
    /**
     * Use this method to get information about address:
     * balance, code, data, last_transaction_id.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_address_information_getAddressInformation_get}
     */
    getAddressInfo(address: string): Promise<GetAddressInformationResult>;
    /**
     * Similar to previous one but tries to parse additional
     * information for known contract types. This method is
     * based on `generic.getAccountState()` thus number of
     * recognizable contracts may grow. For wallets, we
     * recommend to use `getWalletInformation()`.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_extended_address_information_getExtendedAddressInformation_get}
     */
    getExtendedAddressInfo(address: string): Promise<GetExtendedAddressInformationResult>;
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
    getWalletInfo(address: string): Promise<GetWalletInformationResult>;
    /**
     * Use this method to get transaction history of a given address.
     *
     * Returns array of transaction objects.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_transactions_getTransactions_get}
     */
    getTransactions(address: string, limit?: number, lt?: number, hash?: string, toLt?: number, archival?: boolean): Promise<GetTransactionsResult>;
    /**
     * Use this method to get balance (in nanograms)
     * of a given address.
     *
     * {@link https://toncenter.com/api/v2/#/accounts/get_address_balance_getAddressBalance_get}
     */
    getBalance(address: string): Promise<GetAddressBalanceResult>;
    /**
     * Use this method to send serialized boc file:
     * fully packed and serialized external message.
     *
     * {@link https://toncenter.com/api/v2/#/send/send_boc_sendBoc_post}
     *
     * @param base64 - Base64 string of BOC bytes (`Cell.toBoc`)
     */
    sendBoc(base64: string): Promise<SendBocResult>;
    /**
     * Estimates fees required for query processing.
     *
     * {@link https://toncenter.com/api/v2/#/send/estimate_fee_estimateFee_post}
     */
    getEstimateFee(query: EstimateFeeParams): Promise<EstimateFeeResult>;
    /**
     * Invokes get-method of smart contract.
     *
     * @todo: rename to `runGetMethodRaw()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     *
     * @param address - Contract address
     * @param method - Method name or method ID
     * @param stack - Array of stack elements
     */
    call(address: string, method: (string | number), stack?: RunGetMethodParamsStackItem[]): Promise<RunGetMethodResult>;
    /**
     * Invokes get-method of smart contract.
     *
     * @todo: rename to `runGetMethod()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     *
     * @param address - Contract address
     * @param method - Method name or method ID
     * @param params - Array of stack elements
     */
    call2(address: string, method: (string | number), params?: RunGetMethodParamsStackItem[]): Promise<ParseResponseResult>;
    /**
     * Returns ID's of last and init block of masterchain.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_masterchain_info_getMasterchainInfo_get}
     */
    getMasterchainInfo(): Promise<GetMasterchainInfoResult>;
    /**
     * Returns ID's of shardchain blocks included
     * in this masterchain block.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/shards_shards_get}
     */
    getBlockShards(masterchainBlockNumber: number): Promise<ShardsResult>;
    /**
     * Returns transactions hashes included in this block.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_block_transactions_getBlockTransactions_get}
     */
    getBlockTransactions(workchain: number, shardId: string, shardBlockNumber: number): Promise<GetBlockTransactionsResult>;
    /**
     * Returns transactions hashes included
     * in this masterchain block.
     */
    getMasterchainBlockTransactions(masterchainBlockNumber: number): Promise<GetBlockTransactionsResult>;
    /**
     * Returns block header and his previous blocks ID's.
     *
     * {@link https://toncenter.com/api/v2/#/blocks/get_block_header_getBlockHeader_get}
     */
    getBlockHeader(workchain: number, shardId: string, shardBlockNumber: number): Promise<GetBlockHeaderResult>;
    /**
     * Returns masterchain block header and his previous block ID.
     */
    getMasterchainBlockHeader(masterchainBlockNumber: number): Promise<GetBlockHeaderResult>;
    /**
     * Sends external message.
     *
     * {@link https://toncenter.com/api/v2/#/send/send_query_cell_sendQuerySimple_post}
     *
     * @deprecated
     */
    sendQuery(query: SendQuerySimpleParams): Promise<SendQuerySimpleResult>;
    private sendHttpRequest;
    private processApiResponseOrThrow;
}

/**
 * Map, where key is a name of method in TON API and value is a description
 * of returned response type.
 *
 * {@link https://toncenter.com/api/v2/}
 */
declare interface HttpProviderMethodMetaMap {
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
 * Available HttpProvider web methods.
 */
declare type HttpProviderMethodName = keyof HttpProviderMethodMetaMap;

/**
 * API methods which don't require any arguments to call.
 */
declare type HttpProviderMethodNoArgsName = {
    [MethodType in keyof HttpProviderMethodMetaMap]: [
    HttpProviderMethodMetaMap[MethodType]['params']
    ] extends [never] ? MethodType : never;
}[keyof HttpProviderMethodMetaMap];

/**
 * Returns type of parameters for specified API method.
 */
declare type HttpProviderMethodParams<MethodType extends HttpProviderMethodName> = (HttpProviderMethodMetaMap[MethodType]['params']);

/**
 * Returns type of response for specified API method.
 */
declare type HttpProviderMethodResponse<MethodType extends HttpProviderMethodName> = (HttpProviderMethodMetaMap[MethodType]['response']);

/**
 * API methods which required arguments to call.
 */
declare type HttpProviderMethodWithArgsName = (Exclude<HttpProviderMethodName, HttpProviderMethodNoArgsName>);

export declare interface HttpProviderOptions {
    apiKey?: string;
    httpClient?: HttpClient;
}

export declare interface HttpRequest<BodyType = any> {
    url: string;
    method?: HttpRequestMethod;
    query?: Record<string, any>;
    body?: BodyType;
    headers?: RequestHeaders;
}

export declare type HttpRequestMethod = ('GET' | 'POST');

export declare interface HttpResponse<PayloadType = any> {
    status: number;
    payload: PayloadType;
}

export declare type InMemoryBlockStorage = InMemoryBlockStorage_2;

/**
 * Simple in-memory implementation of the processed
 * block number storage.
 */
declare class InMemoryBlockStorage_2 implements BlockStorage {
    private readonly logFunction;
    /**
     * @todo: should we use `Map` here?
     * Map of the processed masterchain blocks:
     * `key` is the block number, while
     * `value` reflects `isProcessed` state.
     */
    private readonly masterBlocks;
    /**
     * @todo: should we use `Map` here?
     * Map of the processed shardchain blocks:
     * The `key` should be constructed this way:
     * `${workchain}_${shardId}_${shardBlockNumber}`
     * and the `value` reflects `isProcessed` state.
     */
    private readonly shardBlocks;
    constructor(logFunction: LogFunction);
    insertBlocks(mcBlockNumber: number, shardBlockNumbers: ShardBlock[]): Promise<void>;
    getLastMasterchainBlockNumber(): Promise<number | undefined>;
    setBlockProcessed(workchain: number, shardId: string, shardBlockNumber: number, prevShardBlocks: ShardBlock[]): Promise<void>;
    getUnprocessedShardBlock(): (Promise<ShardBlock | undefined>);
    /**
     * Inserts new unprocessed shardchain block numbers.
     * Block number (workchain + shardId + shardBlockNumber) should be IGNORED if it is already in the storage.
     */
    private insertShardBlocks;
    /**
     * Generates unique key for identifying the specified
     * shardchain block.
     */
    private getShardBlockKey;
    /**
     * Parses the specified shardchain block key and returns
     * a shardchain block definition.
     */
    private parseShardBlockKey;
}

declare interface JettonData {
    totalSupply: BN_2;
    isMutable: boolean;
    jettonContentUri: string;
    tokenWalletCode: Cell_3;
    adminAddress?: Address_2;
}

export declare type JettonMinter = JettonMinter_2;

/**
 * ATTENTION: this is a DRAFT, there will be changes.
 */
declare class JettonMinter_2 extends Contract_2<JettonMinterOptions, JettonMinterMethods> {
    constructor(provider: HttpProvider_2, options: JettonMinterOptions);
    createMintBody(params: MintBodyParams_2): Cell_3;
    getJettonData(): Promise<JettonData>;
    /**
     * Returns cell that contains jetton minter data.
     */
    protected createDataCell(): Cell_3;
}

export declare interface JettonMinterMethods extends ContractMethods {
}

export declare interface JettonMinterOptions extends ContractOptions {
    wc?: 0;
    adminAddress: Address_2;
    jettonContentUri: string;
    jettonWalletCodeHex: string;
}

export declare type JettonWallet = JettonWallet_2;

/**
 * ATTENTION: this is a DRAFT, there will be changes.
 */
declare class JettonWallet_2 extends Contract_2<JettonWalletOptions, JettonWalletMethods> {
    static codeHex: string;
    constructor(provider: HttpProvider_2, options: JettonWalletOptions);
    getData(): Promise<WalletData>;
    /**
     * @todo: should it be async?
     */
    createTransferBody(params: TransferBodyParams): Promise<Cell_3>;
    /**
     * @todo: should it be async?
     */
    createBurnBody(params: BurnBodyParams): Promise<Cell_3>;
}

export declare interface JettonWalletMethods extends ContractMethods {
}

export declare interface JettonWalletOptions extends ContractOptions {
    wc?: 0;
}

export declare type LedgerAppTon = AppTon;

export declare type LockupWalletV1 = LockupWalletV1_2;

declare class LockupWalletV1_2 extends WalletContract_2<LockupWalletV1Options, LockupWalletV1Methods> {
    constructor(provider: HttpProvider_2, options: any);
    getName(): string;
    getPublicKey(): Promise<BN_2>;
    getWalletId(): Promise<number>;
    /**
     * Returns amount of nanograms that can be spent immediately.
     */
    getLiquidBalance(): Promise<BN_2>;
    /**
     * Returns amount of nanograms that can be spent after
     * the timelock OR to the whitelisted addresses.
     */
    getNominalRestrictedBalance(): Promise<BN_2>;
    /**
     * Returns amount of nanograms that can be spent after
     * the timelock only (whitelisted addresses not used).
     */
    getNominalLockedBalance(): Promise<BN_2>;
    /**
     * Returns total amount of nanograms on the contract,
     * nominal restricted value and nominal locked value.
     */
    getBalances(): Promise<[BN_2, BN_2, BN_2]>;
    /**
     * Returns cell that contains wallet data.
     */
    protected createDataCell(): Cell_3;
    protected createSigningMessage(seqno?: number, withoutOp?: boolean): Cell_3;
}

export declare interface LockupWalletV1Config {
    wallet_type: 'lockup-0.1';
    /**
     * BASE64-encoded public key.
     */
    config_public_key: string;
    /**
     * Dictionary with allowed address destinations
     * as BASE64-encoded string, where key is address
     * and the value must be empty.
     */
    allowed_destinations: string;
}

export declare interface LockupWalletV1Methods extends WalletContractMethods {
    getPublicKey: () => Promise<BN_2>;
    getWalletId: () => Promise<number>;
    getLiquidBalance: () => Promise<BN_2>;
    getNominalRestrictedBalance: () => Promise<BN_2>;
    getNominalLockedBalance: () => Promise<BN_2>;
}

export declare interface LockupWalletV1Options extends WalletContractOptions {
    walletId?: number;
    config?: LockupWalletV1Config;
}

export declare type LogFunction = (message: string) => void;

export declare interface Method {
    getQuery(): Promise<Cell_3>;
    send(): Promise<any>;
    estimateFee(): Promise<any>;
}

/**
 * Creates metadata for API method.
 */
declare interface MethodMeta<ParamsType, ResponseType> {
    params: ParamsType;
    response: ResponseType;
}

export declare interface MintBodyParams {
    itemIndex: number;
    amount: BN_2;
    itemOwnerAddress: Address_2;
    itemContentUri: string;
    queryId?: number;
}

declare interface MintBodyParams_2 {
    tokenAmount: BN_2;
    destination: Address_2;
    amount: BN_2;
    queryId?: number;
}

export declare type NftCollection = NftCollection_2;

/**
 * NFT Release Candidate - may still change slightly.
 */
declare class NftCollection_2 extends Contract_2<NftCollectionOptions, NftCollectionMethods> {
    private readonly royaltyBase;
    private readonly royaltyFactor;
    constructor(provider: HttpProvider_2, options: NftCollectionOptions);
    createMintBody(params: MintBodyParams): Cell_3;
    createGetRoyaltyParamsBody(params: CreateGetRoyaltyParamsBodyParams): Cell_3;
    createChangeOwnerBody(params: CreateChangeOwnerBodyParams): Cell_3;
    getCollectionData(): Promise<CollectionData>;
    getNftItemContent(nftItem: NftItem_2): Promise<NftItemContent>;
    getNftItemAddressByIndex(index: number): Promise<Address_2>;
    getRoyaltyParams(): Promise<RoyaltyParams>;
    /**
     * Returns cell that contains NFT collection data.
     */
    protected createDataCell(): Cell_3;
}

export declare interface NftCollectionMethods extends ContractMethods {
    getCollectionData: () => Promise<CollectionData>;
    getNftItemAddressByIndex: (index: number) => Promise<Address_2>;
    getNftItemContent: (nftItem: NftItem_2) => Promise<NftItemContent>;
    getRoyaltyParams: () => Promise<RoyaltyParams>;
}

export declare interface NftCollectionOptions extends ContractOptions {
    ownerAddress?: Address_2;
    collectionContentUri?: string;
    nftItemContentBaseUri?: string;
    nftItemCodeHex?: string;
    royalty?: number;
    royaltyAddress?: Address_2;
}

export declare type NftItem = NftItem_2;

/**
 * NFT Release Candidate - may still change slightly.
 */
declare class NftItem_2 extends Contract_2<NftItemOptions, NftItemMethods> {
    static codeHex: string;
    constructor(provider: HttpProvider_2, options: NftItemOptions);
    getData(): Promise<NftItemData>;
    createTransferBody(params: CreateTransferBodyParams): Promise<Cell_3>;
    createGetStaticDataBody(params: CreateGetStaticDataBodyParams): Cell_3;
    /**
     * Returns cell that contains NFT data.
     */
    protected createDataCell(): Cell_3;
}

export declare interface NftItemContent {
    isInitialized: boolean;
    index: number;
    collectionAddress: Address_2;
    ownerAddress?: Address_2;
    contentUri?: string;
}

export declare interface NftItemData {
    isInitialized: boolean;
    index: number;
    collectionAddress: Address_2;
    contentCell: Cell_3;
    ownerAddress?: Address_2;
}

export declare interface NftItemMethods extends ContractMethods {
    getData: () => Promise<NftItemData>;
}

export declare interface NftItemOptions extends ContractOptions {
    index?: number;
    collectionAddress?: Address_2;
}

export declare type NftMarketplace = NftMarketplace_2;

/**
 * Work in progress, will be changed.
 */
declare class NftMarketplace_2 extends Contract_2<NftMarketplaceOptions, NftMarketplaceMethods> {
    constructor(provider: HttpProvider_2, options: NftMarketplaceOptions);
    /**
     * Returns cell that contains NFT marketplace data.
     */
    protected createDataCell(): Cell_3;
}

export declare interface NftMarketplaceMethods extends ContractMethods {
}

export declare interface NftMarketplaceOptions extends ContractOptions {
    ownerAddress?: Address_2;
    cell?: Cell_3;
}

export declare type NftSale = NftSale_2;

/**
 * Work in progress, will be changed.
 */
declare class NftSale_2 extends Contract_2<NftSaleOptions, NftSaleMethods> {
    static codeHex: string;
    constructor(provider: HttpProvider_2, options: NftSaleOptions);
    getData(): Promise<NftSaleData>;
    createCancelBody(params: CreateCancelBodyParams): Promise<Cell_3>;
    /**
     * Returns cell that contains NFT sale data.
     */
    protected createDataCell(): Cell_3;
}

export declare interface NftSaleData {
    marketplaceAddress?: Address_2;
    nftAddress?: Address_2;
    nftOwnerAddress?: Address_2;
    fullPrice: any;
    marketplaceFee: any;
    royaltyAddress?: Address_2;
    royaltyAmount: any;
}

export declare interface NftSaleMethods extends ContractMethods {
    getData: () => Promise<NftSaleData>;
}

export declare interface NftSaleOptions extends ContractOptions {
    marketplaceAddress?: Address_2;
    nftAddress?: Address_2;
    fullPrice?: BN_2;
    marketplaceFee?: BN_2;
    royaltyAddress?: Address_2;
    royaltyAmount?: BN_2;
}

export declare type ParsedJson = (null | string | number | boolean | ParsedJson[] | {
    [key: string]: ParsedJson;
});

export declare interface ParsedTransferUrl {
    address: string;
    amount?: string;
    text?: string;
}

declare type ParseObjectResult = (BN_2 | ParseObjectResult[]);

declare type ParseResponseResult = (ParseResponseStackResult | ParseResponseStackResult[]);

declare type ParseResponseStackResult = (BN_2 | ParseObjectResult | Cell_3);

/**
 * Parses the specified TON-transfer URL into its individual
 * parts, throws error if URL format is invalid.
 */
declare function parseTransferUrl(url: string): ParsedTransferUrl;

export declare interface PayExternalMessage {
    address: Address_2;
    message: Cell_3;
    body: Cell_3;
    signature?: Uint8Array;
    cell?: Cell_3;
    resultMessage?: Cell_3;
}

/**
 * @todo: this type is created on indirect data
 *        and needs proper revision
 */
export declare interface Query {
    address: Address_2;
    message: Cell_3;
    code?: Cell_3;
    body: Cell_3;
    data?: Cell_3;
    signature?: Uint8Array;
    signingMessage?: Cell_3;
    stateInit?: Cell_3;
}

export declare type RequestHeaders = (Record<string, string | string[]>);

export declare interface RoyaltyParams {
    royalty: number;
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address_2;
}

declare type RunGetMethodMeta = MethodMeta<RunGetMethodParams, RunGetMethodResult>;

declare interface RunGetMethodParams {
    address: string;
    method: (string | number);
    stack?: RunGetMethodParamsStackItem[];
}

/**
 * Currently, list of provided stack items is restricted by API.
 */
declare type RunGetMethodParamsStackItem = (['num', (number | string)] | ['cell', Cell_2] | ['slice', Slice] | ['tvm.Cell', string] | ['tvm.Slice', string]);

declare interface RunGetMethodResult extends Omit<TonLib.Types.Smc.RunResult, '@type' | 'stack'> {
    stack: RunGetMethodResultStackItem[];
}

/**
 * Unlike RunGetMethodParamsStackItem, API returns strict types.
 */
declare type RunGetMethodResultStackItem = (['num', string] | ['cell', Cell_2] | ['tuple', TonLib.Combinators.Tvm.StackEntryTuple['tuple']] | ['list', TonLib.Combinators.Tvm.StackEntryList['list']]);

declare type SendBocMeta = MethodMeta<{
    boc: string;
}, SendBocResult>;

declare type SendBocResult = TonLib.Types.Ok;

declare type SendQuerySimpleMeta = MethodMeta<SendQuerySimpleParams, SendQuerySimpleResult>;

declare interface SendQuerySimpleParams {
    address: string;
    body: string;
    init_code?: CellSerialized;
    init_data?: CellSerialized;
}

declare type SendQuerySimpleResult = TonLib.Types.Ok;

export declare type SeqnoMethod = (() => SeqnoMethodResult);

export declare interface SeqnoMethodResult {
    call: () => Promise<number | undefined>;
}

export declare interface SetPluginParams {
    secretKey: Uint8Array;
    seqno: number;
    pluginAddress: AddressType;
    amount?: BN_2;
    queryId?: number;
}

/**
 * A shardchain block definition.
 */
export declare interface ShardBlock {
    workchain: number;
    shardId: string;
    shardBlockNumber: number;
}

declare type ShardsMeta = MethodMeta<{
    seqno: number;
}, ShardsResult>;

declare type ShardsResult = TonLib.Types.Blocks.Shards;

export declare interface SignResult {
    signature: Buffer;
}

export declare type SimpleWalletContractR1 = SimpleWalletContractR1_2;

/**
 * Attention: no seqno get-method in this wallet.
 */
declare class SimpleWalletContractR1_2 extends WalletContract_2 {
    constructor(provider: HttpProvider_2, options: WalletContractOptions);
    getName(): string;
}

export declare type SimpleWalletContractR2 = SimpleWalletContractR2_2;

declare class SimpleWalletContractR2_2 extends WalletContract_2 {
    constructor(provider: HttpProvider_2, options: ContractOptions);
    getName(): string;
}

export declare type SimpleWalletContractR3 = SimpleWalletContractR3_2;

declare class SimpleWalletContractR3_2 extends WalletContract_2 {
    constructor(provider: HttpProvider_2, options: ContractOptions);
    getName(): string;
}

declare type Slice = Cell_2;

export declare interface StateInit {
    stateInit: Cell_3;
    address: Address_2;
    code: Cell_3;
    data: Cell_3;
}

/**
 * @deprecated this function is no longer used by the library
 *             and will be removed in the future
 */
declare function stringToBase64(text: string): string;

export declare type SubscriptionContract = SubscriptionContract_2;

declare class SubscriptionContract_2 extends Contract_2<SubscriptionContractOptions, SubscriptionContractMethods> {
    constructor(provider: HttpProvider_2, options: SubscriptionContractOptions);
    /**
     * Creates payment body (from wallet to subscription).
     */
    createBody(): Cell_3;
    /**
     * Destroys plugin body (from wallet to subscription OR
     * from beneficiary to subscription).
     */
    createSelfDestructBody(): Cell_3;
    getSubscriptionData(): Promise<SubscriptionData>;
    protected createDataCell(): Cell_3;
    protected createPayExternalMessage(): Promise<PayExternalMessage>;
}

export declare interface SubscriptionContractMethods extends ContractMethods {
    pay: () => Method;
    getSubscriptionData: () => Promise<SubscriptionData>;
}

export declare interface SubscriptionContractOptions extends ContractOptions {
    wallet?: Address_2;
    beneficiary?: Address_2;
    amount?: BN_2;
    period?: number;
    timeout?: number;
    startAt?: number;
    subscriptionId?: number;
}

export declare interface SubscriptionData {
    wallet: string;
    beneficiary: string;
    amount: BN_2;
    period: number;
    startAt: number;
    timeout: number;
    lastPayment: number;
    lastRequest: number;
    failedAttempts: number;
    subscriptionId: number;
}

declare class TonWeb {
    provider: HttpProvider_2;
    static version: string;
    static utils: {
        base64ToBytes: typeof base64ToBytes;
        bytesToBase64: typeof bytesToBase64;
        base64toString: typeof base64toString;
        stringToBase64: typeof stringToBase64;
        BN: typeof $BN;
        nacl: nacl_2;
        Address: typeof Address_2;
        formatTransferUrl: typeof formatTransferUrl;
        parseTransferUrl: typeof parseTransferUrl;
        sha256(bytes: Uint8Array): Promise<ArrayBuffer>;
        toNano(amount: string | number | $BN): $BN;
        fromNano(amount: string | number | $BN): string;
        bytesToHex(buffer: Uint8Array): string;
        hexToBytes(hex: string): Uint8Array;
        stringToBytes(str: string, size?: number): Uint8Array;
        crc32c(bytes: Uint8Array): Uint8Array;
        crc16(data: ArrayLike<number>): Uint8Array;
        concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array;
        compareBytes(a: Uint8Array, b: Uint8Array): boolean;
        readNBytesUIntFromArray(n: number, ui8array: Uint8Array): number;
    };
    static Address: typeof Address_2;
    static boc: {
        BitString: typeof BitString_2;
        Cell: typeof Cell_3;
    };
    static HttpProvider: typeof HttpProvider_2;
    static Contract: typeof Contract_2;
    static Wallets: typeof Wallets_2;
    static LockupWallets: {
        LockupWalletV1: typeof LockupWalletV1_2;
        all: {
            'lockup-0.1': typeof LockupWalletV1_2;
        };
        list: (typeof LockupWalletV1_2)[];
    };
    static SubscriptionContract: typeof SubscriptionContract_2;
    static BlockSubscription: typeof BlockSubscription_2;
    static InMemoryBlockStorage: typeof InMemoryBlockStorage_2;
    static FetchHttpClient: typeof FetchHttpClient_2;
    static ledger: {
        TransportWebUSB: typeof TransportWebUSB;
        TransportWebHID: any;
        BluetoothTransport: any;
        AppTon: typeof AppTon;
    };
    static token: {
        nft: {
            NftCollection: typeof NftCollection_2;
            NftItem: typeof NftItem_2;
            NftMarketplace: typeof NftMarketplace_2;
            NftSale: typeof NftSale_2;
        };
        ft: {
            JettonWallet: typeof JettonWallet_2;
            JettonMinter: typeof JettonMinter_2;
        };
        jetton: {
            JettonWallet: typeof JettonWallet_2;
            JettonMinter: typeof JettonMinter_2;
        };
    };
    version: string;
    utils: {
        base64ToBytes: typeof base64ToBytes;
        bytesToBase64: typeof bytesToBase64;
        base64toString: typeof base64toString;
        stringToBase64: typeof stringToBase64;
        BN: typeof $BN;
        nacl: nacl_2;
        Address: typeof Address_2;
        formatTransferUrl: typeof formatTransferUrl;
        parseTransferUrl: typeof parseTransferUrl;
        sha256(bytes: Uint8Array): Promise<ArrayBuffer>;
        toNano(amount: string | number | $BN): $BN;
        fromNano(amount: string | number | $BN): string;
        bytesToHex(buffer: Uint8Array): string;
        hexToBytes(hex: string): Uint8Array;
        stringToBytes(str: string, size?: number): Uint8Array;
        crc32c(bytes: Uint8Array): Uint8Array;
        crc16(data: ArrayLike<number>): Uint8Array;
        concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array;
        compareBytes(a: Uint8Array, b: Uint8Array): boolean;
        readNBytesUIntFromArray(n: number, ui8array: Uint8Array): number;
    };
    Address: typeof Address_2;
    boc: {
        BitString: typeof BitString_2;
        Cell: typeof Cell_3;
    };
    Contract: typeof Contract_2;
    BlockSubscription: typeof BlockSubscription_2;
    InMemoryBlockStorage: typeof InMemoryBlockStorage_2;
    wallet: Wallets_2;
    lockupWallet: {
        LockupWalletV1: typeof LockupWalletV1_2;
        all: {
            'lockup-0.1': typeof LockupWalletV1_2;
        };
        list: (typeof LockupWalletV1_2)[];
    };
    constructor(provider?: HttpProvider_2);
    /**
     * Use this method to get transaction history of a given address.
     * Returns array of transaction objects.
     */
    getTransactions(address: AddressType, limit?: number, lt?: number, txhash?: string, to_lt?: number): Promise<any>;
    /**
     * Returns current balance for the given address in nanograms.
     */
    getBalance(address: AddressType): Promise<string>;
    /**
     * Use this method to send serialized boc file:
     * fully packed and serialized external message.
     */
    sendBoc(bytes: Uint8Array): Promise<TonLib>;
    /**
     * Invoke get-method of smart contract.
     */
    call(
    /**
     * Contract address.
     */
    address: AddressType, 
    /**
     * Method name or method ID.
     */
    method: (string | number), 
    /**
     * Array of stack elements.
     */
    params?: any[]): Promise<any>;
}
export default TonWeb;

declare interface TransferBodyParams {
    queryId?: number;
    tokenAmount: BN_2;
    toAddress: Address_2;
    responseAddress: Address_2;
    forwardAmount: BN_2;
    forwardPayload: Uint8Array;
}

export declare type TransferMethod = ((params: TransferMethodParams) => Method);

export declare interface TransferMethodParams {
    secretKey: Uint8Array;
    toAddress: AddressType;
    amount: (BN_2 | number);
    seqno: number;
    payload?: (string | Uint8Array | Cell_3);
    sendMode?: number;
    stateInit?: Cell_3;
}

export declare type WalletContract = WalletContract_2;

/**
 * Abstract standard wallet class.
 */
declare class WalletContract_2<WalletType extends WalletContractOptions = WalletContractOptions, MethodsType extends WalletContractMethods = WalletContractMethods> extends Contract_2<WalletType, MethodsType> {
    constructor(provider: HttpProvider_2, options: WalletContractOptions);
    /**
     * Returns name of the contract.
     */
    getName(): string;
    /**
     * Creates external message for contract initialization.
     */
    createInitExternalMessage(secretKey: Uint8Array): Promise<Query>;
    createTransferMessage(
    /**
     * `nacl.KeyPair.secretKey`
     * @todo: improve the description
     */
    secretKey: Uint8Array, address: AddressType, nanograms: (BN_2 | number), seqno: number, payload?: (string | Uint8Array | Cell_3), sendMode?: number, dummySignature?: boolean, stateInit?: Cell_3): Promise<ExternalMessage>;
    deploy(secretKey: Uint8Array): Method;
    /**
     * Returns cell that contains wallet data.
     */
    protected createDataCell(): Cell_3;
    protected createSigningMessage(seqno?: number): Cell_3;
    protected createExternalMessage(signingMessage: Cell_3, 
    /**
     * `nacl.KeyPair.secretKey`
     * @todo: improve the description
     */
    secretKey: Uint8Array, seqno: number, dummySignature?: boolean): Promise<ExternalMessage>;
    private serializePayload;
}

export declare interface WalletContractMethods extends ContractMethods {
    transfer: TransferMethod;
    seqno: SeqnoMethod;
}

export declare interface WalletContractOptions extends ContractOptions {
    publicKey?: Uint8Array;
}

declare interface WalletData {
    balance: BN_2;
    ownerAddress: Address_2;
    jettonMinterAddress: Address_2;
    tokenWalletCode: Cell_3;
}

export declare type Wallets = Wallets_2;

declare class Wallets_2 {
    readonly provider: HttpProvider_2;
    static all: {
        simpleR1: typeof SimpleWalletContractR1_2;
        simpleR2: typeof SimpleWalletContractR2_2;
        simpleR3: typeof SimpleWalletContractR3_2;
        v2R1: typeof WalletV2ContractR1_2;
        v2R2: typeof WalletV2ContractR2_2;
        v3R1: typeof WalletV3ContractR1_2;
        v3R2: typeof WalletV3ContractR2_2;
        v4R1: typeof WalletV4ContractR1_2;
        v4R2: typeof WalletV4ContractR2_2;
    };
    static list: (typeof SimpleWalletContractR1_2 | typeof WalletV4ContractR1_2)[];
    readonly all: {
        simpleR1: typeof SimpleWalletContractR1_2;
        simpleR2: typeof SimpleWalletContractR2_2;
        simpleR3: typeof SimpleWalletContractR3_2;
        v2R1: typeof WalletV2ContractR1_2;
        v2R2: typeof WalletV2ContractR2_2;
        v3R1: typeof WalletV3ContractR1_2;
        v3R2: typeof WalletV3ContractR2_2;
        v4R1: typeof WalletV4ContractR1_2;
        v4R2: typeof WalletV4ContractR2_2;
    };
    readonly list: (typeof SimpleWalletContractR1_2 | typeof WalletV4ContractR1_2)[];
    readonly defaultVersion = "v3R1";
    readonly default: typeof WalletV3ContractR1_2;
    constructor(provider: HttpProvider_2);
    create(options: any): WalletV3ContractR1_2;
}

/**
 * Known wallet types.
 */
declare type WalletType = ('wallet v1 r1' | 'wallet v1 r2' | 'wallet v1 r3' | 'wallet v2 r1' | 'wallet v2 r2' | 'wallet v3 r1' | 'wallet v3 r2' | 'wallet v4 r1' | 'wallet v4 r2');

declare class WalletV2ContractBase extends WalletContract_2 {
    protected createSigningMessage(seqno?: number): Cell_3;
}

export declare type WalletV2ContractR1 = WalletV2ContractR1_2;

declare class WalletV2ContractR1_2 extends WalletV2ContractBase {
    constructor(provider: HttpProvider_2, options: ContractOptions);
    getName(): string;
}

export declare type WalletV2ContractR2 = WalletV2ContractR2_2;

declare class WalletV2ContractR2_2 extends WalletV2ContractBase {
    constructor(provider: HttpProvider_2, options: ContractOptions);
    getName(): string;
}

declare class WalletV3ContractBase extends WalletContract_2<WalletV3ContractOptions> {
    protected createSigningMessage(seqno?: number): Cell_3;
    protected createDataCell(): Cell_3;
}

export declare interface WalletV3ContractOptions extends WalletContractOptions {
    walletId?: number;
}

export declare type WalletV3ContractR1 = WalletV3ContractR1_2;

declare class WalletV3ContractR1_2 extends WalletV3ContractBase {
    constructor(provider: HttpProvider_2, options: WalletV3ContractOptions);
    getName(): string;
}

export declare type WalletV3ContractR2 = WalletV3ContractR2_2;

declare class WalletV3ContractR2_2 extends WalletV3ContractBase {
    constructor(provider: HttpProvider_2, options: WalletV3ContractOptions);
    getName(): string;
}

declare class WalletV4ContractBase<WalletType extends WalletV4ContractOptions = WalletV4ContractOptions, MethodsType extends WalletV4ContractMethods = WalletV4ContractMethods> extends WalletContract_2<WalletType, MethodsType> {
    getPublicKey(): Promise<BN_2>;
    protected createSigningMessage(seqno?: number, withoutOp?: boolean): Cell_3;
    protected createDataCell(): Cell_3;
}

export declare interface WalletV4ContractMethods extends WalletContractMethods {
    getPublicKey: () => Promise<BN_2>;
}

export declare interface WalletV4ContractOptions extends WalletContractOptions {
    walletId?: number;
}

export declare type WalletV4ContractR1 = WalletV4ContractR1_2;

declare class WalletV4ContractR1_2 extends WalletV4ContractBase {
    constructor(provider: HttpProvider_2, options: WalletV4ContractOptions);
    getName(): string;
}

export declare type WalletV4ContractR2 = WalletV4ContractR2_2;

declare class WalletV4ContractR2_2 extends WalletV4ContractBase<WalletV4ContractOptions, WalletV4ContractR2Methods> {
    constructor(provider: HttpProvider_2, options: WalletV4ContractOptions);
    getName(): string;
    deployAndInstallPlugin(params: DeployAndInstallPluginParams): Promise<ExternalMessage>;
    installPlugin(params: SetPluginParams): Promise<ExternalMessage>;
    removePlugin(params: SetPluginParams): Promise<ExternalMessage>;
    getWalletId(): Promise<number>;
    isPluginInstalled(pluginAddress: AddressType): Promise<boolean>;
    /**
     * Returns plugins addresses.
     */
    getPluginsList(): Promise<string[]>;
    private setPlugin;
}

export declare interface WalletV4ContractR2Methods extends WalletV4ContractMethods {
    deployAndInstallPlugin: (params: DeployAndInstallPluginParams) => Method;
    installPlugin: (params: SetPluginParams) => Method;
    removePlugin: (params: SetPluginParams) => Method;
    getWalletId: () => Promise<number>;
    isPluginInstalled: (pluginAddress: AddressType) => Promise<boolean>;
    getPluginsList: () => Promise<string[]>;
}

declare type Workchain = (WorkchainId | number);

declare enum WorkchainId {
    Master = -1,
    Basic = 0
}


export * from "@ton.js/types";

export { }
