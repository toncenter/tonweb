
import BN from 'bn.js';
import nacl from 'tweetnacl';
import BluetoothTransport from '@ledgerhq/hw-transport-web-ble';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';


//===========//
// PROVIDERS //
//===========//

import { HttpProvider, StackElement } from './providers/http-provider';

export {
    CellObject,
    EstimateFeeBody,
    // HttpProvider,
    HttpProviderOptions,
    SliceObject,
    StackElement,
    // defaultHost,

} from './providers/http-provider';

import { BlockSubscription } from './providers/block-subscription/block-subscription';

import { InMemoryBlockStorage } from './providers/block-subscription/in-memory-block-storage';

export {
    // BlockSubscription,
    BlockHandler,
    BlockSubscriptionOptions,

} from './providers/block-subscription/block-subscription';

export {
    // InMemoryBlockStorage,
    LogFunction,

} from './providers/block-subscription/in-memory-block-storage';

export {
    ShardBlock,
    BlockStorage,

} from './providers/block-subscription/block-storage';


//=======//
// UTILS //
//=======//

import { Address, AddressType } from './utils/Address';
export { AddressType } from './utils/Address';

import * as utilsExports from './utils/common';

import { formatTransferUrl, parseTransferUrl } from './utils/transfer-url';
export { ParsedTransferUrl } from './utils/transfer-url';


const utils = {
    ...utilsExports,
    BN,
    nacl,
    Address,
    formatTransferUrl,
    parseTransferUrl,
};


//=====//
// BOC //
//=====//

import { BitString } from './boc/bit-string';
import { Cell } from './boc/cell';
const boc = { BitString, Cell };


//==========//
// CONTRACT //
//==========//

import { Contract } from './contract/contract';

export {
    ContractMethods,
    ContractOptions,
    Method,
    Query,
    StateInit,

} from './contract/contract';


//=========//
// WALLETS //
//=========//

import { Wallets } from './contract/wallet/wallets';

export {
    DeployMethod,
    ExternalMessage,
    SeqnoMethod,
    SeqnoMethodResult,
    TransferMethod,
    TransferMethodParams,
    WalletContractMethods,
    WalletContractOptions,

} from './contract/wallet/wallet-contract';

export {
    WalletV3ContractOptions,

} from './contract/wallet/v3/wallet-v3-contract-base';

export {
    WalletV4ContractOptions,
    WalletV4ContractMethods,

} from './contract/wallet/v4/wallet-v4-contract-base';

export {
    WalletV4ContractR2Methods,
    DeployAndInstallPluginParams,
    SetPluginParams,

} from './contract/wallet/v4/wallet-v4-contract-r2';


//==============//
// SUBSCRIPTION //
//==============//

import { SubscriptionContract } from './contract/subscription-contract';

export {
    // SubscriptionContract,
    PayExternalMessage,
    SubscriptionContractMethods,
    SubscriptionContractOptions,
    SubscriptionData,

} from './contract/subscription-contract';


//========//
// LOCKUP //
//========//

import { LockupWalletV1 } from './contract/lockup/lockup-wallet-v1';
import * as lockup from './contract/lockup';

const LockupWallets = {
    LockupWalletV1,
    all: lockup.all,
    list: lockup.list,
};

export {
    // LockupWalletV1,
    LockupWalletV1Config,
    LockupWalletV1Methods,
    LockupWalletV1Options,

} from './contract/lockup/lockup-wallet-v1';


//========//
// LEDGER //
//========//

import { AppTon } from './ledger/app-ton';

export {
    // AppTon,
    AppConfiguration,
    GetAddressResult,
    GetPublicKeyResult,
    SignResult,

} from './ledger/app-ton';


//========//
// JETTON //
//========//

import { JettonWallet } from './contract/token/ft/jetton-wallet';
import { JettonMinter } from './contract/token/ft/jetton-minter';
const JETTON = { JettonWallet, JettonMinter };

export {
    JettonWalletMethods,
    JettonWalletOptions,
    // JettonWallet,

} from './contract/token/ft/jetton-wallet';

export {
    JettonMinterMethods,
    JettonMinterOptions,
    // JettonMinter,

} from './contract/token/ft/jetton-minter';


//=====//
// NFT //
//=====//

import { NftCollection } from './contract/token/nft/nft-collection';

export {
    // NftCollection,
    CreateChangeOwnerBodyParams,
    CreateGetRoyaltyParamsBodyParams,
    MintBodyParams,
    NftCollectionMethods,
    NftCollectionOptions,
    NftItemContent,
    RoyaltyParams,
    CollectionData,

} from './contract/token/nft/nft-collection';

import { NftItem } from './contract/token/nft/nft-item';

export {
    // NftItem,
    CreateGetStaticDataBodyParams,
    CreateTransferBodyParams,
    NftItemMethods,
    NftItemOptions,
    NftItemData,

} from './contract/token/nft/nft-item';

import { NftMarketplace } from './contract/token/nft/nft-marketplace';

export {
    // NftMarketplace,
    NftMarketplaceMethods,
    NftMarketplaceOptions,

} from './contract/token/nft/nft-marketplace';

import { NftSale } from './contract/token/nft/nft-sale';

export {
    CreateCancelBodyParams,
    // NftSale,
    NftSaleMethods,
    NftSaleOptions,
    NftSaleData,

} from './contract/token/nft/nft-sale';

const NFT = {
    NftCollection,
    NftItem,
    NftMarketplace,
    NftSale,
};

// -----


const version = '0.0.33';


export default class TonWeb {

    public static version = version;
    public static utils = utils;
    public static Address = Address;
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
    public Address = Address;
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

// @todo: set window.TonWeb = TonWeb via webpack
