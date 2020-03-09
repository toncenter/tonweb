const utils = require("tonweb-utils");
const Address = utils.Address;
const boc = require("tonweb-boc");
const HttpProvider = require("tonweb-http-provider").default;
const {Contract} = require("tonweb-contract");
const Wallets = require("tonweb-contract-wallet").default;
const version = '0.0.1';

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
     * @return array of transaction object
     */
    async getTransactions(address, limit = 20) {
        return this.provider.getTransactions(address.toString(), limit);
    };

    /**
     * Get transaction by hash
     * @param hash   {string}
     */
    async getTransaction(hash) {
        return this.provider.getTransaction(hash);
    }

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
     * @param params   Array of stack elements: [['num',3], ['cell', cell_object], ['slice', slice_object]]
     */
    async call(address, method, params) {
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

window.TonWeb = TonWeb;

export default TonWeb;