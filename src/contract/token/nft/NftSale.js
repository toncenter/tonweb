const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {parseAddress} = require("./NftUtils");
const {BN} = require("../../../utils");

const NFT_SALE_HEX_CODE = 'B5EE9C7241020901000140000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CE0607001DA03859DA89A1F481F481F481F4006101F7401D0D3030171B0925F04E0FA4030ED44D0FA40FA40FA40FA003021D749C202B38E343135355CC705925F05E05114C705F2E1F401D31F801112BAF2E1F5D33F31FA40304303C85004CF1658CF1601CF1601FA02C9ED54E03324C7009634414470F003E004D31FD33F3021C001925F08E021C0029631455013F003E0808009B582103B9ACA005240A05230BEF2E1C2708010C8CB055006CF165073A113A0FA0212CB6AC971FB0071708018C8CB055004CF1623FA0213CB6A12CB1F12CB3F21CF1670FA0201CF16C98100A0FB008007C33333501C0038E3082103B9ACA0013BEF2E1C271708010C8CB055005CF1624FA0214CB6A13CB1FCB3F21CF1670FA0201CF16C98100A0FB00E05F04F2C1C3A2F9F328';

class NftSale extends Contract {

    /**
     * @param provider
     * @param options   {{marketplaceAddress: Address, nftAddress: Address, price: BN, address?: Address | string}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = Cell.oneFromBoc(NFT_SALE_HEX_CODE);
        super(provider, options);

        this.methods.getData = this.getData.bind(this);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains nft sale data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.marketplaceAddress);
        cell.bits.writeAddress(this.options.nftAddress);
        cell.bits.writeAddress(null); // nft_owner_address
        cell.bits.writeCoins(this.options.price);
        return cell;
    }

    async getData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_sale_data');

        const marketplaceAddress = parseAddress(result[0]);
        const nftAddress = parseAddress(result[1]);
        const nftOwnerAddress = parseAddress(result[2]);
        const price = result[3];

        return {marketplaceAddress, nftAddress, nftOwnerAddress, price};
    }

    /**
     * @param params    {{queryId?: number}}
     */
    async createCancelBody(params) {
        const cell = new Cell();
        cell.bits.writeUint(3, 32); // cancel op
        cell.bits.writeUint(params.queryId || 0, 64);
        return cell;
    }

}

NftSale.codeHex = NFT_SALE_HEX_CODE;

module.exports = {NftSale};