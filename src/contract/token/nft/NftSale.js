const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {parseAddress} = require("./NftUtils");
const {BN} = require("../../../utils");

const NFT_SALE_HEX_CODE = 'B5EE9C7241020B0100019F000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CD0607002FA03859DA89A1F481F481F481F401A861A1F401F481F4006102F7D00E8698180B8D8492F82707D201876A2687D207D207D207D006A18116BA4E10159C71B991B1B2990E382C92F837028916382F970FA01698FC008895D7970FAE99F98FD2018201A642802E78B2801E78B00E78B00FD016664F6AA701363804C9B081B2299823878027003698FE99F9810E000C92F857010E00171814080901F7D41081DCD650029285029185F7970E101E87D007D207D0018384008646582A804E78B28B9D090D0A85AD08A500AFD010AE5B564B8FD80384008646582AC678B2803FD010B65B564B8FD80384008646582A802E78B00FD0109E5B564B8FD8038103890C00C646582A802E78B117D010A65B509E58F8A659F91678B2C40A00143110471036454012F004008E3234343435C0038E3882103B9ACA0013BEF2E1C9702071218010C8CB055007CF1622FA0216CB6A15CB1F13CB3F21CF1601CF1612CA0021FA02CA00C98100A0FB00E05F04F2C1C3001ECF16CA0021FA02CA00C98100A0FB00B6C972BD';

class NftSale extends Contract {

    /**
     * @param provider
     * @param options   {{marketplaceAddress: Address, nftAddress: Address, fullPrice: BN, marketplaceFee: BN, royaltyAddress: Address, royaltyAmount: BN, address?: Address | string}}
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