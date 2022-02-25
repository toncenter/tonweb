import { BitString } from './bit-string';
export declare class Cell {
    readonly bits: BitString;
    isExotic: (number | false);
    refs: Cell[];
    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns root cells.
     */
    static fromBoc(serializedBoc: (string | Uint8Array)): Cell[];
    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns one root cells. Throws an
     * error if BOC contains multiple root cells.
     */
    static oneFromBoc(serializedBoc: (string | Uint8Array)): Cell;
    /**
     * Writes the specified cell to this cell.
     */
    writeCell(cell: Cell): void;
    /**
     * Returns cell max level.
     */
    getMaxLevel(): number;
    /**
     * @todo: add description
     */
    isExplicitlyStoredHashes(): number;
    /**
     * Returns the cell's max depth, by inspecting
     * its children.
     */
    getMaxDepth(): number;
    /**
     * @todo: add description
     */
    getRefsDescriptor(): Uint8Array;
    /**
     * @todo: add description
     */
    getBitsDescriptor(): Uint8Array;
    /**
     * @todo: add description
     */
    getDataWithDescriptors(): Uint8Array;
    /**
     * @todo: add description
     */
    getRepr(): Promise<Uint8Array>;
    /**
     * @todo: add description
     */
    hash(): Promise<Uint8Array>;
    /**
     * Recursively prints cell's content like in Fift.
     */
    print(indent?: string): string;
    /**
     * Creates BOC byte-array.
     */
    toBoc(hasIdx?: boolean, hashCrc32?: boolean, hasCacheBits?: boolean, flags?: number): Promise<Uint8Array>;
    private getMaxDepthAsArray;
    private treeWalk;
    private serializeForBoc;
    private bocSerializationSize;
}
