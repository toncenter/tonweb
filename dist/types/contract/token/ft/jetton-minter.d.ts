import BN from 'bn.js';
import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
export interface JettonMinterOptions extends ContractOptions {
    wc?: 0;
    adminAddress: Address;
    jettonContentUri: string;
    jettonWalletCodeHex: string;
}
export interface JettonMinterMethods extends ContractMethods {
}
export interface MintBodyParams {
    jettonAmount: BN;
    destination: Address;
    amount: BN;
    queryId?: number;
}
export interface JettonData {
    totalSupply: BN;
    isMutable: boolean;
    jettonContentUri: string;
    tokenWalletCode: Cell;
    adminAddress?: Address;
}
/**
 * ATTENTION: this is a DRAFT, there will be changes.
 */
export declare class JettonMinter extends Contract<JettonMinterOptions, JettonMinterMethods> {
    constructor(provider: HttpProvider, options: JettonMinterOptions);
    createMintBody(params: MintBodyParams): Cell;
    getJettonData(): Promise<JettonData>;
    getJettonWalletAddress(ownerAddress: Address): Promise<Address>;
    /**
     * Returns cell that contains jetton minter data.
     */
    protected createDataCell(): Cell;
}
