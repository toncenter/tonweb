import { HttpProvider } from '../../../providers/index';
import { WalletV4ContractBase, WalletV4ContractOptions } from './wallet-v4-contract-base';
export declare class WalletV4ContractR1 extends WalletV4ContractBase {
    constructor(provider: HttpProvider, options: WalletV4ContractOptions);
    getName(): string;
}
