import { HttpProvider } from '../../../providers/http-provider';
import { ContractOptions } from '../../contract';
import { WalletContract } from '../wallet-contract';
export declare class SimpleWalletContractR3 extends WalletContract {
    constructor(provider: HttpProvider, options: ContractOptions);
    getName(): string;
}
