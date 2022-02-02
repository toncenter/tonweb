const {Cell} = require("../boc");
const {Address, BN, bytesToHex} = require("../utils");
const {Contract} = require("../contract");

class AppTon {

    /**
     * @param transport {Transport} @ledgerhq/hw-transport
     * @param ton   {TonWeb}
     */
    constructor(transport, ton) {
        this.transport = transport;
        this.ton = ton;

        this.ADDRESS_FORMAT_HEX = 0;
        this.ADDRESS_FORMAT_USER_FRIENDLY = 1;
        this.ADDRESS_FORMAT_URL_SAFE = 2;
        this.ADDRESS_FORMAT_BOUNCEABLE = 4;
        this.ADDRESS_FORMAT_TEST_ONLY = 8;

        // todo: узнать зачем вызывается decorateAppAPIMethods
        // const scrambleKey = "w0w";
        // transport.decorateAppAPIMethods(
        //     this,
        //     [
        //         "getAppConfiguration",
        //         "getAddress",
        //         "sign",
        //         "signTransfer",
        //     ],
        //     scrambleKey
        // );
    }

    /***
     * Get App version
     * @return {{version: string}}
     */
    async getAppConfiguration() {
        const response = await this.transport.send(0xe0, 0x01, 0x00, 0x00);
        return {
            version: "" + response[0] + "." + response[1] + "." + response[2] // major version, minor version, patch version
        };
    }

    /**
     * This command returns a public key for the given account number
     * @param accountNumber {number}
     * @param isDisplay {boolean} display public key and confirm before returning
     * @return {{publicKey: Uint8Array}}
     */
    async getPublicKey(accountNumber, isDisplay) {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(accountNumber);

        const response = await this.transport
            .send(
                0xe0,
                0x02,
                isDisplay ? 0x01 : 0x00,
                0x00,
                buffer
            );
        const len = response[0];
        const publicKey = new Uint8Array(response.slice(1, 1 + len));
        return {publicKey};
    }

    /**
     * This command returns a wallet v3R1 address for the given account number
     * @param accountNumber {number}
     * @param isDisplay {boolean} display address and confirm before returning
     * @param addressFormat {number} display address format (use sum of ADDRESS_FORMAT_ constants)
     * @return {{address: Address}}
     */
    async getAddress(accountNumber, isDisplay, addressFormat) {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(accountNumber);

        const response = await this.transport
            .send(
                0xe0,
                0x05,
                isDisplay ? 0x01 : 0x00,
                addressFormat,
                buffer
            );
        const len = response[0];
        const addressHex = new Uint8Array(response.slice(1, 1 + len));
        const address = new Address('0:' + bytesToHex(addressHex));
        return {address};
    }

    /**
     * Sign a bytes
     * @param accountNumber {number}
     * @param buffer    {Buffer}
     * @return {{signature: Buffer}}
     */
    async sign(accountNumber, buffer) {
        const accountNumberBuffer = Buffer.alloc(4);
        accountNumberBuffer.writeInt32BE(accountNumber);
        const signBuffer = Buffer.concat([accountNumberBuffer, Buffer.from(buffer)]);

        const response = await this.transport
            .send(
                0xe0,
                0x03,
                0x00,
                0x00,
                signBuffer
            );

        const len = response[0];
        const signature = response.slice(1, 1 + len);
        return {signature};
    }

    /**
     * Sign a transfer coins message (same with TonWeb.WalletContract.createTransferMessage)
     * if seqno === 0 it will be deploy wallet + transfer coins message
     * @param accountNumber {number}
     * @param wallet {WalletContract}  Sender wallet
     * @param toAddress {String | Address}  Destination address in any format
     * @param amount    {BN | number}  Transfer value in nanograms
     * @param seqno {number}
     * @param addressFormat {number} display address format (use sum of ADDRESS_FORMAT_ constants)
     * @return
     */
    async transfer(accountNumber, wallet, toAddress, amount, seqno, addressFormat) {
        const sendMode = 3;

        const query = await wallet.createTransferMessage(null, toAddress, amount, seqno, null, sendMode, true);

        const accountNumberBuffer = Buffer.alloc(4);
        accountNumberBuffer.writeInt32BE(accountNumber);
        const msgBuffer = Buffer.concat([accountNumberBuffer, Buffer.from(await query.signingMessage.toBoc())]);

        const response = await this.transport
            .send(
                0xe0,
                0x04,
                addressFormat,
                0x00,
                msgBuffer
            );

        const len = response[0];
        const signatureBuffer = response.slice(1, 1 + len);
        const signature = new Uint8Array(signatureBuffer);

        const body = new Cell();
        body.bits.writeBytes(signature);
        body.writeCell(query.signingMessage);

        let stateInit = null, code = null, data = null;

        if (seqno === 0) {
            const deploy = await wallet.createStateInit();
            stateInit = deploy.stateInit;
            code = deploy.code;
            data = deploy.data;
        }

        const selfAddress = await wallet.getAddress();
        const header = Contract.createExternalMessageHeader(selfAddress);
        const resultMessage = Contract.createCommonMsgInfo(header, stateInit, body);

        const resultPromise = new Promise(resolve => {
            resolve({
                address: selfAddress,
                message: resultMessage, // old wallet_send_generate_external_message

                body: body,
                signature: signature,
                signingMessage: query.signingMessage,

                stateInit,
                code,
                data,
            });
        });

        return Contract.createMethod(
            this.ton.provider,
            resultPromise
        );
    }
}

module.exports = AppTon;