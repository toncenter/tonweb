
const nacl = require('tweetnacl');

const TonWeb = require('../../src');
const utils = TonWeb.utils;
const { TestHttpProvider } = require('./test-http-provider');


const FakeTimers = require('@sinonjs/fake-timers');
FakeTimers.install();


(async () => {

    const testProvider = new TestHttpProvider();

    // Address: UQC63Lo54ZfLTGo12UECZc8Ba3g-dEVhvzy7Vroe43-AQzAe
    const keyPair = nacl.sign.keyPair.fromSeed(
        new Uint8Array(32)
    );

    const wallet = new TonWeb.Wallets.all.v4R2(
        testProvider, {
            publicKey: keyPair.publicKey,
        }
    );

    const method = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: 'UQC63Lo54ZfLTGo12UECZc8Ba3g-dEVhvzy7Vroe43-AQzAe',
        amount: 1050,
        seqno: 1,
    });

    const queryCell = await method.getQuery();
    const queryBoc = await queryCell.toBoc();
    const queryBocB64 = utils.bytesToBase64(queryBoc);

    console.log(queryBocB64);

})();
