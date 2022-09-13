/// <reference types="ledgerhq__hw-transport" />
/// <reference types="node" />

import BN from 'bn.js';
import { default as nacl_2 } from 'tweetnacl';
import { SignKeyPair } from 'tweetnacl';
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
export declare type AddressState = ('uninitialized' | 'frozen' | 'active');

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
    transfer(accountNumber: number, wallet: WalletContract_2, toAddress: AddressType, nanograms: (BN | number), seqno: number, addressFormat: number): Promise<Method>;
}

declare function base64ToBytes(base64: string): Uint8Array;

/**
 * @deprecated this function is no longer used by the library
 *             and will be removed in the future
 */
declare function base64toString(base64: string): string;

declare type BigIntInput = (number | string | BN);

declare type Bit = boolean;

declare type BitInput = (boolean | 0 | 1 | number);

export declare type BitString = BitString_2;

/**
 * Represents an array of bits of the fixed length. Allows
 * to serialize various data types to bits and supports
 * single-bit operations. Serves as a data container for
 * {@link Cell | Cells}.
 */
declare class BitString_2 {
    /**
     * Maximum number of bits that this bit-string should hold.
     */
    private maxLength;
    /**
     * Internal representation of the stored bit data.
     * Special bit arithmetic is used to operate on individual
     * bits inside of bytes.
     */
    private bytes;
    /**
     * Internal counter to store the number of bits
     * that are actually used.
     */
    private usedBits;
    /**
     * Returns maximum available length of the bit-string.
     */
    get length(): number;
    /**
     * @param maxLength - A maximum length of the bit-string
     *                    in bits, can't be changed after
     *                    creation.
     */
    constructor(maxLength?: number);
    /**
     * Creates a bit-string using the specified array of
     * bytes.
     *
     * @param bytes - An array of bytes to parse.
     *
     * @param hasCompletion - Flag indicating that the specified
     *                        array of bytes doesn't have a
     *                        completion bits.
     */
    constructor(bytes: Uint8Array, hasCompletion: boolean);
    /**
     * Creates a bit-string using the specified array of
     * bytes and the bit length.
     *
     * @param bytes - An array of bytes to parse.
     *
     * @param bitLength - Length of the bit string in bits.
     *
     * @param maxLength - Maximum available length of the
     *                    bit-string.
     */
    constructor(bytes: Uint8Array, bitLength: number, maxLength: number);
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
     * Appends the specified bit value to the end
     * of the bit-string.
     *
     * @param bit - Bit value
     *              (a boolean or a number: `0` or `1`).
     */
    writeBit(bit: BitInput): void;
    /**
     * Appends the specified array of bit values
     * to the end of the bit-string.
     *
     * @param values - An array of individual bits.
     *                 Each bit should a boolean or
     *                 a number: `0` or `1`.
     */
    writeBitArray(values: BitInput[]): void;
    /**
     * Appends the specified unsigned integer of the
     * specified length in bits to the bit-string.
     *
     * @param value - Unsigned integer value as `number`,
     *                `BN` or `string`. Shouldn't occupy
     *                more bits than specified in
     *                the `bitLength` argument.
     *
     * @param bitLength - The number of bits that should be
     *                    occupied by the specified integer
     *                    in the bit-string.
     */
    writeUint(value: BigIntInput, bitLength: number): void;
    /**
     * Appends the specified signed integer of the specified
     * length in bits to the bit-string.
     *
     * @param value - Integer value as `number`, `BN` or
     *                `string`. Shouldn't occupy
     *                more bits than specified in
     *                the `bitLength` argument.
     *
     * @param bitLength - The number of bits that should be
     *                    occupied by the specified integer
     *                    in the bit-string.
     */
    writeInt(value: BigIntInput, bitLength: number): void;
    /**
     * Appends the specified array of the unsigned 8-bit
     * integers to the bit-string.
     *
     * @param bytes - An `Uint8Array` representing an array
     *                of bytes to append.
     */
    writeBytes(bytes: Uint8Array): void;
    /**
     * Represents the specified multibyte string as bytes
     * and appends them to the end of the bit-string.
     *
     * @param text - A multibyte string to append
     *               to the bit-string. UTF-8 values are
     *               supported.
     */
    writeString(text: string): void;
    /**
     * Writes the specified TON amount in nanotons to the
     * bit-string.
     *
     * @param coins - Unsigned integer value as `number`,
     *                `BN` or `string`, representing the
     *                number of coins to append to the
     *                bit-string.
     */
    writeCoins(coins: BigIntInput): void;
    /**
     * Appends the specified standard internal address
     * to the bit-string.
     *
     * @param address - An instance of
     *                  {@link Address | Address} to append.
     */
    writeAddress(address?: AddressType): void;
    /**
     * Appends the specified bit-string to this bit-string.
     *
     * @param bitString - An instance of another
     *                    {@link BitString | BitString}
     *                    to append.
     */
    writeBitString(bitString: BitString_2): void;
    /**
     * Creates a cloned instance of the bit-string.
     *
     * @returns Returns a new {@link BitString | BitString}
     *          that is exact copy of this one.
     */
    clone(): BitString_2;
    /**
     * Returns the bit-string represented as HEX-string.
     */
    toString(): string;
    /**
     * Returns the bit-string represented as a HEX-string
     * (like in Fift).
     */
    toHex(): string;
    /**
     * Serializes bit-string into a sequence of bytes (octets).
     * The completion bits are added if the number of used
     * bits is not divisible by eight.
     */
    getTopUppedArray(): Uint8Array;
    /* Excluded from this release type: getRawData */
    /**
     * @deprecated - Don't access the underlying bytes directly,
     *               use the {@link CellSlice} instead to parse the
     *               bit-string.
     *
     * This getter is available only for backward-compatibility.
     *
     * @todo remove this getter
     */
    get array(): Uint8Array;
    /**
     * @deprecated: don't use internal cursor directly,
     *              use {@link BitString.getUsedBits | getUsedBits()}
     *              instead.
     *
     * This getter is available only for backward-compatibility.
     *
     * @todo remove this getter
     */
    get cursor(): number;
    /**
     * Returns the bit value at the specified index
     * in the bit-string.
     *
     * @param offset - An offset of the bit to read.
     *
     * @deprecated - Use the
     *               {@link CellSlice.loadBit() | loadBit()}
     *               instead.
     *
     * @todo: remove this method
     */
    get(offset: number): Bit;
    /**
     * Sets the bit at the specified offset.
     *
     * @param offset - A bit offset of the bit to set.
     *
     * @deprecated Don't manipulate the bits directly,
     *             use `write*` methods instead.
     *
     * @todo: remove this method
     */
    on(offset: number): void;
    /**
     * Clears the bit at the specified index.
     *
     * @param offset - A bit offset of the bit to clear.
     *
     * @deprecated Don't manipulate the bits directly,
     *             use `write*` methods instead.
     *
     * @todo: remove this method
     */
    off(offset: number): void;
    /**
     * Toggles the bit at the specified offset.
     *
     * @param offset - A bit offset of the bit to toggle.
     *
     * @deprecated Don't manipulate the bits directly,
     *             use `write*` methods instead.
     *
     * @todo: remove this method
     */
    toggle(offset: number): void;
    /**
     * Iterates the bits of the bit-string and calls the
     * specified user function for each bit, passing in
     * the value.
     *
     * @param callback - A callback function to execute
     *                   for each sequential bit.
     *
     * @deprecated Use the native Slice iterator
     *             to iterate over bits instead.
     *
     * @todo: remove this method
     */
    forEach(callback: (bit: Bit) => void): void;
    /**
     * Appends the specified unsigned 8-bit integer to the
     * bit-string.
     *
     * @param value - Unsigned integer value as `number`,
     *                `BN` or `string`. Shouldn't occupy
     *                more than 8 bits.
     *
     * @deprecated Use the
     *             {@link BitString.writeUint() | writeUint(value, 8)}
     *             instead.
     */
    writeUint8(value: BigIntInput): void;
    /**
     * Appends the specified amount of nanograms to the
     * bit-string.
     *
     * @param nanograms - Unsigned integer value as `number`,
     *                    `BN` or `string`, representing the
     *                    number of nanograms to append to the
     *                    bit-string.
     *
     * @deprecated: Use the
     *              {@link BitString.writeCoins() | writeCoins()}
     *              instead.
     */
    writeGrams(nanograms: BigIntInput): void;
    /**
     * Parses the specified array of bytes and replaces
     * bit-string data with it.
     *
     * @param bytes - An array of bytes to parse.
     *
     * @param noCompletion - Flag indicating that the specified
     *                       array of bytes doesn't have a
     *                       completion bits.
     *
     * @deprecated Use the constructor with bytes argument.
     */
    setTopUppedArray(bytes: Uint8Array, noCompletion?: boolean): void;
    /**
     * Sets the bit at the specified offset
     * in the used bounds of the bit-string.
     *
     * @param offset - An offset of the bit to set.
     */
    private setBit;
    /**
     * Clears the bit at the specified index
     * in the used bounds of the bit-string.
     *
     * @param offset - A bit offset of the bit to clear.
     */
    private clearBit;
    /**
     * Toggles the bit at the specified offset
     * in the used bounds of the bit-string.
     *
     * @param offset - A bit offset of the bit to toggle.
     */
    private toggleBit;
    /**
     * Returns value of the bit at the specified offset
     * in the used bounds of the bit-string.
     *
     * @param offset - Offset in bits from which to start
     *                 reading data.
     */
    private readBit;
    private allocateBytes;
    /**
     * Increases used bits by the specified amount of bits.
     *
     * @throws Error
     * Throws error when maximum BitString length is exceeded.
     */
    private allocateBits;
    /**
     * Checks if the specified offset is in used bounds
     * of the bit-string.
     *
     * @throws Error
     * Throws errors when offset is invalid
     * or is out of used bounds.
     */
    private checkOffsetOrThrow;
    /**
     * Parses the specified array of bytes and replaces
     * bit-string data with it.
     *
     * @param bytes - An array of bytes to parse.
     *
     * @param hasCompletion - Flag indicating that the specified
     *                       array of bytes doesn't have a
     *                       completion bits.
     */
    private setBytes;
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

export { BN }

declare function bytesToBase64(bytes: Uint8Array): string;

/**
 * Converts the specified bytes array to hex string
 * using lookup table.
 */
declare function bytesToHex(buffer: Uint8Array): string;

export declare type Cell = Cell_3;

declare type Cell_2 = {
    bytes: TonLib.Combinators.Tvm.StackEntryCell['cell']['bytes'];
    object: CellSerialized;
};

declare class Cell_3 {
    readonly bits: BitString_2;
    refs: Cell_3[];
    isExotic: boolean;
    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns root cells.
     *
     * @param serializedBoc - HEX string or array of bytes
     *
     * @returns List of root cells
     */
    static fromBoc(serializedBoc: SerializedBoc): Cell_3[];
    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns one root cell.
     *
     * @param serializedBoc - HEX string or array of bytes
     *
     * @returns One root cell
     *
     * @throws Error
     * Throws if BOC contains multiple root cells.
     */
    static oneFromBoc(serializedBoc: SerializedBoc): Cell_3;
    /**
     * Writes the specified cell to this cell.
     */
    writeCell(cell: Cell_3): void;
    /**
     * Returns cell's (De Bruijn) level, which affects
     * the number of higher hashes it has.
     *
     * @todo rename to `getLevel()`
     */
    getMaxLevel(): number;
    /**
     * @todo add description
     */
    isExplicitlyStoredHashes(): number;
    /**
     * Returns the cell's max depth, by inspecting
     * its children.
     */
    getMaxDepth(): number;
    /**
     * Returns standard cell representation.
     * Used for unique hash calculation.
     *
     * @todo should it be public?
     */
    getRepr(): Promise<Uint8Array>;
    /**
     * Returns cell's descriptors data.
     *
     * @todo should it be public?
     */
    getDataWithDescriptors(): Uint8Array;
    /**
     * Returns cell's references descriptor.
     *
     * @todo should it be public?
     */
    getRefsDescriptor(): Uint8Array;
    /**
     * Returns cell's bits descriptor.
     */
    getBitsDescriptor(): Uint8Array;
    /**
     * Returns unique hash of the cell representation.
     */
    hash(): Promise<CellHash>;
    /* Excluded from this release type: hashBase64 */
    /**
     * Recursively prints cell's content (like Fift).
     *
     * @property indent - A string containing spaces used
     *                    for indentation
     */
    print(indent?: string): string;
    /**
     * Converts cell with all it's content to Bag of Cells (BOC).
     */
    toBoc(hasIdx?: boolean, hashCrc32?: boolean, hasCacheBits?: boolean, flags?: number): Promise<Uint8Array>;
    /**
     * Returns a slice with this cell's data that
     * allows you to parse it.
     */
    parse(): CellSlice;
    private getMaxDepthAsArray;
    private index;
    private serializeForBoc;
    private bocSerializationSize;
    private checkForCyclesOrThrow;
}

declare type CellHash = Uint8Array;

declare type CellHashBase64 = string;

declare interface CellSerialized {
    data: {
        b64: string;
        len: number;
    };
    refs: CellSerialized[];
}

/* Excluded from this release type: CellSlice */

declare function compareBytes(a: Uint8Array, b: Uint8Array): boolean;

/**
 * Concatenates two byte arrays together.
 */
declare function concatBytes(bytes1: Uint8Array, bytes2: Uint8Array): Uint8Array;

export declare type Contract = Contract_2;

declare class Contract_2<OptionsType extends ContractOptions = ContractOptions, MethodsType extends ContractMethods = ContractMethods> {
    readonly provider: HttpProvider_2;
    readonly options: OptionsType;
    static createStateInit(code: Cell_3, data: Cell_3, library?: undefined, splitDepth?: undefined, ticktock?: undefined): Cell_3;
    static createInternalMessageHeader(dest: AddressType, nanograms?: (number | BN), ihrDisabled?: boolean, bounce?: boolean, bounced?: boolean, src?: AddressType, currencyCollection?: undefined, ihrFees?: (number | BN), fwdFees?: (number | BN), createdLt?: (number | BN), createdAt?: (number | BN)): Cell_3;
    static createExternalMessageHeader(dest: AddressType, src?: AddressType, importFee?: (number | BN)): Cell_3;
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

declare function crc16(data: ArrayLike<number>): Uint8Array;

declare function crc32c(bytes: Uint8Array): Uint8Array;

declare function createAdnlAddressRecord(adnlAddress: BN): Cell_3;

declare function createNextResolverRecord(address: Address_2): Cell_3;

declare function createSmartContractAddressRecord(address: Address_2): Cell_3;

export declare interface DeployAndInstallPluginParams {
    secretKey: Uint8Array;
    seqno: number;
    pluginWc: number;
    amount: BN;
    stateInit: Cell_3;
    body: Cell_3;
}

export declare class Dns {
    private readonly provider;
    static resolve: typeof dnsResolve;
    static createSmartContractAddressRecord: typeof createSmartContractAddressRecord;
    static createAdnlAddressRecord: typeof createAdnlAddressRecord;
    static createNextResolverRecord: typeof createNextResolverRecord;
    static parseNextResolverRecord: typeof parseNextResolverRecord;
    static parseSmartContractAddressRecord: typeof parseSmartContractAddressRecord;
    static DNS_CATEGORY_NEXT_RESOLVER: "dns_next_resolver";
    static DNS_CATEGORY_WALLET: "wallet";
    static DNS_CATEGORY_SITE: "site";
    constructor(provider: HttpProvider_2);
    /**
     * Returns address of the root DNS smart contract
     * based on the network used.
     */
    getRootDnsAddress(): Promise<Address_2>;
    /**
     * Makes a call to "dnsresolve" get method of the root
     * smart contract to resolve the specified domain name
     * and category. Makes recursive calls if `oneStep`
     * flag is not set.
     *
     * @param domain - e.g. "sub.alice.ton".
     * @param category - category of requested DNS record,
     *                   omit for all categories.
     * @param oneStep - Whether to not resole recursively.
     */
    resolve(domain: string, category?: DnsCategory, oneStep?: boolean): Promise<DnsResolveResponse>;
    /**
     * Returns wallet address for the specified domain name.
     *
     * @param domain - e.g. "sub.alice.ton".
     */
    getWalletAddress(domain: string): Promise<Address_2 | null>;
}

declare const DnsCategories: {
    readonly NextResolver: "dns_next_resolver";
    readonly Wallet: "wallet";
    readonly Site: "site";
};

declare type DnsCategory = Values<typeof DnsCategories>;

/**
 * Implementation of the DNS collection smart contract.
 *
 * Contract source code:
 * {@link https://github.com/ton-blockchain/dns-contract/blob/main/func/nft-collection.fc | nft-collection.fc}
 */
export declare namespace DnsCollection {
    export interface Options extends ContractOptions {
        collectionContent: Cell_3;
        dnsItemCodeHex: string;
        address?: AddressType;
        code?: Cell_3;
    }
    export interface Methods extends ContractMethods {
        getCollectionData(): Promise<CollectionData>;
        getNftItemAddressByIndex(): Promise<Address_2>;
        getNftItemContent(): Promise<DnsItem.Data>;
        resolve(domain: string, category?: DnsCategory, oneStep?: boolean): Promise<DnsResolveResponse>;
    }
    export interface CollectionData {
        collectionContentUri: string;
        collectionContent: Cell_3;
        ownerAddress: null;
        nextItemIndex: 0;
    }
}

/**
 * DNS collection contract that is based on NFT collection.
 *
 * @todo extend NftCollection?
 */
export declare class DnsCollection extends Contract_2<DnsCollection.Options, DnsCollection.Methods> {
    constructor(provider: HttpProvider_2, options: DnsCollection.Options);
    /**
     * Returns DNS collection's data.
     */
    getCollectionData(): (Promise<DnsCollection.CollectionData>);
    getNftItemContent(nftItem: DnsItem): (Promise<DnsItem.Data>);
    /**
     * Returns DNS (NFT) item address by the specified index.
     *
     * @param index - Index of the DNS (NFT) item.
     */
    getNftItemAddressByIndex(index: BN): (Promise<Address_2>);
    /**
     * Makes a call to "dnsresolve" get method of this smart
     * contract to resolve the specified domain name
     * and category. Makes recursive calls if `oneStep` flag
     * is not set.
     *
     * @param domain - Domain name.
     * @param category - DNS resolution category.
     * @param oneStep - Whether to not resolve recursively.
     */
    resolve(domain: string, category?: DnsCategory, oneStep?: boolean): Promise<DnsResolveResponse>;
    /**
     * @override
     *
     * @returns Cell containing DNS collection's data.
     */
    protected createDataCell(): Cell_3;
}

/**
 * Implementation of the DNS item smart contract.
 *
 * Smart contract source code:
 * {@link https://github.com/ton-blockchain/dns-contract/blob/main/func/nft-item.fc | nft-item.fc}
 */
export declare namespace DnsItem {
    export interface Options extends ContractOptions {
        index: BN;
        collectionAddress: Address_2;
        address?: MaybeAddressType;
        code?: Cell_3;
    }
    export interface Methods extends ContractMethods {
        getData: () => Promise<Data>;
        getDomain: () => Promise<string>;
        getAuctionInfo: () => Promise<AuctionInfo>;
        getLastFillUpTime: () => Promise<number>;
        resolve(domain: string, category?: DnsCategory, oneStep?: boolean): Promise<DnsResolveResponse>;
    }
    export interface AuctionInfo {
        maxBidAddress: MaybeAddress;
        maxBidAmount: BN;
        auctionEndTime: number;
    }
    export interface Data {
        isInitialized: boolean;
        index: BN;
        collectionAddress: MaybeAddress;
        ownerAddress: MaybeAddress;
        contentCell: Cell_3;
    }
    export interface TransferBodyParams {
        queryId?: number;
        newOwnerAddress: Address_2;
        forwardAmount?: BN;
        forwardPayload?: Uint8Array;
        responseAddress: Address_2;
    }
}

export declare class DnsItem extends Contract_2<DnsItem.Options, DnsItem.Methods> {
    /**
     * BOC of the DNS item smart contract's source code
     * in HEX format.
     *
     * Contract's source code:
     * {@link https://github.com/ton-blockchain/dns-contract/blob/main/func/nft-item.fc | nft-item.fc}
     */
    static codeHex: string;
    static createChangeContentEntryBody(params: {
        category: DnsCategory;
        value?: MaybeCell;
        queryId?: number;
    }): Promise<Cell_3>;
    constructor(provider: HttpProvider_2, options: DnsItem.Options);
    /**
     * Gets data of the DNS (NFT) item.
     */
    getData(): Promise<DnsItem.Data>;
    createTransferBody(params: DnsItem.TransferBodyParams): Promise<Cell_3>;
    createGetStaticDataBody(params: {
        queryId?: number;
    }): Cell_3;
    /**
     * Returns domain name of this DNS item.
     */
    getDomain(): Promise<string>;
    /**
     * Returns auction information of this DNS item.
     */
    getAuctionInfo(): (Promise<DnsItem.AuctionInfo>);
    /**
     * Returns last fill-up time.
     */
    getLastFillUpTime(): Promise<number>;
    /**
     * Makes a call to "dnsresolve" get method of this smart
     * contract to resolve the specified domain name
     * and category. Makes recursive calls if `oneStep` flag
     * is not set.
     *
     * @param domain - Domain name.
     * @param category - DNS resolution category.
     * @param oneStep - Whether to not resolve recursively.
     */
    resolve(domain: string, category?: DnsCategory, oneStep?: boolean): Promise<DnsResolveResponse>;
    /**
     * @override
     *
     * @returns Cell containing DNS (NFT) item's data.
     */
    protected createDataCell(): Cell_3;
}

/**
 * Makes a call to "dnsresolve" get method of the specified
 * root smart contract to resolve the specified domain name
 * and category. Makes recursive calls if `oneStep` flag
 * is not set.
 *
 * @param provider - An HTTP provider.
 * @param dnsAddress - Address of the DNS smart contract.
 * @param domain - Domain name.
 * @param category - Resolution category.
 * @param oneStep - Whether to not resolve recursively.
 */
declare function dnsResolve(provider: HttpProvider_2, dnsAddress: string, domain: string, category?: DnsCategory, oneStep?: boolean): Promise<DnsResolveResponse>;

declare type DnsResolveResponse = (Cell_3 | Address_2 | null);

declare type EstimateFeeMeta = MethodMeta<EstimateFeeParams, EstimateFeeResult>;

export declare interface EstimateFeeParams {
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

export declare type EstimateFeeResult = TonLib.Types.Query.Fees;

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
 * @todo pass all the parts as a single argument of `ParsedTransferUrl` type
 */
declare function formatTransferUrl(address: string, amount?: string, text?: string): string;

/**
 * Converts the specified amount from nanocoins to coins.
 */
declare function fromNano(amount: (BN | string)): string;

declare type GetAddressBalanceMeta = MethodMeta<AddressParam, GetAddressBalanceResult>;

export declare type GetAddressBalanceResult = TonLib.Types.Raw.FullAccountState['balance'];

declare type GetAddressInformationMeta = MethodMeta<AddressParam, GetAddressInformationResult>;

export declare interface GetAddressInformationResult extends TonLib.Types.Raw.FullAccountState {
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

export declare type GetBlockHeaderResult = TonLib.Types.Blocks.Header;

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

export declare interface GetBlockTransactionsResult extends TonLib.Types.Blocks.Transactions {
    account?: string;
}

declare type GetExtendedAddressInformationMeta = MethodMeta<AddressParam, GetExtendedAddressInformationResult>;

export declare type GetExtendedAddressInformationResult = TonLib.Types.FullAccountState;

declare type GetMasterchainInfoMeta = MethodMeta<never, GetMasterchainInfoResult>;

export declare type GetMasterchainInfoResult = TonLib.Types.Blocks.MasterchainInfo;

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

export declare type GetTransactionsResult = (GetTransactionsResultTransaction[]);

export declare interface GetTransactionsResultTransaction extends Omit<TonLib.Types.Raw.Transaction, 'in_msg' | 'out_msgs'> {
    in_msg: GetTransactionsResultTransactionMessage;
    out_msgs: GetTransactionsResultTransactionMessage[];
}

export declare type GetTransactionsResultTransactionMessage = (Omit<TonLib.Types.Raw.Transaction['in_msg'], 'source' | 'destination'> & {
    source: TonLib.Types.Raw.Transaction['in_msg']['source']['account_address'];
    destination: TonLib.Types.Raw.Transaction['in_msg']['destination']['account_address'];
    message?: string;
});

declare type GetWalletInformationMeta = MethodMeta<AddressParam, GetWalletInformationResult>;

export declare type GetWalletInformationResult = {
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

/**
 * Converts the specified hex string to bytes array
 * using lookup table.
 */
declare function hexToBytes(hex: string): Uint8Array;

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
     * @todo rename to `runGetMethodRaw()`
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
     * @todo rename to `runGetMethod()`
     *
     * {@link https://toncenter.com/api/v2/#/run%20method/run_get_method_runGetMethod_post}
     *
     * @param address - Contract address
     * @param method - Method name or method ID
     * @param params - Array of stack elements
     */
    call2<ParamsType = RunGetMethodParamsStackItem[], ResultType = ParseResponseResult>(address: string, method: (string | number), params?: RunGetMethodParamsStackItem[]): Promise<ResultType>;
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
     * @todo should we use `Map` here?
     * Map of the processed masterchain blocks:
     * `key` is the block number, while
     * `value` reflects `isProcessed` state.
     */
    private readonly masterBlocks;
    /**
     * @todo should we use `Map` here?
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

export declare namespace JettonMinter {
    export interface Options extends ContractOptions {
        wc?: 0;
        adminAddress: Address_2;
        jettonContentUri: string;
        jettonWalletCodeHex: string;
    }
    export interface Methods extends ContractMethods {
    }
    export interface MintBodyParams {
        jettonAmount: BN;
        destination: Address_2;
        amount: BN;
        queryId?: number;
    }
    export interface JettonData {
        totalSupply: BN;
        isMutable: boolean;
        jettonContentUri: string;
        jettonWalletCode: Cell_3;
        adminAddress?: Address_2;
    }
    export interface ChangeAdminBodyParams {
        newAdminAddress: Address_2;
        queryId?: number;
    }
    export interface EditContentBodyParams {
        jettonContentUri: string;
        queryId?: number;
    }
}

export declare class JettonMinter extends Contract_2<JettonMinter.Options, JettonMinter.Methods> {
    constructor(provider: HttpProvider_2, options: JettonMinter.Options);
    createMintBody(params: JettonMinter.MintBodyParams): Cell_3;
    createChangeAdminBody(params: JettonMinter.ChangeAdminBodyParams): Cell_3;
    createEditContentBody(params: JettonMinter.EditContentBodyParams): Cell_3;
    getJettonData(): (Promise<JettonMinter.JettonData>);
    getJettonWalletAddress(ownerAddress: Address_2): Promise<Address_2>;
    /**
     * Returns cell that contains jetton minter data.
     */
    protected createDataCell(): Cell_3;
}

export declare namespace JettonWallet {
    export interface Options extends ContractOptions {
        wc?: 0;
    }
    export interface Methods extends ContractMethods {
    }
    export interface WalletData {
        balance: BN;
        ownerAddress: Address_2;
        jettonMinterAddress: Address_2;
        jettonWalletCode: Cell_3;
    }
    export interface TransferBodyParams {
        queryId?: number;
        jettonAmount: BN;
        toAddress: Address_2;
        responseAddress: Address_2;
        forwardAmount: BN;
        forwardPayload: Uint8Array;
    }
    export interface BurnBodyParams {
        queryId?: number;
        jettonAmount: BN;
        responseAddress: Address_2;
    }
}

export declare class JettonWallet extends Contract_2<JettonWallet.Options, JettonWallet.Methods> {
    static codeHex: string;
    constructor(provider: HttpProvider_2, options: JettonWallet.Options);
    getData(): Promise<JettonWallet.WalletData>;
    /**
     * @todo should it be async?
     */
    createTransferBody(params: JettonWallet.TransferBodyParams): Promise<Cell_3>;
    /**
     * @todo should it be async?
     */
    createBurnBody(params: JettonWallet.BurnBodyParams): Promise<Cell_3>;
}

declare function keyPairFromSeed(seed: Uint8Array): SignKeyPair;

export declare type LedgerAppTon = AppTon;

export declare type LockupWalletV1 = LockupWalletV1_2;

declare class LockupWalletV1_2 extends WalletContract_2<LockupWalletV1Options, LockupWalletV1Methods> {
    constructor(provider: HttpProvider_2, options: any);
    getName(): string;
    getPublicKey(): Promise<BN>;
    getWalletId(): Promise<number>;
    /**
     * Returns amount of nanograms that can be spent immediately.
     */
    getLiquidBalance(): Promise<BN>;
    /**
     * Returns amount of nanograms that can be spent after
     * the timelock OR to the whitelisted addresses.
     */
    getNominalRestrictedBalance(): Promise<BN>;
    /**
     * Returns amount of nanograms that can be spent after
     * the timelock only (whitelisted addresses not used).
     */
    getNominalLockedBalance(): Promise<BN>;
    /**
     * Returns total amount of nanograms on the contract,
     * nominal restricted value and nominal locked value.
     */
    getBalances(): Promise<[BN, BN, BN]>;
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
    getPublicKey: () => Promise<BN>;
    getWalletId: () => Promise<number>;
    getLiquidBalance: () => Promise<BN>;
    getNominalRestrictedBalance: () => Promise<BN>;
    getNominalLockedBalance: () => Promise<BN>;
}

export declare interface LockupWalletV1Options extends WalletContractOptions {
    walletId?: number;
    config?: LockupWalletV1Config;
}

export declare type LogFunction = (message: string) => void;

declare type MaybeAddress = (Address_2 | null);

declare type MaybeAddressType = (AddressType | null);

declare type MaybeCell = (Cell_3 | null);

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

declare function newKeyPair(): SignKeyPair;

declare function newSeed(): Uint8Array;

export declare namespace NftCollection {
    export interface Options extends ContractOptions {
        ownerAddress?: Address_2;
        collectionContentUri?: string;
        nftItemContentBaseUri?: string;
        nftItemCodeHex?: string;
        royalty?: number;
        royaltyFactor: number;
        royaltyBase: number;
        royaltyAddress?: Address_2;
    }
    export interface Methods extends ContractMethods {
        getCollectionData: () => Promise<NftCollectionData>;
        getNftItemAddressByIndex: (index: number) => Promise<Address_2>;
        getNftItemContent: (nftItem: NftItem) => Promise<NftItemContent>;
        getRoyaltyParams: () => Promise<RoyaltyParams>;
    }
    export interface MintBodyParams {
        itemIndex: number;
        amount: BN;
        itemOwnerAddress: Address_2;
        itemContentUri: string;
        queryId?: number;
    }
    export interface GetRoyaltyParamsBodyParams {
        queryId?: number;
    }
    export interface ChangeOwnerBodyParams {
        queryId?: number;
        newOwnerAddress: Address_2;
    }
    export interface NftCollectionData {
        nextItemIndex: number;
        ownerAddress: Address_2;
        collectionContentUri: string;
    }
    export interface NftItemContent {
        isInitialized: boolean;
        index: number;
        collectionAddress: Address_2;
        ownerAddress: MaybeAddress;
        contentUri?: string;
    }
}

export declare class NftCollection<OptionsType extends NftCollection.Options = NftCollection.Options, MethodsType extends NftCollection.Methods = NftCollection.Methods> extends Contract_2<OptionsType, MethodsType> {
    constructor(provider: HttpProvider_2, options: NftCollection.Options);
    createMintBody(params: NftCollection.MintBodyParams): Cell_3;
    createGetRoyaltyParamsBody(params: NftCollection.GetRoyaltyParamsBodyParams): Cell_3;
    createChangeOwnerBody(params: NftCollection.ChangeOwnerBodyParams): Cell_3;
    createEditContentBody(params: {
        collectionContentUri: string;
        nftItemContentBaseUri: string;
        royalty: number;
        royaltyAddress: Address_2;
        queryId?: number;
    }): Cell_3;
    getCollectionData(): (Promise<NftCollection.NftCollectionData>);
    getNftItemContent(nftItem: NftItem): Promise<NftCollection.NftItemContent>;
    getNftItemAddressByIndex(index: number): Promise<Address_2>;
    getRoyaltyParams(): Promise<RoyaltyParams>;
    /**
     * Returns cell that contains NFT collection data.
     */
    protected createDataCell(): Cell_3;
    private createContentCell;
    private createRoyaltyCell;
}

export declare namespace NftItem {
    export interface Options extends ContractOptions {
        index?: number;
        collectionAddress?: Address_2;
    }
    export interface Methods extends ContractMethods {
        getData: () => Promise<NftItemData>;
    }
    export interface NftItemData {
        isInitialized: boolean;
        index: number;
        collectionAddress: Address_2;
        contentCell: Cell_3;
        ownerAddress?: Address_2;
        contentUri: (string | null);
    }
    export interface TransferBodyParams {
        newOwnerAddress: Address_2;
        responseAddress: Address_2;
        queryId?: number;
        forwardAmount?: BN;
        forwardPayload?: Uint8Array;
    }
    export interface GetStaticDataBodyParams {
        queryId?: number;
    }
}

export declare class NftItem extends Contract_2<NftItem.Options, NftItem.Methods> {
    static codeHex: string;
    constructor(provider: HttpProvider_2, options: NftItem.Options);
    getData(): Promise<NftItem.NftItemData>;
    createTransferBody(params: NftItem.TransferBodyParams): Promise<Cell_3>;
    createGetStaticDataBody(params: NftItem.GetStaticDataBodyParams): Cell_3;
    /**
     * Returns royalty params for a single NFT without
     * a collection.
     */
    getRoyaltyParams(): Promise<RoyaltyParams>;
    /**
     * Returns cell that contains NFT data.
     */
    protected createDataCell(): Cell_3;
}

export declare namespace NftMarketplace {
    export interface Options extends ContractOptions {
        ownerAddress?: Address_2;
        cell?: Cell_3;
    }
    export interface Methods extends ContractMethods {
    }
}

/**
 * Work in progress, will be changed.
 */
export declare class NftMarketplace extends Contract_2<NftMarketplace.Options, NftMarketplace.Methods> {
    constructor(provider: HttpProvider_2, options: NftMarketplace.Options);
    /**
     * Returns cell that contains NFT marketplace data.
     */
    protected createDataCell(): Cell_3;
}

export declare namespace NftSale {
    export interface Options extends ContractOptions {
        marketplaceAddress?: Address_2;
        nftAddress?: Address_2;
        fullPrice?: BN;
        marketplaceFee?: BN;
        royaltyAddress?: Address_2;
        royaltyAmount?: BN;
    }
    export interface Methods extends ContractMethods {
        getData: () => Promise<SaleData>;
    }
    export interface SaleData {
        marketplaceAddress?: Address_2;
        nftAddress?: Address_2;
        nftOwnerAddress?: Address_2;
        fullPrice: any;
        marketplaceFee: any;
        royaltyAddress?: Address_2;
        royaltyAmount: any;
    }
    export interface CancelBodyParams {
        queryId?: number;
    }
}

/**
 * Work in progress, will be changed.
 */
export declare class NftSale extends Contract_2<NftSale.Options, NftSale.Methods> {
    static codeHex: string;
    constructor(provider: HttpProvider_2, options: NftSale.Options);
    getData(): Promise<NftSale.SaleData>;
    createCancelBody(params: NftSale.CancelBodyParams): Promise<Cell_3>;
    /**
     * Returns cell that contains NFT sale data.
     */
    protected createDataCell(): Cell_3;
}

export declare type ParsedJson = (null | string | number | boolean | ParsedJson[] | {
    [key: string]: ParsedJson;
});

export declare interface ParsedTransferUrl {
    address: string;
    amount?: string;
    text?: string;
}

declare function parseNextResolverRecord(cell: Cell_3): (Address_2 | null);

export declare type ParseObjectResult = (BN | Cell_3 | ParseObjectResult[]);

export declare type ParseResponseResult = (ParseResponseStackResult | ParseResponseStackResult[]);

export declare type ParseResponseStackResult = (BN | ParseObjectResult | Cell_3);

declare function parseSmartContractAddressRecord(cell: Cell_3): (Address_2 | null);

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

export declare namespace PaymentChannel {
    export interface Options extends ContractOptions {
        isA: boolean;
        channelId: BN;
        myKeyPair: nacl_2.SignKeyPair;
        hisPublicKey: Uint8Array;
        initBalanceA: BN;
        initBalanceB: BN;
        addressA: Address_2;
        addressB: Address_2;
        closingConfig?: ClosingConfig;
        excessFee?: BN;
    }
    export interface CooperativeCloseChannelParams {
        hisSignature?: Uint8Array;
        balanceA: BN;
        balanceB: BN;
        seqnoA: BN;
        seqnoB: BN;
    }
    export interface CooperativeCommitParams {
        hisSignature?: Uint8Array;
        seqnoA: BN;
        seqnoB: BN;
    }
    export interface ClosingConfig {
        quarantineDuration: number;
        misbehaviorFine: BN;
        conditionalCloseDuration: number;
    }
    export interface SignedCell {
        cell: Cell_3;
        signature: Uint8Array;
    }
    export interface StateParams {
        balanceA: BN;
        balanceB: BN;
        seqnoA: BN;
        seqnoB: BN;
    }
    export interface Data {
        state: number;
        balanceA: BN;
        balanceB: BN;
        publicKeyA: Uint8Array;
        publicKeyB: Uint8Array;
        channelId: BN;
        quarantineDuration: number;
        misbehaviorFine: BN;
        conditionalCloseDuration: number;
        seqnoA: BN;
        seqnoB: BN;
        quarantine?: Cell_3;
        excessFee: BN;
        addressA: Address_2;
        addressB: Address_2;
    }
    export interface WalletParams {
        wallet: WalletContract_2;
        secretKey: Uint8Array;
    }
    export interface InitParams {
        balanceA: BN;
        balanceB: BN;
    }
    export interface TopUpParams {
        coinsA: BN;
        coinsB: BN;
    }
    export interface CloseParams {
        hisSignature: Uint8Array;
        balanceA: BN;
        balanceB: BN;
        seqnoA: BN;
        seqnoB: BN;
    }
    export interface CommitParams {
        hisSignature: Uint8Array;
        seqnoA: BN;
        seqnoB: BN;
    }
    export interface StartUncooperativeCloseParams {
        signedSemiChannelStateA: Cell_3;
        signedSemiChannelStateB: Cell_3;
    }
    export interface ChallengeQuarantinedStateParams {
        signedSemiChannelStateA: Cell_3;
        signedSemiChannelStateB: Cell_3;
    }
    export interface SettleConditionalsParams {
        conditionalsToSettle?: (Cell_3 | null);
    }
    export interface WalletChannel {
        deploy: () => TransferMethod;
        init: (params: InitParams) => TransferMethod;
        topUp: (params: PaymentChannel.TopUpParams) => TransferMethod;
        close: (params: PaymentChannel.CloseParams) => TransferMethod;
        commit: (params: PaymentChannel.CommitParams) => TransferMethod;
        startUncooperativeClose: (params: PaymentChannel.StartUncooperativeCloseParams) => TransferMethod;
        challengeQuarantinedState: (params: PaymentChannel.ChallengeQuarantinedStateParams) => TransferMethod;
        settleConditionals: (params: PaymentChannel.SettleConditionalsParams) => TransferMethod;
        finishUncooperativeClose: () => TransferMethod;
    }
    export interface TransferMethod {
        send: (amount: (BN | number)) => Promise<any>;
        estimateFee: (amount: (BN | number)) => Promise<any>;
    }
}

export declare class PaymentChannel extends Contract_2<PaymentChannel.Options, {}> {
    #private;
    static codeHex: string;
    static STATE_UNINITED: number;
    static STATE_OPEN: number;
    static STATE_CLOSURE_STARTED: number;
    static STATE_SETTLING_CONDITIONALS: number;
    static STATE_AWAITING_FINALIZATION: number;
    constructor(provider: HttpProvider_2, options: PaymentChannel.Options);
    createTopUpBalance(params: PaymentChannel.TopUpParams): Promise<Cell_3>;
    createInitChannel(params: PaymentChannel.InitParams): Promise<PaymentChannel.SignedCell>;
    createCooperativeCloseChannel(params: PaymentChannel.CooperativeCloseChannelParams): Promise<PaymentChannel.SignedCell>;
    createCooperativeCommit(params: PaymentChannel.CooperativeCommitParams): Promise<PaymentChannel.SignedCell>;
    signState(params: PaymentChannel.StateParams): Promise<Uint8Array>;
    verifyState(params: PaymentChannel.StateParams, hisSignature: Uint8Array): Promise<boolean>;
    signClose(params: PaymentChannel.StateParams): Promise<Uint8Array>;
    verifyClose(params: PaymentChannel.StateParams, hisSignature: Uint8Array): Promise<boolean>;
    /**
     * @param params.signedSemiChannelStateA - signed semi-channel state created
     *                                         by `createSignedSemiChannelState()`.
     *
     * @param params.signedSemiChannelStateB - signed semi-channel state created
     *                                         by `createSignedSemiChannelState()`.
     */
    createStartUncooperativeClose(params: {
        signedSemiChannelStateA: Cell_3;
        signedSemiChannelStateB: Cell_3;
    }): Promise<PaymentChannel.SignedCell>;
    /**
     * @param params.signedSemiChannelStateA - signed semi-channel state created
     *                                         by `createSignedSemiChannelState()`.
     *
     * @param params.signedSemiChannelStateB - signed semi-channel state created
     *                                         by `createSignedSemiChannelState()`.
     */
    createChallengeQuarantinedState(params: {
        signedSemiChannelStateA: Cell_3;
        signedSemiChannelStateB: Cell_3;
    }): Promise<PaymentChannel.SignedCell>;
    /**
     * @param params.conditionalsToSettle - A dictionary with uint32 keys and
     *                                      values created by `createConditionalPayment()`.
     */
    createSettleConditionals(params: {
        conditionalsToSettle?: (Cell_3 | null);
    }): Promise<PaymentChannel.SignedCell>;
    createFinishUncooperativeClose(): Promise<Cell_3>;
    getChannelState(): Promise<number>;
    getData(): Promise<PaymentChannel.Data>;
    fromWallet(params: PaymentChannel.WalletParams): PaymentChannel.WalletChannel;
    /**
     * @returns Cell containing payment channel data.
     */
    protected createDataCell(): Cell_3;
    private createOneSignature;
    private createTwoSignature;
    private createSignedSemiChannelState;
}

export declare class Payments {
    readonly provider: HttpProvider_2;
    constructor(provider: HttpProvider_2);
    createChannel(options: PaymentChannel.Options): PaymentChannel;
}

/**
 * @todo this type is created on indirect data
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

declare interface RawBitString {
    bytes: Uint8Array;
    usedBits: number;
}

declare function readNBytesUIntFromArray(n: number, ui8array: Uint8Array): number;

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
export declare type RunGetMethodParamsStackItem = (['num', (number | string)] | ['cell', Cell_2] | ['slice', Slice] | ['tvm.Cell', string] | ['tvm.Slice', string]);

export declare interface RunGetMethodResult extends Omit<TonLib.Types.Smc.RunResult, '@type' | 'stack'> {
    stack: RunGetMethodResultStackItem[];
}

/**
 * Unlike RunGetMethodParamsStackItem, API returns strict types.
 */
export declare type RunGetMethodResultStackItem = (['num', string] | ['cell', Cell_2] | ['tuple', TonLib.Combinators.Tvm.StackEntryTuple['tuple']] | ['list', TonLib.Combinators.Tvm.StackEntryList['list']]);

declare type SendBocMeta = MethodMeta<{
    boc: string;
}, SendBocResult>;

export declare type SendBocResult = TonLib.Types.Ok;

declare type SendQuerySimpleMeta = MethodMeta<SendQuerySimpleParams, SendQuerySimpleResult>;

export declare interface SendQuerySimpleParams {
    address: string;
    body: string;
    init_code?: CellSerialized;
    init_data?: CellSerialized;
}

export declare type SendQuerySimpleResult = TonLib.Types.Ok;

export declare type SeqnoMethod = (() => SeqnoMethodResult);

export declare interface SeqnoMethodResult {
    call: () => Promise<number | undefined>;
}

declare type SerializedBoc = (string | Uint8Array);

export declare interface SetPluginParams {
    secretKey: Uint8Array;
    seqno: number;
    pluginAddress: AddressType;
    amount?: BN;
    queryId?: number;
}

declare function sha256(bytes: Uint8Array): Promise<ArrayBuffer>;

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

export declare type ShardsResult = TonLib.Types.Blocks.Shards;

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

/**
 * @deprecated: this function is no longer used in the library
 *              and will be deleted in the future.
 */
declare function stringToBytes(str: string, size?: number): Uint8Array;

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
    amount?: BN;
    period?: number;
    timeout?: number;
    startAt?: number;
    subscriptionId?: number;
}

export declare interface SubscriptionData {
    wallet: string;
    beneficiary: string;
    amount: BN;
    period: number;
    startAt: number;
    timeout: number;
    lastPayment: number;
    lastRequest: number;
    failedAttempts: number;
    subscriptionId: number;
}

/**
 * Converts the specified amount from coins to nanocoins.
 */
declare function toNano(amount: (BN | string)): BN;

declare class TonWeb {
    provider: HttpProvider_2;
    static version: string;
    static utils: {
        Address: typeof Address_2;
        BN: typeof BN;
        base64ToBytes: typeof base64ToBytes;
        base64toString: typeof base64toString;
        bytesToBase64: typeof bytesToBase64;
        bytesToHex: typeof bytesToHex;
        compareBytes: typeof compareBytes;
        concatBytes: typeof concatBytes;
        crc16: typeof crc16;
        crc32c: typeof crc32c;
        formatTransferUrl: typeof formatTransferUrl;
        fromNano: typeof fromNano;
        hexToBytes: typeof hexToBytes;
        nacl: nacl_2;
        parseTransferUrl: typeof parseTransferUrl;
        readNBytesUIntFromArray: typeof readNBytesUIntFromArray;
        sha256: typeof sha256;
        stringToBase64: typeof stringToBase64;
        stringToBytes: typeof stringToBytes;
        toNano: typeof toNano;
        keyPairFromSeed: typeof keyPairFromSeed;
        newKeyPair: typeof newKeyPair;
        newSeed: typeof newSeed;
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
    static dns: typeof Dns;
    static payments: typeof Payments;
    static ledger: {
        TransportWebUSB: typeof TransportWebUSB;
        TransportWebHID: any;
        BluetoothTransport: any;
        AppTon: typeof AppTon;
    };
    static token: {
        nft: {
            NftCollection: typeof NftCollection;
            NftItem: typeof NftItem;
            NftMarketplace: typeof NftMarketplace;
            NftSale: typeof NftSale;
        };
        ft: {
            JettonWallet: typeof JettonWallet;
            JettonMinter: typeof JettonMinter;
        };
        jetton: {
            JettonWallet: typeof JettonWallet;
            JettonMinter: typeof JettonMinter;
        };
    };
    version: string;
    utils: {
        Address: typeof Address_2;
        BN: typeof BN;
        base64ToBytes: typeof base64ToBytes;
        base64toString: typeof base64toString;
        bytesToBase64: typeof bytesToBase64;
        bytesToHex: typeof bytesToHex;
        compareBytes: typeof compareBytes;
        concatBytes: typeof concatBytes;
        crc16: typeof crc16;
        crc32c: typeof crc32c;
        formatTransferUrl: typeof formatTransferUrl;
        fromNano: typeof fromNano;
        hexToBytes: typeof hexToBytes;
        nacl: nacl_2;
        parseTransferUrl: typeof parseTransferUrl;
        readNBytesUIntFromArray: typeof readNBytesUIntFromArray;
        sha256: typeof sha256;
        stringToBase64: typeof stringToBase64;
        stringToBytes: typeof stringToBytes;
        toNano: typeof toNano;
        keyPairFromSeed: typeof keyPairFromSeed;
        newKeyPair: typeof newKeyPair;
        newSeed: typeof newSeed;
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
    payments: Payments;
    lockupWallet: {
        LockupWalletV1: typeof LockupWalletV1_2;
        all: {
            'lockup-0.1': typeof LockupWalletV1_2;
        };
        list: (typeof LockupWalletV1_2)[];
    };
    dns: Dns;
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

export declare type TransferMethod = ((params: TransferMethodParams) => Method);

export declare interface TransferMethodParams {
    secretKey: Uint8Array;
    toAddress: AddressType;
    amount: (BN | number);
    seqno: number;
    payload?: (string | Uint8Array | Cell_3);
    sendMode?: number;
    stateInit?: Cell_3;
}

declare type Values<Type> = Type[keyof Type];

export declare type WalletContract = WalletContract_2;

/**
 * Abstract standard wallet class.
 */
declare class WalletContract_2<OptionsType extends WalletContractOptions = WalletContractOptions, MethodsType extends WalletContractMethods = WalletContractMethods> extends Contract_2<OptionsType, MethodsType> {
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
     * @todo improve the description
     */
    secretKey: Uint8Array, address: AddressType, nanograms: (BN | number), seqno: number, payload?: (string | Uint8Array | Cell_3), sendMode?: number, dummySignature?: boolean, stateInit?: Cell_3): Promise<ExternalMessage>;
    deploy(secretKey: Uint8Array): Method;
    /**
     * Returns cell that contains wallet data.
     */
    protected createDataCell(): Cell_3;
    protected createSigningMessage(seqno?: number): Cell_3;
    protected createExternalMessage(signingMessage: Cell_3, 
    /**
     * `nacl.KeyPair.secretKey`
     * @todo improve the description
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
export declare type WalletType = ('wallet v1 r1' | 'wallet v1 r2' | 'wallet v1 r3' | 'wallet v2 r1' | 'wallet v2 r2' | 'wallet v3 r1' | 'wallet v3 r2' | 'wallet v4 r1' | 'wallet v4 r2');

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
    getPublicKey(): Promise<BN>;
    protected createSigningMessage(seqno?: number, withoutOp?: boolean): Cell_3;
    protected createDataCell(): Cell_3;
}

export declare interface WalletV4ContractMethods extends WalletContractMethods {
    getPublicKey: () => Promise<BN>;
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
