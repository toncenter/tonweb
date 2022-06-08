import { HttpProvider } from '../../../providers/http-provider';
import { ContractOptions } from '../../contract';
import { WalletContract } from '../wallet-contract';
export declare class SimpleWalletContractR2 extends WalletContract {
    constructor(provider: HttpProvider, options: ContractOptions);
    getName(): string;
}
