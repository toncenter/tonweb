
const nacl = require('tweetnacl');

const TonWeb = require('../../src');
const { TestHttpProvider } = require('./test-http-provider');
const utils = TonWeb.utils;
const Lockup = TonWeb.LockupWallets;

const FakeTimers = require('@sinonjs/fake-timers');
FakeTimers.install();


const testProvider = new TestHttpProvider();

// noinspection JSCheckFunctionSignatures
const keyPair = nacl.sign.keyPair.fromSeed(
    Uint8Array.from('12345678912345678912345678912345')
);

const testAddress = 'UQBhK88OC8wm21NbmS3ElxpJqybSQHZN8FdXWISVP8SWeiMn';

const wallets = [
    TonWeb.Wallets.all.simpleR1,
    TonWeb.Wallets.all.simpleR2,
    TonWeb.Wallets.all.simpleR3,
    TonWeb.Wallets.all.v2R1,
    TonWeb.Wallets.all.v2R2,
    TonWeb.Wallets.all.v3R1,
    TonWeb.Wallets.all.v3R2,
    TonWeb.Wallets.all.v4R1,
    TonWeb.Wallets.all.v4R2,
    Lockup.LockupWalletV1,
];


(async () => {

    let results = [];

    for (const WalletType of wallets) {

        let walletExtraOptions = {};

        if (WalletType.name === 'LockupWalletV1') {
            walletExtraOptions = {
                config: {
                    config_public_key: utils.bytesToBase64(keyPair.publicKey),
                },
            };
        }

        //====================//
        // SEQNO (PUBLIC KEY) //
        //====================//

        let wallet = new WalletType(
            testProvider, {
                publicKey: keyPair.publicKey,
                ...walletExtraOptions,
            }
        );

        await wallet.methods.seqno().call();

        console.log(`\n${WalletType.name} (public-key)`);
        console.log(JSON.stringify(testProvider.calls, null, 4));
        testProvider.calls = [];


        //=================//
        // SEQNO (ADDRESS) //
        //=================//

        wallet = new WalletType(
            testProvider, {
                address: testAddress,
                ...walletExtraOptions,
            }
        );

        await wallet.methods.seqno().call();

        console.log(`\n${WalletType.name} (address)`);
        console.log(JSON.stringify(testProvider.calls, null, 4));
        testProvider.calls = [];


        //===============//
        // OTHER METHODS //
        //===============//

        wallet = new WalletType(
            testProvider, {
                publicKey: keyPair.publicKey,
                ...walletExtraOptions,
            }
        );

        const result = {
            type: WalletType.name,
            address: (await wallet.getAddress()).toString(true, true),
        };


        //===================//
        // TRANSFER: SEQNO 0 //
        //===================//

        await (async () => {
            const method = wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: testAddress,
                amount: 1050,
                seqno: 0,
            });

            const queryCell = await method.getQuery();
            const queryBoc = await queryCell.toBoc();

            result.queryBocB64Seqno0 = utils.bytesToBase64(queryBoc);

        })();


        //===================//
        // TRANSFER: SEQNO 1 //
        //===================//

        await (async () => {
            const method = wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: testAddress,
                amount: 1050,
                seqno: 1,
            });

            const queryCell = await method.getQuery();
            const queryBoc = await queryCell.toBoc();

            result.queryBocB64Seqno1 = utils.bytesToBase64(queryBoc);

        })();


        //==============================//
        // TRANSFER: SEQNO 1, SEND MODE //
        //==============================//

        await (async () => {
            const method = wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: testAddress,
                amount: 1050,
                seqno: 1,
                sendMode: (128 + 32 + 2),
            });

            const queryCell = await method.getQuery();
            const queryBoc = await queryCell.toBoc();

            result.queryBocB64Seqno1SendMode = utils.bytesToBase64(queryBoc);

        })();


        //=================//
        // PAYLOAD: STRING //
        //=================//

        await (async () => {
            const method = wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: testAddress,
                amount: 1050,
                seqno: 1,
                payload: 'MARCO',
            });

            const queryCell = await method.getQuery();
            const queryBoc = await queryCell.toBoc();

            result.queryBocB64Seqno1PayloadStr = (
                utils.bytesToBase64(queryBoc)
            );

        })();


        //===========================//
        // PAYLOAD: MULTIBYTE STRING //
        //===========================//

        await (async () => {
            const method = wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: testAddress,
                amount: 1050,
                seqno: 1,
                payload: '1B: A, 2B: Ω, 3B: ಄, 4B: 𓅱',
            });

            const queryCell = await method.getQuery();
            const queryBoc = await queryCell.toBoc();

            result.queryBocB64Seqno1PayloadMBStr = (
                utils.bytesToBase64(queryBoc)
            );

        })();


        //================//
        // PAYLOAD: BYTES //
        //================//

        await (async () => {
            const method = wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: testAddress,
                amount: 1050,
                seqno: 1,
                payload: Uint8Array.from([1, 3, 3, 7]),
            });

            const queryCell = await method.getQuery();
            const queryBoc = await queryCell.toBoc();

            result.queryBocB64Seqno1PayloadBytes = (
                utils.bytesToBase64(queryBoc)
            );

        })();


        //===============//
        // PAYLOAD: CELL //
        //===============//

        await (async () => {

            const payload = new TonWeb.boc.Cell();

            payload.bits.writeBit(true);
            payload.bits.writeBit(false);
            payload.bits.writeBit(true);
            payload.bits.writeGrams(100500);
            payload.bits.writeString('MARCO');

            payload.bits.writeAddress(
                new TonWeb.Address(testAddress)
            );

            const method = wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: testAddress,
                amount: 1050,
                seqno: 1,
                payload,
            });

            const queryCell = await method.getQuery();
            const queryBoc = await queryCell.toBoc();

            result.queryBocB64Seqno1PayloadCell = (
                utils.bytesToBase64(queryBoc)
            );

        })();


        //==========//
        // GET NAME //
        //==========//

        await (async () => {
            result.name = wallet.getName();
        })();


        //========//
        // DEPLOY //
        //========//

        await (async () => {

            const queryCell = (await wallet
                .deploy(keyPair.secretKey)
                .getQuery()
            );

            const queryBoc = await queryCell.toBoc();

            result.deployQueryBocB64 = (
                utils.bytesToBase64(queryBoc)
            );

        })();

        results.push({
            name: result.name,
            queryBocB64Seqno1PayloadMBStr: result.queryBocB64Seqno1PayloadMBStr,
        });

    }

    console.log(JSON.stringify(results, null, 4));

})();
