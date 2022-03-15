
const nacl = require('tweetnacl');

const TonWeb = require('../../src');
const { TestHttpProvider } = require('./test-http-provider');
const utils = TonWeb.utils;

const FakeTimers = require('@sinonjs/fake-timers');
FakeTimers.install();

const testProvider = new TestHttpProvider();

// noinspection JSCheckFunctionSignatures
const keyPair = nacl.sign.keyPair.fromSeed(
    Uint8Array.from('12345678912345678912345678912345')
);

const testAddress = 'UQBhK88OC8wm21NbmS3ElxpJqybSQHZN8FdXWISVP8SWeiMn';


(async () => {

    //=======//
    // SEQNO //
    //=======//

    for (const WalletType of TonWeb.Wallets.list) {

        let wallet = new WalletType(
            testProvider, {
                publicKey: keyPair.publicKey,
            }
        );

        await wallet.methods.seqno().call();

        console.log(`\n${WalletType.name} (public-key)`);
        console.log(JSON.stringify(testProvider.calls, null, 4));
        testProvider.calls = [];


        wallet = new WalletType(
            testProvider, {
                address: testAddress,
            }
        );

        await wallet.methods.seqno().call();

        console.log(`\n${WalletType.name} (address)`);
        console.log(JSON.stringify(testProvider.calls, null, 4));
        testProvider.calls = [];

    }


    //==================//
    // TRANSFER, DEPLOY //
    //==================//

    let results = [];

    for (const WalletType of TonWeb.Wallets.list) {

        const wallet = new WalletType(
            testProvider, {
                publicKey: keyPair.publicKey,
            }
        );

        const result = {
            type: WalletType.name,
            address: (await wallet.getAddress()).toString(true, true),
        };


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

        results.push(result);

    }

    console.log(JSON.stringify(results, null, 4));

})();
