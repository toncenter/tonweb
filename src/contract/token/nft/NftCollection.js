const {Contract} = require("../../index.js");
const {Cell} = require("../../../boc");
const {Address, bytesToBase64, BN} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');
const {createOffchainUriCell, serializeUri, parseOffchainUriCell, getRoyaltyParams} = require("./NftUtils");

class NftCollection extends Contract {
    /**
     * @param provider
     * @param options   {{ownerAddress: Address, collectionContentUri: string, nftItemContentBaseUri: string, nftItemCodeHex: string, royalty: number, royaltyAddress: Address, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        // https://github.com/ton-blockchain/token-contract/blob/1ad314a98d20b41241d5329e1786fc894ad811de/nft/nft-collection-editable.fc
        options.code = options.code || Cell.oneFromBoc('B5EE9C724102140100021F000114FF00F4A413F4BCF2C80B0102016202030202CD04050201200E0F04E7D10638048ADF000E8698180B8D848ADF07D201800E98FE99FF6A2687D20699FEA6A6A184108349E9CA829405D47141BAF8280E8410854658056B84008646582A802E78B127D010A65B509E58FE59F80E78B64C0207D80701B28B9E382F970C892E000F18112E001718112E001F181181981E0024060708090201200A0B00603502D33F5313BBF2E1925313BA01FA00D43028103459F0068E1201A44343C85005CF1613CB3FCCCCCCC9ED54925F05E200A6357003D4308E378040F4966FA5208E2906A4208100FABE93F2C18FDE81019321A05325BBF2F402FA00D43022544B30F00623BA9302A402DE04926C21E2B3E6303250444313C85005CF1613CB3FCCCCCCC9ED54002C323401FA40304144C85005CF1613CB3FCCCCCCC9ED54003C8E15D4D43010344130C85005CF1613CB3FCCCCCCC9ED54E05F04840FF2F00201200C0D003D45AF0047021F005778018C8CB0558CF165004FA0213CB6B12CCCCC971FB008002D007232CFFE0A33C5B25C083232C044FD003D0032C03260001B3E401D3232C084B281F2FFF2742002012010110025BC82DF6A2687D20699FEA6A6A182DE86A182C40043B8B5D31ED44D0FA40D33FD4D4D43010245F04D0D431D430D071C8CB0701CF16CCC980201201213002FB5DAFDA89A1F481A67FA9A9A860D883A1A61FA61FF480610002DB4F47DA89A1F481A67FA9A9A86028BE09E008E003E00B01A500C6E');
        if (options.royalty > 1) throw new Error('royalty > 1');
        options.royaltyBase = 1000;
        options.royaltyFactor = Math.floor(options.royalty * options.royaltyBase);
        super(provider, options);

        this.methods.getCollectionData = this.getCollectionData.bind(this);
        this.methods.getNftItemAddressByIndex = this.getNftItemAddressByIndex.bind(this);
        this.methods.getNftItemContent = this.getNftItemContent.bind(this);
        this.methods.getRoyaltyParams = this.getRoyaltyParams.bind(this);
    }

    /**
     * @private
     * @param params {{collectionContentUri: string, nftItemContentBaseUri: string}}
     * @return {Cell}
     */
    createContentCell(params) {
        const collectionContentCell = createOffchainUriCell(params.collectionContentUri);

        const commonContentCell = new Cell();
        commonContentCell.bits.writeBytes(serializeUri(params.nftItemContentBaseUri));

        const contentCell = new Cell();
        contentCell.refs[0] = collectionContentCell;
        contentCell.refs[1] = commonContentCell;

        return contentCell;
    }

    /**
     * @private
     * @param params    {{royaltyFactor: number, royaltyBase: number, royaltyAddress: Address}}
     * @return {Cell}
     */
    createRoyaltyCell(params) {
        const royaltyCell = new Cell();
        royaltyCell.bits.writeUint(params.royaltyFactor, 16);
        royaltyCell.bits.writeUint(params.royaltyBase, 16);
        royaltyCell.bits.writeAddress(params.royaltyAddress);
        return royaltyCell;
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains nft collection data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.ownerAddress);
        cell.bits.writeUint(0, 64); // next_item_index
        cell.refs[0] = this.createContentCell(this.options);
        cell.refs[1] = Cell.oneFromBoc(this.options.nftItemCodeHex);
        cell.refs[2] = this.createRoyaltyCell(this.options);
        return cell;
    }

    /**
     * params   {{itemIndex: BN|number, amount: BN, itemOwnerAddress: Address, itemContentUri: string, queryId?: number}}
     * @return {Cell}
     */
    createMintBody(params) {
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

    /**
     * params   {{queryId?: number}}
     * @return {Cell}
     */
    createGetRoyaltyParamsBody(params) {
        const body = new Cell();
        body.bits.writeUint(0x693d3950, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        return body;
    }

    /**
     * params   {{queryId?: number, newOwnerAddress: Address}}
     * @return {Cell}
     */
    createChangeOwnerBody(params) {
        if (params.newOwnerAddress === undefined) throw new Error('Specify newOwnerAddress');

        const body = new Cell();
        body.bits.writeUint(3, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeAddress(params.newOwnerAddress);
        return body;
    }

    /**
     * @param params    {{collectionContentUri: string, nftItemContentBaseUri: string, royalty: number, royaltyAddress: Address, queryId?: number}}
     * @return {Cell}
     */
    createEditContentBody(params) {
        if (params.royalty > 1) throw new Error('royalty > 1');
        params.royaltyBase = 1000;
        params.royaltyFactor = Math.floor(params.royalty * params.royaltyBase);

        const body = new Cell();
        body.bits.writeUint(4, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.refs[0] = this.createContentCell(params);
        body.refs[1] = this.createRoyaltyCell(params);
        return body;
    }

    /**
     * @return {Promise<{nextItemIndex: number, itemsCount: BN, ownerAddress: Address, collectionContentCell: Cell, collectionContentUri: string|null}>}
     */
    async getCollectionData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_collection_data');

        const itemsCount = result[0];
        let nextItemIndex = NaN;
        try {
            nextItemIndex = itemsCount.toNumber();
        } catch (e) {
        }
        const collectionContentCell = result[1];
        let collectionContentUri = null;
        try {
            collectionContentUri = parseOffchainUriCell(collectionContentCell);
        } catch (e) {
        }
        const ownerAddress = parseAddress(result[2]);

        return {nextItemIndex, itemsCount, ownerAddress, collectionContentCell, collectionContentUri};
    }

    /**
     * @param nftItem   {NftItem}
     * @return {Promise<{isInitialized: boolean, index: number, itemIndex: BN, collectionAddress: Address, ownerAddress: Address|null, contentCell: Cell, contentUri: string|null}>}
     */
    async getNftItemContent(nftItem) {
        const myAddress = await this.getAddress();
        const nftData = await nftItem.getData();
        if (nftData.isInitialized) {
            const result = await this.provider.call2(myAddress.toString(), 'get_nft_content', [['num', nftData.itemIndex.toString(10)], ['tvm.Cell', bytesToBase64(await nftData.contentCell.toBoc(false))]]);
            nftData.contentUri = null;
            try {
                nftData.contentUri = parseOffchainUriCell(result);
            } catch (e) {
            }
        }
        return nftData;
    }

    /**
     * @param index {BN|number}
     * @return {Promise<Address>}
     */
    async getNftItemAddressByIndex(index) {
        index = new BN(index);
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_address_by_index', [['num', index.toString(10)]]);

        return parseAddress(result);
    }

    /**
     * @return {Promise<{royalty: number, royaltyFactor: number, royaltyBase: number, royaltyAddress: Address}>}
     */
    async getRoyaltyParams() {
        const myAddress = await this.getAddress();
        return getRoyaltyParams(this.provider, myAddress.toString());
    }
}

module.exports = {NftCollection};
