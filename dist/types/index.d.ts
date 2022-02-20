import HttpProvider, { StackElement } from './providers';
export { CellObject, EstimateFeeBody, HttpProviderOptions, SliceObject, StackElement, } from './providers';
import { AddressType } from './utils/Address';
export { AddressType } from './utils/Address';
import * as utils from './utils';
export default class TonWeb {
    provider: HttpProvider;
    static version: string;
    static utils: typeof utils;
    static Address: typeof utils.Address;
    static boc: any;
    static HttpProvider: typeof HttpProvider;
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
    version: string;
    utils: typeof utils;
    Address: typeof utils.Address;
    boc: any;
    Contract: any;
    BlockSubscription: any;
    InMemoryBlockStorage: any;
    wallet: any;
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
