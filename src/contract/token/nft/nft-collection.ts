
import BN from 'bn.js';

import { Cell } from '../../../boc/cell/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { Address, MaybeAddress } from '../../../utils/address';
import { bytesToBase64 } from '../../../utils/base64';
import { parseAddressFromCell } from '../../../utils/parsing';
import { expectCell } from '../../../utils/type-guards';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
import { NftItem } from './nft-item';

import {
    createOffchainUriCell,
    getRoyaltyParams,
    parseOffchainUriCell,
    RoyaltyParams,
    serializeUri,

} from './utils';


export namespace NftCollection {

    export interface Options extends ContractOptions {
        ownerAddress?: Address;
        collectionContentUri?: string;
        nftItemContentBaseUri?: string;
        nftItemCodeHex?: string;
        royalty?: number;
        royaltyFactor: number;
        royaltyBase: number;
        royaltyAddress?: Address;
    }

    export interface Methods extends ContractMethods {

        getCollectionData: () => Promise<NftCollectionData>;

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

    export interface GetRoyaltyParamsBodyParams {
        queryId?: number;
    }

    export interface ChangeOwnerBodyParams {
        queryId?: number;
        newOwnerAddress: Address;
    }

    export interface NftCollectionData {
        nextItemIndex: number;
        ownerAddress: Address;
        collectionContentUri: string;
    }

    export interface NftItemContent {
        isInitialized: boolean;
        index: number;
        collectionAddress: Address;
        ownerAddress: MaybeAddress;
        contentUri?: string;
    }

}


/**
 * Contract source code:
 * {@link https://github.com/ton-blockchain/token-contract/blob/1ad314a98d20b41241d5329e1786fc894ad811de/nft/nft-collection-editable.fc}
 */
const CODE_HEX = (
    'B5EE9C724102140100021F000114FF00F4A413F4BCF2C80B0102016202030202CD04050201200E0F04E7D10638048ADF000E8698180B8D848ADF07D201800E98FE99FF6A2687D20699FEA6A6A184108349E9CA829405D47141BAF8280E8410854658056B84008646582A802E78B127D010A65B509E58FE59F80E78B64C0207D80701B28B9E382F970C892E000F18112E001718112E001F181181981E0024060708090201200A0B00603502D33F5313BBF2E1925313BA01FA00D43028103459F0068E1201A44343C85005CF1613CB3FCCCCCCC9ED54925F05E200A6357003D4308E378040F4966FA5208E2906A4208100FABE93F2C18FDE81019321A05325BBF2F402FA00D43022544B30F00623BA9302A402DE04926C21E2B3E6303250444313C85005CF1613CB3FCCCCCCC9ED54002C323401FA40304144C85005CF1613CB3FCCCCCCC9ED54003C8E15D4D43010344130C85005CF1613CB3FCCCCCCC9ED54E05F04840FF2F00201200C0D003D45AF0047021F005778018C8CB0558CF165004FA0213CB6B12CCCCC971FB008002D007232CFFE0A33C5B25C083232C044FD003D0032C03260001B3E401D3232C084B281F2FFF2742002012010110025BC82DF6A2687D20699FEA6A6A182DE86A182C40043B8B5D31ED44D0FA40D33FD4D4D43010245F04D0D431D430D071C8CB0701CF16CCC980201201213002FB5DAFDA89A1F481A67FA9A9A860D883A1A61FA61FF480610002DB4F47DA89A1F481A67FA9A9A86028BE09E008E003E00B01A500C6E'
);


export class NftCollection <
    OptionsType extends NftCollection.Options = NftCollection.Options,
    MethodsType extends NftCollection.Methods = NftCollection.Methods

> extends Contract<OptionsType, MethodsType> {

    constructor(
        provider: HttpProvider,
        options: NftCollection.Options
    ) {
        options.wc = 0;
        options.code = (options.code || Cell.oneFromBoc(CODE_HEX));

        if (options.royalty > 1) {
            throw new Error(`"royalty" option can't be greater than one`);
        }

        super(provider, options as any);

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


    public createMintBody(
        params: NftCollection.MintBodyParams

    ): Cell {

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
        params: NftCollection.GetRoyaltyParamsBodyParams

    ): Cell {

        const body = new Cell();
        body.bits.writeUint(0x693d3950, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        return body;
    }

    public createChangeOwnerBody(
        params: NftCollection.ChangeOwnerBodyParams

    ): Cell {

        if (!params.newOwnerAddress) {
            throw new Error(
                `Missing required option: "newOwnerAddress"`
            );
        }

        const body = new Cell();

        body.bits.writeUint(3, 32); // OP
        body.bits.writeUint((params.queryId || 0), 64); // query_id
        body.bits.writeAddress(params.newOwnerAddress);

        return body;

    }

    public createEditContentBody(params: {
        collectionContentUri: string;
        nftItemContentBaseUri: string;
        royalty: number;
        royaltyAddress: Address;
        queryId?: number;

    }): Cell {

        if (params.royalty > 1) {
            throw new Error(`"royalty" option can't be greater than one`);
        }

        const body = new Cell();

        body.bits.writeUint(4, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id

        // Content cell
        // -----

        body.refs[0] = this.createContentCell({
            collectionContentUri: params.collectionContentUri,
            nftItemContentBaseUri: params.nftItemContentBaseUri,
        });

        // Royalty cell
        // -----

        const royaltyBase = 1000;
        const royaltyFactor = Math.floor(
            params.royalty * royaltyBase
        );

        body.refs[1] = this.createRoyaltyCell({
            royaltyFactor,
            royaltyBase,
            royaltyAddress: params.royaltyAddress,
        });

        return body;

    }

    public async getCollectionData(): (
        Promise<NftCollection.NftCollectionData>
    ) {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(
            myAddress.toString(),
            'get_collection_data'
        );

        const nextItemIndex = result[0].toNumber();

        const collectionContentUri = parseOffchainUriCell(
            result[1]
        );

        return {
            nextItemIndex,
            ownerAddress: parseAddressFromCell(result[2]),
            collectionContentUri,
        };

    }

    public async getNftItemContent(
        nftItem: NftItem

    ): Promise<NftCollection.NftItemContent> {

        const myAddress = await this.getAddress();
        const itemData = await nftItem.getData();
        const itemContent: NftCollection.NftItemContent = {
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

        return parseAddressFromCell(result);

    }

    public async getRoyaltyParams(): Promise<RoyaltyParams> {

        const myAddress = await this.getAddress();

        return getRoyaltyParams(
            this.provider,
            myAddress.toString()
        );

    }


    /**
     * Returns cell that contains NFT collection data.
     */
    protected createDataCell(): Cell {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.ownerAddress);
        cell.bits.writeUint(0, 64); // next_item_index
        cell.refs[0] = this.createContentCell({
            collectionContentUri: this.options.collectionContentUri,
            nftItemContentBaseUri: this.options.nftItemContentBaseUri,
        });
        cell.refs[1] = Cell.oneFromBoc(this.options.nftItemCodeHex);
        cell.refs[2] = this.createRoyaltyCell({
            royaltyFactor: this.options.royaltyFactor,
            royaltyBase: this.options.royaltyBase,
            royaltyAddress: this.options.royaltyAddress,
        });
        return cell;
    }

    private createContentCell(params: {
        collectionContentUri: string;
        nftItemContentBaseUri: string;

    }): Cell {

        const collectionContentCell = createOffchainUriCell(
            params.collectionContentUri
        );

        const commonContentCell = new Cell();
        commonContentCell.bits.writeBytes(
            serializeUri(params.nftItemContentBaseUri)
        );

        const contentCell = new Cell();
        contentCell.refs[0] = collectionContentCell;
        contentCell.refs[1] = commonContentCell;

        return contentCell;

    }

    private createRoyaltyCell(params: {
        royaltyFactor: number;
        royaltyBase: number;
        royaltyAddress: Address;

    }): Cell {

        const royaltyCell = new Cell();

        royaltyCell.bits.writeUint(params.royaltyFactor, 16);
        royaltyCell.bits.writeUint(params.royaltyBase, 16);
        royaltyCell.bits.writeAddress(params.royaltyAddress);

        return royaltyCell;

    }

}
