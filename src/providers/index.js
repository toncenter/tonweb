const {Cell} = require("../boc");
const {base64ToBytes} = require("../utils");
const HttpProviderUtils = require('./HttpProviderUtils').default;

if (typeof fetch === 'undefined') {
    fetch = require('node-fetch');
}

const SHARD_ID_ALL = '-9223372036854775808'; // 0x8000000000000000

class HttpProvider {
    /**
     * @param host? {string}
     * @param options? {{apiKey: string}}
     */
    constructor(host, options) {
        this.host = host || "https://toncenter.com/api/v2/jsonRPC";
        this.options = options || {};
    }

    /**
     * @private
     * @param apiUrl   {string}
     * @param request   {any}
     * @return {Promise<any>}
     */
    sendImpl(apiUrl, request) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.options.apiKey) {
            headers['X-API-Key'] = this.options.apiKey;
        }

        return fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(request)
        })
            .then((response) => response.json())
            .then(({ result, error }) => result || Promise.reject(error))
    }

    /**
     * @param method    {string}
     * @param params    {any}  todo: Array<any>
     * @return {Promise<any>}
     */
    send(method, params) {
        return this.sendImpl(
            this.host,
            {id: 1, jsonrpc: "2.0", method: method, params: params}
        );
    }

    /**
     * Use this method to get information about address: balance, code, data, last_transaction_id.
     * @param address {string}
     */
    async getAddressInfo(address) {
        return this.send('getAddressInformation', {address: address});
    }

    /**
     * Similar to previous one but tries to parse additional information for known contract types. This method is based on generic.getAccountState thus number of recognizable contracts may grow. For wallets we recommend to use getWalletInformation.
     * @param address {string}
     */
    async getExtendedAddressInfo(address) {
        return this.send('getExtendedAddressInformation', {address: address});
    }

    /**
     * Use this method to retrieve wallet information, this method parse contract state and currently supports more wallet types than getExtendedAddressInformation: simple wallet, stadart wallet and v3 wallet.
     * @param address {string}
     */
    async getWalletInfo(address) {
        return this.send('getWalletInformation', {address: address});
    }

    /**
     * Use this method to get transaction history of a given address.
     * @param address   {string}
     * @param limit?    {number}
     * @param lt?    {number | string}
     * @param hash?    {string}
     * @param to_lt?    {number | string}
     * @return array of transaction object
     */
    async getTransactions(address, limit = 20, lt = undefined, hash = undefined, to_lt = undefined, archival = undefined) {
        return this.send("getTransactions", {address, limit, lt, hash, to_lt, archival});
    };

    /**
     * Use this method to get balance (in nanograms) of a given address.
     * @param address {string}
     */
    async getBalance(address) {
        return this.send('getAddressBalance', {address: address});
    }

    /**
     * Use this method to send serialized boc file: fully packed and serialized external message.
     * @param base64 {string} base64 of boc bytes Cell.toBoc
     */
    async sendBoc(base64) {
        return this.send("sendBoc", {'boc': base64});
    };

    /**
     * @deprecated
     * Send external message
     * @param query     object as described https://toncenter.com/api/test/v2/#sendQuerySimple
     */
    async sendQuery(query) {
        return this.send("sendQuerySimple", query);
    };


    /**
     * @param query     object as described https://toncenter.com/api/test/v2/#estimateFee
     * @return fees object
     */
    async getEstimateFee(query) {
        return this.send("estimateFee", query);
    };

    /**
     * Invoke get-method of smart contract
     * todo: think about throw error if result.exit_code !== 0 (the change breaks backward compatibility)
     * @param address   {string}    contract address
     * @param method   {string | number}        method name or method id
     * @param params?   Array of stack elements: [['num',3], ['cell', cell_object], ['slice', slice_object]]
     */
    async call(address, method, params = []) {
        return this.send('runGetMethod', {
            address: address,
            method: method,
            stack: params,
        });
    }

    /**
     * Invoke get-method of smart contract
     * @param address   {string}    contract address
     * @param method   {string | number}        method name or method id
     * @param params?   Array of stack elements: [['num',3], ['cell', cell_object], ['slice', slice_object]]
     */
    async call2(address, method, params = []) {
        const result = await this.send('runGetMethod', {
            address: address,
            method: method,
            stack: params
        });
        return HttpProviderUtils.parseResponse(result);
    }

    /**
     * Returns network config param
     * @param configParamId {number}
     * @return {Cell}
     */
    async getConfigParam(configParamId) {
        const rawResult = await this.send('getConfigParam', {
            config_id: configParamId
        });
        if (rawResult['@type'] !== 'configInfo') throw new Error('getConfigParam expected type configInfo');
        if (!rawResult.config) throw new Error('getConfigParam expected config');
        if (rawResult.config['@type'] !== 'tvm.cell') throw new Error('getConfigParam expected type tvm.cell');
        if (!rawResult.config.bytes) throw new Error('getConfigParam expected bytes');
        return Cell.oneFromBoc(base64ToBytes(rawResult.config.bytes));
    }

    /**
     * Returns ID's of last and init block of masterchain
     */
    async getMasterchainInfo() {
        return this.send('getMasterchainInfo', {});
    }

    /**
     * Returns ID's of shardchain blocks included in this masterchain block
     * @param masterchainBlockNumber {number}
     */
    async getBlockShards(masterchainBlockNumber) {
        return this.send('shards', {
            seqno: masterchainBlockNumber
        });
    }

    /**
     * Returns transactions hashes included in this block
     * @param workchain {number}
     * @param shardId   {string}
     * @param shardBlockNumber  {number}
     * @param limit? {number}
     * @param afterLt? {number} pivot transaction LT to start with
     * @param addressHash? {string} take the account address where the pivot transaction took place, convert it to raw format and take the part of the address without the workchain (address hash)
     */
    async getBlockTransactions(workchain, shardId, shardBlockNumber, limit, afterLt, addressHash) {
        return this.send('getBlockTransactions', {
            workchain: workchain,
            shard: shardId,
            seqno: shardBlockNumber,
            count: limit,
            after_lt: afterLt,
            after_hash: addressHash
        });
    }

    /**
     * Returns transactions hashes included in this masterhcain block
     * @param masterchainBlockNumber  {number}
     * @param limit? {number}
     * @param afterLt? {number | string} pivot transaction LT to start with
     * @param addressHash? {string}  take the account address where the pivot transaction took place, convert it to raw format and take the part of the address without the workchain (address hash)
     */
    async getMasterchainBlockTransactions(masterchainBlockNumber, limit, afterLt, addressHash) {
        return this.getBlockTransactions(-1, SHARD_ID_ALL, masterchainBlockNumber, limit, afterLt, addressHash);
    }

    /**
     * Returns block header and his previous blocks ID's
     * @param workchain {number}
     * @param shardId   {string}
     * @param shardBlockNumber  {number}
     */
    async getBlockHeader(workchain, shardId, shardBlockNumber) {
        return this.send('getBlockHeader', {
            workchain: workchain,
            shard: shardId,
            seqno: shardBlockNumber
        });
    }

    /**
     * Returns masterchain block header and his previous block ID
     * @param masterchainBlockNumber  {number}
     */
    async getMasterchainBlockHeader(masterchainBlockNumber) {
        return this.getBlockHeader(-1, SHARD_ID_ALL, masterchainBlockNumber);
    }
}

HttpProvider.SHARD_ID_ALL = SHARD_ID_ALL;

module.exports.default = HttpProvider;
