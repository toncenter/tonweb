const TonWeb = require("./index");
const {HighloadWalletContractV3, HighloadQueryId} = TonWeb.HighloadWallets;
const {Address, toNano} = TonWeb.utils;

const receiver = new Address('UQCdqXGvONLwOr3zCNX5FjapflorB6ZsOdcdfLrjsDLt3AF4');
const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: ''}));

const seed = TonWeb.utils.hexToBytes('607cdaf518cd38050b536005bea2667d008d5dda1027f9549479f4a42ac315c4');

const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
const highloadWallet = new HighloadWalletContractV3(tonweb.provider, {
    publicKey: keyPair.publicKey,
    timeout: 60 * 60, // 1 hour
});

let queryId = new HighloadQueryId();



const ecTransfer = async () => {

    console.log("Testing extra currency send");
    // queryId = queryId.getNext();

    const createAt = Math.floor(Date.now() / 1000) - 200;
    console.log(createAt);

    const stateBefore = await tonweb.provider.getAddressInfo(receiver.toString());
    let lastTx = {lt: new TonWeb.utils.BN(stateBefore.last_transaction_id.lt), hash: stateBefore.last_transaction_id.hash};
    const toSend  = new TonWeb.utils.BN(1 * (10 ** 6));
    let balanceBefore;
    let ecFound = stateBefore.extra_currencies.find(x => (x.id == 100));
    if(ecFound) {
        balanceBefore = new TonWeb.utils.BN(ecFound.amount);
    } else {
        balanceBefore = new TonWeb.utils.BN(0);
    }

    const transfer = highloadWallet.methods.transfer({
        secretKey: keyPair.secretKey,
        queryId: queryId,
        createdAt: createAt,
        toAddress: receiver.toString(),
        amount: new TonWeb.utils.CurrencyCollection(0, {id: 100, value: toSend}),
        payload: 'Hello highload EC',
        sendMode: 3,
        needDeploy: queryId.getQueryId() === 0n
    });


    await transfer.send();

    const depositTx = await tonweb.waitForTx(highloadWallet.address, receiver, lastTx.lt, lastTx.hash);

    if(depositTx.in_msg.extra_currencies.find(c => c.id == 100 && new TonWeb.utils.BN(c.amount).eq(toSend)) == undefined) {
        console.log(depositTx);
        throw Error("Incoming message doesn't contain expected amount of ec");
    }
    const stateAfter = await tonweb.provider.getAddressInfo(receiver.toString());
    ecFound = stateAfter.extra_currencies.find(x => (x.id == 100));
    if(ecFound) {
        if((new TonWeb.utils.BN(ecFound.amount)).eq(balanceBefore.add(toSend))) {
            console.log(`${receiver.toString(true, true, true)} got ${toSend} EC`);
        } else {
            console.log(stateAfter);
            throw Error(`Expected balance ${balanceBefore.add(toSend)} got ${ecFound.amount}`);
        }
    } else {
        console.log(stateAfter);
        throw Error("No extra currency with id 100 present on receiver address");
    }
}

const init = async () => {

    console.log('wallet public key =', TonWeb.utils.bytesToHex(keyPair.publicKey));

    const highloadAddress = await highloadWallet.getAddress();

    console.log('Highload-wallet address is ' + highloadAddress.toString(true, true, true));

    const stateBefore = await tonweb.provider.getAddressInfo(receiver.toString(true, true, true));
    const ltBefore    = stateBefore.last_transaction_id.lt;

    do {
        queryId = queryId.getNext();
    } while(await highloadWallet.isProcessed(queryId, false));

    const createAt = Math.floor(Date.now() / 1000) - 200;
    console.log(createAt);

    const transfer = highloadWallet.methods.transfer({
        secretKey: keyPair.secretKey,
        queryId: queryId,
        createdAt: createAt,
        toAddress: receiver,
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

    await ecTransfer();
}

init();