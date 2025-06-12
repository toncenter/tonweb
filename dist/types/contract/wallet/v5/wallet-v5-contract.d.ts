import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { WalletContract, WalletContractOptions, WalletContractMethods } from '../wallet-contract';

export interface WalletV5ContractMethods extends WalletContractMethods {
    getWalletId: () => Promise<number>;
    getSeqno: () => Promise<number>;
    getIsSignatureAuthAllowed: () => Promise<number>;
    getExtensions: () => Promise<Cell>;
    getExtensionsList: () => Promise<string[]>;
}

export declare class WalletV5Contract extends WalletContract<WalletContractOptions, WalletV5ContractMethods> {
    constructor(provider: HttpProvider, options: WalletContractOptions);
    getName(): string;
    getWalletId(): Promise<number>;
    getSeqno(): Promise<number>;
    getIsSignatureAuthAllowed(): Promise<number>;
    getExtensions(): Promise<Cell>;
    getExtensionsList(): Promise<string[]>;
}
