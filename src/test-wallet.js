const TonWeb = require("./index");

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));

    // Create private key

    const seed = TonWeb.utils.hexToBytes('607cdaf518cd38050b536005bea2667d008d5dda1027f9549479f4a42ac315c4');
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);

    // Create v3 wallet

    const WalletClass = tonweb.wallet.all['v3R2'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });

    console.log('my address', (await wallet.getAddress()).toString(true, true, true))

    // Create transfer

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
        amount: TonWeb.utils.toNano(0.01), // 0.01 TON
        seqno: 1,
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
}

init();