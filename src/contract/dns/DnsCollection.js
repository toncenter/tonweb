const {Contract} = require("../../contract/index.js");
const {Cell} = require("../../boc");
const {Address} = require("../../utils");
const {parseAddress} = require('../token/nft/NftUtils.js');
const {dnsResolve} = require("./DnsUtils.js")
const {parseOffchainUriCell} = require("../token/nft/NftUtils");

class DnsCollection extends Contract {
    /**
     * @param provider
     * @param options   {{collectionContent: Cell, dnsItemCodeHex: string, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc('B5EE9C724102170100020E000114FF00F4A413F4BCF2C80B0102016202030202CC0405020120111202012006070201D40F1002012008090201200D0E01F543221C70094840FF2F0DED0D3030171B0915BE0FA403001D31FED44D0D4D4303122C0008E5032F00320D74920C218F2E0C8208103F0BBF2E0C978A908C000F2E0CA20F004F2E0CB20F9018050F833206EB38E10D0F4043052108307F40E6FA131F2D0CC9130E2C858CF16C9C85004CF1613CCC9F009E010235F0380A0201200B0C000EC007DC840FF2F000331C27C074C1C07000082CE500A98200B784B98C4830003CB43260004F3223880875D244B5C61673C58875D2883000082CE6C070007CB83280B50C3400A44C78B98C727420007F47021D7498E355CBA20B38E2E3002D30721C02D23C200B024A6F85240B9B022C22F23C13AB0B122C26003C17B13B012B1B320B39402A60802DE13DEE66C12BA8002D501C8CBFFF828CF16C97020C8CB0113F400F400CB00C98001B3E401D3232C084B281F2FFF274200039167C01DC087C021DE0063232C15633C59C3E80B2DAF3333260103EC020020120131402012015160007B8B5D318001FBA7A3ED44D0D4D43031F0077001F00880019B905BED44D0D4D4303070016D8009DBA30C3020D74978A908C000F2E04620D70A07C00021D749C0085210B0935B786DE0209501D3073101DE21F0025122D71830F9018200BA93C8CB0F01820167A3ED43D8CF16C90191789170E212A0018467EBCAB');
        super(provider, options);

        if (!options.collectionContent && !options.address) throw new Error('required collectionContent cell');

        this.methods.getCollectionData = this.getCollectionData.bind(this);
        this.methods.getNftItemAddressByIndex = this.getNftItemAddressByIndex.bind(this);
        this.methods.getNftItemContent = this.getNftItemContent.bind(this);
        this.methods.resolve = this.resolve.bind(this);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains dns collection data
     */
    createDataCell() {
        const cell = new Cell();
        cell.refs[0] = this.options.collectionContent;
        cell.refs[1] = Cell.oneFromBoc(this.options.dnsItemCodeHex);
        return cell;
    }

    /**
     * @return {Promise<{collectionContent: Cell}>}
     */
    async getCollectionData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_collection_data');

        const collectionContent = result[1];
        const collectionContentUri = parseOffchainUriCell(collectionContent);

        return {collectionContentUri, collectionContent, ownerAddress: null, nextItemIndex: 0};
    }

    /**
     * @param nftItem   {DnsItem}
     * @return {Promise<{isInitialized: boolean, index: BN, collectionAddress: Address|null, ownerAddress: Address|null, contentCell: Cell}>}
     */
    async getNftItemContent(nftItem) {
        const nftData = await nftItem.getData();
        return nftData;
    }

    /**
     * @param index {BN}
     * @return {Promise<Address>}
     */
    async getNftItemAddressByIndex(index) {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_address_by_index', [['num', index.toString()]]);

        return parseAddress(result);
    }

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @param category?  {string} category of requested DNS record, null for all categories
     * @param oneStep? {boolean} non-recursive
     * @returns {Promise<Cell | Address | BN | null>}
     */
    async resolve(domain, category, oneStep) {
        const myAddress = await this.getAddress();
        return dnsResolve(this.provider, myAddress.toString(), domain, category, oneStep);
    }
}

module.exports = {DnsCollection: DnsCollection};
