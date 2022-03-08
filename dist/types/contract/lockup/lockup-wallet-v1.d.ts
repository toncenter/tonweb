import BN from 'bn.js';
import { Cell } from '../../boc/cell';
import { HttpProvider } from '../../providers/http-provider';
import { WalletContract, WalletContractMethods, WalletContractOptions } from '../wallet/wallet-contract';
export interface LockupWalletV1Options extends WalletContractOptions {
    walletId?: number;
    config?: LockupWalletV1Config;
}
export interface LockupWalletV1Methods extends WalletContractMethods {
    getPublicKey: () => Promise<BN>;
    getWalletId: () => Promise<number>;
    getLiquidBalance: () => Promise<BN>;
    getNominalRestrictedBalance: () => Promise<BN>;
    getNominalLockedBalance: () => Promise<BN>;
}
export interface LockupWalletV1Config {
    wallet_type: 'lockup-0.1';
    /**
     * BASE64-encoded public key.
     */
    config_public_key: string;
    /**
     * Dictionary with allowed address destinations
     * as BASE64-encoded string, where key is address
     * and the value must be empty.
     */
    allowed_destinations: string;
}
export declare class LockupWalletV1 extends WalletContract<LockupWalletV1Options, LockupWalletV1Methods> {
    constructor(provider: HttpProvider, options: any);
    getName(): string;
    getPublicKey(): Promise<BN>;
    getWalletId(): Promise<number>;
    /**
     * Returns amount of nanograms that can be spent immediately.
     */
    getLiquidBalance(): Promise<BN>;
    /**
     * Returns amount of nanograms that can be spent after
     * the timelock OR to the whitelisted addresses.
     */
    getNominalRestrictedBalance(): Promise<BN>;
    /**
     * Returns amount of nanograms that can be spent after
     * the timelock only (whitelisted addresses not used).
     */
    getNominalLockedBalance(): Promise<BN>;
    /**
     * Returns total amount of nanograms on the contract,
     * nominal restricted value and nominal locked value.
     */
    getBalances(): Promise<[BN, BN, BN]>;
    /**
     * Returns cell that contains wallet data.
     */
    protected createDataCell(): Cell;
    protected createSigningMessage(seqno?: number, withoutOp?: boolean): Cell;
}
