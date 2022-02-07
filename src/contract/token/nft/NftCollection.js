const {Contract} = require("../../index.js");
const {Cell} = require("../../../boc");
const {Address} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');
const TonWeb = require("../../../index");

class NftCollection extends Contract {
    /**
     * @param provider
     * @param options   {{ownerAddress: Address, uri: string, nftItemCodeHex: string, royalty: number, royaltyAddress: Address, address?: Address | string}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = Cell.oneFromBoc('B5EE9C7241021001000125000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CD06070201200C0D02012008090201480A0B00BF420C700915BE001D0D3030171B0915BE0FA4030ED44D0FA40D33FD4D4D4305154C705F2E19105D31F01C0018E2ED33F5313BBF2E1925313BA01FA00D43028103459F0058E1201A44143C85005CF1613CB3FCCCCCCC9ED54925F05E2925F06E28002D501C8CB3FF828CF16C97020C8CB0113F400F400CB00C98001B3E401D3232C084B281F2FFF27420003D16BC00DC087C011DE0063232C15633C594013E8084F2DAC4B333325C7EC0200201580E0F001FBC82DF6A2687D20699FEA6A6A182D894002FB5DAFDA89A1F481A67FA9A9A860D883A1A61FA61FF480610002DB4F47DA89A1F481A67FA9A9A86028BE09E006E003E0090863008E5');
        if (options.royalty > 1) throw new Error('royalty > 1');
        options.royaltyBase = 1000;
        options.royaltyFactor = Math.floor(options.royalty * options.royaltyBase);
        super(provider, options);

        this.methods.getCollectionData = this.getCollectionData.bind(this);
        this.methods.getNftItemAddressByIndex = this.getNftItemAddressByIndex.bind(this);
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

        const contentCell = new Cell();
        contentCell.bits.writeUint(0x01, 8);
        contentCell.bits.writeBytes(new TextEncoder().encode(this.options.uri));
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
     * params   {{index: number, amount: BN, ownerAddress: Address, uri: string}}
     * @return {Cell}
     */
    createMintBody(params) {
        const body = new Cell();
        body.bits.writeUint(1, 32); // OP deploy new nft
        body.bits.writeUint(params.index, 64);
        body.bits.writeCoins(params.amount);

        const nftItemContent = new TonWeb.boc.Cell();
        nftItemContent.bits.writeAddress(params.ownerAddress);

        const uriContent = new TonWeb.boc.Cell();
        uriContent.bits.writeInt(0x01, 8);
        uriContent.bits.writeBytes(new TextEncoder().encode(params.uri));

        nftItemContent.refs[0] = uriContent;

        body.refs[0] = nftItemContent;
        return body;
    }

    async getCollectionData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_collection_data');

        const nextItemIndex = result[0].toNumber();
        const ownerAddress = parseAddress(result[1]);

        const contentCell = result[2];
        const uri = new TextDecoder().decode(contentCell.bits.array.slice(1)); // slice 0x01 prefix

        return {nextItemIndex, ownerAddress, uri};
    }

    async getNftItemAddressByIndex(index) {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_address_by_index', [['num', index]]);

        return parseAddress(result);
    }

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
