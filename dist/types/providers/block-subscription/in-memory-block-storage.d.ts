import { BlockStorage, ShardBlock } from './block-storage';
export declare type LogFunction = (message: string) => void;
/**
 * Simple in-memory implementation of the processed
 * block number storage.
 */
export declare class InMemoryBlockStorage implements BlockStorage {
    private readonly logFunction;
    /**
     * @todo: should we use `Map` here?
     * Map of the processed masterchain blocks:
     * `key` is the block number, while
     * `value` reflects `isProcessed` state.
     */
    private readonly masterBlocks;
    /**
     * @todo: should we use `Map` here?
     * Map of the processed shardchain blocks:
     * The `key` should be constructed this way:
     * `${workchain}_${shardId}_${shardBlockNumber}`
     * and the `value` reflects `isProcessed` state.
     */
    private readonly shardBlocks;
    constructor(logFunction: LogFunction);
    insertBlocks(mcBlockNumber: number, shardBlockNumbers: ShardBlock[]): Promise<void>;
    getLastMasterchainBlockNumber(): Promise<number | undefined>;
    setBlockProcessed(workchain: number, shardId: string, shardBlockNumber: number, prevShardBlocks: ShardBlock[]): Promise<void>;
    getUnprocessedShardBlock(): (Promise<ShardBlock | undefined>);
    /**
     * Inserts new unprocessed shardchain block numbers.
     * Block number (workchain + shardId + shardBlockNumber) should be IGNORED if it is already in the storage.
     */
    private insertShardBlocks;
    /**
     * Generates unique key for identifying the specified
     * shardchain block.
     */
    private getShardBlockKey;
    /**
     * Parses the specified shardchain block key and returns
     * a shardchain block definition.
     */
    private parseShardBlockKey;
}
