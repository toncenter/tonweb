import BN from 'bn.js';
import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
export interface NftItemOptions extends ContractOptions {
    index?: number;
    collectionAddress?: Address;
}
export interface NftItemMethods extends ContractMethods {
    getData: () => Promise<NftItemData>;
}
export interface NftItemData {
    isInitialized: boolean;
    index: number;
    collectionAddress: Address;
    contentCell: Cell;
    ownerAddress?: Address;
}
export interface CreateTransferBodyParams {
    newOwnerAddress: Address;
    responseAddress: Address;
    queryId?: number;
    forwardAmount?: BN;
    forwardPayload?: Uint8Array | Cell;
}
export interface CreateGetStaticDataBodyParams {
    queryId?: number;
}
/**
 * NFT Release Candidate - may still change slightly.
 */
export declare class NftItem extends Contract<NftItemOptions, NftItemMethods> {
    static codeHex: string;
    constructor(provider: HttpProvider, options: NftItemOptions);
    getData(): Promise<NftItemData>;
    createTransferBody(params: CreateTransferBodyParams): Promise<Cell>;
    createGetStaticDataBody(params: CreateGetStaticDataBodyParams): Cell;
    /**
     * Returns cell that contains NFT data.
     */
    protected createDataCell(): Cell;
}
