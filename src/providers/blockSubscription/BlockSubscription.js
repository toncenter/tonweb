// NOTE: "mc" means masterchain, "shards" means shardchains

const MC_INTERVAL = 10 * 1000;
const SHARDS_INTERVAL = 1 * 1000;

const parseShardBlockNumber = x => {
    return {
        workchain: x.workchain,
        shardId: x.shard,
        shardBlockNumber: x.seqno
    }
}

class BlockSubscription {

    /**
     * @param provider  {TonWeb.HttpProvider}
     * @param storage   persistent storage for storing block numbers that we have already processed.
     * @param onBlock {(blockHeader: BlockHeader) => Promise<void>} callback which is called for of each block.
     *                                                       callback may throw an error, in this case the block processing will be interrupted and block will not be saved in the storage as processed.
     *                                                       shardchain blocks are processed OUT of chronological order.
     *                                                       masterchain blocks are processed in chronological order.
     *                                                       for masterchain workchain === -1 and shardId === '-9223372036854775808'
     * @param options? {startMcBlockNumber:? number, mcInterval?: number, shardsInterval?: number} start masterchain block number from which we start to process blocks.
     *                                     if not specified, the subscription starts from the last block of the network at the time of launch.
     */
    constructor(provider, storage, onBlock, options) {
        this.provider = provider;
        this.storage = storage;
        this.onBlock = onBlock;
        this.startMcBlockNumber = options ? options.startMcBlockNumber : undefined;
        this.mcInterval = (options ? options.mcInterval : undefined) || MC_INTERVAL;
        this.shardsInterval = (options ? options.shardsInterval : undefined) || SHARDS_INTERVAL;
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
                    const blockHeader = await this.provider.getMasterchainBlockHeader(i);
                    await this.onBlock(blockHeader, blockShards);
                    await this.storage.insertBlocks(i, blockShards.shards.map(parseShardBlockNumber));
                }
            } catch (e) {
                console.error(e);
            }

            isMcProcessing = false;
        }

        this.mcIntervalId = setInterval(() => mcTick(), this.mcInterval);
        mcTick();

        // SHARDCHAINS

        let isShardsProcessing = false;

        const shardsTick = async () => {
            if (isShardsProcessing) return;

            isShardsProcessing = true;
            try {
                const shardBlock = await this.storage.getUnprocessedShardBlock();
                if (shardBlock) {
                    const {workchain, shardId, shardBlockNumber} = shardBlock;
                    const blockHeader = await this.provider.getBlockHeader(workchain, shardId, shardBlockNumber);
                    if (blockHeader.end_lt < this.startLT) {
                        await this.storage.setBlockProcessed(workchain, shardId, shardBlockNumber, []);
                    } else {
                        await this.onBlock(blockHeader);
                        const prevBlocks = blockHeader.prev_blocks.map(parseShardBlockNumber);
                        await this.storage.setBlockProcessed(workchain, shardId, shardBlockNumber, prevBlocks);
                    }
                }
            } catch (e) {
                console.log(e);
            }
            isShardsProcessing = false;
        }

        this.shardsIntervalId = setInterval(() => shardsTick(), this.shardsInterval);
    }

    stop() {
        clearInterval(this.mcIntervalId);
        clearInterval(this.shardsIntervalId);
    }
}

module.exports = {BlockSubscription};
