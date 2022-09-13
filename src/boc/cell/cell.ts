
import { bytesToBase64 } from '../../utils/base64';
import { hexToBytes } from '../../utils/hex';
import { BitString } from '../bit-string/bit-string';
import { CellSlice } from './cell-slice';

import {
    compareBytes,
    concatBytes,
    crc32c,
    readNBytesUIntFromArray,
    sha256,

} from '../../utils/common';


import {
    IndexHashmap,
    indexCell,
    IndexCellResult,

} from './cell-index';


type SerializedBoc = (string | Uint8Array);

export type CellHash = Uint8Array;
export type CellHashBase64 = string;

export type MaybeCell = (Cell | null);

interface BocHeaderParseResult {
    has_idx: number;
    hash_crc32: number;
    has_cache_bits: number;
    flags: number;
    size_bytes: number;
    off_bytes: number;
    cells_num: number;
    roots_num: number;
    absent_num: number;
    tot_cells_size: number;
    root_list: number[];
    index: (number[] | false);
    cells_data: Uint8Array;
}

interface DeserializeCellDataResult {
    cell: Cell;
    residue: Uint8Array;
}


const bocConstructorTag = hexToBytes('B5EE9C72');
const leanBocMagicPrefix = hexToBytes('68FF65F3');
const leanBocMagicPrefixCRC = hexToBytes('ACC3A728');

const maxCellBits = 1023;
const maxCellRefs = 4;


export class Cell {

    public readonly bits = new BitString(maxCellBits);

    public refs: Cell[] = [];

    public isExotic = false;


    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns root cells.
     *
     * @param serializedBoc - HEX string or array of bytes
     *
     * @returns List of root cells
     */
    public static fromBoc(serializedBoc: SerializedBoc): Cell[] {
        return deserializeBoc(serializedBoc);
    }

    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns one root cell.
     *
     * @param serializedBoc - HEX string or array of bytes
     *
     * @returns One root cell
     *
     * @throws Error
     * Throws if BOC contains multiple root cells.
     */
    public static oneFromBoc(serializedBoc: SerializedBoc): Cell {
        const cells = deserializeBoc(serializedBoc);
        if (cells.length !== 1) {
            throw new Error(
                `Expected 1 root cell, but have ` +
                `${cells.length} cells`
            );
        }
        return cells[0];
    }

    /**
     * Writes the specified cell to this cell.
     */
    public writeCell(cell: Cell) {
        // @todo check for bits overflow and
        //       the number of cell references
        this.bits.writeBitString(cell.bits);
        this.refs = this.refs.concat(cell.refs);
    }

    /**
     * Returns cell's (De Bruijn) level, which affects
     * the number of higher hashes it has.
     *
     * @todo rename to `getLevel()`
     */
    public getMaxLevel(): number {

        // Chapter 3.1.3 of the "Telegram Open Network Virtual Machine".
        // {@link https://ton-blockchain.github.io/docs/tvm.pdf}

        // The level of an ordinary cell is always equal
        // to the maximum of the levels of all its children.

        // @todo implement level calculation for exotic cells

        // Our cell implementation supports only
        // ordinary cells now, so we can hard-code this
        // value for the time being.
        return 0;

    }

    /**
     * @todo add description
     */
    public isExplicitlyStoredHashes(): number {
        // @todo does it require implementation?
        return 0;
    }

    /**
     * Returns the cell's max depth, by inspecting
     * its children.
     */
    public getMaxDepth(): number {

        if (this.refs.length === 0) {
            return 0;
        }

        this.checkForCyclesOrThrow();

        let childrenMaxDepth = 0;

        for (const subCell of this.refs) {
            const subCellMaxDepth = subCell.getMaxDepth();
            if (subCellMaxDepth > childrenMaxDepth) {
                childrenMaxDepth = subCellMaxDepth;
            }
        }

        return (childrenMaxDepth + 1);

    }

    /**
     * Returns standard cell representation.
     * Used for unique hash calculation.
     *
     * @todo should it be public?
     */
    public async getRepr(): Promise<Uint8Array> {

        // Chapter 3.1.4 of the "Telegram Open Network Virtual Machine".
        // {@link https://ton-blockchain.github.io/docs/tvm.pdf}

        const reprArray = [];

        reprArray.push(this.getDataWithDescriptors());

        // Max depths
        for (const subCell of this.refs) {
            reprArray.push(subCell.getMaxDepthAsArray());
        }

        // Hashes
        for (const subCell of this.refs) {
            reprArray.push(await subCell.hash());
        }

        // Converting to bytes
        let bytes = new Uint8Array();
        for (const value of reprArray) {
            bytes = concatBytes(bytes, value);
        }

        return bytes;

    }

    /**
     * Returns cell's descriptors data.
     *
     * @todo should it be public?
     */
    public getDataWithDescriptors(): Uint8Array {

        // Chapter 3.1.4 of the "Telegram Open Network Virtual Machine".
        // {@link https://ton-blockchain.github.io/docs/tvm.pdf}
        //
        // Two descriptor bytes `d1` and `d2`
        // are serialized first.

        // `d1`
        const refsDescriptor = this.getRefsDescriptor();

        // `d2`
        const bitsDescriptor = this.getBitsDescriptor();

        // Then the data bits are serialized as `⌈b/8⌉`
        // 8-bit octets (bytes). If `b` is not a multiple
        // of eight, a binary `1` and up to six binary `0`s
        // are appended to the data bits. After that, the
        // data is split into `⌈b/8⌉` eight-bit groups,
        // and each group is interpreted as an unsigned
        // big-endian integer `0…255` and stored into an octet.

        const uppedBits = this.bits.getTopUppedArray();

        return concatBytes(
            concatBytes(refsDescriptor, bitsDescriptor),
            uppedBits
        );

    }

    /**
     * Returns cell's references descriptor.
     *
     * @todo should it be public?
     */
    public getRefsDescriptor(): Uint8Array {

        // Chapter 3.1.4 of the "Telegram Open Network Virtual Machine".
        // {@link https://ton-blockchain.github.io/docs/tvm.pdf}
        //
        // Byte `d1` equals `r + 8s + 32l`, where
        // - `0 ≤ r ≤ 4` is the quantity of cell references
        //   contained in the cell,
        // - `0 ≤ l ≤ 3` is the level of the cell, and
        // - `0 ≤ s ≤ 1` is `1` for exotic cells and `0`
        //   for ordinary cells.

        const value = (
            this.refs.length +
            (Number(this.isExotic) * 8) +
            (this.getMaxLevel() * 32)
        );

        return Uint8Array.from([value]);

    }

    /**
     * Returns cell's bits descriptor.
     */
    public getBitsDescriptor(): Uint8Array {

        // Chapter 3.1.4 of the "Telegram Open Network Virtual Machine".
        // {@link https://ton-blockchain.github.io/docs/tvm.pdf}
        //
        // Byte `d2` equals `⌊b/8⌋ + ⌈b/8⌉`, where
        // `0 ≤ b ≤ 1023` is the quantity of data bits in `c`.
        //

        const usedBits = this.bits.getUsedBits();
        const value = (
            Math.floor(usedBits / 8) +
            Math.ceil(usedBits / 8)
        );
        return Uint8Array.from([value]);
    }

    /**
     * Returns unique hash of the cell representation.
     */
    public async hash(): Promise<CellHash> {
        return new Uint8Array(
            await sha256(await this.getRepr())
        );
    }

    /**
     * Returns unique string hash of the cell representation.
     *
     * @alpha (not available in vanilla TonWeb)
     */
    public async hashBase64(): Promise<CellHashBase64> {

        return bytesToBase64(await this.hash());

    }

    /**
     * Recursively prints cell's content (like Fift).
     *
     * @property indent - A string containing spaces used
     *                    for indentation
     */
    public print(indent?: string): string {
        indent = (indent || '');
        let output = indent + 'x{' + this.bits.toHex() + '}\n';
        for (const subCell of this.refs) {
            output += subCell.print(indent + ' ');
        }
        return output;
    }

    /**
     * Converts cell with all it's content to Bag of Cells (BOC).
     */
    public async toBoc(
        hasIdx = true,
        hashCrc32 = true,
        hasCacheBits = false,
        flags = 0

    ): Promise<Uint8Array> {

        /**
         * TL-B Scheme:
         * {@link https://github.com/ton-blockchain/ton/blob/24dc184a2ea67f9c47042b4104bbb4d82289fac1/crypto/tl/boc.tlb#L25}
         *
         * C++ implementation:
         * {@link https://github.com/newton-blockchain/ton/blob/master/crypto/vm/boc.cpp#L500}
         */

        const rootCell = this;

        const { orderedCells, indexHashmap } = (
            await rootCell.index()
        );

        const cellsCount = orderedCells.length;
        const refByteSize = 1;

        let offset = 0;
        let cellOffsetsIndex: number[] = [];
        for (const cell of orderedCells) {
            // @todo it should be async map or async for
            cellOffsetsIndex.push(offset);
            // @todo use index cache to minimize number
            //       of calls to serializeForBoc/bocSerializationSize
            const cellSize = (await cell
                .bocSerializationSize(indexHashmap, refByteSize)
            );
            offset += cellSize;
        }
        const fullSize = offset;

        // Minimal number of bits to offset/len
        const offsetBits = fullSize.toString(2).length;

        const offsetBytes = Math.max(
            Math.ceil(offsetBits / 8),
            1
        );

        const cellRefsLength = (32 * maxCellRefs);

        // @todo do not use BitString for this,
        //       use normal array of bytes instead.

        const bocBitString = new BitString(
            (maxCellBits + cellRefsLength + (32 * 3)) *
            cellsCount
        );

        // [serialized_boc#b5ee9c72]
        bocBitString.writeBytes(bocConstructorTag);

        // [has_idx]
        bocBitString.writeBit(hasIdx);

        // [has_crc32c]
        bocBitString.writeBit(hashCrc32);

        // [has_cache_bits]
        bocBitString.writeBit(hasCacheBits);

        // [flags]
        bocBitString.writeUint(flags, 2);

        // [size]
        bocBitString.writeUint(refByteSize, 3);

        // [off_bytes]
        bocBitString.writeUint(offsetBytes, 8);

        // Cells [cells]
        bocBitString.writeUint(cellsCount, refByteSize * 8);

        // Roots [roots] (one root for now)
        bocBitString.writeUint(1, refByteSize * 8);

        // Absent [absent] (complete BOCs only)
        bocBitString.writeUint(0, refByteSize * 8);

        // Total cells size [tot_cells_size]
        bocBitString.writeUint(fullSize, offsetBytes * 8);

        // Root list [root_list] (root should have index 0)
        bocBitString.writeUint(0, refByteSize * 8);

        // Cell offsets [index]
        if (hasIdx) {
            for (let index = 0; index < cellsCount; index++) {
                bocBitString.writeUint(
                    cellOffsetsIndex[index],
                    (offsetBytes * 8)
                );
            }
        }

        // Serialized cells [cell_data]
        for (let cell of orderedCells) {
            // @todo it should be async map or async for
            const serializedCell = (await cell
                .serializeForBoc(indexHashmap, refByteSize)
            );
            bocBitString.writeBytes(serializedCell);
        }

        // Converting to bytes
        let bocBytes = bocBitString.getTopUppedArray();

        // Checksum [crc32c]
        if (hashCrc32) {
            bocBytes = concatBytes(bocBytes, crc32c(bocBytes));
        }

        return bocBytes;

    }

    /**
     * Returns a slice with this cell's data that
     * allows you to parse it.
     */
    public parse(): CellSlice {

        return new CellSlice(this);

    }


    private getMaxDepthAsArray(): Uint8Array {
        const maxDepth = this.getMaxDepth();
        const d = Uint8Array.from({length: 2}, () => 0);
        d[1] = maxDepth % 256;
        d[0] = Math.floor(maxDepth / 256);
        return d;
    }

    private async index(): Promise<IndexCellResult> {
        return indexCell(this);
    }

    private async serializeForBoc(
        indexHashmap: IndexHashmap,
        // @todo remove/use unused parameter
        refSize: any

    ): Promise<Uint8Array> {

        const reprArray: Uint8Array[] = [];

        reprArray.push(this.getDataWithDescriptors());

        if (this.isExplicitlyStoredHashes()) {
            throw new Error('Cell hashes explicit storing is not implemented');
        }

        // Setting reference to each sub-cell
        for (const subCell of this.refs) {
            const cellHash = await subCell.hashBase64();
            const cellIndex = indexHashmap[cellHash];
            let cellIndexHex = cellIndex.toString(16);
            if (cellIndexHex.length % 2) {
                cellIndexHex = '0' + cellIndexHex;
            }
            const reference = hexToBytes(cellIndexHex);
            reprArray.push(reference);
        }

        // Converting result to bytes
        let bytes = new Uint8Array();
        for (const reference of reprArray) {
            bytes = concatBytes(bytes, reference);
        }

        return bytes;

    }

    private async bocSerializationSize(cellsIndex: any, refSize: any): Promise<number> {
        return (await this.serializeForBoc(cellsIndex, refSize)).length;
    }

    private checkForCyclesOrThrow() {
        iterate(this);
        function iterate(cell: Cell, parents: Cell[] = []) {
            for (const subCell of cell.refs) {
                if (parents.includes(subCell)) {
                    throw new Error(
                        `Cycles are not allowed in cell topology`
                    );
                }
                iterate(subCell, [...parents, subCell]);
            }
        }
    }

}


/**
 * Deserializes the BOC specified as HEX-string or
 * a byte-array and returns root cells.
 *
 * @param serializedBoc - HEX string or array of bytes.
 *
 * @returns List of root cells.
 */
function deserializeBoc(serializedBoc: SerializedBoc): Cell[] {
    if (typeof serializedBoc === 'string') {
        serializedBoc = hexToBytes(serializedBoc);
    }

    const header = parseBocHeader(serializedBoc);

    let cellsData = header.cells_data;

    // Parsing individual cells
    let cellsArray = [];
    for (let index = 0; index < header.cells_num; index++) {
        let dd = parseCell(cellsData, header.size_bytes);
        cellsData = dd.residue;
        cellsArray.push(dd.cell);
    }

    for (let ci = header.cells_num - 1; ci >= 0; ci--) {
        let c = cellsArray[ci];
        for (let ri = 0; ri < c.refs.length; ri++) {
            const r = c.refs[ri];
            if (r < ci) {
                throw new Error('Topological order is broken');
            }
            c.refs[ri] = cellsArray[r];
        }
    }
    let rootCells = [];
    for (let ri of header.root_list) {
        rootCells.push(cellsArray[ri]);
    }
    return rootCells;
}


/**
 * Parses the specified BOC header and returns
 * the parsing result.
 *
 * @param bocBytes - an entire array of BOC bytes.
 */
function parseBocHeader(
    bocBytes: Uint8Array

): BocHeaderParseResult {

    // snake_case is used to match TON docs
    if (bocBytes.length < (4 + 1)) {
        throw new Error('Not enough bytes for magic prefix');
    }

    const inputData = bocBytes; // Save copy for crc32
    const prefix = bocBytes.slice(0, 4);
    bocBytes = bocBytes.slice(4);

    let has_idx: number;
    let hash_crc32: number;
    let has_cache_bits: number;
    let flags: number;
    let size_bytes: number;

    if (compareBytes(prefix, bocConstructorTag)) {
        const flags_byte = bocBytes[0];
        has_idx = flags_byte & 128;
        hash_crc32 = flags_byte & 64;
        has_cache_bits = flags_byte & 32;
        flags = (flags_byte & 16) * 2 + (flags_byte & 8);
        size_bytes = flags_byte % 8;
    }

    if (compareBytes(prefix, leanBocMagicPrefix)) {
        has_idx = 1;
        hash_crc32 = 0;
        has_cache_bits = 0;
        flags = 0;
        size_bytes = bocBytes[0];
    }

    if (compareBytes(prefix, leanBocMagicPrefixCRC)) {
        has_idx = 1;
        hash_crc32 = 1;
        has_cache_bits = 0;
        flags = 0;
        size_bytes = bocBytes[0];
    }

    bocBytes = bocBytes.slice(1);
    if (bocBytes.length < 1 + 5 * size_bytes) {
        throw new Error('Not enough bytes for encoding cells counters');
    }

    const off_bytes = bocBytes[0];
    bocBytes = bocBytes.slice(1);
    const cells_num = readNBytesUIntFromArray(size_bytes, bocBytes);
    bocBytes = bocBytes.slice(size_bytes);
    const roots_num = readNBytesUIntFromArray(size_bytes, bocBytes);
    bocBytes = bocBytes.slice(size_bytes);
    const absent_num = readNBytesUIntFromArray(size_bytes, bocBytes);
    bocBytes = bocBytes.slice(size_bytes);
    const tot_cells_size = readNBytesUIntFromArray(off_bytes, bocBytes);
    bocBytes = bocBytes.slice(off_bytes);

    if (bocBytes.length < roots_num * size_bytes) {
        throw new Error('Not enough bytes for encoding root cells hashes');
    }

    let root_list: number[] = [];
    for (let c = 0; c < roots_num; c++) {
        root_list.push(readNBytesUIntFromArray(size_bytes, bocBytes));
        bocBytes = bocBytes.slice(size_bytes);
    }

    let index: (number[] | false) = false;
    if (has_idx) {
        index = [];
        if (bocBytes.length < off_bytes * cells_num) {
            throw new Error('Not enough bytes for index encoding');
        }
        for (let c = 0; c < cells_num; c++) {
            index.push(readNBytesUIntFromArray(off_bytes, bocBytes));
            bocBytes = bocBytes.slice(off_bytes);
        }
    }

    if (bocBytes.length < tot_cells_size) {
        throw new Error('Not enough bytes for cells data');
    }
    const cells_data = bocBytes.slice(0, tot_cells_size);
    bocBytes = bocBytes.slice(tot_cells_size);
    if (hash_crc32) {
        if (bocBytes.length < 4) {
            throw new Error('Not enough bytes for crc32c hashsum');
        }
        const length = inputData.length;
        if (!compareBytes(crc32c(inputData.slice(0, length - 4)), bocBytes.slice(0, 4))) {
            throw new Error('Crc32c hashsum mismatch');
        }
        bocBytes = bocBytes.slice(4);
    }

    if (bocBytes.length > 0) {
        throw new Error('Too much bytes in BoC serialization');
    }

    return {
        has_idx,
        hash_crc32,
        has_cache_bits,
        flags,
        size_bytes,
        off_bytes,
        cells_num,
        roots_num,
        absent_num,
        tot_cells_size,
        root_list,
        index,
        cells_data,
    };

}

/**
 */


/**
 *
 * @param bytes - An array of cell bytes to parse.
 * @param referenceIndexSize
 */
function parseCell(
    bytes: Uint8Array,
    referenceIndexSize: number

): DeserializeCellDataResult {

    /**
     * Chapter 1.1.3 of the "Telegram Open Network Blockchain"
     * {@link https://ton-blockchain.github.io/docs/tblkch.pdf | tblkch.pdf}
     */

    if (bytes.length < 2) {
        throw new Error('Not enough bytes to encode cell descriptors');
    }
    const byte1 = bytes[0];
    const byte2 = bytes[1];
    bytes = bytes.slice(2);

    const cell = new Cell();

    cell.isExotic = Boolean(byte1 & 8);

    const refsCount = (byte1 % 8);
    if (refsCount > 4) {
        throw new Error(
            `Failed to parse cell: ` +
            `cell can't have more than 4 references`
        );
    }

    const dataByteSize = Math.ceil(byte2 / 2);
    const noCompletion = !(byte2 % 2);

    if (bytes.length < dataByteSize + (referenceIndexSize * refsCount)) {
        throw new Error('Not enough bytes to encode cell data');
    }

    cell.bits.setTopUppedArray(
        bytes.slice(0, dataByteSize),
        noCompletion
    );

    bytes = bytes.slice(dataByteSize);
    for (let r = 0; r < refsCount; r++) {
        cell.refs.push(
            // @todo right now we are storing cell references
            //       as numbers in `refs` and resolve them
            //       to Cell objects later on, however, this
            //       breaks typing and is not a best practice,
            //       the temporary structure should be
            //       introduced instead to support parsing.
            <any> readNBytesUIntFromArray(referenceIndexSize, bytes)
        );
        bytes = bytes.slice(referenceIndexSize);
    }

    return {
        cell,
        residue: bytes,
    };

}
