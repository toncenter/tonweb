const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {Address, BN} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');

const NFT_ITEM_CODE_HEX = 'B5EE9C7241020D0100015D000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CD06070009A11F9FE003020120080901E5D7D20289AE382F970C8817D0041057D78400CD090D09061007970C9047D20114720400892822A22A18C92EB8580E000492F8370384008646582A803E78B2802FD010AE5B509658FE59F913759CA2C678B00C89971103759C9678B48987164B8FD8049981A9871410840000009081A238036B6C0C0201200A0B001D403C8CB3F58CF1601CF16CCC9ED54800890C8871C02497C0F83434C0C05C6C2497C0F83E900C3C00412CE3854C0C8D1480B1C165C07E90350C3C00B817C0FCB065780174C7F4CFC0B00065C40D9788807C013817C220003B3B513434CFFE900835D27080269FC07E90350C04090408F80C1C165B5B60007825D70B01C000925F06E0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF16019132E2206EB392CF169130E2C971FB004130F002E25C8FC7';

class NftItem extends Contract {
    /**
     * @param provider
     * @param options   {{index: number, collectionAddress: Address, address?: Address | string}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = Cell.oneFromBoc(NFT_ITEM_CODE_HEX);
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

    async getData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_data');

        const isInitialized = result[0].toNumber() === -1;
        const index = result[1].toNumber();
        const collectionAddress =  parseAddress(result[2]);
        const ownerAddress = isInitialized ? parseAddress(result[3]) : null;

        const contentCell = result[4];
        const uri = isInitialized ? new TextDecoder().decode(contentCell.bits.array.slice(1)) : null; // slice 0x01 prefix

        return {isInitialized, index, collectionAddress, ownerAddress, uri};
    }

    /**
     * @param params    {{queryId?: number, newOwnerAddress: Address, payloadAmount?: BN, payload?: Uint8Array, responseAddress: Address}}
     */
    async createTransferBody(params) {
        const cell = new Cell();
        cell.bits.writeUint(1, 32); // transfer op
        cell.bits.writeUint(params.queryId || 0, 64);
        cell.bits.writeAddress(params.newOwnerAddress);
        cell.bits.writeCoins(params.payloadAmount || new BN(0));
        cell.bits.writeAddress(params.responseAddress);
        if (params.payload) {
            cell.bits.writeBytes(params.payload);
        }
        return cell;
    }
}

NftItem.codeHex = NFT_ITEM_CODE_HEX;

module.exports = {NftItem};