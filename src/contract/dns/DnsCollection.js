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
        options.code = options.code;
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

        const nextItemIndex = result[0].toNumber();
        const collectionContent = result[1];
        const collectionContentUri = parseOffchainUriCell(collectionContent);

        return {collectionContentUri, collectionContent, ownerAddress: null, nextItemIndex};
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
     * @returns {Promise<Cell | Address | AdnlAddress | StorageBagId | null>}
     */
    async resolve(domain, category, oneStep) {
        const myAddress = await this.getAddress();
        return dnsResolve(this.provider, myAddress.toString(), domain, category, oneStep);
    }
}

module.exports = {DnsCollection: DnsCollection};
