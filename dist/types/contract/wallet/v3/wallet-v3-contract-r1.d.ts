import { HttpProvider } from '../../../providers/http-provider';
import { WalletV3ContractBase, WalletV3ContractOptions } from './wallet-v3-contract-base';
export declare class WalletV3ContractR1 extends WalletV3ContractBase {
    constructor(provider: HttpProvider, options: WalletV3ContractOptions);
    getName(): string;
}
