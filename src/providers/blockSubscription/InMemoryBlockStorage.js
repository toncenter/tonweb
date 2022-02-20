/**
 * Storage for storing block numbers that we have already processed.
 * Used by `BlockSubscription`.
 *
 * Dumb in-memory implementation.
 */
class InMemoryBlockStorage {

    /**
     * @param logFunction?   {(text: string) => void}
     */
    constructor(logFunction) {
        this.masterchainBlocks = {}; // mcBlockNumber {number} -> isProcessed {boolean}
        this.shardchainBlocks = {}; // workchain {number} + shardId {string} + shardBlockNumber {number} -> isProcessed {boolean}
        this.logFunction = logFunction;
    }

    /**
     * @private
     * Insert new UNprocessed shardchain block numbers
     * Block number (workchain + shardId + shardBlockNumber) should be IGNORED if it is already in the storage
     * @param   shardBlockNumbers {[{workchain: number, shardId: string, shardBlockNumber: number}]}
     */
    async insertShardBlocks(shardBlockNumbers) {
        for (const {workchain, shardId, shardBlockNumber} of shardBlockNumbers) {
            if (this.shardchainBlocks[workchain + '_' + shardId + '_' + shardBlockNumber] !== undefined) continue;
            if (this.logFunction) {
                this.logFunction('insert shard ' + workchain + ' ' + shardId + ' ' + shardBlockNumber);
            }
            // INSERT INTO shardchainBlocks VALUES (workchain, shardId, shardBlockNumber, FALSE);
            this.shardchainBlocks[workchain + '_' + shardId + '_' + shardBlockNumber] = false;
        }
    }

    /**
     * Insert new processed masterchain block number & new UNprocessed shardchains blocks numbers
     * Must be in single DB transaction
     * @param   mcBlockNumber {number}
     * @param   shardBlockNumbers {[{workchain: number, shardId: string, shardBlockNumber: number}]}
     */
    async insertBlocks(mcBlockNumber, shardBlockNumbers) {
        if (this.logFunction) {
            this.logFunction('mc processed ' + mcBlockNumber);
        }
        // INSERT INTO masterchainBlocks VALUES (blockNumber, TRUE);
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
     * @param   workchain {number}
     * @param   shardId {string}
     * @param   shardBlockNumber    {number}
     * @param   prevShardBlocks    {[{workchain: number, shardId: string, shardBlockNumber: number}]}
     */
    async setBlockProcessed(workchain, shardId, shardBlockNumber, prevShardBlocks) {
        if (this.logFunction) {
            this.logFunction('shard processed ' + workchain + ' ' + shardId + ' ' + shardBlockNumber);
        }
        // UPDATE shardchainBlocks SET processed = TRUE WHERE workchain = ? AND shardId = ? AND shardBlockNumber = ?
        if (this.shardchainBlocks[workchain + '_' + shardId + '_' + shardBlockNumber] === undefined) throw new Error('shard not exists ' + workchain + '_' + shardId + '_' + shardBlockNumber);
        this.shardchainBlocks[workchain + '_' + shardId + '_' + shardBlockNumber] = true;

        await this.insertShardBlocks(prevShardBlocks);
    }

    /**
     * Get any unprocesed shard block number (order is not important)
     * @return {Promise<{workchain: number, shardId: string, shardBlockNumber: number}>}
     */
    async getUnprocessedShardBlock() {
        // SELECT workchain, shardId, shardBlockNumber from sharchainBlocks WHERE processed = FALSE LIMIT 1
        for (let key in this.shardchainBlocks) {
            if (this.shardchainBlocks[key] === false) {
                const arr = key.split('_');
                return {
                    workchain: Number(arr[0]),
                    shardId: arr[1],
                    shardBlockNumber: Number(arr[2]),
                }
            }
        }
        return undefined;
    }

}

module.exports = {InMemoryBlockStorage};