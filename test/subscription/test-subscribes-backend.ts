
import TonWeb from '../../src/index';
import { TestBlocksStorage } from './test-block-storage';


const BN = TonWeb.utils.BN;
const Address = TonWeb.utils.Address;


(async () => {

    const tonweb = new TonWeb(
        new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC')
    );

    const storage = new TestBlocksStorage();

    // Force to process last N transaction of publisher address and find subscriptions
    await pollAddress('EQCmDZwk4sS3Nl2VumtvsDMs5AZ2AqH8yqJzf9y10sxaolWg');

    // Subscribe to new network blocks and find subscriptions
    const blockSubscribe = new TonWeb.BlockSubscription(
        tonweb.provider,
        storage,
        onTransaction
    );

    await blockSubscribe.start();

    // Payments interval
    let isPaymentsProcessing = false;
    setInterval(() => paymentsTick(), 60 * 1000); // 1 min


    async function processTransaction(
        /**
         * Publisher address.
         */
        address: string,

        /**
         * tx from `getTransactions()`
         */
        tx: any

    ): Promise<boolean> {

        const msg = tx.in_msg;
        if (!msg) {
            return false;
        }

        if (msg.message !== 'ODY6s4A=\n') {
            return false; // msg from subscription prefix
        }

        const subscriptionAddress = msg.source; // subscription contract address
        const amount = new BN(msg.value); // coins received by the publisher (in nanotons); subscription amount minus fee and withheld 0.0671 ton

        // get subscription data

        const subscription = new TonWeb.SubscriptionContract(tonweb.provider, {
            address: subscriptionAddress,
        });
        const subscriptionData = await subscription.getSubscriptionData();

        // check subscription contract validity

        const subscription2 = new TonWeb.SubscriptionContract(tonweb.provider, {
            wc: 0,
            wallet: new Address(subscriptionData.wallet),
            beneficiary: new Address(subscriptionData.beneficiary),
            amount: subscriptionData.amount,
            period: subscriptionData.period,
            startAt: subscriptionData.startAt,
            timeout: subscriptionData.timeout,
            subscriptionId: subscriptionData.subscriptionId
        });
        const validSubscriptionAddress = await subscription2.getAddress();
        if (new Address(subscriptionAddress).toString(false) !== validSubscriptionAddress.toString(false)) {
            return false;
        }

        // todo: check subscription data === bot subscription data for this publisher `address` + `subscriptionId`

        // notify

        const isNew = !(await storage.isSubscription(subscriptionAddress));

        if (isNew) {
            await storage.replaceSubscription(subscriptionAddress, subscriptionData);
        }

        console.log(`Notify: publisher ${address} receive ${TonWeb.utils.fromNano(amount)} from ${isNew ? 'new' : ''} subscriber ${subscriptionData.wallet}  via ${subscriptionAddress} subscription contract; subscription ID = ${subscriptionData.subscriptionId}`);

        return true;

    }

    async function pollAddress(address: string) {
        const LIMIT = 20;
        const txs = await tonweb.provider.getTransactions(address, LIMIT);
        for (const tx of txs) {
            await processTransaction(address, tx);
        }
    }

    async function onTransaction(shortTx: any) {
        const address = shortTx.account;

        if (await storage.isPublisher(address)) {
            const txs = await tonweb.provider.getTransactions(
                address,
                1,
                shortTx.lt,
                shortTx.hash
            );
            const tx = txs[0];
            if (tx) {
                await processTransaction(address, tx);
            } else {
                console.error('Cant get tx', shortTx);
            }
        }
    }

    async function paymentsTick() {
        if (isPaymentsProcessing) {
            return;
        }
        isPaymentsProcessing = true;
        try {
            const subscriptions = await storage.getSubscriptionsReadyForPayment();
            for (const s of subscriptions) {
                const subscription = new TonWeb.SubscriptionContract(tonweb.provider, {
                    address: s.address,
                });
                const subscriptionData = await subscription.getSubscriptionData();
                await storage.replaceSubscription(s.address, subscriptionData);
                await subscription.methods.pay().send();
            }
        } catch (error) {
            console.error(error);
        }
        isPaymentsProcessing = false;
    }

})();
