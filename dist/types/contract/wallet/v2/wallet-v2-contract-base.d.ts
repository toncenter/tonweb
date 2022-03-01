import { Cell } from '../../../boc/index';
import { WalletContract } from '../wallet-contract';
export declare class WalletV2ContractBase extends WalletContract {
    protected createSigningMessage(seqno?: number): Cell;
}
