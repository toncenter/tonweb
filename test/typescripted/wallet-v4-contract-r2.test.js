
const nacl = require('tweetnacl');

const TonWeb = require('../../src');
const utils = TonWeb.utils;
const { TestHttpProvider } = require('./test-http-provider');


const FakeTimers = require('@sinonjs/fake-timers');
FakeTimers.install();


(async () => {

    const testProvider = new TestHttpProvider();

    // noinspection JSCheckFunctionSignatures
    const keyPair = nacl.sign.keyPair.fromSeed(
        Uint8Array.from('12345678912345678912345678912345')
    );

    const wallet = new TonWeb.Wallets.all.v4R2(
        testProvider, {
            publicKey: keyPair.publicKey,
        }
    );

    const results = {
        address: (await wallet.getAddress()).toString(true, true),
    };

    await (async () => {
        const method = wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: 'UQAXQH-lFETZ9KncaE4qs0XVTAYMMC2AGSKPNKhvt_Do45ym',
            amount: 1050,
            seqno: 0,
        });

        const queryCell = await method.getQuery();
        const queryBoc = await queryCell.toBoc();

        results.queryBocB64Seqno0 = utils.bytesToBase64(queryBoc);

    })();

    await (async () => {
        const method = wallet.methods.transfer({
            secretKey: keyPair.secretKey,
            toAddress: 'UQAXQH-lFETZ9KncaE4qs0XVTAYMMC2AGSKPNKhvt_Do45ym',
            amount: 1050,
            seqno: 1,
        });

        const queryCell = await method.getQuery();
        const queryBoc = await queryCell.toBoc();

        results.queryBocB64Seqno1 = utils.bytesToBase64(queryBoc);

    })();

    console.log(JSON.stringify(results, null, 4));

})();
