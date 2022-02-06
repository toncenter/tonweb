const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {Address, base64ToBytes, BN} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');

const NFT_ITEM_CODE_HEX = 'B5EE9C7241020C01000110000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CD06070009A11F9FE003020120080900C7D7D2078009A28BBE382F970C8AA1021F80141057D7840397D817D0010C720C008881AA20A281992EB8580E000492F8370384008646582A803E78B28027D010AE5B509E58F89659F913759CA2C678B00C89971103759C9678B48987164B8FD80492F82F140201200A0B001D403C8CB3F58CF1601CF16CCC9ED548008B1B088831C02456F8007434C0C05C6C2456F83C0057C17C0056C0FE900C00ACE3849488B1C165C0BE90350C3C00B817C0FCB065780C0C4074C7F4CFC0B00064C07C013817C0E0003B3B513434CFFE900835D27080269FC07E90350C04090408F80C1C165B5B6051BDA67B';

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

        const isInited = result[0].toNumber() === -1;
        const index = result[1].toNumber();
        const collectionAddress = parseAddress(result[2]);
        const ownerAddress = parseAddress(result[3]);

        const contentBytes = base64ToBytes(result[4].bytes);
        const contentCell = Cell.oneFromBoc(contentBytes);
        const uri = new TextDecoder().decode(contentCell.bits.array.slice(1)); // slice 0x01 prefix

        return {isInited, index, collectionAddress, ownerAddress, uri};
    }

    /**
     * @param params    {{queryId?: number, newOwnerAddress: Address, payloadAmount?: BN, payload?: Uint8Array}}
     */
    async createTransferBody(params) {
        const cell = new Cell();
        cell.bits.writeUint(1, 32); // transfer op
        cell.bits.writeUint(params.queryId || 0, 64);
        cell.bits.writeAddress(params.newOwnerAddress);
        cell.bits.writeCoins(params.payloadAmount || new BN(0));
        if (params.payload) {
            cell.bits.writeBytes(params.payload);
        }
        return cell;
    }
}

NftItem.codeHex = NFT_ITEM_CODE_HEX;

module.exports = {NftItem};