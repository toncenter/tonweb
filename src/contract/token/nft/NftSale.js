const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {parseAddress} = require("./NftUtils");
const {base64ToBytes, BN} = require("../../../utils");

const NFT_SALE_HEX_CODE = 'B5EE9C724102090100010D000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CE06070019A03859DA89A1F481F481F4006101E9401D0D3030171B0925F03E0FA4030ED44D0FA40FA40FA003021D749C202B38E27313466C705F2E1F401D31F801112BAF2E1F5D33F31FA403058C85003CF1601CF1601FA02C9ED54E024C7009634434370F003E004D31FD33F3021C001E30221C002925F07E001C00395454013F003E05F06F2C1C3808007955123BEF2E1C2708018C8CB055005CF165003FA0213CB6AC971FB0071708018C8CB055005CF1624FA0214CB6A13CB1FCB3F01CF1670FA02C98306FB008004A316C3371708018C8CB055005CF1624FA0214CB6A13CB1F12CB3F01CF1670FA02C98306FB008A7309DA';

class NftSale extends Contract {

    /**
     * @param provider
     * @param options   {{nftAddress: Address, price: BN, address?: Address | string}}
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
        cell.bits.writeAddress(this.options.nftAddress);
        cell.bits.writeAddress(null);
        cell.bits.writeCoins(this.options.price);
        return cell;
    }

    async getData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_sale_data');

        const nftAddress = parseAddress(result[0]);
        const nftOwnerAddress = parseAddress(result[1]);
        const price = result[2];

        return {nftAddress, nftOwnerAddress, price};
    }

    /**
     * @param params    {{queryId?: number}}
     */
    async createCancelBody(params) {
        const cell = new Cell();
        cell.bits.writeUint(1, 32); // cancel op
        cell.bits.writeUint(params.queryId || 0, 64);
        return cell;
    }

}

NftSale.codeHex = NFT_SALE_HEX_CODE;

module.exports = {NftSale};