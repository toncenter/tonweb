const {Contract} = require("../../contract/index.js");
const {Cell} = require("../../boc");
const {Address, BN} = require("../../utils");
const {parseAddress} = require('./../token/nft/NftUtils.js');
const DNS = require('./DNS.js').default;

const DNS_ITEM_CODE_HEX = 'B5EE9C7241022201000471000114FF00F4A413F4BCF2C80B0102016202030202CC04050201201A1B0201200607002BD836465FFA802E78B2801E78B66667A00659FE4F6AA4020120080902012014150201200A0B00314709E01D30701C00020B39302A402DE12E63120C000F2D0C9803F7007434C0C05C6C2497C1383E903E900C7E800C5C75C87E800C7E800C3C01C9ECE38C57C15B088D5490B1C17CB8655B5C3232C1FD003240BE90350C3E08E082024EA0283C0110D9BC01840944090408FE08FC023814D671C1462C38C08A71C0245C254274C7D42AB8887C017E08C86F09300038C08FD6C2F4CFC8DBA00C0D0E00113E910C1C2EBCB8536000665F096C12FA403070206D211045708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0000EE343A3A3B8E1636363737375135C705F2E07B102510241023F823F0088E58305396BCF2E07B820AFAF08052B0A15270BC9836820AFAF0801AA1933A0905E270206D21105B708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB004464F00610451024F823F008E203FAB31EB096323409036D01913BE2F82328A18209E14320BC226EB08E1A5B6C55F004F8238208093A80A04470F0061045103412F823F008E082105FCC3D145210BAE302383B82102FCB26A25270BAE3023882101A0B9D515260BA8E1430345143C705F2E19A05D430105610354433F008E0058104D2BAE3025F09840FF2F00F101102B630105A104910385E4255025168C705F2E19103FA4021F001FA40D20031FA00820AFAF0801EA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E1922194102D3A5BE30D02951029333530E30D1056104510344033F0081213007C5F0336365B7082108B77173505C8CBFF5004CF1644408040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0000585155C705F2E19A06D3FFD43004D0D30701C000F2E750F4043010248307F41770C8CB07F400C946134444F008007C821005138D91C8500CCF16500ECF1671244C145449D0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00107A006A29F0018210D53276DB103A47046D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0002012016170201201819000D1C3232C07274200021081BA50C1B5C0838343E903E8034CFCC200017321400F3C5807E80B2CFF26000513B513434FFFE900835D2708027DFC07E9035353D0134CFCC0415C415B80C1C1B5B5B5B490415C415A00201201C1D0201201E1F0013BBB39F007175F07F0058000DBA559F0076C718000DB8FCFF0075F03802012020210013B64A5E00E204EBE0FA1000E7B461843AE9356054A45E00441540429AE3061E00EB6D885A041AE934C10A0678E0B6728BE0AE0DBC0A049791C4705E033E04883DCB11FB64DDC4964AD1BA06B879240DC23572F37CC5CAAAB143A2FFE65BC05A1A60E038001E5CEA1E808604380012263C1060FE81CDF432B90039E2D93C060DB063B05FEA';

// ATTENTION: This is BETA, will be changed

class DnsItem extends Contract {
    /**
     * @param provider
     * @param options   {{index: BN, collectionAddress: Address, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc(DNS_ITEM_CODE_HEX);
        super(provider, options);

        this.methods.getData = this.getData.bind(this);
        this.methods.getAuctionInfo = this.getAuctionInfo.bind(this);
        this.methods.getLastFillUpTime = this.getLastFillUpTime.bind(this);
        this.methods.getDomain = this.getDomain.bind(this);
        this.methods.dnsResolve = this.dnsResolve.bind(this);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains nft data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeUint(this.options.index, 256);
        cell.bits.writeAddress(this.options.collectionAddress);
        return cell;
    }

    /**
     * @return {Promise<{isInitialized: boolean, index: BN, collectionAddress: Address|null, ownerAddress: Address|null, contentCell: Cell}>}
     */
    async getData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_data');

        const isInitialized = result[0].toNumber() === -1;
        const index = result[1];
        const collectionAddress = parseAddress(result[2]);
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

    /**
     * @return {Promise<string>}
     */
    async getDomain() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_domain');
        return new TextDecoder().decode(result.bits.array.buffer);
    }

    /**
     * @return {Promise<{maxBidAddress: Address|null, maxBidAmount: BN, auctionEndTime: number}>}
     */
    async getAuctionInfo() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_auction_info');
        const maxBidAddress = parseAddress(result[0]);
        const maxBidAmount = result[1];
        const auctionEndTime = result[2].toNumber();
        return {maxBidAddress, maxBidAmount, auctionEndTime};
    }

    /**
     * @return {Promise<number>}
     */
    async getLastFillUpTime() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_last_fill_up_time');
        return result.toNumber();
    }

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @param category  {number}
     * @returns {Promise<Cell|Address|null>}
     */
    async dnsResolve(domain, category) {
        const myAddress = await this.getAddress();
        return DNS.resolve(this.provider, myAddress.toString(), domain, category, true);
    }
}

DnsItem.codeHex = DNS_ITEM_CODE_HEX;

module.exports = {DnsItem: DnsItem};