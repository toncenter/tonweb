
import { BlockStorage, ShardBlock } from './block-storage';


/**
 * This is just a proof of concept of the
 * RDBMS (SQL) shardchain block storage implementation.
 */
export class SqlBlockStorage implements BlockStorage {

    public async insertBlocks(
      mcBlockNumber: number,
      shardBlockNumbers: ShardBlock[]

    ): Promise<void> {

        // @todo:
        // INSERT INTO masterchainBlocks VALUES (blockNumber, TRUE);

    }

    public async getLastMasterchainBlockNumber(): Promise<number | undefined> {
        // @todo:
        // SELECT MAX(blockNumber) FROM masterchainBlocks;
        return undefined;
    }

    public async setBlockProcessed(
      workchain: number,
      shardId: string,
      shardBlockNumber: number,
      prevShardBlocks: ShardBlock[]

    ): Promise<void> {

        // @todo:
        // UPDATE shardchainBlocks
        // SET processed = TRUE
        // WHERE workchain = ? AND shardId = ? AND shardBlockNumber = ?;

    }

    public async getUnprocessedShardBlock(): (
      Promise<ShardBlock | undefined>
    ) {
        // @todo:
        // SELECT workchain, shardId, shardBlockNumber
        // FROM shardchainBlocks
        // WHERE processed = FALSE
        // LIMIT 1;
        return undefined;
    }

}
