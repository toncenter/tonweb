import BN from 'bn.js';
import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
export interface JettonWalletOptions extends ContractOptions {
    wc?: 0;
}
export interface JettonWalletMethods extends ContractMethods {
}
export interface WalletData {
    balance: BN;
    ownerAddress: Address;
    jettonMinterAddress: Address;
    tokenWalletCode: Cell;
}
export interface TransferBodyParams {
    queryId?: number;
    jettonAmount: BN;
    toAddress: Address;
    responseAddress: Address;
    forwardAmount?: BN;
    forwardPayload?: Uint8Array | Cell;
}
export interface BurnBodyParams {
    queryId?: number;
    jettonAmount: BN;
    responseAddress: Address;
}
/**
 * ATTENTION: this is a DRAFT, there will be changes.
 */
export declare class JettonWallet extends Contract<JettonWalletOptions, JettonWalletMethods> {
    static codeHex: string;
    constructor(provider: HttpProvider, options: JettonWalletOptions);
    getData(): Promise<WalletData>;
    /**
     * @todo: should it be async?
     */
    createTransferBody(params: TransferBodyParams): Promise<Cell>;
    /**
     * @todo: should it be async?
     */
    createBurnBody(params: BurnBodyParams): Promise<Cell>;
}
