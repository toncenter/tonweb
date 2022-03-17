import BN from 'bn.js';
import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
export interface NftSaleOptions extends ContractOptions {
    marketplaceAddress?: Address;
    nftAddress?: Address;
    fullPrice?: BN;
    marketplaceFee?: BN;
    royaltyAddress?: Address;
    royaltyAmount?: BN;
}
export interface NftSaleMethods extends ContractMethods {
    getData: () => Promise<NftSaleData>;
}
export interface NftSaleData {
    marketplaceAddress?: Address;
    nftAddress?: Address;
    nftOwnerAddress?: Address;
    fullPrice: any;
    marketplaceFee: any;
    royaltyAddress?: Address;
    royaltyAmount: any;
}
export interface CreateCancelBodyParams {
    queryId?: number;
}
/**
 * Work in progress, will be changed.
 */
export declare class NftSale extends Contract<NftSaleOptions, NftSaleMethods> {
    static codeHex: string;
    constructor(provider: HttpProvider, options: NftSaleOptions);
    getData(): Promise<NftSaleData>;
    createCancelBody(params: CreateCancelBodyParams): Promise<Cell>;
    /**
     * Returns cell that contains NFT sale data.
     */
    protected createDataCell(): Cell;
}
