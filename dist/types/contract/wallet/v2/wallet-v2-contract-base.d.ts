import { Cell } from '../../../boc/cell';
import { WalletContract } from '../wallet-contract';
export declare class WalletV2ContractBase extends WalletContract {
    protected createSigningMessage(seqno?: number, expireAt?: number): Cell;
}
