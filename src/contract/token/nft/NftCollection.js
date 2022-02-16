const {Contract} = require("../../index.js");
const {Cell} = require("../../../boc");
const {Address, bytesToBase64} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');
const {createOffchainUriCell, serializeUri, parseOffchainUriCell} = require("./NftUtils");

// todo: add method - get_royalty_params
// todo: add method - batch deploy
// todo: add method - change owner
class NftCollection extends Contract {
    /**
     * @param provider
     * @param options   {{ownerAddress: Address, uri: string, baseUri: string, nftItemCodeHex: string, royalty: number, royaltyAddress: Address, address?: Address | string}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = Cell.oneFromBoc('B5EE9C72410215010001FF000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CD06070201200F1002012008090201480D0E03ED420C700915BE001D0D3030171B0915BE0FA4030ED44D0FA40D33FD4D4D43006D31FD33F8210693D39505230BA8E29165F0602D0128210F0F8FE3C708010C8CB055005CF1624FA0214CB6A13CB1FCB3F01CF16C98040FB00E0315165C705F2E19120C001E30220C002E3023403C003E3025F05840FF2F080A0B0C002D501C8CB3FF828CF16C97020C8CB0113F400F400CB00C9800623004D33F5313BBF2E1925313BA01FA00D43027103459F0058E1301A4443302C85005CF1613CB3FCCCCCCC9ED54925F05E20092307005D4308E2F208040F4966FA533228E203207A45315BBF2E19207FA00D43022544530F00524BA9303A403DE258100FAB9915BE2B3E630344034C85005CF1613CB3FCCCCCCC9ED54002803FA40304334C85005CF1613CB3FCCCCCCC9ED54001B3E401D3232C084B281F2FFF27420003D16BC00DC087C011DE0063232C15633C594013E8084F2DAC4B333325C7EC02002012011120025BC82DF6A2687D20699FEA6A6A182DE86A180940043B8B5D31ED44D0FA40D33FD4D4D43010245F04D0D431D430D071C8CB0701CF16CCC980201201314002FB5DAFDA89A1F481A67FA9A9A860D883A1A61FA61FF480610002DB4F47DA89A1F481A67FA9A9A86028BE09E006E003E0090A2E531FB');
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

        const collectionContentCell = createOffchainUriCell(this.options.uri);

        const commonContentCell = new Cell();
        commonContentCell.bits.writeBytes(serializeUri(this.options.baseUri));

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
     * params   {{itemIndex: number, amount: BN, ownerAddress: Address, uri: string, queryId?: number}}
     * @return {Cell}
     */
    createMintBody(params) {
        const body = new Cell();
        body.bits.writeUint(1, 32); // OP deploy new nft
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeUint(params.itemIndex, 64);
        body.bits.writeCoins(params.amount);

        const nftItemContent = new Cell();
        nftItemContent.bits.writeAddress(params.ownerAddress);

        const uriContent = new Cell();
        uriContent.bits.writeBytes(serializeUri(params.uri));
        nftItemContent.refs[0] = uriContent;

        body.refs[0] = nftItemContent;
        return body;
    }

    /**
     * @return {Promise<{nextItemIndex: number, ownerAddress: Address, uri: string}>}
     */
    async getCollectionData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_collection_data');

        const nextItemIndex = result[0].toNumber();
        const ownerAddress = parseAddress(result[1]);
        const uri = parseOffchainUriCell(result[2]);

        return {nextItemIndex, ownerAddress, uri};
    }

    /**
     * @param nftItem   {NFTItem}
     * @return {Promise<{isInitialized: boolean, index: number, collectionAddress: Address, ownerAddress: Address|null, uri: string}>}
     */
    async getNftItemContent(nftItem) {
        const myAddress = await this.getAddress();
        const nftData = await nftItem.getData();
        if (nftData.isInitialized) {
            const result = await this.provider.call2(myAddress.toString(), 'get_nft_content', [['num', nftData.index], ['tvm.Cell', bytesToBase64(await nftData.contentCell.toBoc(false))]]);
            nftData.uri = parseOffchainUriCell(result);
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
