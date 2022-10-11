import BN from 'bn.js';
import { Cell } from '../../../boc/cell';
import { WalletContract, WalletContractMethods, WalletContractOptions } from '../wallet-contract';
export interface WalletV4ContractOptions extends WalletContractOptions {
    walletId?: number;
}
export interface WalletV4ContractMethods extends WalletContractMethods {
    getPublicKey: () => Promise<BN>;
}
export declare class WalletV4ContractBase<WalletType extends WalletV4ContractOptions = WalletV4ContractOptions, MethodsType extends WalletV4ContractMethods = WalletV4ContractMethods> extends WalletContract<WalletType, MethodsType> {
    getPublicKey(): Promise<BN>;
    protected createSigningMessage(seqno?: number, expireAt?: number, withoutOp?: boolean): Cell;
    protected createDataCell(): Cell;
}
