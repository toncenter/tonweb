import { HttpProvider } from '../../../providers/index';
import { ContractOptions } from '../../contract';
import { WalletContract } from '../wallet-contract';
export declare class SimpleWalletContractR2 extends WalletContract {
    constructor(provider: HttpProvider, options: ContractOptions);
    getName(): string;
}
