const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {parseAddress} = require("./NftUtils");
const {BN} = require("../../../utils");

const NFT_SALE_HEX_CODE = 'B5EE9C7241020A010001B4000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CD0607002FA03859DA89A1F481F481F481F401A861A1F401F481F4006101F7D00E8698180B8D8492F82707D201876A2687D207D207D207D006A18116BA4E10159C71D991B1B2990E382C92F837028916382F970FA01698FC1080289C6C8895D7970FAE99F98FD2018201A642802E78B2801E78B00E78B00FD016664F6AA701363804C9B081B2299823878027003698FE99F9810E000C92F857010C0801F5D41081DCD650029285029185F7970E101E87D007D207D0018384008646582A804E78B28B9D090D0A85AD08A500AFD010AE5B564B8FD80384008646582AC678B2803FD010B65B564B8FD80384008646582A802E78B00FD0109E5B564B8FD80381041082FE61E8A10C00C646582A802E78B117D010A65B509E58F8A40900C8C0029A3110471036454012F004E032363704C0038E4782103B9ACA0015BEF2E1C95312C70559C705B1F2E1CA702082105FCC3D14218010C8CB055006CF1622FA0215CB6A14CB1F14CB3F21CF1601CF16CA0021FA02CA00C98100A0FB00E05F06840FF2F0002ACB3F22CF1658CF16CA0021FA02CA00C98100A0FB00AECABAD1';

/**
 * Not release - will change
 */
class NftSale extends Contract {

    /**
     * @param provider
     * @param options   {{marketplaceAddress: Address, nftAddress: Address, fullPrice: BN, marketplaceFee: BN, royaltyAddress: Address, royaltyAmount: BN, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc(NFT_SALE_HEX_CODE);
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
        cell.bits.writeCoins(this.options.fullPrice);

        const feesCell = new Cell();
        feesCell.bits.writeCoins(this.options.marketplaceFee);
        feesCell.bits.writeAddress(this.options.royaltyAddress);
        feesCell.bits.writeCoins(this.options.royaltyAmount);
        cell.refs[0] = feesCell;

        return cell;
    }

    async getData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_sale_data');

        const marketplaceAddress = parseAddress(result[0]);
        const nftAddress = parseAddress(result[1]);
        const nftOwnerAddress = parseAddress(result[2]);
        const fullPrice = result[3];
        const marketplaceFee = result[4];
        const royaltyAddress = parseAddress(result[5]);
        const royaltyAmount = result[6];

        return {marketplaceAddress, nftAddress, nftOwnerAddress, fullPrice, marketplaceFee, royaltyAddress, royaltyAmount};
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