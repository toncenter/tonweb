import BN from 'bn.js';
import nacl from 'tweetnacl';
import { HttpProvider, StackElement } from './providers';
export { CellObject, EstimateFeeBody, HttpProviderOptions, SliceObject, StackElement, } from './providers';
import { BlockSubscription, InMemoryBlockStorage } from './providers/block-subscription';
export { LogFunction, BlockHandler, BlockSubscriptionOptions, ShardBlock, BlockStorage, } from './providers/block-subscription';
import { Address, AddressType } from './utils/Address';
export { AddressType } from './utils/Address';
import * as boc from './boc';
import { Contract } from './contract/contract';
export { ContractMethods, ContractOptions, Method, Query, StateInit, } from './contract/contract';
import { Wallets } from './contract/wallet/wallets';
export { DeployMethod, ExternalMessage, SeqnoMethod, SeqnoMethodResult, TransferMethod, TransferMethodParams, WalletContractMethods, WalletContractOptions, } from './contract/wallet/wallet-contract';
export { WalletV3ContractOptions, } from './contract/wallet/v3/wallet-v3-contract-base';
export { WalletV4ContractOptions, WalletV4ContractMethods, } from './contract/wallet/v4/wallet-v4-contract-base';
export { WalletV4ContractR2Methods, DeployAndInstallPluginParams, SetPluginParams, } from './contract/wallet/v4/wallet-v4-contract-r2';
export default class TonWeb {
    provider: HttpProvider;
    static version: string;
    static utils: {
        BN: typeof BN;
        nacl: nacl;
        Address: typeof Address;
        sha256(bytes: Uint8Array): Promise<ArrayBuffer>;
        toNano(amount: string | number | BN): BN;
        fromNano(amount: string | number | BN): string;
        bytesToHex(buffer: Uint8Array): string;
        hexToBytes(hex: string): Uint8Array;
        stringToBytes(str: string, size?: number): Uint8Array;
        crc32c(bytes: Uint8Array): Uint8Array;
        crc16(data: ArrayLike<number>): Uint8Array;
        concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array;
        compareBytes(a: Uint8Array, b: Uint8Array): boolean; /**
         * Array of stack elements.
         */
        bytesToBase64(bytes: Uint8Array): string;
        base64toString(base64: string): string;
        stringToBase64(str: string): string;
        base64ToBytes(base64: string): Uint8Array;
        readNBytesUIntFromArray(n: number, ui8array: Uint8Array): number;
    };
    static Address: typeof Address;
    static boc: typeof boc;
    static HttpProvider: typeof HttpProvider;
    static Contract: typeof Contract;
    static Wallets: typeof Wallets;
    static LockupWallets: any;
    static SubscriptionContract: any;
    static BlockSubscription: typeof BlockSubscription;
    static InMemoryBlockStorage: typeof InMemoryBlockStorage;
    static ledger: {
        TransportWebUSB: any;
        TransportWebHID: any;
        BluetoothTransport: any;
        AppTon: any;
    };
    static token: {
        nft: any;
        ft: any;
        jetton: any;
    };
    version: string;
    utils: {
        BN: typeof BN;
        nacl: nacl;
        Address: typeof Address;
        sha256(bytes: Uint8Array): Promise<ArrayBuffer>;
        toNano(amount: string | number | BN): BN;
        fromNano(amount: string | number | BN): string;
        bytesToHex(buffer: Uint8Array): string;
        hexToBytes(hex: string): Uint8Array;
        stringToBytes(str: string, size?: number): Uint8Array;
        crc32c(bytes: Uint8Array): Uint8Array;
        crc16(data: ArrayLike<number>): Uint8Array;
        concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array;
        compareBytes(a: Uint8Array, b: Uint8Array): boolean; /**
         * Array of stack elements.
         */
        bytesToBase64(bytes: Uint8Array): string;
        base64toString(base64: string): string;
        stringToBase64(str: string): string;
        base64ToBytes(base64: string): Uint8Array;
        readNBytesUIntFromArray(n: number, ui8array: Uint8Array): number;
    };
    Address: typeof Address;
    boc: typeof boc;
    Contract: typeof Contract;
    BlockSubscription: typeof BlockSubscription;
    InMemoryBlockStorage: typeof InMemoryBlockStorage;
    wallet: Wallets;
    lockupWallet: any;
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
