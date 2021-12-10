const {Contract} = require("../index.js");
const {Cell} = require("../../boc");
const {hexToBytes, BN, nacl, bytesToBase64} = require("../../utils");


class SubscriptionContract extends Contract {
    /**
     * @param provider
     * @param options   {{wc: number, wallet: Address, beneficiary: Address, amount: BN, period: number, timeout: number, subscriptionId: number, address?: Address | string}}
     */
    constructor(provider, options) {
        options.code = Cell.oneFromBoc('B5EE9C7241021001000225000114FF00F4A413F4BCF2C80B0102012002030201480405035CF230DB3C5335A127A904F82327A128A90401BC5135A0F823B913B0F29E735210BCF25FF8005386DB3CF82302DB3C0D0E0F0468D0DB3C0BD0D303FA40305309C7058F1E5F093333D31F30821064737472BA8E8330DB3CE031708210756E6B77DB3CE0530AC705B30D060C070121A0D0C9B67813F488DE0411F488DE0410130D0044F825821064737472708018C8CB055004CF168317FA0213CB6A12CB1FCB3FC973FB0004888E8D109D5F0D708210756E6B77DB3CE02BD749C1208E8D109D5F0D708210756E6B77DB3CE00BD31F30841EB08210706C75675210BAE3023A5F086C2232821064737472BA0C0C080902B8305335A127A904F82327A128A904BEF2710AFA44300A71B094393A07A48EA709A619F833D078D721D70B3F5260A11BBC8E923036F82370708210737562732759DB3C5077DE07E222B393F82333DE106910581047103645044313DB3C0C0F010C8E82DB3CE0300A0216DB3C7F821064737472DB3C0B0C0018708030C8CB05CB61C972FB00006021B395831972FB02DE70F8276F118010C8CB055005CF1621FA0214F40013CB6912CB1F830602948100A032DEC901FB000030ED44D0FA40FA40FA00D31FD31FD31FD31FD31FD307D31F30005270F8258210706C7567228018C8CB055006CF168317FA0215CB6A14CB1F13CB3F01FA02CB00C973FB000040C8500ACF165008CF165006FA0214CB1F12CB1FCB1FCB1FCB1FCB07CB1FC9ED54ACD897B2');
        super(provider, options);

        this.methods.pay = () => Contract.createMethod(provider, this.createPayExternalMessage());
        this.methods.getSubscriptionData = this.getSubscriptionData.bind(this)
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
        cell.bits.writeUint(0, 32); // start_at
        cell.bits.writeUint(this.options.timeout, 32);
        cell.bits.writeUint(0, 32); // last_payment
        cell.bits.writeUint(0, 32); // last_request_attempt
        cell.bits.writeUint(0, 8); // failed_attempts
        cell.bits.writeUint(this.options.subscriptionId, 32); // subscription_id
        return cell;
    }

    /**
     * Create payment request body
     * @return {Cell}
     */
    createBody() {
        const body = new Cell();
        body.bits.writeUint(0x706c7567, 32); // op
        return body;
    }

    /**
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
        const startAt = result[4].toNumber();
        const timeout = result[5].toNumber();
        const lastPayment = result[6].toNumber();
        const lastRequest = result[7].toNumber();
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

        return {
            address: selfAddress,
            message: resultMessage, // old wallet_send_generate_external_message
            body: new Cell()
        };
    }
}

module.exports = {SubscriptionContract};
