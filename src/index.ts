
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

export * from '@ton.js/types';

import nacl from 'tweetnacl';
import BluetoothTransport from '@ledgerhq/hw-transport-web-ble';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

import BN from 'bn.js';
export type { BN };


//=============//
// HTTP CLIENT //
//=============//

export {
    RequestHeaders,
    HttpRequest,
    HttpResponse,
    HttpRequestMethod,
    HttpClient,
    ParsedJson,

} from './http-client/http-client';

import {
    FetchHttpClient as $FetchHttpClient

} from './http-client/fetch-http-client';

export type FetchHttpClient = $FetchHttpClient;

export {
    FetchHttpClientOptions,
    // FetchHttpClient,

} from './http-client/fetch-http-client';


//===============//
// HTTP PROVIDER //
//===============//

import {
    HttpProvider as $HttpProvider,

} from './http-provider/http-provider';

export type HttpProvider = $HttpProvider;

export {
    // HttpProvider,
    // defaultHost,
    HttpProviderOptions,

} from './http-provider/http-provider';

export {
    GetAddressInformationResult,
    GetExtendedAddressInformationResult,
    GetWalletInformationResult,
    GetTransactionsResult,
    GetTransactionsResultTransaction,
    GetTransactionsResultTransactionMessage,
    GetAddressBalanceResult,
    SendBocResult,
    EstimateFeeParams,
    EstimateFeeResult,
    RunGetMethodParamsStackItem,
    RunGetMethodResult,
    RunGetMethodResultStackItem,
    GetMasterchainInfoResult,
    ShardsResult,
    GetBlockTransactionsResult,
    GetBlockHeaderResult,
    SendQuerySimpleParams,
    SendQuerySimpleResult,

} from './http-provider/types/responses/meta';

export {
    AddressState,
    WalletType,

} from './http-provider/types/responses/misc';

export {
    ParseResponseResult,
    ParseResponseStackResult,
    ParseObjectResult,

} from './http-provider/http-provider-utils';


//====================//
// BLOCK SUBSCRIPTION //
//====================//

import {
    BlockSubscription as $BlockSubscription,

} from './block-subscription/block-subscription';

export type BlockSubscription = $BlockSubscription;

export {
    // BlockSubscription,
    BlockHandler,
    BlockSubscriptionOptions,

} from './block-subscription/block-subscription';

import {
    InMemoryBlockStorage as $InMemoryBlockStorage,

} from './block-subscription/in-memory-block-storage';

export type InMemoryBlockStorage = $InMemoryBlockStorage;

export {
    // InMemoryBlockStorage,
    LogFunction,

} from './block-subscription/in-memory-block-storage';

export {
    ShardBlock,
    BlockStorage,

} from './block-subscription/block-storage';


//=======//
// UTILS //
//=======//

import {
    Address as $Address,
    AddressType,

} from './utils/address';

export type Address = $Address;

export {
    // Address,
    AddressType,

} from './utils/address';

import {
    base64ToBytes,
    bytesToBase64,
    base64toString,
    stringToBase64,

} from './utils/base64';

import {
    keyPairFromSeed,
    newKeyPair,
    newSeed,

} from './utils/crypto';

import {
    bytesToHex,
    hexToBytes,

} from './utils/hex';

import {
    formatTransferUrl,
    parseTransferUrl,

} from './utils/transfer-url';

export { ParsedTransferUrl } from './utils/transfer-url';

import {
    compareBytes,
    concatBytes,
    crc16,
    crc32c,
    fromNano,
    readNBytesUIntFromArray,
    sha256,
    stringToBytes,
    toNano,

} from './utils/common';

const utils = {
    Address: $Address,
    BN,
    base64ToBytes,
    base64toString,
    bytesToBase64,
    bytesToHex,
    compareBytes,
    concatBytes,
    crc16,
    crc32c,
    formatTransferUrl,
    fromNano,
    hexToBytes,
    nacl,
    parseTransferUrl,
    readNBytesUIntFromArray,
    sha256,
    stringToBase64,
    stringToBytes,
    toNano,
    keyPairFromSeed,
    newKeyPair,
    newSeed,
};


//=====//
// BOC //
//=====//

import { BitString as $BitString } from './boc/bit-string/bit-string';
export type BitString = $BitString;

import { Cell as $Cell } from './boc/cell/cell';

// @todo export cell-related types
export {  } from './boc/cell/cell';

export type Cell = $Cell;

const boc = {
    BitString: $BitString,
    Cell: $Cell,
};


//==========//
// CONTRACT //
//==========//

import { Contract as $Contract } from './contract/contract';
export type Contract = $Contract;

export {
    // Contract,
    ContractMethods,
    ContractOptions,
    Method,
    Query,
    StateInit,

} from './contract/contract';


//=========//
// WALLETS //
//=========//

import {
    Wallets as $Wallets,

} from './contract/wallet/wallets';

export type Wallets = $Wallets;


//=================//
// WALLET CONTRACT //
//=================//

import {
    WalletContract as $WalletContract,

} from './contract/wallet/wallet-contract';

export type WalletContract = $WalletContract;

export {
    // WalletContract,
    ExternalMessage,
    SeqnoMethod,
    SeqnoMethodResult,
    TransferMethod,
    TransferMethodParams,
    WalletContractMethods,
    WalletContractOptions,

} from './contract/wallet/wallet-contract';


//===================//
// WALLET: SIMPLE R1 //
//===================//

import {
    SimpleWalletContractR1 as $SimpleWalletContractR1,

} from './contract/wallet/simple/simple-wallet-contract-r1';

export type SimpleWalletContractR1 = $SimpleWalletContractR1;

export {
    // SimpleWalletContractR1,

} from './contract/wallet/simple/simple-wallet-contract-r1';


//===================//
// WALLET: SIMPLE R2 //
//===================//

import {
    SimpleWalletContractR2 as $SimpleWalletContractR2,

} from './contract/wallet/simple/simple-wallet-contract-r2';

export type SimpleWalletContractR2 = $SimpleWalletContractR2;

export {
    // SimpleWalletContractR2,

} from './contract/wallet/simple/simple-wallet-contract-r2';


//===================//
// WALLET: SIMPLE R3 //
//===================//

import {
    SimpleWalletContractR3 as $SimpleWalletContractR3,

} from './contract/wallet/simple/simple-wallet-contract-r3';

export type SimpleWalletContractR3 = $SimpleWalletContractR3;

export {
    // SimpleWalletContractR3,

} from './contract/wallet/simple/simple-wallet-contract-r3';


//===============//
// WALLET: V2 R1 //
//===============//

import {
    WalletV2ContractR1 as $WalletV2ContractR1

} from './contract/wallet/v2/wallet-v2-contract-r1';

export type WalletV2ContractR1 = $WalletV2ContractR1;

export {
    // WalletV2ContractR1,

} from './contract/wallet/v2/wallet-v2-contract-r1';


//===============//
// WALLET: V2 R2 //
//===============//

import {
    WalletV2ContractR2 as $WalletV2ContractR2

} from './contract/wallet/v2/wallet-v2-contract-r2';

export type WalletV2ContractR2 = $WalletV2ContractR2;

export {
    // WalletV2ContractR2,

} from './contract/wallet/v2/wallet-v2-contract-r2';


//============//
// WALLET: V3 //
//============//

export {
    WalletV3ContractOptions,

} from './contract/wallet/v3/wallet-v3-contract-base';


//===============//
// WALLET: V3 R1 //
//===============//

import {
    WalletV3ContractR1 as $WalletV3ContractR1

} from './contract/wallet/v3/wallet-v3-contract-r1';

export type WalletV3ContractR1 = $WalletV3ContractR1;

export {
    // WalletV3ContractR1,

} from './contract/wallet/v3/wallet-v3-contract-r1';


//===============//
// WALLET: V3 R2 //
//===============//

import {
    WalletV3ContractR2 as $WalletV3ContractR2,

} from './contract/wallet/v3/wallet-v3-contract-r2';

export type WalletV3ContractR2 = $WalletV3ContractR2;

export {
    // WalletV3ContractR2,

} from './contract/wallet/v3/wallet-v3-contract-r2';


//============//
// WALLET: V4 //
//============//

export {
    WalletV4ContractOptions,
    WalletV4ContractMethods,

} from './contract/wallet/v4/wallet-v4-contract-base';


//===============//
// WALLET: V4 R1 //
//===============//

import {
    WalletV4ContractR1 as $WalletV4ContractR1,

} from './contract/wallet/v4/wallet-v4-contract-r1';

export type WalletV4ContractR1 = $WalletV4ContractR1;

export {
    // WalletV4ContractR1,

} from './contract/wallet/v4/wallet-v4-contract-r1';


//===============//
// WALLET: V4 R2 //
//===============//

import {
    WalletV4ContractR2 as $WalletV4ContractR2

} from './contract/wallet/v4/wallet-v4-contract-r2';

export type WalletV4ContractR2 = $WalletV4ContractR2;

export {
    // WalletV4ContractR2,
    WalletV4ContractR2Methods,
    DeployAndInstallPluginParams,
    SetPluginParams,

} from './contract/wallet/v4/wallet-v4-contract-r2';


//==============//
// SUBSCRIPTION //
//==============//

import {
    SubscriptionContract as $SubscriptionContract,

} from './contract/subscription-contract';

export type SubscriptionContract = $SubscriptionContract;

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

import {
    LockupWalletV1 as $LockupWalletV1,

} from './contract/lockup/lockup-wallet-v1';

export type LockupWalletV1 = $LockupWalletV1;

import * as lockup from './contract/lockup';

const LockupWallets = {
    LockupWalletV1: $LockupWalletV1,
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

import { AppTon as $LedgerAppTon } from './ledger/app-ton';

export type LedgerAppTon = $LedgerAppTon;

export {
    // AppTon as LedgerAppTon,
    AppConfiguration,
    GetAddressResult,
    GetPublicKeyResult,
    SignResult,

} from './ledger/app-ton';


//================//
// JETTON: WALLET //
//================//

import { JettonWallet } from './contract/token/ft/jetton-wallet';
export type { JettonWallet } from './contract/token/ft/jetton-wallet';


//================//
// JETTON: MINTER //
//================//

import { JettonMinter } from './contract/token/ft/jetton-minter';
export type { JettonMinter } from './contract/token/ft/jetton-minter';


//========//
// JETTON //
//========//

const JETTON = {
    JettonWallet,
    JettonMinter,
};


//=================//
// NFT: COLLECTION //
//=================//

import { NftCollection } from './contract/token/nft/nft-collection';
export type { NftCollection } from './contract/token/nft/nft-collection';

export { RoyaltyParams } from './contract/token/nft/utils';


//===========//
// NFT: ITEM //
//===========//

import { NftItem } from './contract/token/nft/nft-item';
export type { NftItem } from './contract/token/nft/nft-item';


//==================//
// NFT: MARKETPLACE //
//==================//

import { NftMarketplace } from './contract/token/nft/nft-marketplace';
export type { NftMarketplace } from './contract/token/nft/nft-marketplace';


//===========//
// NFT: SALE //
//===========//

import { NftSale } from './contract/token/nft/nft-sale';
export type { NftSale } from './contract/token/nft/nft-sale';


//=====//
// NFT //
//=====//

const NFT = {
    NftCollection,
    NftItem,
    NftMarketplace,
    NftSale,
};


//=====//
// DNS //
//=====//

import { Dns } from './contract/dns/dns';
import { DnsCollection } from './contract/dns/dns-collection';
import { DnsItem } from './contract/dns/dns-item';

export type {
    Dns,
    DnsCollection,
    DnsItem,
};


//==========//
// PAYMENTS //
//==========//

import { Payments } from './contract/payments/payments';
import { PaymentChannel } from './contract/payments/payment-channel';

export type {
    Payments,
    PaymentChannel,
};


// -----

import { version } from './version';

export default class TonWeb {

    public static version = version;
    public static utils = utils;
    public static Address = $Address;
    public static boc = boc;
    public static HttpProvider = $HttpProvider;
    public static Contract = $Contract;
    public static Wallets = $Wallets;
    public static LockupWallets = LockupWallets;
    public static SubscriptionContract = $SubscriptionContract;
    public static BlockSubscription = $BlockSubscription;
    public static InMemoryBlockStorage = $InMemoryBlockStorage;
    public static FetchHttpClient = $FetchHttpClient;
    public static dns = Dns;
    public static payments = Payments;

    public static ledger = {
        TransportWebUSB,
        TransportWebHID,
        BluetoothTransport,
        AppTon: $LedgerAppTon,
    };

    public static token = {
        nft: NFT,
        ft: JETTON,
        jetton: JETTON,
    }


    public version = version;
    public utils = utils;
    public Address = $Address;
    public boc = boc;
    public Contract = $Contract;
    public BlockSubscription = $BlockSubscription;
    public InMemoryBlockStorage = $InMemoryBlockStorage;
    public wallet = new $Wallets(this.provider);
    public payments = new Payments(this.provider);
    public lockupWallet = LockupWallets;
    public dns = new Dns(this.provider);


    constructor(public provider = new $HttpProvider()) {
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
        return this.provider.sendBoc(
            utils.bytesToBase64(bytes)
        );
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
      params: any[] = []

    ): Promise<any> {

        // @todo type return value

        return this.provider.call(
            address.toString(),
            method,
            params
        );

    }

}

Object.assign(TonWeb.dns, {
    DnsCollection,
    DnsItem,
});

Object.assign(TonWeb.payments, {
    PaymentChannel,
});

// @todo set window.TonWeb = TonWeb via webpack


//======//
// NEXT //
//======//

/**
 * These a new symbols added to the original vanilla TonWeb.
 */

export { CellSlice } from './boc/cell/cell-slice';
