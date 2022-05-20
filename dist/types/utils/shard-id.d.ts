import BN from 'bn.js';
import { Address } from './address';

export declare class ShardId {
  private value;
  constructor(value: BN);
  static root(): ShardId;
  static fromHex(value: string): ShardId;
  static fromDecimal(value: string): ShardId;
  getPrefix(length: number): ShardId;
  contains(address: Address): boolean;
  getPrefixLength(): number;
  isRightChild(): boolean;
  isLeftChild(): boolean;
  isAncestorOf(child: ShardId): boolean;
  getParent(): ShardId;
  isParentOf(child: ShardId): boolean;
  getChild(isLeft: boolean): ShardId;
  getSibling(): ShardId;
  isSibling(shardId: ShardId): boolean;
  intersects(other: ShardId): boolean;
  getIntersection(other: ShardId): ShardId;
  toPrefixString(): string;
  toString(): string;
}
