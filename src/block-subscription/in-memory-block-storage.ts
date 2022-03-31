
import { BlockStorage, ShardBlock } from './block-storage';


export type LogFunction = (message: string) => void;


/**
 * Simple in-memory implementation of the processed
 * block number storage.
 */
export class InMemoryBlockStorage implements BlockStorage {

    /**
     * @todo: should we use `Map` here?
     * Map of the processed masterchain blocks:
     * `key` is the block number, while
     * `value` reflects `isProcessed` state.
     */
    private readonly masterBlocks: {
        [key: number]: boolean;
    } = {};

    /**
     * @todo: should we use `Map` here?
     * Map of the processed shardchain blocks:
     * The `key` should be constructed this way:
     * `${workchain}_${shardId}_${shardBlockNumber}`
     * and the `value` reflects `isProcessed` state.
     */
    private readonly shardBlocks: {
        [key: string]: boolean;
    } = {};


    constructor(private readonly logFunction: LogFunction) {
    }


    public async insertBlocks(
      mcBlockNumber: number,
      shardBlockNumbers: ShardBlock[]

    ): Promise<void> {

        this.logFunction?.('mc processed ' + mcBlockNumber);

        if (this.masterBlocks[mcBlockNumber] !== undefined)
            throw new Error('mc already exists ' + mcBlockNumber);

        this.masterBlocks[mcBlockNumber] = true;

        await this.insertShardBlocks(shardBlockNumbers);

    }

    public async getLastMasterchainBlockNumber(): Promise<number | undefined> {
        const blockNumbers = Object.keys(this.masterBlocks)
            .map(x => Number(x))
            .sort((a, b) => b - a);
        return blockNumbers[0];
    }

    public async setBlockProcessed(
      workchain: number,
      shardId: string,
      shardBlockNumber: number,
      prevShardBlocks: ShardBlock[]

    ): Promise<void> {

        const shardBlockKey = this.getShardBlockKey({
            workchain,
            shardId,
            shardBlockNumber,
        });

        this.logFunction?.(`processing shard: ${shardBlockKey}`);

        if (this.shardBlocks[shardBlockKey] === undefined)
            throw new Error(`Shard doesn't exist: ${shardBlockKey}`);

        this.shardBlocks[shardBlockKey] = true;

        await this.insertShardBlocks(prevShardBlocks);

    }

    public async getUnprocessedShardBlock(): (
      Promise<ShardBlock | undefined>
    ) {
        for (const key in this.shardBlocks) {
            if (this.shardBlocks[key] === false) {
                return this.parseShardBlockKey(key);
            }
        }
        return undefined;
    }


    /**
     * Inserts new unprocessed shardchain block numbers.
     * Block number (workchain + shardId + shardBlockNumber) should be IGNORED if it is already in the storage.
     */
    private async insertShardBlocks(
      shardBlockNumbers: ShardBlock[]

    ): Promise<void> {

        for (const shardBlock of shardBlockNumbers) {
            const shardBlockKey = this.getShardBlockKey(shardBlock);
            if (this.shardBlocks[shardBlockKey] !== undefined)
                continue;
            this.logFunction?.(`insert shard: ${shardBlockKey}`);
            this.shardBlocks[shardBlockKey] = false;
        }

    }

    /**
     * Generates unique key for identifying the specified
     * shardchain block.
     */
    private getShardBlockKey(shardBlock: ShardBlock): string {
        return [
          shardBlock.workchain,
          shardBlock.shardId,
          shardBlock.shardBlockNumber,

        ].join('_');
    }

    /**
     * Parses the specified shardchain block key and returns
     * a shardchain block definition.
     */
    private parseShardBlockKey(key: string): ShardBlock {
        const parts = key.split('_');
        return {
            workchain: Number(parts[0]),
            shardId: parts[1],
            shardBlockNumber: Number(parts[2]),
        }
    }

}
