
import TonWeb from '../../../src/index';
import { BlockStorage, ShardBlock, SubscriptionData } from '../../../src/index';


const Address = TonWeb.utils.Address;


interface ExtendedSubscriptionData extends SubscriptionData {
    address: string;
}


/**
 * Storage for storing block numbers that we have already processed.
 *
 * Dumb in-memory block numbers storage implementation
 * Just an example of what it should do
 */
export class TestBlocksStorage implements BlockStorage {

    // mcBlockNumber {number} -> isProcessed {boolean}
    private readonly masterchainBlocks = {};

    // shardId {string} + shardBlockNumber {number} -> isProcessed {boolean}
    private readonly shardchainBlocks = {};

    private readonly subscriptions: ExtendedSubscriptionData[] = [];


    /**
     * Insert new processed masterchain block number & new UNprocessed shardchains blocks numbers
     * Must be in single DB transaction
     * @param   mcBlockNumber {number}
     * @param   shardBlockNumbers {[{shardId: string, shardBlockNumber: number}]}
     */
    public async insertBlocks(mcBlockNumber, shardBlockNumbers) {
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
    public async getLastMasterchainBlockNumber() {
        // SELECT MAX(blockNumber) FROM masterchainBlocks
        const blockNumbers = Object.keys(this.masterchainBlocks)
            .map(x => Number(x))
            .sort((a, b) => b - a);
        return blockNumbers[0];
    }

    /**
     * Set that this shardchain block number processed & insert new UNprocessed shardchains blocks numbers
     * Must be in single DB transaction
     */
    public async setBlockProcessed(
        workchain: number,
        shardId: string,
        shardBlockNumber: number,
        prevShardBlocks: ShardBlock[]
    ) {
        // @todo use workchain argument
        console.log('shard processed ' + shardId + ' ' + shardBlockNumber);
        // UPDATE shardchainBlocks SET processed = TRUE WHERE shardId = ? && shardBlockNumber = ?
        if (this.shardchainBlocks[shardId + '_' + shardBlockNumber] === undefined) {
            throw new Error('shard not exists ' + shardId + '_' + shardBlockNumber);
        }
        this.shardchainBlocks[shardId + '_' + shardBlockNumber] = true;

        await this.insertShardBlocks(prevShardBlocks);
    }

    /**
     * Gets any unprocessed shard block number (order is not important).
     */
    public async getUnprocessedShardBlock(): Promise<ShardBlock | undefined> {
        // SELECT shardId, shardBlockNumber from shardchainBlocks WHERE processed = FALSE LIMIT 1
        for (let key in this.shardchainBlocks) {
            if (this.shardchainBlocks[key] === false) {
                const arr = key.split('_');
                return {
                    shardId: arr[0],
                    shardBlockNumber: Number(arr[1]),

                // @todo return correct workchain
                } as ShardBlock
            }
        }
        return undefined;
    }

    public async isPublisher(address: string): Promise<boolean> {
        return (address === 'EQCmDZwk4sS3Nl2VumtvsDMs5AZ2AqH8yqJzf9y10sxaolWg');
    }

    public async isSubscription(address: string): Promise<boolean> {
        address = new Address(address).toString(false)
        return Boolean(this.subscriptions.find(s => s.address === address));
    }

    public async replaceSubscription(address: string, data: SubscriptionData) {
        this.subscriptions.push({
            ...data,
            address: new Address(address).toString(false),
        });
    }

    public async getSubscriptionsReadyForPayment() {
        return this.subscriptions.filter(s => {
            const now = Date.now() / 1000; // in seconds

            const isPaid = now - s.lastPayment < s.period;

            return !isPaid && (now - s.lastRequest > s.timeout);
        });
    }


    /**
     * Inserts new unprocessed shardchain block numbers
     * Block number (shardId + shardBlockNumber) should be IGNORED if it is already in the storage.
     */
    private async insertShardBlocks(shardBlockNumbers: ShardBlock[]) {
        for (const { shardId, shardBlockNumber } of shardBlockNumbers) {
            if (this.shardchainBlocks[shardId + '_' + shardBlockNumber] !== undefined) {
                continue;
            }
            // INSERT INTO shardchainBlocks VALUES (shardId, shardBlockNumber, FALSE)
            // @todo specify workchain
            console.log('insert shard ' + shardId + ' ' + shardBlockNumber);
            this.shardchainBlocks[shardId + '_' + shardBlockNumber] = false;
        }
    }

}
