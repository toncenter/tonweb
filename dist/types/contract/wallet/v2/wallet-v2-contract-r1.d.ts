import { HttpProvider } from '../../../providers/http-provider';
import { ContractOptions } from '../../contract';
import { WalletV2ContractBase } from './wallet-v2-contract-base';
export declare class WalletV2ContractR1 extends WalletV2ContractBase {
    constructor(provider: HttpProvider, options: ContractOptions);
    getName(): string;
}
