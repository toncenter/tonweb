const {Contract} = require("../../index.js");
const {Cell} = require("../../../boc");
const {Address, bytesToBase64} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');
const {createOffchainUriCell, serializeUri, parseOffchainUriCell} = require("./NftUtils");

/**
 * NFT Release Candidate - may still change slightly
 */
class NftCollection extends Contract {
    /**
     * @param provider
     * @param options   {{ownerAddress: Address, collectionContentUri: string, nftItemContentBaseUri: string, nftItemCodeHex: string, royalty: number, royaltyAddress: Address, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc('B5EE9C72410213010001FE000114FF00F4A413F4BCF2C80B0102016202030202CD04050201200D0E03EBD10638048ADF000E8698180B8D848ADF07D201800E98FE99FF6A2687D20699FEA6A6A184108349E9CA829405D47141BAF8280E8410854658056B84008646582A802E78B127D010A65B509E58FE59F80E78B64C0207D80701B28B9E382F970C892E000F18112E001718119026001F1812F82C207F9784060708020120090A00603502D33F5313BBF2E1925313BA01FA00D43028103459F0068E1201A44343C85005CF1613CB3FCCCCCCC9ED54925F05E200A6357003D4308E378040F4966FA5208E2906A4208100FABE93F2C18FDE81019321A05325BBF2F402FA00D43022544B30F00623BA9302A402DE04926C21E2B3E6303250444313C85005CF1613CB3FCCCCCCC9ED54002801FA40304144C85005CF1613CB3FCCCCCCC9ED540201200B0C003D45AF0047021F005778018C8CB0558CF165004FA0213CB6B12CCCCC971FB008002D007232CFFE0A33C5B25C083232C044FD003D0032C03260001B3E401D3232C084B281F2FFF274200201200F100025BC82DF6A2687D20699FEA6A6A182DE86A182C40043B8B5D31ED44D0FA40D33FD4D4D43010245F04D0D431D430D071C8CB0701CF16CCC980201201112002FB5DAFDA89A1F481A67FA9A9A860D883A1A61FA61FF480610002DB4F47DA89A1F481A67FA9A9A86028BE09E008E003E00B05AEACEF5');
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
     * @override
     * @private
     * @return {Cell} cell contains nft collection data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.ownerAddress);
        cell.bits.writeUint(0, 64); // next_item_index

        const collectionContentCell = createOffchainUriCell(this.options.collectionContentUri);

        const commonContentCell = new Cell();
        commonContentCell.bits.writeBytes(serializeUri(this.options.nftItemContentBaseUri));

        const contentCell = new Cell();
        contentCell.refs[0] = collectionContentCell;
        contentCell.refs[1] = commonContentCell;
        cell.refs[0] = contentCell;

        cell.refs[1] = Cell.oneFromBoc(this.options.nftItemCodeHex);

        const royaltyCell = new Cell();
        royaltyCell.bits.writeUint(this.options.royaltyFactor, 16);
        royaltyCell.bits.writeUint(this.options.royaltyBase, 16);
        royaltyCell.bits.writeAddress(this.options.royaltyAddress);
        cell.refs[2] = royaltyCell;

        return cell;
    }

    /**
     * params   {{itemIndex: number, amount: BN, itemOwnerAddress: Address, itemContentUri: string, queryId?: number}}
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
        const body = new Cell();
        body.bits.writeUint(3, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeAddress(params.newOwnerAddress);
        return body;
    }

    /**
     * @return {Promise<{nextItemIndex: number, ownerAddress: Address, collectionContentUri: string}>}
     */
    async getCollectionData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_collection_data');

        const nextItemIndex = result[0].toNumber();
        const collectionContentUri = parseOffchainUriCell(result[1]);
        const ownerAddress = parseAddress(result[2]);

        return {nextItemIndex, ownerAddress, collectionContentUri};
    }

    /**
     * @param nftItem   {NFTItem}
     * @return {Promise<{isInitialized: boolean, index: number, collectionAddress: Address, ownerAddress: Address|null, contentUri: string}>}
     */
    async getNftItemContent(nftItem) {
        const myAddress = await this.getAddress();
        const nftData = await nftItem.getData();
        if (nftData.isInitialized) {
            const result = await this.provider.call2(myAddress.toString(), 'get_nft_content', [['num', nftData.index], ['tvm.Cell', bytesToBase64(await nftData.contentCell.toBoc(false))]]);
            nftData.contentUri = parseOffchainUriCell(result);
            delete nftData.contentCell;
        }
        return nftData;
    }

    /**
     * @param index {number}
     * @return {Promise<Address>}
     */
    async getNftItemAddressByIndex(index) {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_address_by_index', [['num', index]]);

        return parseAddress(result);
    }

    /**
     * @return {Promise<{royalty: number, royaltyFactor: number, royaltyBase: number, royaltyAddress: Address}>}
     */
    async getRoyaltyParams() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'royalty_params');

        const royaltyFactor = result[0].toNumber();
        const royaltyBase = result[1].toNumber();
        const royalty = royaltyFactor / royaltyBase;
        const royaltyAddress = parseAddress(result[2]);

        return {royalty, royaltyBase, royaltyFactor, royaltyAddress};
    }
}

module.exports = {NftCollection};
