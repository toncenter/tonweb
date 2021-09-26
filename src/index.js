const utils = require("./utils");
const Address = require("./utils/Address").default;
utils.Address = Address;
const boc = require("./boc");
const AppTon = require("./ledger/AppTon");
const HttpProvider = require("./providers").default;
const {Contract} = require("./contract");
const Wallets = require("./contract/wallet").default;
const TransportWebUSB = require("@ledgerhq/hw-transport-webusb").default;
const TransportWebHID = require("@ledgerhq/hw-transport-webhid").default;
const BluetoothTransport = require("@ledgerhq/hw-transport-web-ble").default;
const version = '0.0.20';

class TonWeb {
    constructor(provider) {
        this.version = version;
        this.utils = utils;
        this.Address = Address;
        this.boc = boc;
        this.Contract = Contract;

        this.provider = provider || new HttpProvider();
        this.wallet = new Wallets(this.provider);
    }

    /**
     * Use this method to get transaction history of a given address.
     * @param address   {Address | string}
     * @param limit?    {number}
     * @param lt?    {number}
     * @param txhash?    {string}   in HEX
     * @param to_lt?    {number}
     * @return array of transaction objects
     */
    async getTransactions(address, limit = 20, lt = undefined, txhash = undefined, to_lt = undefined) {
        return this.provider.getTransactions(address.toString(), limit, lt, txhash, to_lt);
    };

    /**
     * @param address   {Address | string}
     * @return {Promise<string>} - The current balance for the given address in nanograms.
     */
    async getBalance(address) {
        return this.provider.getBalance(address.toString());
    }

    /**
     * Use this method to send serialized boc file: fully packed and serialized external message.
     * @param bytes {Uint8Array}
     */
    async sendBoc(bytes) {
        return this.provider.sendBoc(utils.bytesToBase64(bytes));
    }

    /**
     * Invoke get-method of smart contract
     * @param address   {Address | string}    contract address
     * @param method   {string | number}        method name or method id
     * @param params?   Array of stack elements: [['num',3], ['cell', cell_object], ['slice', slice_object]]
     */
    async call(address, method, params = []) {
        return this.provider.call(address.toString(), method, params);
    }
}

TonWeb.version = version;
TonWeb.utils = utils;
TonWeb.Address = Address;
TonWeb.boc = boc;
TonWeb.HttpProvider = HttpProvider;
TonWeb.Contract = Contract;
TonWeb.Wallets = Wallets;
TonWeb.ledger = {
    TransportWebUSB,
    TransportWebHID,
    BluetoothTransport,
    AppTon,
};

if (typeof window !== 'undefined') {
    window.TonWeb = TonWeb;
}

module.exports = TonWeb;
