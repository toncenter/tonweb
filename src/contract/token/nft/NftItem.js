const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {Address, BN} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');

const NFT_ITEM_CODE_HEX = 'B5EE9C7241020B0100019C000114FF00F4A413F4BCF2C80B0102016202030202CE04050009A11F9FE0030201200607001D403C8CB3F58CF1601CF16CCC9ED54802A30C8871C02497C0F83434C0C05C6C2497C0F83E900C3C00412CE3844C0C8D1480B1C17CB865407E90350C3C00B80174C7F4CFE08417F30F45148C2EB8C08C0D0D4D60840BF2C9A8852EB8C097C12103FCBC200809003B3B513434CFFE900835D27080269FC07E90350C04090408F80C1C165B5B6001FC3210365E22015124C705F2E19101FA40FA40D20031FA00820AFAF0801AA121A120C200F2E192218E3E821005138D91C85008CF16500ACF1671244814544690708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB001036941029365BE226D70B01C3009410266C31E30D5502F0020A00767082108B77173504C8CBFF5005CF16102410238040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0000648210D53276DB103744046D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00D5B62154';

/**
 * NFT Release Candidate - may still change slightly
 */
class NftItem extends Contract {
    /**
     * @param provider
     * @param options   {{index: number, collectionAddress: Address, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc(NFT_ITEM_CODE_HEX);
        super(provider, options);

        this.methods.getData = this.getData.bind(this);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains nft data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeUint(this.options.index, 64);
        cell.bits.writeAddress(this.options.collectionAddress);
        return cell;
    }

    /**
     * @return {Promise<{isInitialized: boolean, index: number, collectionAddress: Address, ownerAddress: Address|null, contentCell: Cell}>}
     */
    async getData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_data');

        const isInitialized = result[0].toNumber() === -1;
        const index = result[1].toNumber();
        const collectionAddress =  parseAddress(result[2]);
        const ownerAddress = isInitialized ? parseAddress(result[3]) : null;

        const contentCell = result[4];

        return {isInitialized, index, collectionAddress, ownerAddress, contentCell};
    }

    /**
     * @param params    {{queryId?: number, newOwnerAddress: Address, forwardAmount?: BN, forwardPayload?: Uint8Array, responseAddress: Address}}
     */
    async createTransferBody(params) {
        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(params.queryId || 0, 64);
        cell.bits.writeAddress(params.newOwnerAddress);
        cell.bits.writeAddress(params.responseAddress);
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(params.forwardAmount || new BN(0));
        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell

        if (params.forwardPayload) {
            cell.bits.writeBytes(params.forwardPayload);
        }
        return cell;
    }

    /**
     * params   {{queryId?: number}}
     * @return {Cell}
     */
    createGetStaticDataBody(params) {
        const body = new Cell();
        body.bits.writeUint(0x2fcb26a2, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        return body;
    }

}

NftItem.codeHex = NFT_ITEM_CODE_HEX;

module.exports = {NftItem};