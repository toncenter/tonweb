/**
 * A shardchain block definition.
 */
export interface ShardBlock {
    workchain: number;
    shardId: string;
    shardBlockNumber: number;
}
/**
 * A storage for processed block numbers with
 * useful query functions.
 *
 * Used by `BlockSubscription`.
 */
export interface BlockStorage {
    /**
     * Inserts new processed masterchain block number and
     * new unprocessed shardchain blocks numbers.
     *
     * Must be in single DB transaction.
     */
    insertBlocks(mcBlockNumber: number, shardBlocks: ShardBlock[]): Promise<void>;
    /**
     * Returns last processed masterchain block number.
     */
    getLastMasterchainBlockNumber(): (Promise<number | undefined>);
    /**
     * Marks the specified shardchain block number as processed and
     * inserts new unprocessed shardchain blocks numbers.
     *
     * Must be in single DB transaction.
     */
    setBlockProcessed(workchain: number, shardId: string, shardBlockNumber: number, prevShardBlocks: ShardBlock[]): Promise<void>;
    /**
     * Returns any unprocessed shard block numbers
     * (order is not important).
     */
    getUnprocessedShardBlock(): (Promise<ShardBlock | undefined>);
}
