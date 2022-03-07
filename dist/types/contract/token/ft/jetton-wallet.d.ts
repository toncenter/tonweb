import { HttpProvider } from '../../../providers/http-provider';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
export interface JettonWalletOptions extends ContractOptions {
}
export interface JettonWalletMethods extends ContractMethods {
}
export declare class JettonWallet extends Contract<JettonWalletOptions, JettonWalletMethods> {
    constructor(provider: HttpProvider, options: JettonWalletOptions);
}
