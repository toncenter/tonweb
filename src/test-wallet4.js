const TonWeb = require("./index");
const {SubscriptionContract} = require("./contract/subscription");

async function init() {
    // Create testnet tonweb

    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));

    // Create v4 wallet

    const seed = TonWeb.utils.hexToBytes('507cdaf518cd38050b536005bea2667d008d5dda1027f9549479f4a42ac315c3');

    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
    const WalletClass = tonweb.wallet.all['v4R1'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });

    // Get wallet address

    const walletAddress = await wallet.getAddress();
    console.log('walletAddress=', walletAddress.toString(true, true, true));

    // wallet seqno get method

    const seqno = await wallet.methods.seqno().call();
    console.log({seqno})

    // Simple transfer

    const simpleTransfer = async () => {
        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: 'EQCmDZwk4sS3Nl2VumtvsDMs5AZ2AqH8yqJzf9y10sxaolWg',
                amount: TonWeb.utils.toNano(0.01), // 0.01 TON
                seqno: seqno || 0,
                payload: 'Hello',
                sendMode: 3,
            }).send()
        );
    }

    // Create subscription

    const subscription = new SubscriptionContract(tonweb.provider, {
        wc: 0,
        wallet: walletAddress,
        beneficiary: new TonWeb.utils.Address('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'),
        amount: TonWeb.utils.toNano(0.1), // 0.1 ton
        period: 60 * 60, // 1 hour,
        timeout: 30 * 60, // 0.5 hour
        subscriptionId: 123
    });
    const subscriptionAddress = await subscription.getAddress();
    console.log('subscriptionAddress=', subscriptionAddress.toString(true, true, true))

    // Deploy and install subscription

    const deployAndInstallPlugin = async () => {
        console.log(
            await wallet.methods.deployAndInstallPlugin({
                secretKey: keyPair.secretKey,
                seqno: seqno,
                pluginWc: 0,
                amount: TonWeb.utils.toNano(0.1), // 0.1 ton
                stateInit: (await subscription.createStateInit()).stateInit,
                body: subscription.createBody(),
            }).send()
        );
    }

    // Install plugin

    const installPlugin = async () => {
        console.log(
            await wallet.methods.installPlugin({
                secretKey: keyPair.secretKey,
                seqno: seqno,
                pluginAddress: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'
            }).send()
        );
    }

    // Remove plugin

    const removePlugin = async () => {
        console.log(
            await wallet.methods.removePlugin({
                secretKey: keyPair.secretKey,
                seqno: seqno,
                pluginAddress: 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'
            }).send()
        );
    }

    // Subscription get-methods

    const subscriptionGetMethods = async () => {
        console.log('', await subscription.methods.getSubscriptionData());
    }

    const subscriptionPay = async () => {
        console.log('', await subscription.methods.pay().send());
    }

    // Wallet get-methods

    const walletGetMethods = async () => {
        console.log('publicKey', (await wallet.methods.getPublicKey()).toString(16));
        console.log('pluginList', await wallet.methods.getPluginsList());
        console.log('isPluginInstalled1', await wallet.methods.isPluginInstalled('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'))
        console.log('isPluginInstalled2', await wallet.methods.isPluginInstalled(subscriptionAddress.toString(true, true, true)));
    }

    //

    // await simpleTransfer();
    // await deployAndInstallPlugin();
    // await installPlugin();
    // await removePlugin();
    await walletGetMethods();
    await subscriptionGetMethods();


}

init();
