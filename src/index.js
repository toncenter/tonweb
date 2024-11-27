const utils = require("./utils");
const Address = utils.Address;
const boc = require("./boc");
const AppTon = require("./ledger/AppTon");
const HttpProvider = require("./providers").default;
const {Contract} = require("./contract");
const Wallets = require("./contract/wallet").default;
const LockupWallets = require("./contract/lockup").default;
const HighloadWallets = require("./contract/highloadWallet").default;
const NFT = require("./contract/token/nft").default;
const JETTON = require("./contract/token/ft").default;
const {BlockSubscription, InMemoryBlockStorage} = require("./providers/blockSubscription");
const {SubscriptionContract} = require("./contract/subscription/index");
const {Payments, PaymentChannel} = require("./contract/payments/index");
const TransportWebUSB = require("@ledgerhq/hw-transport-webusb").default;
const TransportWebHID = require("@ledgerhq/hw-transport-webhid").default;
const BluetoothTransport = require("@ledgerhq/hw-transport-web-ble").default;
const {Dns, DnsCollection, DnsItem} = require("./contract/dns").default;
const version = '0.0.66';

class TonWeb {
    constructor(provider) {
        this.version = version;
        this.utils = utils;
        this.Address = Address;
        this.boc = boc;
        this.Contract = Contract;
        this.BlockSubscription = BlockSubscription;
        this.InMemoryBlockStorage = InMemoryBlockStorage;

        this.provider = provider || new HttpProvider();
        this.dns = new Dns(this.provider);
        this.wallet = new Wallets(this.provider);
        this.payments = new Payments(this.provider);
        this.lockupWallet = LockupWallets;
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
TonWeb.LockupWallets = LockupWallets;
TonWeb.SubscriptionContract = SubscriptionContract;
TonWeb.BlockSubscription = BlockSubscription;
TonWeb.InMemoryBlockStorage = InMemoryBlockStorage;
TonWeb.ledger = {
    TransportWebUSB,
    TransportWebHID,
    BluetoothTransport,
    AppTon,
};
TonWeb.token = {
    nft: NFT,
    ft: JETTON,
    jetton: JETTON,
}
TonWeb.HighloadWallets = HighloadWallets;
TonWeb.dns = Dns;
TonWeb.dns.DnsCollection = DnsCollection;
TonWeb.dns.DnsItem = DnsItem;
TonWeb.payments = Payments;
TonWeb.payments.PaymentChannel = PaymentChannel;

module.exports = TonWeb;
