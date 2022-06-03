const TonWeb = require("./index");
const {SubscriptionContract} = require("./contract/subscription");

async function init() {
    const BENEFICIARY = 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG';

    // Create testnet tonweb

    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));

    // Create v4 wallet

    const seed = TonWeb.utils.hexToBytes('607cdaf518cd38050b536005bea2667d008d5dda1027f9549479f4a42ac315c4');

    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
    console.log('wallet public key =', TonWeb.utils.bytesToHex(keyPair.publicKey));

    const WalletClass = tonweb.wallet.all['v4R2'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });

    // Get wallet address

    const walletAddress = await wallet.getAddress();
    const WALLET_ADDRESS = walletAddress.toString(true, true, true);
    console.log('wallet address =', WALLET_ADDRESS);

    // wallet seqno get method

    const seqno = (await wallet.methods.seqno().call()) || 0;
    console.log('wallet seqno = ', seqno);

    // Simple transfer

    const simpleTransfer = async () => {
        console.log(
            'simpleTransfer',
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: BENEFICIARY,
                amount: TonWeb.utils.toNano('0.01'), // 0.01 TON
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
        beneficiary: new TonWeb.utils.Address(BENEFICIARY),
        amount: TonWeb.utils.toNano('1'), // 1 ton
        startAt: 123,
        period: 2 * 60, // 2 min,
        timeout: 30, // 30 sec
        subscriptionId: 123
    });
    const subscriptionAddress = await subscription.getAddress();
    console.log('subscription address=', subscriptionAddress.toString(true, true, true))

    // Deploy and install subscription

    const deployAndInstallPlugin = async () => {
        console.log(
            'deployAndInstallPlugin',
            await wallet.methods.deployAndInstallPlugin({
                secretKey: keyPair.secretKey,
                seqno: seqno,
                pluginWc: 0,
                amount: TonWeb.utils.toNano('1'), // 1 ton
                stateInit: (await subscription.createStateInit()).stateInit,
                body: subscription.createBody(),
            }).send()
        );
    };

    const PLUGIN_ADDRESS = subscriptionAddress.toString(true, true, true);

    // Install plugin

    const installPlugin = async () => {
        console.log(
            'installPlugin',
            await wallet.methods.installPlugin({
                secretKey: keyPair.secretKey,
                seqno: seqno,
                pluginAddress: PLUGIN_ADDRESS,
                // amount: TonWeb.utils.toNano('0')
            }).send()
        );
    }

    // Remove plugin

    const removePlugin = async () => {
        console.log(
            'removePlugin',
            await wallet.methods.removePlugin({
                secretKey: keyPair.secretKey,
                seqno: seqno,
                pluginAddress: PLUGIN_ADDRESS,
                // amount: TonWeb.utils.toNano('0')
            }).send()
        );
    }

    // Subscription get-methods

    const subscriptionGetMethods = async () => {
        const data = await subscription.methods.getSubscriptionData();
        console.log('subscriptionGetMethods', data);
        console.log('subscriptionGetMethods amount', data.amount.toString());
    }

    const subscriptionPay = async () => {
        console.log('subscriptionPay', await subscription.methods.pay().send());
    }

    // Wallet get-methods

    const walletGetMethods = async () => {
        console.log('walletGetMethods:');
        const pubkey = (await wallet.methods.getPublicKey()).toString(16);
        console.log('publicKey', pubkey);
        if (pubkey !== 'c204f35296aadbd0b4c7e905dcd087a94733d284456f05813e9184059a61a9fd') throw new Error('invalid pubkey');
        const walletId = await wallet.methods.getWalletId();
        console.log('walletId', walletId);
        if (walletId !== 698983191) throw new Error('invalid walletId');
        const pluginList = await wallet.methods.getPluginsList();
        console.log('pluginList', pluginList.length, pluginList);
        console.log('isPluginInstalled1', await wallet.methods.isPluginInstalled(BENEFICIARY));
        console.log('isPluginInstalled2', await wallet.methods.isPluginInstalled(PLUGIN_ADDRESS));
    }

    //

    // await simpleTransfer();
    // await deployAndInstallPlugin();
    // await installPlugin();
    // await removePlugin();
    // await walletGetMethods();
    // await subscriptionGetMethods();
    // await subscriptionPay();

    // self destruct by beneficiary

    const selfDestruct = async () => {
        const seed = TonWeb.utils.hexToBytes('');

        const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
        const WalletClass = tonweb.wallet.all['v3R1'];
        const wallet = new WalletClass(tonweb.provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        console.log(await wallet.getAddress().toString(true, true, true))
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const body = new TonWeb.boc.BitString(32 + 64);
        body.writeUint(0x64737472, 32); // op
        body.writeUint(124, 64); // query id

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: PLUGIN_ADDRESS,
                amount: TonWeb.utils.toNano('0.2'),
                seqno: seqno || 0,
                payload: body.array,
                sendMode: 3,
            }).send()
        );
    }

    const requestPayment = async () => {
        const seed = TonWeb.utils.hexToBytes('');

        const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
        const WalletClass = tonweb.wallet.all['v3R1'];
        const wallet = new WalletClass(tonweb.provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });
        console.log(await wallet.getAddress().toString(true, true, true))
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const body = new TonWeb.boc.Cell();
        body.bits.writeUint(0x706c7567, 32); // op
        body.bits.writeUint(123, 64); // query id
        body.bits.writeGrams(TonWeb.utils.toNano('2.22'));
        body.bits.writeUint(0, 1); //  dict empty

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: WALLET_ADDRESS,
                amount: TonWeb.utils.toNano('0.016'),
                seqno: seqno || 0,
                payload: body,
                sendMode: 3,
            }).send()
        );
    }

    // await selfDestruct();
    // await requestPayment();

}

init();
