/**
 * This is a single-entry point of the library.
 * All the public runtime symbols as well as types that should
 * be available to the library users must be exported from here.
 * We do not support importing symbols from deep inside the
 * library.
 *
 * All the symbols and their structure that are exported
 * from this file must be 100% compatible with the code
 * in the "master" branch of the library, because, we are
 * using this file to generate typing declarations for the
 * vanilla version of the tonweb.
 *
 * We are importing concrete implementation (runtime symbols)
 * with the dollar prefix (like $BN below), this essentially
 * allows us to use the name w/o prefix to export the types
 * with the same name. We can't just export the runtime symbols
 * directly, because they are not available in the vanilla
 * version of the library — this will lead to incorrect typings.
 * So we have to use this workaround for now. After migrating to
 * TypeScript version completely, we would be able to export all
 * the symbols and their types directly under the same name.
 */
import $BN from 'bn.js';
import nacl from 'tweetnacl';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
export declare type BN = $BN;
import { HttpProvider as $HttpProvider, StackElement } from './providers/http-provider';
export declare type HttpProvider = $HttpProvider;
export { CellObject, EstimateFeeBody, HttpProviderOptions, SliceObject, StackElement, } from './providers/http-provider';
import { BlockSubscription as $BlockSubscription } from './providers/block-subscription/block-subscription';
export declare type BlockSubscription = $BlockSubscription;
export { BlockHandler, BlockSubscriptionOptions, } from './providers/block-subscription/block-subscription';
import { InMemoryBlockStorage as $InMemoryBlockStorage } from './providers/block-subscription/in-memory-block-storage';
export declare type InMemoryBlockStorage = $InMemoryBlockStorage;
export { LogFunction, } from './providers/block-subscription/in-memory-block-storage';
export { ShardBlock, BlockStorage, } from './providers/block-subscription/block-storage';
import { Address as $Address, AddressType } from './utils/address';
export declare type Address = $Address;
export { AddressType, } from './utils/address';
import { base64ToBytes, bytesToBase64, base64toString, stringToBase64 } from './utils/base64';
import { formatTransferUrl, parseTransferUrl } from './utils/transfer-url';
export { ParsedTransferUrl } from './utils/transfer-url';
import { BitString as $BitString } from './boc/bit-string';
export declare type BitString = $BitString;
import { Cell as $Cell } from './boc/cell';
export declare type Cell = $Cell;
import { Contract as $Contract } from './contract/contract';
export declare type Contract = $Contract;
export { ContractMethods, ContractOptions, Method, Query, StateInit, } from './contract/contract';
import { Wallets as $Wallets } from './contract/wallet/wallets';
export declare type Wallets = $Wallets;
import { WalletContract as $WalletContract } from './contract/wallet/wallet-contract';
export declare type WalletContract = $WalletContract;
export { ExternalMessage, SeqnoMethod, SeqnoMethodResult, TransferMethod, TransferMethodParams, WalletContractMethods, WalletContractOptions, } from './contract/wallet/wallet-contract';
import { SimpleWalletContractR1 as $SimpleWalletContractR1 } from './contract/wallet/simple/simple-wallet-contract-r1';
export declare type SimpleWalletContractR1 = $SimpleWalletContractR1;
export {} from './contract/wallet/simple/simple-wallet-contract-r1';
import { SimpleWalletContractR2 as $SimpleWalletContractR2 } from './contract/wallet/simple/simple-wallet-contract-r2';
export declare type SimpleWalletContractR2 = $SimpleWalletContractR2;
export {} from './contract/wallet/simple/simple-wallet-contract-r2';
import { SimpleWalletContractR3 as $SimpleWalletContractR3 } from './contract/wallet/simple/simple-wallet-contract-r3';
export declare type SimpleWalletContractR3 = $SimpleWalletContractR3;
export {} from './contract/wallet/simple/simple-wallet-contract-r3';
import { WalletV2ContractR1 as $WalletV2ContractR1 } from './contract/wallet/v2/wallet-v2-contract-r1';
export declare type WalletV2ContractR1 = $WalletV2ContractR1;
export {} from './contract/wallet/v2/wallet-v2-contract-r1';
import { WalletV2ContractR2 as $WalletV2ContractR2 } from './contract/wallet/v2/wallet-v2-contract-r2';
export declare type WalletV2ContractR2 = $WalletV2ContractR2;
export {} from './contract/wallet/v2/wallet-v2-contract-r2';
export { WalletV3ContractOptions, } from './contract/wallet/v3/wallet-v3-contract-base';
import { WalletV3ContractR1 as $WalletV3ContractR1 } from './contract/wallet/v3/wallet-v3-contract-r1';
export declare type WalletV3ContractR1 = $WalletV3ContractR1;
export {} from './contract/wallet/v3/wallet-v3-contract-r1';
import { WalletV3ContractR2 as $WalletV3ContractR2 } from './contract/wallet/v3/wallet-v3-contract-r2';
export declare type WalletV3ContractR2 = $WalletV3ContractR2;
export {} from './contract/wallet/v3/wallet-v3-contract-r2';
export { WalletV4ContractOptions, WalletV4ContractMethods, } from './contract/wallet/v4/wallet-v4-contract-base';
import { WalletV4ContractR1 as $WalletV4ContractR1 } from './contract/wallet/v4/wallet-v4-contract-r1';
export declare type WalletV4ContractR1 = $WalletV4ContractR1;
export {} from './contract/wallet/v4/wallet-v4-contract-r1';
import { WalletV4ContractR2 as $WalletV4ContractR2 } from './contract/wallet/v4/wallet-v4-contract-r2';
export declare type WalletV4ContractR2 = $WalletV4ContractR2;
export { WalletV4ContractR2Methods, DeployAndInstallPluginParams, SetPluginParams, } from './contract/wallet/v4/wallet-v4-contract-r2';
import { SubscriptionContract as $SubscriptionContract } from './contract/subscription-contract';
export declare type SubscriptionContract = $SubscriptionContract;
export { PayExternalMessage, SubscriptionContractMethods, SubscriptionContractOptions, SubscriptionData, } from './contract/subscription-contract';
import { LockupWalletV1 as $LockupWalletV1 } from './contract/lockup/lockup-wallet-v1';
export declare type LockupWalletV1 = $LockupWalletV1;
export { LockupWalletV1Config, LockupWalletV1Methods, LockupWalletV1Options, } from './contract/lockup/lockup-wallet-v1';
import { AppTon as $LedgerAppTon } from './ledger/app-ton';
export declare type LedgerAppTon = $LedgerAppTon;
export { AppConfiguration, GetAddressResult, GetPublicKeyResult, SignResult, } from './ledger/app-ton';
import { JettonWallet as $JettonWallet } from './contract/token/ft/jetton-wallet';
export declare type JettonWallet = $JettonWallet;
import { JettonMinter as $JettonMinter } from './contract/token/ft/jetton-minter';
export declare type JettonMinter = $JettonMinter;
export { JettonWalletMethods, JettonWalletOptions, } from './contract/token/ft/jetton-wallet';
export { JettonMinterMethods, JettonMinterOptions, } from './contract/token/ft/jetton-minter';
import { NftCollection as $NftCollection } from './contract/token/nft/nft-collection';
export declare type NftCollection = $NftCollection;
export { CreateChangeOwnerBodyParams, CreateGetRoyaltyParamsBodyParams, MintBodyParams, NftCollectionMethods, NftCollectionOptions, NftItemContent, RoyaltyParams, CollectionData, } from './contract/token/nft/nft-collection';
import { NftItem as $NftItem } from './contract/token/nft/nft-item';
export declare type NftItem = $NftItem;
export { CreateGetStaticDataBodyParams, CreateTransferBodyParams, NftItemMethods, NftItemOptions, NftItemData, } from './contract/token/nft/nft-item';
import { NftMarketplace as $NftMarketplace } from './contract/token/nft/nft-marketplace';
export declare type NftMarketplace = $NftMarketplace;
export { NftMarketplaceMethods, NftMarketplaceOptions, } from './contract/token/nft/nft-marketplace';
import { NftSale as $NftSale } from './contract/token/nft/nft-sale';
export declare type NftSale = $NftSale;
export { CreateCancelBodyParams, NftSaleMethods, NftSaleOptions, NftSaleData, } from './contract/token/nft/nft-sale';
export default class TonWeb {
    provider: $HttpProvider;
    static version: string;
    static utils: {
        base64ToBytes: typeof base64ToBytes;
        bytesToBase64: typeof bytesToBase64;
        base64toString: typeof base64toString;
        stringToBase64: typeof stringToBase64;
        BN: typeof $BN;
        nacl: nacl;
        Address: typeof $Address;
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
    static Address: typeof $Address;
    static boc: {
        BitString: typeof $BitString;
        Cell: typeof $Cell;
    };
    static HttpProvider: typeof $HttpProvider;
    static Contract: typeof $Contract;
    static Wallets: typeof $Wallets;
    static LockupWallets: {
        LockupWalletV1: typeof $LockupWalletV1;
        all: {
            'lockup-0.1': typeof $LockupWalletV1;
        };
        list: (typeof $LockupWalletV1)[];
    };
    static SubscriptionContract: typeof $SubscriptionContract;
    static BlockSubscription: typeof $BlockSubscription;
    static InMemoryBlockStorage: typeof $InMemoryBlockStorage;
    static ledger: {
        TransportWebUSB: typeof TransportWebUSB;
        TransportWebHID: any;
        BluetoothTransport: any;
        AppTon: typeof $LedgerAppTon;
    };
    static token: {
        nft: {
            NftCollection: typeof $NftCollection;
            NftItem: typeof $NftItem;
            NftMarketplace: typeof $NftMarketplace;
            NftSale: typeof $NftSale;
        };
        ft: {
            JettonWallet: typeof $JettonWallet;
            JettonMinter: typeof $JettonMinter;
        };
        jetton: {
            JettonWallet: typeof $JettonWallet;
            JettonMinter: typeof $JettonMinter;
        };
    };
    version: string;
    utils: {
        base64ToBytes: typeof base64ToBytes;
        bytesToBase64: typeof bytesToBase64;
        base64toString: typeof base64toString;
        stringToBase64: typeof stringToBase64;
        BN: typeof $BN;
        nacl: nacl;
        Address: typeof $Address;
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
    Address: typeof $Address;
    boc: {
        BitString: typeof $BitString;
        Cell: typeof $Cell;
    };
    Contract: typeof $Contract;
    BlockSubscription: typeof $BlockSubscription;
    InMemoryBlockStorage: typeof $InMemoryBlockStorage;
    wallet: $Wallets;
    lockupWallet: {
        LockupWalletV1: typeof $LockupWalletV1;
        all: {
            'lockup-0.1': typeof $LockupWalletV1;
        };
        list: (typeof $LockupWalletV1)[];
    };
    constructor(provider?: $HttpProvider);
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
