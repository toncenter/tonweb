const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {createOffchainUriCell, parseOffchainUriCell, parseAddress} = require("../nft/NftUtils");

/**
 * ATTENTION: this is DRAFT, there will be changes
 */
class JettonMinter extends Contract {

    /**
     * @param provider
     * @param options   {{adminAddress: Address, jettonContentUri: string, jettonWalletCodeHex: string, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc('B5EE9C7241020701000133000114FF00F4A413F4BCF2C80B0102016202030202CD0405001FA13C5BDA89A1F401F481A9A860FEAA4101C1D1910E38048ADF068698180B8D848ADF07D201800E98FE99FF6A2687D007D206A6A18400AA9385D47149B28B0E382F97024817D007D207D00182A0900AA2383F803AC502099E428027D012C678B666664F6AA701AC0090B5D71812F834207F97840600A5F7C142281B82A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064907C80383A6465816503E5FFE4E840073B400C646582A801E78B28037D0165B5E609E58F89659F80FD0164B87D804009E02FA00FA4030F8282570542013541403C85004FA0258CF1601CF16CCC922C8CB0112F400F400CB00C9F9007074C8CB02CA07CBFFC9D05006C705F2E2C35004A15520C85004FA0258CF16CCCCC9ED549C3AF745');
        super(provider, options);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains jetton minter data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeCoins(0); // total supply
        cell.bits.writeAddress(this.options.adminAddress);
        cell.refs[0] = createOffchainUriCell(this.options.jettonContentUri);
        cell.refs[1] = Cell.oneFromBoc(this.options.jettonWalletCodeHex);
        return cell;
    }

    /**
     * params   {{tokenAmount: BN, destination: Address, amount: BN, queryId?: number}}
     * @return {Cell}
     */
    createMintBody(params) {
        const body = new Cell();
        body.bits.writeUint(21, 32); // OP mint
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeCoins(params.tokenAmount);
        body.bits.writeAddress(params.destination);
        body.bits.writeCoins(params.amount);
        return body;
    }

    /**
     * @return {Promise<{ totalSupply: BN, isMutable: boolean, adminAddress: Address|null, jettonContentUri: string, tokenWalletCode: Cell }>}
     */
    async getJettonData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_jetton_data');

        const totalSupply = result[0];
        const isMutable = result[1].toNumber() === -1;
        const adminAddress = parseAddress(result[2]);
        const jettonContentUri = parseOffchainUriCell(result[3]);
        const tokenWalletCode = result[4];

        return {totalSupply, isMutable, adminAddress, jettonContentUri, tokenWalletCode};
    }

}

module.exports = {JettonMinter};
