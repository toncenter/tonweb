import { HttpProvider, StackElement } from './providers';
export { CellObject, EstimateFeeBody, HttpProviderOptions, SliceObject, StackElement, } from './providers';
import { BlockSubscription, InMemoryBlockStorage } from './providers/block-subscription';
export { LogFunction, BlockHandler, BlockSubscriptionOptions, ShardBlock, BlockStorage, } from './providers/block-subscription';
import { AddressType } from './utils/Address';
export { AddressType } from './utils/Address';
import * as utils from './utils';
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
    static utils: typeof utils;
    static Address: typeof utils.Address;
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
    utils: typeof utils;
    Address: typeof utils.Address;
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
