const {Contract} = require("../index.js");
const {Cell} = require("../../boc");
const {hexToBytes, BN, nacl, bytesToBase64} = require("../../utils");


class SubscriptionContract extends Contract {
    /**
     * @param provider
     * @param options   {{wc: number, wallet: Address, beneficiary: Address, amount: BN, period: number, timeout: number, subscriptionId: number, address?: Address | string}}
     */
    constructor(provider, options) {
        options.code = Cell.oneFromBoc('B5EE9C7241021001000215000114FF00F4A413F4BCF2C80B01020120020302014804050350F230DB3C5324A126A904F82326A127A90401BC5124A0F823B912B0F29EF8005375DB3CF82301DB3C0D0E0F0468D0DB3C0AD0D303FA40305308C7058F1E5F083333D31F30821064737472BA8E8330DB3CE031708210756E6B77DB3CE05309C705B30D060C070121A0D0C9B67811F488DE040FF488DE040E110D004CF825821064737472708018C8CB055004CF16821005F5E100FA0213CB6A12CB1FCB3FC973FB0004868E8D108C5F0C708210756E6B77DB3CE02AD749C1208E8D108C5F0C708210756E6B77DB3CE00AD31F30841EB0208210706C7567BAE302395F076C2232821064737472BA0C0C08090298305324A126A904F82326A127A904BEF27109FA44300971B0B309A619F833D078D721D70B3F5260A11BBC18B08E8E36F82324708210706C7567DB3C06DE21B393F82332DE105810475523DB3C0C0F010C8E82DB3CE0300A0216DB3C7F821064737472DB3C0B0C0018708030C8CB05CB61C972FB00006821B39982103B9ACA0072FB02DE70F8276F118010C8CB055005CF1621FA0214F40013CB6912CB1F830602948100A032DEC901FB00002CED44D0FA40FA40FA00D31FD31FD31FD31FD31FD31F30005A70F8258210706C7567228018C8CB055006CF16821005F5E100FA0215CB6A14CB1F13CB3F01FA02CB00C973FB00003AC85009CF165007CF165005FA0213CB1FCB1FCB1FCB1FCB1FCB1FC9ED5431F1CC92');
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
        cell.bits.writeUint(this.options.subscriptionId, 32); // subscription_id
        return cell;
    }

    /**
     * @return {Cell}
     */
    createBody() {
        const body = new Cell();
        body.bits.writeUint(0x706c7567, 32); // op
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
        const subscriptionId = result[8].toNumber();

        return {wallet, beneficiary, amount, period, startAt, timeout, lastPayment, lastRequest, subscriptionId};
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
