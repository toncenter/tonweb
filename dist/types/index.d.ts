import { AddressType } from './utils/Address';
import * as utils from './utils';
export declare type Address = any;
export declare type Transaction = any;
export declare type CellObject = any;
export declare type SliceObject = any;
export declare type StackElement = (['num', number] | ['cell', CellObject] | ['slice', SliceObject] | [string, any]);
export default class TonWeb {
    provider: any;
    version: string;
    utils: typeof utils;
    Address: typeof utils.Address;
    boc: any;
    Contract: any;
    BlockSubscription: any;
    InMemoryBlockStorage: any;
    wallet: any;
    lockupWallet: any;
    constructor(provider?: any);
    getTransactions(address: AddressType, limit?: number, lt?: number, txhash?: string, to_lt?: number): Promise<Transaction[]>;
    getBalance(address: AddressType): Promise<string>;
    sendBoc(bytes: Uint8Array): Promise<any>;
    call(address: AddressType, method: (string | number), params?: StackElement[]): Promise<any>;
    static version: string;
    static utils: typeof utils;
    static Address: typeof utils.Address;
    static boc: any;
    static HttpProvider: any;
    static Contract: any;
    static Wallets: any;
    static LockupWallets: any;
    static SubscriptionContract: any;
    static BlockSubscription: any;
    static InMemoryBlockStorage: any;
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
}
