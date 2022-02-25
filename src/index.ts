
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import BluetoothTransport from '@ledgerhq/hw-transport-web-ble';

import HttpProvider, { StackElement } from './providers';

export {
    // default as HttpProvider,
    CellObject,
    EstimateFeeBody,
    HttpProviderOptions,
    SliceObject,
    StackElement,

} from './providers';

import {
    BlockSubscription,
    InMemoryBlockStorage,

} from './providers/block-subscription';

export {
    // BlockSubscription,
    // InMemoryBlockStorage,
    LogFunction,
    BlockHandler,
    BlockSubscriptionOptions,
    ShardBlock,
    BlockStorage,

} from './providers/block-subscription';

import { AddressType } from './utils/Address';
export { AddressType } from './utils/Address';

import * as utils from './utils';

import * as boc from './boc';

const AppTon = require('./ledger/AppTon');
const {Contract} = require('./contract');
const Wallets = require('./contract/wallet').default;
const LockupWallets = require('./contract/lockup').default;
const NFT = require('./contract/token/nft').default;
const JETTON = require('./contract/token/ft').default;
const {SubscriptionContract} = require('./contract/subscription/index');


const version = '0.0.32';


export default class TonWeb {

    public static version = version;
    public static utils = utils;
    public static Address = utils.Address;
    public static boc = boc;
    public static HttpProvider = HttpProvider;
    public static Contract = Contract;
    public static Wallets = Wallets;
    public static LockupWallets = LockupWallets;
    public static SubscriptionContract = SubscriptionContract;
    public static BlockSubscription = BlockSubscription;
    public static InMemoryBlockStorage = InMemoryBlockStorage;

    public static ledger = {
        TransportWebUSB,
        TransportWebHID,
        BluetoothTransport,
        AppTon,
    };

    public static token = {
        nft: NFT,
        ft: JETTON,
        jetton: JETTON,
    }


    public version = version;
    public utils = utils;
    public Address = utils.Address;
    public boc = boc;
    public Contract = Contract;
    public BlockSubscription = BlockSubscription;
    public InMemoryBlockStorage = InMemoryBlockStorage;
    public wallet = new Wallets(this.provider);
    public lockupWallet = LockupWallets;


    constructor(public provider = new HttpProvider()) {
    }


    /**
     * Use this method to get transaction history of a given address.
     * Returns array of transaction objects.
     */
    public async getTransactions(
      address: AddressType,
      limit = 20,
      lt?: number,
      txhash?: string,
      to_lt?: number

    ): Promise<any> {

        return this.provider.getTransactions(
          address.toString(),
          limit,
          lt,
          txhash,
          to_lt
        );

    };

    /**
     * Returns current balance for the given address in nanograms.
     */
    public async getBalance(address: AddressType): Promise<string> {
        return this.provider.getBalance(address.toString());
    }

    /**
     * Use this method to send serialized boc file:
     * fully packed and serialized external message.
     */
    public async sendBoc(bytes: Uint8Array) {
        return this.provider.sendBoc(utils.bytesToBase64(bytes));
    }

    /**
     * Invoke get-method of smart contract.
     */
    public async call(
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
      params: StackElement[] = []

    ): Promise<any> {

        // @todo: type return value

        return this.provider.call(
          address.toString(),
          method,
          params
        );

    }

}

if (typeof window !== 'undefined') {
    (window as any).TonWeb = TonWeb;
}
