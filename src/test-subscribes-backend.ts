const TonWeb = require("./index");
const BN = TonWeb.utils.BN;
const Address = TonWeb.utils.Address;

/**
 * Storage for storing block numbers that we have already processed.
 *
 * Dumb in-memory block numbers storage implementation
 * Just an example of what it should do
 */
class BlocksStorageImpl {
    masterchainBlocks = {}; // mcBlockNumber {number} -> isProcessed {boolean}
    shardchainBlocks = {}; // shardId {string} + shardBlockNumber {number} -> isProcessed {boolean}

    constructor() {
    }

    /**
     * @private
     * Insert new UNprocessed shardchain block numbers
     * Block number (shardId + shardBlockNumber) should be IGNORED if it is already in the storage
     * @param   shardBlockNumbers {[{shardId: string, shardBlockNumber: number}]}
     */
    async insertShardBlocks(shardBlockNumbers) {
        for (const {shardId, shardBlockNumber} of shardBlockNumbers) {
            if (this.shardchainBlocks[shardId + '_' + shardBlockNumber] !== undefined) continue;
            // INSERT INTO shardchainBlocks VALUES (shardId, shardBlockNumber, FALSE)
            console.log('insert shard ' + shardId + ' ' + shardBlockNumber);
            this.shardchainBlocks[shardId + '_' + shardBlockNumber] = false;
        }
    }

    /**
     * Insert new processed masterchain block number & new UNprocessed shardchains blocks numbers
     * Must be in single DB transaction
     * @param   mcBlockNumber {number}
     * @param   shardBlockNumbers {[{shardId: string, shardBlockNumber: number}]}
     */
    async insertBlocks(mcBlockNumber, shardBlockNumbers) {
        console.log('mc processed ' + mcBlockNumber);
        // INSERT INTO masterchainBlocks VALUES (blockNumber, TRUE)
        if (this.masterchainBlocks[mcBlockNumber] !== undefined) throw new Error('mc already exists ' + mcBlockNumber);
        this.masterchainBlocks[mcBlockNumber] = true;

        await this.insertShardBlocks(shardBlockNumbers);
    }

    /**
     * Get last processed masterchain block number
     * @return {Promise<number | undefined>}
     */
    async getLastMasterchainBlockNumber() {
        // SELECT MAX(blockNumber) FROM masterchainBlocks
        const blockNumbers = Object.keys(this.masterchainBlocks)
            .map(x => Number(x))
            .sort((a, b) => b - a);
        return blockNumbers[0];
    }

    /**
     * Set that this shardchain block number processed & insert new UNprocessed shardchains blocks numbers
     * Must be in single DB transaction
     * @param   shardId {string}
     * @param   shardBlockNumber    {number}
     * @param   prevShardBlocks    {[{shardId: string, shardBlockNumber: number}]}
     */
    async setBlockProcessed(shardId, shardBlockNumber, prevShardBlocks) {
        console.log('shard processed ' + shardId + ' ' + shardBlockNumber);
        // UPDATE shardchainBlocks SET processed = TRUE WHERE shardId = ? && shardBlockNumber = ?
        if (this.shardchainBlocks[shardId + '_' + shardBlockNumber] === undefined) throw new Error('shard not exists ' + shardId + '_' + shardBlockNumber);
        this.shardchainBlocks[shardId + '_' + shardBlockNumber] = true;

        await this.insertShardBlocks(prevShardBlocks);
    }

    /**
     * Get any unprocesed shard block number (order is not important)
     * @return {Promise<{shardId: string, shardBlockNumber: number}>}
     */
    async getUnprocessedShardBlock() {
        // SELECT shardId, shardBlockNumber from sharchainBlocks WHERE processed = FALSE LIMIT 1
        for (let key in this.shardchainBlocks) {
            if (this.shardchainBlocks[key] === false) {
                const arr = key.split('_');
                return {
                    shardId: arr[0],
                    shardBlockNumber: Number(arr[1]),
                }
            }
        }
        return undefined;
    }

    /**
     * @param address   {string}
     * @return {Promise<boolean>}
     */
    async isPublisher(address) {
        return address === 'EQCmDZwk4sS3Nl2VumtvsDMs5AZ2AqH8yqJzf9y10sxaolWg';
    }

    subscriptions = [];

    /**
     * @param address   {string}
     * @return {Promise<boolean>}
     */
    async isSubscription(address) {
        address = new Address(address).toString(false)
        return Boolean(this.subscriptions.find(s => s.address === address));
    }

    /**
     * @param address   {string}
     * @param data     subscriptionData from subscription contract get-method (contains startAt, period, timeout, lastPayment, etc. fields)
     */
    async replaceSubscription(address, data) {
        data.address = new Address(address).toString(false);
        this.subscriptions.push(data);
    }

    async getSubscriptionsReadyForPayment() {
        return this.subscriptions.filter(s => {
            const now = Date.now() / 1000; // in seconds

            const isPaid = now - s.lastPayment < s.period;

            return !isPaid && (now - s.lastRequest > s.timeout);
        });
    }
}

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));
    const storage = new BlocksStorageImpl();

    /**
     * @param address   {string}    publisher address
     * @param tx    tx from `getTransactions`
     * @return {Promise<boolean>}
     */
    const processTransaction = async (address, tx) => {
        const msg = tx.in_msg;
        if (!msg) return false;
        if (msg.message !== 'ODY6s4A=\n') return false; // msg from subscription prefix

        const subscriptionAddress = msg.source; // subscription contract address
        const amount = new BN(msg.value); // coins received by the publisher (in nanotons); subscription amount minus fee and withheld 0.0671 ton

        // get subscription data

        const subscription = new TonWeb.SubscriptionContract(tonweb.provider, {address: subscriptionAddress});
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
        if (new Address(subscriptionAddress).toString(false) !== validSubscriptionAddress.toString(false)) return false;

        // todo: check subscription data === bot subscription data for this publisher `address` + `subscriptionId`

        // notify

        const isNew = !(await storage.isSubscription(subscriptionAddress));

        if (isNew) {
            await storage.replaceSubscription(subscriptionAddress, subscriptionData);
        }

        console.log(`Notify: publisher ${address} receive ${TonWeb.utils.fromNano(amount)} from ${isNew ? 'new' : ''} subscriber ${subscriptionData.wallet}  via ${subscriptionAddress} subscription contract; subscription ID = ${subscriptionData.subscriptionId}`);

        return true;
    }

    // force process last N transaction of publisher address and find subscriptions

    const pollAddress = async (address) => {
        const LIMIT = 20;
        const txs = await tonweb.provider.getTransactions(address, LIMIT);
        for (const tx of txs) {
            await processTransaction(address, tx);
        }
    }

    await pollAddress('EQCmDZwk4sS3Nl2VumtvsDMs5AZ2AqH8yqJzf9y10sxaolWg');

    // subscribe to new network blocks and find subscriptions

    const onTransaction = async (shortTx) => {
        const address = shortTx.account;

        if (await storage.isPublisher(address)) {
            const txs = await tonweb.provider.getTransactions(address, 1, shortTx.lt, shortTx.hash);
            const tx = txs[0];
            if (tx) {
                await processTransaction(address, tx);
            } else {
                console.error('Cant get tx', shortTx);
            }
        }
    }

    const blockSubscribe = new TonWeb.BlockSubscribe(tonweb.provider, storage, onTransaction);
    await blockSubscribe.start();

    // payments interval

    let isPaymentsProcessing = false;

    const paymentsTick = async () => {
        if (isPaymentsProcessing) return;
        isPaymentsProcessing = true;
        try {
            const subscriptions = await storage.getSubscriptionsReadyForPayment();
            for (const s of subscriptions) {
                const subscription = new TonWeb.SubscriptionContract(tonweb.provider, {address: s.address});
                const subscriptionData = await subscription.getSubscriptionData();
                storage.replaceSubscription(s.address, subscriptionData);

                await subscription.methods.pay().send();
            }
        } catch (e) {
            console.error(e);
        }
        isPaymentsProcessing = false;
    }

    setInterval(() => paymentsTick(), 60 * 1000); // 1 min
}

init();
