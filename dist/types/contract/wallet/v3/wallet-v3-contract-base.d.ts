import { Cell } from '../../../boc/cell';
import { WalletContract, WalletContractOptions } from '../wallet-contract';
export interface WalletV3ContractOptions extends WalletContractOptions {
    walletId?: number;
}
export declare class WalletV3ContractBase extends WalletContract<WalletV3ContractOptions> {
    protected createSigningMessage(seqno?: number, expireAt?: number): Cell;
    protected createDataCell(): Cell;
}
