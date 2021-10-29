const TonWeb = require("./index");

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));

    const seed = TonWeb.utils.hexToBytes('507cdaf518cd38050b536005bea2667d008d5dda1027f9549479f4a42ac315c3');

    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
    const WalletClass = tonweb.wallet.all['v4R1'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });
    console.log('address=', (await wallet.getAddress()).toString(true, true, true));

    // console.log(
    //     await wallet.methods.transfer({
    //         secretKey: keyPair.secretKey,
    //         toAddress: 'EQCmDZwk4sS3Nl2VumtvsDMs5AZ2AqH8yqJzf9y10sxaolWg',
    //         amount: TonWeb.utils.toNano(0.01), // 0.01 TON
    //         seqno: 0,
    //         payload: 'Hello',
    //         sendMode: 3,
    //     }).send()
    // );

    // console.log(
    //     await wallet.methods.installPlugin({
    //         secretKey: keyPair.secretKey,
    //         seqno: 2,
    //         pluginAddress: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'
    //     }).send()
    // );

    // console.log(
    //     await wallet.methods.removePlugin({
    //         secretKey: keyPair.secretKey,
    //         seqno: 3,
    //         pluginAddress: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'
    //     }).send()
    // );

    console.log('publicKey', await wallet.methods.getPublicKey())
    // console.log('pluginList', await wallet.methods.getPluginsList())
    console.log('isPluginInstalled', await wallet.methods.isPluginInstalled('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'))
}

init();
