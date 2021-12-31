// todo: (tolya-yanot) when calling getMasterchainBlockTransactions and getShardBlockTransactions `incomplete` is not handled in response
const MC_POLL_INTERVAL = 10 * 1000;
const SHARDS_INTERVAL = 1 * 1000;

const parseShardBlockNumber = x => {
    return {
        shardId: x.shard,
        shardBlockNumber: x.seqno
    }
}

class BlockSubscribe {

    /**
     * @param provider  {TonWeb.HttpProvider}
     * @param storage   persistent storage for storing block numbers that we have already processed.
     * @param onTransaction {(tx: ShortTx, shardId: string, blockNumber: number) => Promise<void>} callback which is called for each transaction of each block.
     *                                                       callback may throw an error, in this case the block processing will be interrupted and block will not be saved in the storage as processed.
     *                                                       blocks are processed out of chronological order.
     *                                                       for masterchain shardId === '-1'
     * @param startMcBlockNumber? {number} start masterchain block number from which we start to process blocks.
     *                                     if not specified, the subscription starts from the last block of the network at the time of launch.
     * @param onBlock?(shardId: string, blockNumber: number) => Promise<void> callback which is called for of each block.
     *                                                                        for masterchain shardId === '-1'
     */
    constructor(provider, storage, onTransaction, startMcBlockNumber, onBlock) {
        this.provider = provider;
        this.storage = storage;
        this.onTransaction = onTransaction;
        this.onBlock = onBlock;
        this.startMcBlockNumber = startMcBlockNumber;
    }

    async start() {
        this.stop();

        if (!this.startMcBlockNumber) {
            this.startMcBlockNumber = (await this.provider.getMasterchainInfo()).last.seqno;
            if (!this.startMcBlockNumber) throw new Error('Cannot get start mc block number from provider');
        }
        const startMcBlockHeader = await this.provider.getMasterchainBlockHeader(this.startMcBlockNumber);
        this.startLT = startMcBlockHeader.end_lt;
        if (!this.startLT) throw new Error('Cannot get startLT from provider');

        // MASTERCHAIN

        let isMcProcessing = false;

        const mcTick = async () => {
            if (isMcProcessing) return;

            isMcProcessing = true;

            try {
                const lastSavedMcBlock = await this.storage.getLastMasterchainBlockNumber() || this.startMcBlockNumber;
                if (!lastSavedMcBlock) throw new Error('no init masterchain block in storage');
                const lastMcBlock = (await this.provider.getMasterchainInfo()).last.seqno;
                if (!lastMcBlock) throw new Error('invalid last masterchain block from provider');

                for (let i = lastSavedMcBlock + 1; i < lastMcBlock; i++) {
                    const blockShards = await this.provider.getBlockShards(i);
                    const blockTransactions = await this.provider.getMasterchainBlockTransactions(i);
                    if (this.onBlock) {
                        this.onBlock('-1', i);
                    }
                    for (let shortTx of blockTransactions.transactions) {
                        await this.onTransaction(shortTx, '-1', i);
                    }
                    await this.storage.insertBlocks(i, blockShards.shards.map(parseShardBlockNumber));
                }
            } catch (e) {
                console.error(e);
            }

            isMcProcessing = false;
        }

        this.mcIntervalId = setInterval(() => mcTick(), MC_POLL_INTERVAL);
        mcTick();

        // SHARDCHAINS

        let isShardsProcessing = false;

        const shardsTick = async () => {
            if (isShardsProcessing) return;

            isShardsProcessing = true;
            try {
                const shardBlock = await this.storage.getUnprocessedShardBlock();
                if (shardBlock) {
                    const {shardId, shardBlockNumber} = shardBlock;
                    const blockHeader = await this.provider.getShardBlockHeader(shardId, shardBlockNumber);
                    if (blockHeader.end_lt < this.startLT) {
                        await this.storage.setBlockProcessed(shardId, shardBlockNumber, []);
                    } else {
                        const blockTransactions = await this.provider.getShardBlockTransactions(shardId, shardBlockNumber);
                        if (this.onBlock) {
                            this.onBlock(shardId, shardBlockNumber);
                        }
                        for (let shortTx of blockTransactions.transactions) {
                            await this.onTransaction(shortTx, shardId, shardBlockNumber);
                        }
                        const prevBlocks = blockHeader.prev_blocks.map(parseShardBlockNumber);
                        await this.storage.setBlockProcessed(shardId, shardBlockNumber, prevBlocks);
                    }
                }
            } catch (e) {
                console.log(e);
            }
            isShardsProcessing = false;
        }

        this.shardsIntervalId = setInterval(() => shardsTick(), SHARDS_INTERVAL)
    }

    stop() {
        clearInterval(this.mcIntervalId);
        clearInterval(this.shardsIntervalId);
    }
}

module.exports = {BlockSubscribe};
