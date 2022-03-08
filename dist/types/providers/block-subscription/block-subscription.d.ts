import { HttpProvider } from '../http-provider';
import { BlockStorage } from './block-storage';
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
export declare type BlockHandler = ((blockHeader: any, blockShards?: any) => (Promise<void> | void));
export declare class BlockSubscription {
    /**
     * TonWeb HTTP provider.
     */
    private readonly provider;
    /**
     * Persistent storage for storing block numbers
     * that we have already processed.
     */
    private readonly storage;
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
    private readonly onBlock;
    /**
     * Start masterchain block number from which we start to process blocks.
     * if not specified, the subscription starts from the last block of the network at the time of launch.
     */
    private readonly options?;
    private startMcBlockNumber;
    private readonly mcInterval;
    private readonly shardsInterval;
    private startLT?;
    private mcIntervalId?;
    private shardsIntervalId?;
    constructor(
    /**
     * TonWeb HTTP provider.
     */
    provider: HttpProvider, 
    /**
     * Persistent storage for storing block numbers
     * that we have already processed.
     */
    storage: BlockStorage, 
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
    onBlock: BlockHandler, 
    /**
     * Start masterchain block number from which we start to process blocks.
     * if not specified, the subscription starts from the last block of the network at the time of launch.
     */
    options?: BlockSubscriptionOptions);
    start(): Promise<void>;
    stop(): void;
}
