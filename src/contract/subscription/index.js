const {Contract} = require("../index.js");
const {Cell} = require("../../boc");
const {hexToBytes, BN, nacl, bytesToBase64} = require("../../utils");


class SubscriptionContract extends Contract {
    /**
     * @param provider
     * @param options   {{wc: number, wallet: Address, beneficiary: Address, amount: BN, period: number, timeout: number, startAt: number, subscriptionId: number, address?: Address | string}}
     */
    constructor(provider, options) {
        options.code = Cell.oneFromBoc('B5EE9C7241020F01000262000114FF00F4A413F4BCF2C80B0102012002030201480405036AF230DB3C5335A127A904F82327A128A90401BC5135A0F823B913B0F29EF800725210BE945387F0078E855386DB3CA4E2F82302DB3C0B0C0D0202CD06070121A0D0C9B67813F488DE0411F488DE0410130B048FD6D9E05E8698198FD201829846382C74E2F841999E98F9841083239BA395D497803F018B841083AB735BBED9E702984E382D9C74688462F863841083AB735BBED9E70156BA4E09040B0A0A080269F10FD22184093886D9E7C12C1083239BA39384008646582A803678B2801FD010A65B5658F89659FE4B9FD803FC1083239BA396D9E40E0A04F08E8D108C5F0C708210756E6B77DB3CE00AD31F308210706C7567831EB15210BA8F48305324A126A904F82326A127A904BEF27109FA4430A619F833D078D721D70B3F5260A11BBE8E923036F82370708210737562732759DB3C5077DE106910581047103645135042DB3CE0395F076C2232821064737472BA0A0A0D09011A8E897F821064737472DB3CE0300A006821B39982100400000072FB02DE70F8276F118010C8CB055005CF1621FA0214F40013CB6912CB1F830602948100A032DEC901FB000030ED44D0FA40FA40FA00D31FD31FD31FD31FD31FD307D31F30018021FA443020813A98DB3C01A619F833D078D721D70B3FA070F8258210706C7567228018C8CB055007CF165004FA0215CB6A12CB1F13CB3F01FA02CB00C973FB000E0040C8500ACF165008CF165006FA0214CB1F12CB1FCB1FCB1FCB1FCB07CB1FC9ED54005801A615F833D020D70B078100D1BA95810088D721DED307218100DDBA028100DEBA12B1F2E047D33F30A8AB0FE5855AB4');
        super(provider, options);

        this.methods.pay = () => Contract.createMethod(provider, this.createPayExternalMessage());
        this.methods.getSubscriptionData = this.getSubscriptionData.bind(this);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.wallet);
        cell.bits.writeAddress(this.options.beneficiary);
        cell.bits.writeGrams(this.options.amount);
        cell.bits.writeUint(this.options.period, 32);
        cell.bits.writeUint(this.options.startAt, 32); // start_time
        cell.bits.writeUint(this.options.timeout, 32);
        cell.bits.writeUint(0, 32); // last_payment_time
        cell.bits.writeUint(0, 32); // last_request_time
        cell.bits.writeUint(0, 8); // failed_attempts
        cell.bits.writeUint(this.options.subscriptionId, 32); // subscription_id
        return cell;
    }

    /**
     * Payment body (from wallet to subscription)
     * @return {Cell}
     */
    createBody() {
        const body = new Cell();
        body.bits.writeUint(new BN(0x706c7567).add(new BN(0x80000000)), 32); // op
        return body;
    }

    /**
     * Destroy plugin body (from wallet to subscription OR from beneficiary to subscription)
     * @return {Cell}
     */
    createSelfDestructBody() {
        const body = new Cell();
        body.bits.writeUint(0x64737472, 32); // op
        return body;
    }

    async getSubscriptionData() {
        const parseAddress = tuple => tuple[0].toNumber() + ':' + tuple[1].toString(16);

        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_subscription_data');

        const wallet = parseAddress(result[0]);
        const beneficiary = parseAddress(result[1]);
        const amount = result[2];
        const period = result[3].toNumber();
        const startAt = result[4].toNumber(); // start_time
        const timeout = result[5].toNumber();
        const lastPayment = result[6].toNumber(); // last_payment_time
        const lastRequest = result[7].toNumber(); // last_request_time
        const failedAttempts = result[8].toNumber();
        const subscriptionId = result[9].toNumber();

        return {wallet, beneficiary, amount, period, startAt, timeout, lastPayment, lastRequest, failedAttempts, subscriptionId};
    }

    /**
     * @protected
     * @return {Promise<{address: Address, signature: Uint8Array, message: Cell, cell: Cell, body: Cell, resultMessage: Cell}>}
     */
    async createPayExternalMessage() {
        const selfAddress = await this.getAddress();
        const header = Contract.createExternalMessageHeader(selfAddress);
        const resultMessage = Contract.createCommonMsgInfo(header, null, null);
        const body = new Cell();
        body.bits.writeUint(Math.floor(Date.now() / 1000), 64); // this is not required by the contract; just to make it easier to distinguish messages

        return {
            address: selfAddress,
            message: resultMessage,
            body: body
        };
    }
}

module.exports = {SubscriptionContract};
