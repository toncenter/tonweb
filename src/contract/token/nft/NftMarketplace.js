const {Contract} = require("../../index.js");
const {Cell} = require("../../../boc");
const {Address, base64ToBytes} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');
const TonWeb = require("../../../index");

class NftMarketplace extends Contract {
    /**
     * @param provider
     * @param options   {{ownerAddress: Address, address?: Address | string}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = Cell.oneFromBoc('B5EE9C7241010401006E000114FF00F4A413F4BCF2C80B01020120020300ACD23221C700915BE0D0D3030171B0915BE0ED44D0FA403001FA4002C705F2E19101D31F01C0018E2BFA003001D4D43021F90070C8CA07CBFFC9D077748018C8CB05CB0258CF165004FA0213CB6BCCCCC971FB00915BE20004F230B320D104');
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
