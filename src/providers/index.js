let XMLHttpRequest;
if (typeof window === 'undefined') {
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
} else {
    XMLHttpRequest = window.XMLHttpRequest;
}

class HttpProvider {
    /**
     * @param host? {string}
     */
    constructor(host) {
        this.host = host || "https://toncenter.com/api/test/v2/jsonRPC";
    }

    /**
     * @private
     * @param apiUrl   {string}
     * @param request   {any}
     * @return {Promise<any>}
     */
    sendImpl(apiUrl, request) {
        return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", apiUrl, true);

            xhr.onload = function () {
                if (this.status == 200) {
                    const r = JSON.parse(this.responseText);
                    if ("error" in r) {
                        reject(r["error"]);
                    }
                    resolve(r["result"]);
                } else {
                    const error = new Error(this.statusText);
                    error.code = this.status;
                    reject(error);
                }
            };

            xhr.onerror = function () {
                reject(new Error("Network Error"));
            };
            xhr.setRequestHeader("content-type", "application/json");
            xhr.send(JSON.stringify(request));
        });
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
     * @return array of transaction object
     */
    async getTransactions(address, limit = 20) {
        return this.send("getTransactions", {address, limit});
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
     * @deprecated
     * @param query     object as described https://toncenter.com/api/test/v2/#estimateFeeSimple
     * @return fees object
     */
    async getEstimateFee(query) {
        return this.send("estimateFeeSimple", query);
    };

    /**
     * Invoke get-method of smart contract
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
}

module.exports.default = HttpProvider;