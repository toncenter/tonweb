import { BlockStorage, ShardBlock } from './block-storage';
/**
 * This is just a proof of concept of the
 * RDBMS (SQL) shardchain block storage implementation.
 */
export declare class SqlBlockStorage implements BlockStorage {
    insertBlocks(mcBlockNumber: number, shardBlockNumbers: ShardBlock[]): Promise<void>;
    getLastMasterchainBlockNumber(): Promise<number | undefined>;
    setBlockProcessed(workchain: number, shardId: string, shardBlockNumber: number, prevShardBlocks: ShardBlock[]): Promise<void>;
    getUnprocessedShardBlock(): (Promise<ShardBlock | undefined>);
}
