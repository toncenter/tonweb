const {Contract} = require("../../contract/index.js");
const {Cell} = require("../../boc");
const {Address, bytesToBase64} = require("../../utils");
const {parseAddress} = require('../token/nft/NftUtils.js');
const {default: DNS} = require("./DNS");

// ATTENTION: This is BETA, will be changed

class DnsCollection extends Contract {
    /**
     * @param provider
     * @param options   {{collectionContent: Cell, dnsItemCodeHex: string, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc('B5EE9C7241021401000172000114FF00F4A413F4BCF2C80B0102016202030202CC04050201200E0F02012006070039DACF8033810F803BBC00C646582AC678B387D0165B5E66664C0207D80402012008090201580C0D00C743221C70094840FF2F0DED0D3030171B0915BE0FA403001D31FED44D0D4D4303122C0008E323220D74920C218F2E0C8208103F8BBF2E0C978A908C000F2E0CA20F003F2E0CB20F901C858CF16C9C85004CF1613CCC9F008E010235F03C007DC840FF2F080201200A0B00311C278074C1C07000082CE4C0A900B784B98C4830003CB43260004F1C0875D26AC0A386D72E882CE3850C00B4C1C8704840B00B84AC482CE4C0A900B784F7B99B04AEA0002D007232FFFE0A33C5B25C083232C044FD003D0032C03260001B3E401D3232C084B281F2FFF27420020120101102012012130007B8B5D318001FBA7A3ED44D0D4D43031F0067001F00780019B905BED44D0D4D4303070016D80037BA30C3020F002AA02D71830F90170C802820167A3ED43D812CF16C9813EFF73B');
        super(provider, options);

        if (!options.collectionContent && !options.address) throw new Error('required collectionContent cell');

        this.methods.getCollectionData = this.getCollectionData.bind(this);
        this.methods.getNftItemAddressByIndex = this.getNftItemAddressByIndex.bind(this);
        this.methods.getNftItemContent = this.getNftItemContent.bind(this);
        this.methods.dnsResolve = this.dnsResolve.bind(this);
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

        return {collectionContent};
    }

    /**
     * @param nftItem   {NFTItem}
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
     * @param category  {number}
     * @returns {Promise<Address>}
     */
    async dnsResolve(domain, category) {
        const myAddress = await this.getAddress();
        return DNS.resolve(this.provider, myAddress.toString(), domain, category, true)
    }
}

module.exports = {DnsCollection: DnsCollection};
