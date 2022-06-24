const {Contract} = require("../../contract/index.js");
const {Cell} = require("../../boc");
const {Address, BN} = require("../../utils");
const {parseAddress} = require('./../token/nft/NftUtils.js');
const {dnsResolve, categoryToBN} = require("./DnsUtils.js")

// ATTENTION: This is BETA, will be changed

const DNS_ITEM_CODE_HEX = 'B5EE9C72410224010004E9000114FF00F4A413F4BCF2C80B0102016202030202CC04050201201B1C02012006070201D4191A0201480809020120151603F7007434C0C05C6C2497C1383E903E900C7E800C5C75C87E800C7E800C3C0209ECE38BD7C15B088D5490B1C17CB8655B5C3232C1FD003240BE90350C3E08E0404B283C0150D9BC01C40944090408FE08FC027814D671C1462C38C08A71C0245C254274C7D42AB8887C01BE08C86F09300038C08FD6C2F4CFC8DBACC7A00A0B0C00113E910C1C2EBCB853600066109B5F0BFA40307053006D8040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0001E0343A3A3B8E68305396BCF2E07B820AFAF08052B0A15270BC9836820AFAF0801AA1933A0905E270206D21105B708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB007A23F823A1A120C2009313A0029130E24464F00710451024F823F009E30D0D03FEB096323409036D01913BE2F82328A18209E14320BC226EB08E185B6C55F005F82381012CA04470F0071045103412F823F009E082105FCC3D145210BA8E92305383C705F2E191105A104910385E425502E082102FCB26A25210BAE30282101A0B9D515210BA8E183032353536375134C705F2E19A04D43040155044F823F009110E0F002C36363737375135C705F2E07B102510241023F823F009007C5F0536365B7082108B77173505C8CBFF5004CF1644408040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00017AE0208104D2BA8E26303738395155C705F2E19B06D3FF3120D74A31C20027D0D30730C000F2E7503006034444F009E03B0A813039BAE3025F0B840FF2F01001DC810309F833D0F4043052508307F40E6FA18ED7D30721C0008E932510BD107A09105810471046105D4313504D1C96303B5F036C61E201C0018E2D7053006D8100A0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB009130E2925F0CE21103F63603FA4021F001FA40D20031FA00820AFAF0801EA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E192218E3E821005138D91C8500CCF16500ECF1671244C145449D0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00107A94102D3A5BE202E30F1056121314006A29F0018210D53276DB103A47046D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00000A10293335300010104510344033F009000D570C8CB01C9D0802012017180021081BA50C1B5C0838343E903E8034CFCC200017321400F3C5807E80B2CFF26000513B513434FFFE900835D2708027DFC07E9035353D0134CFCC0415C415B80C1C1B5B5B5B490415C415A0002B01B232FFD40173C59400F3C5B3333D0032CFF27B55200201201D1E0201201F200013BBB39F008175F07F0068000DBA559F0086C718000DB8FCFF0085F03802012021220013B64A5E010204EBE0FA1001FBB461843AE9240F152118001E5C09BE010206EBE0FA1A60E038001E5CEA1E8086047AE140E68078001E5CEAB80111C344180012660F003C003060FE81CDF432CF190B19E2D93C060F0DBC06105E033E04883DCB11FB64DDC4964AD1BA06B879240DC23572F37CC5CAAAB143A2FFE03060FE81CDF432CF190B19E2D93C0610230004786D5045BF3F';

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
        this.methods.getDomain = this.getDomain.bind(this);
        this.methods.getAuctionInfo = this.getAuctionInfo.bind(this);
        this.methods.getLastFillUpTime = this.getLastFillUpTime.bind(this);
        this.methods.resolve = this.resolve.bind(this);
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
     * @param category?  {string} category of requested DNS record, null for all categories
     * @param oneStep? {boolean} non-recursive
     * @returns {Promise<Map<String, Cell | Address | BN> | Cell | null>}
     */
    async resolve(domain, category, oneStep) {
        const myAddress = await this.getAddress();
        return dnsResolve(this.provider, myAddress.toString(), domain, category, oneStep);
    }
}

/**
 * params   {{category: string, value: Cell|null, queryId?: number}}
 * @return {Cell}
 */
DnsItem.createChangeContentEntryBody = async (params) => {
    const body = new Cell();
    body.bits.writeUint(1234, 32); // OP
    body.bits.writeUint(params.queryId || 0, 64); // query_id
    body.bits.writeUint(await categoryToBN(params.category), 256);
    if (params.value) {
        body.refs[0] = params.value;
    }
    return body;
}

DnsItem.codeHex = DNS_ITEM_CODE_HEX;

module.exports = {DnsItem: DnsItem};