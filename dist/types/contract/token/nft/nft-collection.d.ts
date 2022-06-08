import BN from 'bn.js';
import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
import { NftItem } from './nft-item';
export interface NftCollectionOptions extends ContractOptions {
    ownerAddress?: Address;
    collectionContentUri?: string;
    nftItemContentBaseUri?: string;
    nftItemCodeHex?: string;
    royalty?: number;
    royaltyAddress?: Address;
}
export interface NftCollectionMethods extends ContractMethods {
    getCollectionData: () => Promise<CollectionData>;
    getNftItemAddressByIndex: (index: number) => Promise<Address>;
    getNftItemContent: (nftItem: NftItem) => Promise<NftItemContent>;
    getRoyaltyParams: () => Promise<RoyaltyParams>;
}
export interface MintBodyParams {
    itemIndex: number;
    amount: BN;
    itemOwnerAddress: Address;
    itemContentUri: string;
    queryId?: number;
}
export interface CreateGetRoyaltyParamsBodyParams {
    queryId?: number;
}
export interface CreateChangeOwnerBodyParams {
    queryId?: number;
    newOwnerAddress: Address;
}
export interface CollectionData {
    nextItemIndex: number;
    ownerAddress: Address;
    collectionContentUri: string;
}
export interface NftItemContent {
    isInitialized: boolean;
    index: number;
    collectionAddress: Address;
    ownerAddress?: Address;
    contentUri?: string;
}
export interface RoyaltyParams {
    royalty: number;
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
}
/**
 * NFT Release Candidate - may still change slightly.
 */
export declare class NftCollection extends Contract<NftCollectionOptions, NftCollectionMethods> {
    private readonly royaltyBase;
    private readonly royaltyFactor;
    constructor(provider: HttpProvider, options: NftCollectionOptions);
    createMintBody(params: MintBodyParams): Cell;
    createGetRoyaltyParamsBody(params: CreateGetRoyaltyParamsBodyParams): Cell;
    createChangeOwnerBody(params: CreateChangeOwnerBodyParams): Cell;
    getCollectionData(): Promise<CollectionData>;
    getNftItemContent(nftItem: NftItem): Promise<NftItemContent>;
    getNftItemAddressByIndex(index: number): Promise<Address>;
    getRoyaltyParams(): Promise<RoyaltyParams>;
    /**
     * Returns cell that contains NFT collection data.
     */
    protected createDataCell(): Cell;
}
