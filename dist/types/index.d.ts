import BN from 'bn.js';
import nacl from 'tweetnacl';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { HttpProvider, StackElement } from './providers/http-provider';
export { CellObject, EstimateFeeBody, HttpProviderOptions, SliceObject, StackElement, } from './providers/http-provider';
import { BlockSubscription } from './providers/block-subscription/block-subscription';
import { InMemoryBlockStorage } from './providers/block-subscription/in-memory-block-storage';
export { BlockHandler, BlockSubscriptionOptions, } from './providers/block-subscription/block-subscription';
export { LogFunction, } from './providers/block-subscription/in-memory-block-storage';
export { ShardBlock, BlockStorage, } from './providers/block-subscription/block-storage';
import { Address, AddressType } from './utils/address';
export { AddressType } from './utils/address';
import { formatTransferUrl, parseTransferUrl } from './utils/transfer-url';
export { ParsedTransferUrl } from './utils/transfer-url';
import { BitString } from './boc/bit-string';
import { Cell } from './boc/cell';
import { Contract } from './contract/contract';
export { ContractMethods, ContractOptions, Method, Query, StateInit, } from './contract/contract';
import { Wallets } from './contract/wallet/wallets';
export { DeployMethod, ExternalMessage, SeqnoMethod, SeqnoMethodResult, TransferMethod, TransferMethodParams, WalletContractMethods, WalletContractOptions, } from './contract/wallet/wallet-contract';
export { WalletV3ContractOptions, } from './contract/wallet/v3/wallet-v3-contract-base';
export { WalletV4ContractOptions, WalletV4ContractMethods, } from './contract/wallet/v4/wallet-v4-contract-base';
export { WalletV4ContractR2Methods, DeployAndInstallPluginParams, SetPluginParams, } from './contract/wallet/v4/wallet-v4-contract-r2';
import { SubscriptionContract } from './contract/subscription-contract';
export { PayExternalMessage, SubscriptionContractMethods, SubscriptionContractOptions, SubscriptionData, } from './contract/subscription-contract';
import { LockupWalletV1 } from './contract/lockup/lockup-wallet-v1';
export { LockupWalletV1Config, LockupWalletV1Methods, LockupWalletV1Options, } from './contract/lockup/lockup-wallet-v1';
import { AppTon } from './ledger/app-ton';
export { AppConfiguration, GetAddressResult, GetPublicKeyResult, SignResult, } from './ledger/app-ton';
import { JettonWallet } from './contract/token/ft/jetton-wallet';
import { JettonMinter } from './contract/token/ft/jetton-minter';
export { JettonWalletMethods, JettonWalletOptions, } from './contract/token/ft/jetton-wallet';
export { JettonMinterMethods, JettonMinterOptions, } from './contract/token/ft/jetton-minter';
import { NftCollection } from './contract/token/nft/nft-collection';
export { CreateChangeOwnerBodyParams, CreateGetRoyaltyParamsBodyParams, MintBodyParams, NftCollectionMethods, NftCollectionOptions, NftItemContent, RoyaltyParams, CollectionData, } from './contract/token/nft/nft-collection';
import { NftItem } from './contract/token/nft/nft-item';
export { CreateGetStaticDataBodyParams, CreateTransferBodyParams, NftItemMethods, NftItemOptions, NftItemData, } from './contract/token/nft/nft-item';
import { NftMarketplace } from './contract/token/nft/nft-marketplace';
export { NftMarketplaceMethods, NftMarketplaceOptions, } from './contract/token/nft/nft-marketplace';
import { NftSale } from './contract/token/nft/nft-sale';
export { CreateCancelBodyParams, NftSaleMethods, NftSaleOptions, NftSaleData, } from './contract/token/nft/nft-sale';
export default class TonWeb {
    provider: HttpProvider;
    static version: string;
    static utils: {
        BN: typeof BN;
        nacl: nacl;
        Address: typeof Address;
        formatTransferUrl: typeof formatTransferUrl;
        parseTransferUrl: typeof parseTransferUrl;
        sha256(bytes: Uint8Array): Promise<ArrayBuffer>;
        toNano(amount: string | number | BN): BN;
        fromNano(amount: string | number | BN): string;
        bytesToHex(buffer: Uint8Array): string;
        hexToBytes(hex: string): Uint8Array;
        stringToBytes(str: string, size?: number): Uint8Array;
        crc32c(bytes: Uint8Array): Uint8Array;
        crc16(data: ArrayLike<number>): Uint8Array;
        concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array;
        compareBytes(a: Uint8Array, b: Uint8Array): boolean;
        bytesToBase64(bytes: Uint8Array): string;
        base64toString(base64: string): string;
        stringToBase64(str: string): string;
        base64ToBytes(base64: string): Uint8Array;
        readNBytesUIntFromArray(n: number, ui8array: Uint8Array): number;
    };
    static Address: typeof Address;
    static boc: {
        BitString: typeof BitString;
        Cell: typeof Cell;
    };
    static HttpProvider: typeof HttpProvider;
    static Contract: typeof Contract;
    static Wallets: typeof Wallets;
    static LockupWallets: {
        LockupWalletV1: typeof LockupWalletV1;
        all: {
            'lockup-0.1': typeof LockupWalletV1;
        };
        list: (typeof LockupWalletV1)[];
    };
    static SubscriptionContract: typeof SubscriptionContract;
    static BlockSubscription: typeof BlockSubscription;
    static InMemoryBlockStorage: typeof InMemoryBlockStorage;
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
        BN: typeof BN;
        nacl: nacl;
        Address: typeof Address;
        formatTransferUrl: typeof formatTransferUrl;
        parseTransferUrl: typeof parseTransferUrl;
        sha256(bytes: Uint8Array): Promise<ArrayBuffer>;
        toNano(amount: string | BN): BN;
        fromNano(amount: string | BN): string;
        bytesToHex(buffer: Uint8Array): string;
        hexToBytes(hex: string): Uint8Array;
        stringToBytes(str: string, size?: number): Uint8Array;
        crc32c(bytes: Uint8Array): Uint8Array;
        crc16(data: ArrayLike<number>): Uint8Array;
        concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array;
        compareBytes(a: Uint8Array, b: Uint8Array): boolean;
        bytesToBase64(bytes: Uint8Array): string;
        base64toString(base64: string): string;
        stringToBase64(str: string): string;
        base64ToBytes(base64: string): Uint8Array;
        readNBytesUIntFromArray(n: number, ui8array: Uint8Array): number;
    };
    Address: typeof Address;
    boc: {
        BitString: typeof BitString;
        Cell: typeof Cell;
    };
    Contract: typeof Contract;
    BlockSubscription: typeof BlockSubscription;
    InMemoryBlockStorage: typeof InMemoryBlockStorage;
    wallet: Wallets;
    lockupWallet: {
        LockupWalletV1: typeof LockupWalletV1;
        all: {
            'lockup-0.1': typeof LockupWalletV1;
        };
        list: (typeof LockupWalletV1)[];
    };
    constructor(provider?: HttpProvider);
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
    sendBoc(bytes: Uint8Array): Promise<any>;
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
    params?: StackElement[]): Promise<any>;
}
