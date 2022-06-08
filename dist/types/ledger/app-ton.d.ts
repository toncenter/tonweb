/// <reference types="node" />
/// <reference types="ledgerhq__hw-transport" />
import Transport from '@ledgerhq/hw-transport';
import BN from 'bn.js';
import { Method } from '../contract/contract';
import { WalletContract } from '../contract/wallet/wallet-contract';
import TonWeb, { AddressType } from '../index';
import { Address } from '../utils/address';
export interface AppConfiguration {
    version: string;
}
export interface GetPublicKeyResult {
    publicKey: Uint8Array;
}
export interface GetAddressResult {
    address: Address;
}
export interface SignResult {
    signature: Buffer;
}
export declare class AppTon {
    /**
     * @ledgerhq compatible transport.
     */
    readonly transport: Transport;
    readonly ton: TonWeb;
    readonly ADDRESS_FORMAT_HEX = 0;
    readonly ADDRESS_FORMAT_USER_FRIENDLY = 1;
    readonly ADDRESS_FORMAT_URL_SAFE = 2;
    readonly ADDRESS_FORMAT_BOUNCEABLE = 4;
    readonly ADDRESS_FORMAT_TEST_ONLY = 8;
    constructor(
    /**
     * @ledgerhq compatible transport.
     */
    transport: Transport, ton: TonWeb);
    /***
     * Returns application configuration that includes version.
     */
    getAppConfiguration(): Promise<AppConfiguration>;
    /**
     * Returns public key for the specified account number.
     * If `isDisplay` is set then it displays the public key
     * and confirms before returning.
     */
    getPublicKey(accountNumber: number, isDisplay: boolean): Promise<GetPublicKeyResult>;
    /**
     * Returns wallet v3R1 address for the specified account number.
     * If `isDisplay` is set, then it displays address and
     * confirms before returning. `addressFormat` is a sum
     * of `ADDRESS_FORMAT_*` instance property constants.
     */
    getAddress(accountNumber: number, isDisplay: boolean, addressFormat: number): Promise<GetAddressResult>;
    /**
     * Signs the specified buffer of bytes using the
     * specified account number.
     */
    sign(accountNumber: number, buffer: Buffer): Promise<SignResult>;
    /**
     * Signs the transfer coins message
     * (same with TonWeb.WalletContract.createTransferMessage).
     * If `seqno` is zero, then it will be "deploy wallet + transfer coins" message.
     * `addressFormat` is a sum of `ADDRESS_FORMAT_*` instance property constants.
     */
    transfer(accountNumber: number, wallet: WalletContract, toAddress: AddressType, nanograms: (BN | number), seqno: number, addressFormat: number): Promise<Method>;
}
