
import { HashMap } from './hash-map';
import { BitString } from './bit-string';
import { Cell } from './cell';


export declare class PfxHashMap extends HashMap {

  /**
   * Loads PfxHashMapNode's label.
   *
   * ```tlb
   * phm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
   *            {n = (~m) + l} node:(PfxHashmapNode m X)
   *            = PfxHashmap n X;
   *
   * phmn_leaf$0 {n:#} {X:Type} value:X = PfxHashmapNode n X;
   *
   * phmn_fork$1 {n:#} {X:Type} left:^(PfxHashmap n X)
   *             right:^(PfxHashmap n X) = PfxHashmapNode (n + 1) X;
   *
   * phme_empty$0 {n:#} {X:Type} = PfxHashmapE n X;
   * ```
   *
   * @param slice - Slice object to parse.
   * @param maxLength - Maximum possible length.
   * @param prefix
   */
  loadHmNode(slice: Cell, maxLength: number, prefix: BitString): void;

  /**
   * Serializes PfxHashMap's edge.
   *
   * ```tlb
   * hm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
   *      {n = (~m) + l} node:(HashmapNode m X) = Hashmap n X;
   * ```
   *
   * @param se - An array containing
   *             `[label as "0" and "1" string,
   *             maximum possible size of label,
   *             leaf or left fork, right fork]`.
   *
   * @param cell - Cell to which edge should be serialized.
   */
  serialize_edge(se: any[], cell: Cell): void;

}
