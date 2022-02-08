const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {Address, BN} = require("../../../utils");
const {parseAddress} = require('./NftUtils.js');

const NFT_ITEM_CODE_HEX = 'B5EE9C7241020E010001A1000114FF00F4A413F4BCF2C80B01020120020302014804050004F2300202CD06070009A11F9FE003020120080901F767E90144D71C17CB86440BE9034800C7E802082BEBC2006A848684830803CB8648274800064F5D3343788638FE00449551154C64975C2C070002497C1B81C20043232C15401F3C594017E808572DA84B2C7F2CFC89BACE51633C580644CB8881BACE4B3C5A44C38B25C7EC02496CD38A08420000004840D11C01B5B60D0201200A0B001D403C8CB3F58CF1601CF16CCC9ED54801F50C8871C02497C0F83434C0C05C6C2497C0F83E900C3C00412CE3854C0C8D1480B1C165C07E90350C3C00B817C0FCB065780174C7F4CFC8B000660C840D9788807C01780C0D0D4D40F005E38B6005C0F232CFD40133C584C0A0C7AC5C20043232C1540173C5893E808532DA84F2C7C4B2CFC073C5F260103EC038200C003B3B513434CFFE900835D27080269FC07E90350C04090408F80C1C165B5B6000045F04007825D70B01C000925F06E0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF16019132E2206EB392CF169130E2C971FB004130F002E761876B';

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
        cell.bits.writeAddress(params.responseAddress);
        cell.bits.writeBit(false); // null InPayload
        cell.bits.writeCoins(params.payloadAmount || new BN(0));
        cell.bits.writeBit(false); // payload in this slice, not separate cell

        if (params.payload) {
            cell.bits.writeBytes(params.payload);
        }
        return cell;
    }
}

NftItem.codeHex = NFT_ITEM_CODE_HEX;

module.exports = {NftItem};