import { Cell } from '../../../boc/cell';
/**
 * Writes current timestamp to the specified signing message,
 * or the placeholder value if the specified `seqno` value
 * is equal to zero.
 */
export declare function writeTimestampToSigningMessage(message: Cell, seqno: number): void;
