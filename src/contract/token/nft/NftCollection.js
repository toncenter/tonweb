const {Contract} = require("../../index.js");
const {Cell} = require("../../../boc");
const {Address, base64ToBytes} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');
const TonWeb = require("../../../index");

class NftCollection extends Contract {
    /**
     * @param provider
     * @param options   {{ownerAddress: Address, uri: string, nftItemCodeHex: string, royalty: number, royaltyAddress: Address, address?: Address | string}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = Cell.oneFromBoc('B5EE9C7241020E0100011E000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CD06070201200A0B0201200809001BD7C803A646581096503E5FFE4E8400EB43221C700915BE0D0D3030171B0915BE0ED44D0FA40D33FD4D4D30FD30FFA403007FA403026C705F2E19107D31F01C0018E3F5342F0037021F00402D4778018C8CB055005CF1601FA0030FA0213CB6BCCCCC971FB0003A41046443512C85007CF1615CB3F13CCCCCB0FCB0F01CF16C9ED54925F08E28002D501C8CB3FF828CF16C97020C8CB0113F400F400CB00C980201580C0D002BBC82DF6A2687D20699FEA6A6987E987FD20182F820940029B5DAFDA89A1F481A67FA9A9A61FA61FF48060D88700039B4F47DA89A1F481A67FA9A9A61FA61FF48060206CBE0DE006E003E009055AC4F58');
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
        cell.bits.writeUint(0, 64); // next_index

        const contentCell = new Cell();
        contentCell.bits.writeUint(0x01, 8);
        contentCell.bits.writeBytes(new TextEncoder().encode(this.options.uri));
        cell.refs[0] = contentCell;

        const nftItemCodeCell = Cell.oneFromBoc(this.options.nftItemCodeHex);
        cell.refs[1] = nftItemCodeCell;

        cell.bits.writeUint(this.options.royaltyFactor, 16);
        cell.bits.writeUint(this.options.royaltyBase, 16);
        cell.bits.writeAddress(this.options.royaltyAddress);

        return cell;
    }

    /**
     * params   {{amount: BN, ownerAddress: Address, uri: string}}
     * @return {Cell}
     */
    createMintBody(params) {
        const body = new Cell();
        body.bits.writeUint(1, 32); // OP deploy new nft
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

        const nextIndex = result[0].toNumber();
        const ownerAddress = parseAddress(result[1]);

        const contentBytes = base64ToBytes(result[2].bytes);
        const contentCell = Cell.oneFromBoc(contentBytes);
        const uri = new TextDecoder().decode(contentCell.bits.array.slice(1)); // slice 0x01 prefix

        return {nextIndex, ownerAddress, uri};
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
