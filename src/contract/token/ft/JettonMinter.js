const {Contract} = require("../../index");
const {Cell} = require("../../../boc");
const {createOffchainUriCell, parseOffchainUriCell, parseAddress} = require("../nft/NftUtils");
const {Address, BN, bytesToBase64} = require("../../../utils");

class JettonMinter extends Contract {

    /**
     * @param provider
     * @param options   {{adminAddress: Address, jettonContentUri: string, jettonWalletCodeHex: string, address?: Address | string, code?: Cell}}
     */
    constructor(provider, options) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc('B5EE9C7241020D0100029C000114FF00F4A413F4BCF2C80B0102016202030202CC040502037A600B0C02F1D906380492F81F000E8698180B8D8492F81F07D207D2018FD0018B8EB90FD0018FD001801698FE99FF6A2687D007D206A6A18400AA9385D47199A9A9B1B289A6382F97024817D207D006A18106840306B90FD001812881A282178048A502819E428027D012C678B666664F6AA7041083DEECBEF29385D7181406070093B3F0508806E0A84026A8280790A009F404B19E2C039E2D99924591960225E801E80196019241F200E0E9919605940F97FF93A0EF003191960AB19E2CA009F4042796D625999992E3F60101C036373701FA00FA40F82854120670542013541403C85004FA0258CF1601CF16CCC922C8CB0112F400F400CB00C9F9007074C8CB02CA07CBFFC9D05006C705F2E04AA1034545C85004FA0258CF16CCCCC9ED5401FA403020D70B01C300915BE30D0801A682102C76B9735270BAE30235373723C0038E1A335035C705F2E04903FA403059C85004FA0258CF16CCCCC9ED54E03502C0048E185124C705F2E049D4304300C85004FA0258CF16CCCCC9ED54E05F05840FF2F009003E8210D53276DB708010C8CB055003CF1622FA0212CB6ACB1FCB3FC98042FB0001FE365F03820898968015A015BCF2E04B02FA40D3003095C821CF16C9916DE28210D1735400708018C8CB055005CF1624FA0214CB6A13CB1F14CB3F23FA443070BA8E33F828440370542013541403C85004FA0258CF1601CF16CCC922C8CB0112F400F400CB00C9F9007074C8CB02CA07CBFFC9D0CF16966C227001CB01E2F4000A000AC98040FB00007DADBCF6A2687D007D206A6A183618FC1400B82A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064FC80383A6465816503E5FFE4E840001FAF16F6A2687D007D206A6A183FAA904081735FE5');
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
     * params   {{jettonAmount: BN, destination: Address, amount: BN, queryId?: number}}
     * @return {Cell}
     */
     createMintBody(params) {
        const body = new Cell();
        body.bits.writeUint(21, 32); // OP mint
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeAddress(params.destination);
        body.bits.writeCoins(params.amount); // in Toncoins

        const transferBody = new Cell(); // internal transfer
        transferBody.bits.writeUint(0x178d4519, 32); // internal_transfer op
        transferBody.bits.writeUint(params.queryId || 0, 64);
        transferBody.bits.writeCoins(params.jettonAmount);
        transferBody.bits.writeAddress(null); // from_address
        transferBody.bits.writeAddress(null); // response_address
        transferBody.bits.writeCoins(new BN(0)); // forward_amount
        transferBody.bits.writeBit(false); // forward_payload in this slice, not separate cell

        body.refs[0] = transferBody;
        return body;
    }

    /**
     * params   {{queryId?: number, newAdminAddress: Address}}
     * @return {Cell}
     */
    createChangeAdminBody(params) {
        if (params.newAdminAddress === undefined) throw new Error('Specify newAdminAddress');

        const body = new Cell();
        body.bits.writeUint(3, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeAddress(params.newAdminAddress);
        return body;
    }

    /**
     * params   {{jettonContentUri: string, queryId?: number}}
     * @return {Cell}
     */
    createEditContentBody(params) {
        const body = new Cell();
        body.bits.writeUint(4, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.refs[0] = createOffchainUriCell(params.jettonContentUri);
        return body;
    }

    /**
     * @return {Promise<{ totalSupply: BN, isMutable: boolean, adminAddress: Address|null, jettonContentCell: Cell, jettonContentUri: string|null, jettonWalletCode: Cell }>}
     */
    async getJettonData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_jetton_data');

        const totalSupply = result[0];
        const isMutable = result[1].toNumber() === -1;
        const adminAddress = parseAddress(result[2]);
        const jettonContentCell = result[3];
        let jettonContentUri = null;
        try {
            jettonContentUri = parseOffchainUriCell(jettonContentCell);
        } catch (e) {
        }
        const jettonWalletCode = result[4];

        return {totalSupply, isMutable, adminAddress, jettonContentCell, jettonContentUri, jettonWalletCode};
    }

    /**
     * params   {{ownerAddress: Address}}
     * @return {Promise<Address>}
     */
    async getJettonWalletAddress(ownerAddress) {
        const myAddress = await this.getAddress();
        const cell = new Cell()
        cell.bits.writeAddress(ownerAddress)

        const result = await this.provider.call2(
            myAddress.toString(),
            'get_wallet_address',
            [['tvm.Slice', bytesToBase64(await cell.toBoc(false))]],
        );
        return parseAddress(result)
    }

}

module.exports = {JettonMinter};
