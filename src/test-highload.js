const TonWeb = require("./index");
const {HighloadWalletContractV3, HighloadQueryId} = TonWeb.HighloadWallets;
const {Address, toNano} = TonWeb.utils;
const init = async () => {

    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: ''}));

    // Create v4 wallet

    const seed = TonWeb.utils.hexToBytes('607cdaf518cd38050b536005bea2667d008d5dda1027f9549479f4a42ac315c4');

    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
    console.log('wallet public key =', TonWeb.utils.bytesToHex(keyPair.publicKey));

    const highloadWallet = new HighloadWalletContractV3(tonweb.provider, {
        publicKey: keyPair.publicKey,
        timeout: 60 * 60, // 1 hour
    });

    const highloadAddress = await highloadWallet.getAddress();

    console.log('Highload-wallet address is ' + highloadAddress.toString(true, true, true));

    let queryId = new HighloadQueryId();
    queryId = queryId.getNext();

    const createAt = Math.floor(Date.now() / 1000) - 60;
    console.log(createAt);

    const transfer = highloadWallet.methods.transfer({
        secretKey: keyPair.secretKey,
        queryId: queryId,
        createdAt: createAt,
        toAddress: new Address('UQCdqXGvONLwOr3zCNX5FjapflorB6ZsOdcdfLrjsDLt3AF4'),
        amount: toNano('0.01'), // 0.01 TON
        payload: 'Hello',
        sendMode: 3,
        needDeploy: queryId.getQueryId() === 0n
    });

    // console.log(await transfer.send());

    console.log('isProcessed', await highloadWallet.isProcessed(queryId, false));
    console.log('isProcessed 0', await highloadWallet.isProcessed(HighloadQueryId.fromQueryId(0n), false));
    console.log('isProcessed 10', await highloadWallet.isProcessed(HighloadQueryId.fromQueryId(10n), false));
    console.log('getWalletId', await highloadWallet.getWalletId());
    console.log('getLastCleanTime', await highloadWallet.getLastCleanTime());
    console.log('getTimeout', await highloadWallet.getTimeout());
    console.log('getPublicKey', await highloadWallet.getPublicKey());

}

init();