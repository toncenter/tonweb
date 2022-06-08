import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
export interface NftMarketplaceOptions extends ContractOptions {
    ownerAddress?: Address;
    cell?: Cell;
}
export interface NftMarketplaceMethods extends ContractMethods {
}
/**
 * Work in progress, will be changed.
 */
export declare class NftMarketplace extends Contract<NftMarketplaceOptions, NftMarketplaceMethods> {
    constructor(provider: HttpProvider, options: NftMarketplaceOptions);
    /**
     * Returns cell that contains NFT marketplace data.
     */
    protected createDataCell(): Cell;
}
