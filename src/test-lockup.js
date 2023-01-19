const TonWeb = require("./index");

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: undefined}));

    const walletSeed = TonWeb.utils.base64ToBytes('vt58J2v6FaBuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
    const walletKeyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(walletSeed);

    // Create private key

    const seed = TonWeb.utils.base64ToBytes('vt58J2v6FaBuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);

    // Create v3 wallet

    console.log(JSON.stringify({
        publicKey: TonWeb.utils.bytesToBase64(keyPair.publicKey),
        workchain: 0,
        wallet_type: "lockup-0.1",
        config_public_key: TonWeb.utils.bytesToBase64(walletKeyPair.publicKey),
        allowed_destinations: 'te6cckEBBQEAegACA3TAAQIARaDgDSLz4J0acX8OFQcd/3ZHU40fqwgD28tn9YtwIiF8EFfQAgV/v7ADBABDv7MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzQABDv5VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQH26pHc='
    }));


    const WalletClass = tonweb.lockupWallet.LockupWalletV1;
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0,
        config: {
            config_public_key: TonWeb.utils.bytesToBase64(walletKeyPair.publicKey),
            allowed_destinations: 'te6cckEBBQEAegACA3TAAQIARaDgDSLz4J0acX8OFQcd/3ZHU40fqwgD28tn9YtwIiF8EFfQAgV/v7ADBABDv7MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzQABDv5VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQH26pHc='
        }
    });

    const walletAddress = (await wallet.getAddress()).toString(true, true, true);
    console.log('my address', walletAddress)

    // await wallet.deploy(keyPair.secretKey).send();

    const seqno = (await wallet.methods.seqno().call()) || 0;
    console.log({seqno});

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N',
        amount: TonWeb.utils.toNano('0.01'), // 0.01 TON
        seqno: seqno,
        payload: 'Transfer'
    });

    await transfer.send();

}

init();