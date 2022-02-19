const {Contract} = require("../../index.js");
const {Cell} = require("../../../boc");
const {Address} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');

/**
 * Not release - will change
 */
class NftMarketplace extends Contract {
    /**
     * @param provider
     * @param options   {{ownerAddress: Address, address?: Address | string, cell?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc('B5EE9C7241010401006D000114FF00F4A413F4BCF2C80B01020120020300AAD23221C700915BE0D0D3030171B0915BE0FA40ED44D0FA403012C705F2E19101D31F01C0018E2BFA003001D4D43021F90070C8CA07CBFFC9D077748018C8CB05CB0258CF165004FA0213CB6BCCCCC971FB00915BE20004F2308EF7CCE7');
        super(provider, options);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains nft marketplace data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.ownerAddress);
        return cell;
    }

}

module.exports = {NftMarketplace};
