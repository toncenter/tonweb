
// NOTE: "mc" means masterchain, while "shards" means "shardchains"

import { HttpProvider } from '../http-provider/http-provider';
import { BlockStorage, ShardBlock } from './block-storage';


export interface BlockSubscriptionOptions {

    /**
     * Start masterchain block number from which we start
     * to process blocks. If not specified, the subscription
     * starts from the last block of the network at the
     * time of launch.
     */
    startMcBlockNumber?: number;

    mcInterval?: number;

    shardsInterval?: number;

}

export type BlockHandler = (
    (blockHeader: any, blockShards?: any) =>
        (Promise<void> | void)
);


const defaultMcInterval = (10 * 1000) // 10 seconds;
const defaultShardsInterval = (1 * 1000) // 1 second;

const parseShardBlockNumber: (
  (data: any) => ShardBlock
) = (
  ({ workchain, shard, seqno }) => ({
      workchain,
      shardId: shard,
      shardBlockNumber: seqno,
  })
);


export class BlockSubscription {

    private startMcBlockNumber = (
      this.options?.startMcBlockNumber
    );

    private readonly mcInterval = (
      this.options?.mcInterval || defaultMcInterval
    );

    private readonly shardsInterval = (
      this.options?.shardsInterval || defaultShardsInterval
    );

    private startLT?: any;
    private mcIntervalId?: number;
    private shardsIntervalId?: number;


    constructor(
        /**
         * TonWeb HTTP provider.
         */
        private readonly provider: HttpProvider,

        /**
         * Persistent storage for storing block numbers
         * that we have already processed.
         */
        private readonly storage: BlockStorage,

        /**
         * Callback which is called for each block.
         *
         * Callback may throw an error, in this case the block
         * processing will be interrupted and block will not
         * be saved in the storage as processed.
         *
         * Shardchain blocks are processed OUT of chronological order.
         * Masterchain blocks are processed in chronological order.
         *
         * For masterchain `workchain === -1` and
         * `shardId === -9223372036854775808`
         */
        private readonly onBlock: BlockHandler,

        /**
         * Start masterchain block number from which we start to process blocks.
         * if not specified, the subscription starts from the last block of the network at the time of launch.
         */
        private readonly options?: BlockSubscriptionOptions
    ) {
    }


    public async start() {
        this.stop();

        if (!this.startMcBlockNumber) {
            this.startMcBlockNumber = (await this.provider.getMasterchainInfo()).last.seqno;
            if (!this.startMcBlockNumber) {
                throw new Error('Cannot get start mc block number from provider');
            }
        }
        const startMcBlockHeader = await this.provider
            .getMasterchainBlockHeader(this.startMcBlockNumber)
        ;
        this.startLT = startMcBlockHeader.end_lt;
        if (!this.startLT) {
            throw new Error('Cannot get startLT from provider');
        }

        // MASTERCHAIN

        let isMcProcessing = false;

        const mcTick = async () => {
            if (isMcProcessing) {
                return;
            }

            isMcProcessing = true;

            try {
                const lastSavedMcBlock = (
                  await this.storage.getLastMasterchainBlockNumber() ||
                  this.startMcBlockNumber
                );
                if (!lastSavedMcBlock) {
                    throw new Error('no init masterchain block in storage');
                }

                const lastMcBlock = (await this.provider.getMasterchainInfo()).last.seqno;
                if (!lastMcBlock) {
                    throw new Error('invalid last masterchain block from provider');
                }

                for (let i = lastSavedMcBlock + 1; i < lastMcBlock; i++) {
                    const blockShards = await this.provider.getBlockShards(i);
                    const blockHeader = await this.provider.getMasterchainBlockHeader(i);
                    await this.onBlock(blockHeader, blockShards);
                    await this.storage.insertBlocks(
                        i,
                        blockShards.shards.map(parseShardBlockNumber)
                    );
                }
            } catch (error) {
                console.error(error);
            } finally {
                isMcProcessing = false;
            }

        }

        this.mcIntervalId = setInterval(mcTick, this.mcInterval);
        void mcTick();

        // SHARDCHAINS

        let isShardsProcessing = false;

        const shardsTick = async () => {
            if (isShardsProcessing) {
                return;
            }

            isShardsProcessing = true;
            try {
                const shardBlock = await this.storage.getUnprocessedShardBlock();
                if (shardBlock) {
                    const {workchain, shardId, shardBlockNumber} = shardBlock;
                    const blockHeader = await this.provider.getBlockHeader(
                        workchain,
                        shardId,
                        shardBlockNumber
                    );
                    if (blockHeader.end_lt < this.startLT) {
                        await this.storage.setBlockProcessed(
                            workchain,
                            shardId,
                            shardBlockNumber,
                            []
                        );
                    } else {
                        await this.onBlock(blockHeader);
                        const prevBlocks = blockHeader.prev_blocks
                            .map(parseShardBlockNumber)
                        ;
                        await this.storage.setBlockProcessed(
                            workchain,
                            shardId,
                            shardBlockNumber,
                            prevBlocks
                        );
                    }
                }
            } catch (error) {
                console.log(error);
            }
            isShardsProcessing = false;
        }

        this.shardsIntervalId = setInterval(
            shardsTick,
            this.shardsInterval
        );

    }

    public stop() {
        clearInterval(this.mcIntervalId);
        clearInterval(this.shardsIntervalId);
    }

}
