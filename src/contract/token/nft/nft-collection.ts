
import BN from 'bn.js';

import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { Address } from '../../../utils/address';
import { bytesToBase64 } from '../../../utils/base64';
import { expectCell } from '../../../utils/type-guards';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
import { NftItem } from './nft-item';
import { createOffchainUriCell, parseAddress, parseOffchainUriCell, serializeUri } from './utils';


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


const CODE_HEX = (
    'B5EE9C72410213010001FE000114FF00F4A413F4BCF2C80B0102016202030202CD04050201200D0E02012006070201480B0C03ED420C700915BE001D0D3030171B0915BE0FA4030ED44D0FA40D33FD4D4D43006D31FD33F8210693D39505230BA8E29165F0602D0128210A8CB00AD708010C8CB055005CF1624FA0214CB6A13CB1FCB3F01CF16C98040FB00E0315165C705F2E19120C001E30220C002E3023403C003E3025F05840FF2F0808090A002D501C8CB3FF828CF16C97020C8CB0113F400F400CB00C9800623004D33F5313BBF2E1925313BA01FA00D43027103459F0058E1301A4443302C85005CF1613CB3FCCCCCCC9ED54925F05E200A2307005D4308E378040F4966FA5208E2908A4208100FABE93F2C18FDE81019321A05327BBF2F402FA00D43022544630F00525BA9304A404DE06926C21E2B3E630344034C85005CF1613CB3FCCCCCCC9ED54002803FA40304334C85005CF1613CB3FCCCCCCC9ED54001B3E401D3232C084B281F2FFF27420003D16BC00DC087C011DE0063232C15633C594013E8084F2DAC4B333325C7EC0200201200F100025BC82DF6A2687D20699FEA6A6A182DE86A182C40043B8B5D31ED44D0FA40D33FD4D4D43010245F04D0D431D430D071C8CB0701CF16CCC980201201112002FB5DAFDA89A1F481A67FA9A9A860D883A1A61FA61FF480610002DB4F47DA89A1F481A67FA9A9A86028BE09E006E003E00901654EE64'
);


/**
 * NFT Release Candidate - may still change slightly.
 */
export class NftCollection extends Contract<
    NftCollectionOptions,
    NftCollectionMethods
> {

    private readonly royaltyBase = 1000;

    private readonly royaltyFactor = Math.floor(
        this.options.royalty *
        this.royaltyBase
    );


    constructor(provider: HttpProvider, options: NftCollectionOptions) {
        options.wc = 0;

        options.code = (options.code || Cell.oneFromBoc(CODE_HEX));
        if (options.royalty > 1) {
            throw new Error(`"royalty" option can't be greater than one`);
        }

        super(provider, options);

        this.methods.getCollectionData = (
            () => this.getCollectionData()
        );

        this.methods.getNftItemAddressByIndex = (
            index => this.getNftItemAddressByIndex(index)
        );

        this.methods.getNftItemContent = (
            nftItem => this.getNftItemContent(nftItem)
        );

        this.methods.getRoyaltyParams = (
            () => this.getRoyaltyParams()
        );

    }


    public createMintBody(params: MintBodyParams): Cell {

        const body = new Cell();
        body.bits.writeUint(1, 32); // OP deploy new nft
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeUint(params.itemIndex, 64);
        body.bits.writeCoins(params.amount);

        const nftItemContent = new Cell();
        nftItemContent.bits.writeAddress(params.itemOwnerAddress);

        const uriContent = new Cell();
        uriContent.bits.writeBytes(serializeUri(params.itemContentUri));
        nftItemContent.refs[0] = uriContent;

        body.refs[0] = nftItemContent;
        return body;
    }

    public createGetRoyaltyParamsBody(
        params: CreateGetRoyaltyParamsBodyParams

    ): Cell {

        const body = new Cell();
        body.bits.writeUint(0x693d3950, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        return body;
    }

    public createChangeOwnerBody(
        params: CreateChangeOwnerBodyParams

    ): Cell {

        const body = new Cell();
        body.bits.writeUint(3, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeAddress(params.newOwnerAddress);
        return body;
    }

    public async getCollectionData(): Promise<CollectionData> {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(
            myAddress.toString(),
            'get_collection_data'
        );

        const nextItemIndex = result[0].toNumber();
        const collectionContentUri = parseOffchainUriCell(result[1]);
        const ownerAddress = parseAddress(result[2]);

        return {
            nextItemIndex,
            ownerAddress,
            collectionContentUri,
        };
    }

    public async getNftItemContent(
        nftItem: NftItem

    ): Promise<NftItemContent> {

        const myAddress = await this.getAddress();
        const itemData = await nftItem.getData();
        const itemContent: NftItemContent = {
            isInitialized: itemData.isInitialized,
            index: itemData.index,
            collectionAddress: itemData.collectionAddress,
            ownerAddress: itemData.ownerAddress,
        };
        if (itemData.isInitialized) {
            const result = await this.provider.call2(
                myAddress.toString(),
                'get_nft_content',
                [
                    ['num', itemData.index],
                    ['tvm.Cell', bytesToBase64(
                        await itemData.contentCell.toBoc(false)
                    )],
                ]
            );
            itemContent.contentUri = parseOffchainUriCell(
                expectCell(result)
            );
        }
        return itemContent;
    }

    public async getNftItemAddressByIndex(
        index: number

    ): Promise<Address> {

        const myAddress = await this.getAddress();
        const result = await this.provider.call2(
            myAddress.toString(),
            'get_nft_address_by_index',
            [['num', index]]
        );

        return parseAddress(
            expectCell(result)
        );
    }

    public async getRoyaltyParams(): Promise<RoyaltyParams> {

        const myAddress = await this.getAddress();
        const result = await this.provider.call2(
            myAddress.toString(),
            'royalty_params'
        );

        const royaltyFactor = result[0].toNumber();
        const royaltyBase = result[1].toNumber();
        const royalty = royaltyFactor / royaltyBase;
        const royaltyAddress = parseAddress(result[2]);

        return {
            royalty,
            royaltyBase,
            royaltyFactor,
            royaltyAddress,
        };
    }


    /**
     * Returns cell that contains NFT collection data.
     */
    protected createDataCell(): Cell {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.ownerAddress);
        cell.bits.writeUint(0, 64); // next_item_index

        const collectionContentCell = createOffchainUriCell(
            this.options.collectionContentUri
        );

        const commonContentCell = new Cell();
        commonContentCell.bits.writeBytes(
            serializeUri(this.options.nftItemContentBaseUri)
        );

        const contentCell = new Cell();
        contentCell.refs[0] = collectionContentCell;
        contentCell.refs[1] = commonContentCell;
        cell.refs[0] = contentCell;

        cell.refs[1] = Cell.oneFromBoc(this.options.nftItemCodeHex);

        const royaltyCell = new Cell();
        royaltyCell.bits.writeUint(this.royaltyFactor, 16);
        royaltyCell.bits.writeUint(this.royaltyBase, 16);
        royaltyCell.bits.writeAddress(this.options.royaltyAddress);
        cell.refs[2] = royaltyCell;

        return cell;
    }

}
