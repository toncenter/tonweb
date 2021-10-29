const {Contract} = require("../index.js");
const {Cell} = require("../../boc");
const {hexToBytes, BN} = require("../../utils");

function createCell(code) {
    return Cell.fromBoc(hexToBytes(code))[0];
}

class SubscriptionContract extends Contract {
    /**
     * @param provider
     * @param options   {{wc: number, wallet: Address, beneficiary: Address, amount: BN, period: number}}
     */
    constructor(provider, options) {
        options.code = createCell('B5EE9C7241020F010001D2000114FF00F4A413F4BCF2C80B0102012002030201480405045EF230DB3C22C00093F82333DEF82323A124A90422A45210BC8E865F07F800DB3CE002A45220BAF29EF800547641DB3C08090A0B045CD032DB3C07D0D303FA40305306C7058F1810785F0801D31F30821064737472BA8E82DB3CE07070DB3CE027C705B308090D060123A0D0C9B678600BF488DE0409F488DE04080B0804808E8810685F087070DB3CE028D749C1208E8810685F087070DB3CE008D31F30841EB0208210706C7567BA0971B019B08E8610575F07DB3CE0278210706C7567BA0D0D0907036E8E8810475F077070DB3CE0278210DE511201BA8E8610575F07DB3CE0078210696E6974BA01C000B08E89F8005513F82359DB3C925F06E20D090E0024ED44D0FA40FA40FA00D31FD31FD21FD31F300216DB3C7F821064737472DB3C0C0D0054708210706C7567218018C8CB055006CF16821005F5E100FA0215CB6A14CB1FCB3F01FA02CB00C973FB000104DB3C0E0018708030C8CB05CB61C972FB00007A21B39982103B9ACA0072FB02DE70F8276F118018C8CB055005CF1621FA0214F40013CB6A22C2009412CB1F019132E283060194308100A0DE01C901FB000030C85007CF165005CF165003FA02CB1FCB1FCA1FCB1FC9ED54B079008B');
        super(provider, options);
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
        cell.bits.writeInt(-1, 32); // last_timeslot
        cell.bits.writeUint(0, 32); // subscription_id
        return cell;
    }

    /**
     * @return {Cell}
     */
    createBody() {
        const body = new Cell();
        body.bits.writeUint(0x696e6974, 32); // op
        return body;
    }


    async getSubscriptionData() {
        function parseTuple(x) {
            const arr = x.elements;
            return arr[0].number.number + ':' + new BN(arr[1].number.number, 10).toString(16);
        }

        const result = await this.provider.call((await this.getAddress()).toString(), 'get_subscription_data', []);
        if (result.exit_code !== 0) throw new Error(result);

        const wallet = parseTuple(result.stack[0][1]);
        const beneficiary = parseTuple(result.stack[1][1]);
        const amount = new BN(result.stack[2][1].substr(2), 16).toString();
        const period = new BN(result.stack[3][1].substr(2), 16).toString();
        const startAt = new BN(result.stack[4][1].substr(2), 16).toString();
        const lastTimeSlot = new BN(result.stack[5][1].replace(/0x/, ''), 16).toString();

        return {wallet, beneficiary, amount, period, startAt, lastTimeSlot};
    }
}

module.exports = {SubscriptionContract};
