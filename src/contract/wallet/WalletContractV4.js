const {Cell} = require("../../boc");
const {Contract} = require("../index.js");
const {Address, bytesToHex, BN} = require("../../utils");
const {WalletContract} = require("./WalletContract");

class WalletV4ContractR1 extends WalletContract {

    /**
     * @param provider    {HttpProvider}
     * @param options {any}
     */
    constructor(provider, options) {
        options.code = Cell.oneFromBoc("B5EE9C7241021201000290000114FF00F4A413F4BCF2C80B010201200203020148040503D0F28308D71820D31FD31FD31F02F823BBF263ED44D0D31FD31FD3FFF404D15143BAF2A15151BAF2A205F901541064F910F2A3F80001D30721C0009C9320D74A96D307D402FB00E8DE21C001E30021C002E30001C0039130E30D03A4C8CB1F12CB1FCBFFF400C9ED540F101103F8D001D0D3030171B0915BE021D749C12002D31F018210706C7567BD13B1915BE0FA403020FA44ED44D0810140D71831F4043002C8CA07CBFFC9D001810108F40A6FA131F2A8F80001FA00F40430F8276F225313B9708AE630C801B38E1D6C218210706C75677080185003CB055005CF165003FA02F400CB69CB1FE30E060708020120090A0074048020F4966FA58E2101FA0430208E1751148020F40E6FA199FA043001B9927F32DE935B7F32E2915BE2915BE204A420C210927F32DE246E22B1004C33338210F06C75677080185004CB055005CF16821005F5E100FA0212CB6A13CB1F58FA02F4000008C971FB000201200B0C005BBD242B6F6A2684080A06B8C18FA0218470D4080847A4937D29910CE6903E9FF9837812801B7810148987159F31840201580D0E0011B8C97ED44D0D70B1F8003FB29DFB513420405035C60C7D010C00B23281F2FFF274006040423D029BE84C600017B0E73B513434CFCC75C2FFE0006ED207FA00D4D422F90005C8CA0715CBFFC9D077748018C8CB05CB0222CF165005FA0214CB6B12CCCCC971FB00C84014810108F451F2A702006C810108D718C8542025810108F451F2A782106E6F746570748018C8CB05CB025004CF16821005F5E100FA0213CB6A12CB1FC971FB00020068810108D718305202810108F459F2A78210DE51120170748018C8CB05CB025004CF16821005F5E100FA0213CB6A12CB1FC971FB0096E977D6");
        super(provider, options);
        if (!this.options.walletId) this.options.walletId = 698983191 + this.options.wc;

        this.methods.deployAndInstallPlugin = (params) => Contract.createMethod(provider, this.deployAndInstallPlugin(params));
        this.methods.installPlugin = (params) => Contract.createMethod(provider, this.installPlugin(params));
        this.methods.removePlugin = (params) => Contract.createMethod(provider, this.removePlugin(params));
        this.methods.getPublicKey = this.getPublicKey.bind(this);
        this.methods.isPluginInstalled = this.isPluginInstalled.bind(this);
        this.methods.getPluginsList = this.getPluginsList.bind(this);
    }

    getName() {
        return 'v4R1';
    }

    /**
     * @override
     * @private
     * @param   seqno?   {number}
     * @param   withoutOp? {boolean}
     * @return {Cell}
     */
    createSigningMessage(seqno, withoutOp) {
        seqno = seqno || 0;
        const message = new Cell();
        message.bits.writeUint(this.options.walletId, 32);
        if (seqno === 0) {
            // message.bits.writeInt(-1, 32);// todo: dont work
            for (let i = 0; i < 32; i++) {
                message.bits.writeBit(1);
            }
        } else {
            const date = new Date();
            const timestamp = Math.floor(date.getTime() / 1e3);
            message.bits.writeUint(timestamp + 60, 32);
        }
        message.bits.writeUint(seqno, 32);
        if (!withoutOp) {
            message.bits.writeUint(0, 32); // op
        }
        return message;
    }

    /**
     * @override
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeUint(0, 32);
        cell.bits.writeUint(this.options.walletId, 32);
        cell.bits.writeBytes(this.options.publicKey);
        cell.bits.writeUint(0, 1); // plugins dict empty
        return cell;
    }

    /**
     * @param   params {{secretKey: Uint8Array, seqno: number, pluginWc: number, amount: BN, stateInit: Cell, body: Cell}}
     */
    async deployAndInstallPlugin(params) {
        const {secretKey, seqno, pluginWc, amount, stateInit, body} = params;

        const signingMessage = this.createSigningMessage(seqno, true);
        signingMessage.bits.writeUint(1, 8); // op
        signingMessage.bits.writeInt(pluginWc, 8);
        signingMessage.bits.writeGrams(amount);
        signingMessage.refs.push(stateInit);
        signingMessage.refs.push(body);
        return this.createExternalMessage(signingMessage, secretKey, seqno, false);
    }

    /**
     * @private
     * @param   params {{secretKey: Uint8Array, seqno: number, pluginAddress: string | Address}}
     * @param   isInstall {boolean} install or uninstall
     */
    async _setPlugin(params, isInstall) {
        const {secretKey, seqno} = params;
        const pluginAddress = new Address(params.pluginAddress);

        const signingMessage = this.createSigningMessage(seqno, true);
        signingMessage.bits.writeUint(isInstall ? 2 : 3, 8); // op
        signingMessage.bits.writeInt(pluginAddress.wc, 8);
        signingMessage.bits.writeBytes(pluginAddress.hashPart);

        return this.createExternalMessage(signingMessage, secretKey, seqno, false);
    }

    /**
     * @param   params {{secretKey: Uint8Array, seqno: number, pluginAddress: string | Address}}
     */
    async installPlugin(params) {
        return this._setPlugin(params, true);
    }

    /**
     * @param   params {{secretKey: Uint8Array, seqno: number, pluginAddress: string | Address}}
     */
    async removePlugin(params) {
        return this._setPlugin(params, false);
    }

    /**
     * @return {Promise<string>}
     */
    async getPublicKey() {
        const result = await this.provider.call((await this.getAddress()).toString(), 'get_public_key', []);
        if (result.exit_code !== 0) throw new Error(result);
        return result.stack[0][1];
    }

    /**
     * @param pluginAddress {string | Address}
     * @return {Promise<boolean>}
     */
    async isPluginInstalled(pluginAddress) {
        pluginAddress = new Address(pluginAddress);
        const hashPart = '0x' + bytesToHex(pluginAddress.hashPart)
        const result = await this.provider.call((await this.getAddress()).toString(), 'is_plugin_installed', [['num', pluginAddress.wc], ['num', hashPart]]);
        if (result.exit_code !== 0) throw new Error(result);
        return result.stack[0][1] !== '0x0';
    }

    /**
     * @return {Promise<string[]>}
     */
    async getPluginsList() {
        function parseTuple(x) {
            const arr = x.tuple.elements;
            return arr[0].number.number + ':' + new BN(arr[1].number.number, 10).toString(16);
        }

        const result = await this.provider.call((await this.getAddress()).toString(), 'get_plugin_list', []);
        if (result.exit_code !== 0) throw new Error(result);
        return result.stack[0][1].elements.map(parseTuple);
    }
}

module.exports = {WalletV4ContractR1};
