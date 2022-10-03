const TonWeb = require("./index");

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));

    // Create private key

    const seed = TonWeb.utils.base64ToBytes('vt58J2v6FaBuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);

    // Create v3 wallet

    const WalletClass = tonweb.wallet.all['v3R2'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });

    const walletAddress = (await wallet.getAddress()).toString(true, true, true);
    console.log('my address', walletAddress)

    // Create transfer

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
        amount: TonWeb.utils.toNano('0.01'), // 0.01 TON
        seqno: 0,
        payload: 'The aim of this text is to provide a brief',
        expireAt: Math.floor(Date.now() / 1000) + 60 // now + 60 seconds
    });

    const query = await transfer.getQuery();
    const boc = TonWeb.utils.bytesToBase64(await query.toBoc(false)); // serialized query
    // await tonweb.provider.sendBoc(boc); // send query to network

    // Parse query

    try {
        const parsed = WalletClass.parseTransferQuery(TonWeb.boc.Cell.oneFromBoc(TonWeb.utils.base64ToBytes(boc)));

        parsed.value = parsed.value.toString();
        parsed.fromAddress = parsed.fromAddress.toString(true, true, true);
        parsed.toAddress = parsed.toAddress.toString(true, true, true);
        console.log(parsed);
    } catch (e) {
        console.error(e); // not valid wallet transfer query
    }

    // Get transaction and parse

    const transactions = await tonweb.provider.getTransactions(walletAddress.toString(true, true, true));

    try {
        const tx = transactions[0];
        const inMsgBody = TonWeb.utils.base64ToBytes(tx.in_msg.msg_data.body);
        const parsed = WalletClass.parseTransferBody(TonWeb.boc.Cell.oneFromBoc(inMsgBody).beginParse());

        parsed.value = parsed.value.toString();
        parsed.toAddress = parsed.toAddress.toString(true, true, true);
        console.log(parsed);
    } catch (e) {
        console.error(e); // not valid wallet transfer tx
    }
}

init();