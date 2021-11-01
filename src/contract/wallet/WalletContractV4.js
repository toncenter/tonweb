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
        options.code = Cell.oneFromBoc("B5EE9C72410215010002F5000114FF00F4A413F4BCF2C80B010201200203020148040504F8F28308D71820D31FD31FD31F02F823BBF263ED44D0D31FD31FD3FFF404D15143BAF2A15151BAF2A205F901541064F910F2A3F80024A4C8CB1F5240CB1F5230CBFF5210F400C9ED54F80F01D30721C0009F6C519320D74A96D307D402FB00E830E021C001E30021C002E30001C0039130E30D03A4C8CB1F12CB1FCBFF1112131403EED001D0D3030171B0915BE021D749C120915BE001D31F218210706C7567BD228210626C6E63BDB022821064737472BDB0925F03E002FA403020FA4401C8CA07CBFFC9D0ED44D0810140D721F404305C810108F40A6FA131B3925F05E004D33FC8258210706C7567BA9131E30D248210626C6E63BAE30004060708020120090A005001FA00F404308210706C7567831EB17080185005CB0527CF165003FA02F40012CB69CB1F5210CB3F0052F8276F228210626C6E63831EB17080185005CB0527CF1624FA0214CB6A13CB1F5230CB3F01FA02F4000092821064737472BA8E3504810108F45930ED44D0810140D720C801CF16F400C9ED54821064737472831EB17080185004CB0558CF1622FA0212CB6ACB1FCB3F9410345F04E2C98040FB000201200B0C0059BD242B6F6A2684080A06B90FA0218470D4080847A4937D29910CE6903E9FF9837812801B7810148987159F31840201580D0E0011B8C97ED44D0D70B1F8003DB29DFB513420405035C87D010C00B23281F2FFF274006040423D029BE84C600201200F100019ADCE76A26840206B90EB85FFC00019AF1DF6A26840106B90EB858FC0006ED207FA00D4D422F90005C8CA0715CBFFC9D077748018C8CB05CB0222CF165005FA0214CB6B12CCCCC971FB00C84014810108F451F2A702006C810108D718C8542025810108F451F2A782106E6F746570748018C8CB05CB025004CF16821005F5E100FA0213CB6A12CB1FC971FB00020072810108D718305202810108F459F2A7F82582106473747270748018C8CB05CB025005CF16821005F5E100FA0214CB6A13CB1F12CB3FC973FB00000AF400C9ED5446A9F34F");
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
            message.bits.writeUint(0, 8); // op
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
     * @return {Promise<BN>}
     */
    async getPublicKey() {
        const myAddress = await this.getAddress();
        return this.provider.call2(myAddress.toString(), 'get_public_key');
    }

    /**
     * @param pluginAddress {string | Address}
     * @return {Promise<boolean>}
     */
    async isPluginInstalled(pluginAddress) {
        pluginAddress = new Address(pluginAddress);
        const hashPart = '0x' + bytesToHex(pluginAddress.hashPart);

        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'is_plugin_installed', [['num', pluginAddress.wc], ['num', hashPart]]);
        return !result.isZero();
    }

    /**
     * @return {Promise<string[]>} plugins addresses
     */
    async getPluginsList() {
        const parseAddress = tuple => tuple[0].toNumber() + ':' + tuple[1].toString(16);

        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_plugin_list');
        return result.map(parseAddress);
    }
}

module.exports = {WalletV4ContractR1};