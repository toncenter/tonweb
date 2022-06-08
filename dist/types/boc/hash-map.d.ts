
import { BitString } from './bit-string';
import { Cell } from './cell';


export type ValueConverter<ValueType = any, ResultType = any> = (
  (value: ValueType) => ResultType
);

export interface HashMapElement {
  key: Cell;
  value: Cell;
}

export type BinaryTree = (
  | []
  | [BinaryTreeItem, BinaryTreeItem]
);

export type BinaryTreeItem = (
  | [HashMapElement]
  | BinaryTree
);

export type FlatTree = Array<
  [string, number, HashMapElement, HashMapElement]
>;


export declare class HashMap<KeyType = any, ValueType = any> {

  raw_elements: HashMapElement[];

  elements: Record<KeyType, ValueType>;

  /**
   * Bit length of the keys.
   */
  n: number;

  /**
   * Maximum number of members.
   */
  maxMembers: number;

  /**
   * Creates an empty hash-map with the keys
   * of the specified bit-length.
   *
   * @param bitLength - Bit length of the keys.
   * @param maxMembers - Maximum number of members.
   *                     The default is: `10 000`.
   */
  constructor(bitLength: number, maxMembers?: number);

  /**
   * Loads a `HashMapNode` label.
   *
   * ```tlb
   * hmn_leaf#_ {X:Type} value:X = HashmapNode 0 X;
   * hmn_fork#_ {n:#} {X:Type} left:^(Hashmap n X)
   *            right:^(Hashmap n X) = HashmapNode (n + 1) X;
   * ```
   *
   * @param slice - Slice object to parse.
   * @param maxLength - Maximum possible length.
   * @param prefix
   */
  loadHmNode(slice: Cell, maxLength: number, prefix: BitString): void;

  /**
   * Loads a hash-map.
   *
   * ```tlb
   * hm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
   *      {n = (~m) + l} node:(HashmapNode m X) = Hashmap n X;
   * ```
   *
   * @param slice - Slice object to parse.
   * @param maxLength - Maximum possible length.
   * @param prefix
   */
  loadHashMap(slice: Cell, maxLength: number, prefix: BitString): void;

  /**
   * Loads hash-map and parses keys and values.
   *
   * ```tlb
   * HashMap X Y;
   * ```
   *
   * @param slice - Slice object to parse.
   * @param keyParser - A function to parse keys.
   * @param valueParser - A function to parse values.
   */
  loadHashMapX2Y(
    slice: Cell,
    keyParser: ValueConverter<Any, KeyType>,
    valueParser: ValueConverter<Any, ValueType>

  ): void;

  /**
   * Reads the keys in array and returns a binary tree
   * in the form of recursively nested arrays.
   *
   * @param array - A list of key-value cell items.
   *
   * @returns Either *leaf* or *empty leaf* or
   *          `[left, right]` *fork*.
   */
  tree_split(items: HashMapElement[]): BinaryTree;

  /**
   * Flatten binary tree (by cutting empty branches) if possible:
   *
   * `[ [], [[left, right]] ]` flatten to `["1", m, left, right]`
   *
   * @param tree - Array which contains uncut tree.
   * @param prefixMaxLength - Maximum possible length of prefix.
   *
   * @returns An array in the form:
   *          `[prefix, maximum possible length of prefix,
   *          left branch tree, right branch tree]`
   */
  flatten(tree: BinaryTree, prefixMaxLength: number): any;

  /**
   * Serializes HashMap's label.
   *
   * ```tlb
   * hml_short$0 {m:#} {n:#} len:(Unary ~n) {n <= m} s:(n * Bit) = HmLabel ~n m;
   * hml_long$10 {m:#} n:(#<= m) s:(n * Bit) = HmLabel ~n m;
   * hml_same$11 {m:#} v:Bit n:(#<= m) = HmLabel ~n m;
   * ```
   *
   * @param label - Label in form of a string of zeroes and
   *                ones, e.g.: `"010101"`
   *
   * @param maxLength - Maximum possible length of the label.
   * @param cell - Cell to which label should be serialized.
   */
  serialize_label(
    label: string,
    maxLength: number,
    cell: Cell

  ): void;

  /**
   * Serializes HashMap's edge.
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

  /**
   * Returns a cell with the serialized elements.
   *
   * @param keySerializer - A key serialization function.
   * @param valueSerializer - A value serialization function.
   */
  serialize(
    keySerializer: ValueConverter<KeyType, Cell>,
    valueSerializer: ValueConverter<ValueType, Cell>

  ): Cell;

}
