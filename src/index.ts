
import { AddressType } from './utils/Address';
import * as utils from './utils';

const boc = require("./boc");
const AppTon = require("./ledger/AppTon");
const HttpProvider = require("./providers").default;
const {Contract} = require("./contract");
const Wallets = require("./contract/wallet").default;
const LockupWallets = require("./contract/lockup").default;
const NFT = require("./contract/token/nft").default;
const JETTON = require("./contract/token/ft").default;
const {BlockSubscription, InMemoryBlockStorage} = require("./providers/blockSubscription");
const {SubscriptionContract} = require("./contract/subscription/index");
const TransportWebUSB = require("@ledgerhq/hw-transport-webusb").default;
const TransportWebHID = require("@ledgerhq/hw-transport-webhid").default;
const BluetoothTransport = require("@ledgerhq/hw-transport-web-ble").default;
const version = '0.0.29';


// @todo: implement/import these types:
export type Address = any;
export type Transaction = any;
export type CellObject = any;
export type SliceObject = any;

export type StackElement = (
  | ['num', number]
  | ['cell', CellObject]
  | ['slice', SliceObject]

  // @todo: remove this when entire type is fully typed
  | [string, any]
);


export default class TonWeb {

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
    async getTransactions(
      address: AddressType,
      limit = 20,
      lt?: number,
      txhash?: string,
      to_lt?: number
    ): Promise<Transaction[]> {
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
    async getBalance(address: AddressType): Promise<string> {
        return this.provider.getBalance(address.toString());
    }

    /**
     * Use this method to send serialized boc file:
     * fully packed and serialized external message.
     */
    async sendBoc(bytes: Uint8Array) {
        return this.provider.sendBoc(utils.bytesToBase64(bytes));
    }



    /**
     * Invoke get-method of smart contract.
     */
    async call(
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

}

if (typeof window !== 'undefined') {
    (window as any).TonWeb = TonWeb;
}
