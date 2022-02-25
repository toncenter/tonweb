
import { BitString } from './bit-string';

import {
    compareBytes,
    concatBytes,
    crc32c,
    hexToBytes,
    readNBytesUIntFromArray,
    sha256,

} from '../utils';


type IndexHashmap = Record<string, number>;
type TopologicalOrderArray = Array<[Uint8Array, Cell]>;
type TreeWalkResult = [TopologicalOrderArray, IndexHashmap];


const reachBocMagicPrefix = hexToBytes('B5EE9C72');
const leanBocMagicPrefix = hexToBytes('68ff65f3');
const leanBocMagicPrefixCRC = hexToBytes('acc3a728');


export class Cell {

    public readonly bits = new BitString(1023);
    public isExotic: (number | false) = false;
    public refs: Cell[] = [];


    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns root cells.
     */
    public static fromBoc(serializedBoc: (string | Uint8Array)): Cell[] {
        return deserializeBoc(serializedBoc);
    }

    /**
     * Deserializes the BOC specified as HEX-string or
     * a byte-array and returns one root cells. Throws an
     * error if BOC contains multiple root cells.
     */
    public static oneFromBoc(serializedBoc: (string | Uint8Array)): Cell {
        const cells = deserializeBoc(serializedBoc);
        if (cells.length !== 1)
            throw new Error(`Expected 1 root cell, but have ${cells.length} cells`);
        return cells[0];
    }

    /**
     * Writes the specified cell to this cell.
     */
    public writeCell(cell: Cell) {
        // XXX we do not check that there are enough place in cell
        // @todo: is this actionable?
        this.bits.writeBitString(cell.bits);
        this.refs = this.refs.concat(cell.refs);
    }

    /**
     * Returns cell max level.
     */
    public getMaxLevel(): number {

        // @todo: implement level calculation for exotic cells

        // let maxLevel = 0;
        // for (const subCell of this.refs) {
        //     const subCellMaxLevel = subCell.getMaxLevel();
        //     if (subCellMaxLevel > maxLevel) {
        //         maxLevel = subCellMaxLevel;
        //     }
        // }
        // return maxLevel;

        return 0;

    }

    /**
     * @todo: add description
     */
    public isExplicitlyStoredHashes(): number {
        // @todo: does it require implementation?
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
     * @todo: add description
     */
    public getRefsDescriptor(): Uint8Array {
        const d1 = Uint8Array.from({ length: 1 }, () => 0);
        d1[0] = this.refs.length + Number(this.isExotic) * 8 + this.getMaxLevel() * 32;
        return d1;
    }

    /**
     * @todo: add description
     */
    public getBitsDescriptor(): Uint8Array {
        const d2 = Uint8Array.from({ length: 1 }, () => 0);
        const usedBits = this.bits.getUsedBits();
        d2[0] = Math.ceil(usedBits / 8) + Math.floor(usedBits / 8);
        return d2;
    }

    /**
     * @todo: add description
     */
    public getDataWithDescriptors(): Uint8Array {
        const d1 = this.getRefsDescriptor();
        const d2 = this.getBitsDescriptor();
        const tuBits = this.bits.getTopUppedArray();
        return concatBytes(concatBytes(d1, d2), tuBits);
    }

    /**
     * @todo: add description
     */
    public async getRepr(): Promise<Uint8Array> {
        const reprArray = [];

        reprArray.push(this.getDataWithDescriptors());
        for (let k in this.refs) {
            const i = this.refs[k];
            reprArray.push(i.getMaxDepthAsArray());
        }
        for (let k in this.refs) {
            const i = this.refs[k];
            reprArray.push(await i.hash());
        }
        let x = new Uint8Array();
        for (let k in reprArray) {
            const i = reprArray[k];
            x = concatBytes(x, i);
        }
        return x;
    }

    /**
     * @todo: add description
     */
    public async hash(): Promise<Uint8Array> {
        return new Uint8Array(
            await sha256(await this.getRepr())
        );
    }

    /**
     * Recursively prints cell's content like in Fift.
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
     * Creates BOC byte-array.
     */
    public async toBoc(
        hasIdx = true,
        hashCrc32 = true,
        hasCacheBits = false,
        flags = 0

    ): Promise<Uint8Array> {

        //serialized_boc#b5ee9c72 has_idx:(## 1) has_crc32c:(## 1)
        //  has_cache_bits:(## 1) flags:(## 2) { flags = 0 }
        //  size:(## 3) { size <= 4 }
        //  off_bytes:(## 8) { off_bytes <= 8 }
        //  cells:(##(size * 8))
        //  roots:(##(size * 8)) { roots >= 1 }
        //  absent:(##(size * 8)) { roots + absent <= cells }
        //  tot_cells_size:(##(off_bytes * 8))
        //  root_list:(roots * ##(size * 8))
        //  index:has_idx?(cells * ##(off_bytes * 8))
        //  cell_data:(tot_cells_size * [ uint8 ])
        //  crc32c:has_crc32c?uint32
        // = BagOfCells;

        const rootCell = this;

        const allCells = await rootCell.treeWalk();
        const topologicalOrder = allCells[0];
        const cellsIndex = allCells[1];

        const cellsNum = topologicalOrder.length;
        const s = cellsNum.toString(2).length; // Minimal number of bits to represent reference (unused?)
        const sBytes = Math.min(Math.ceil(s / 8), 1);
        let fullSize = 0;
        let sizeIndex = [];
        for (let cellInfo of topologicalOrder) {
            // @todo: it should be async map or async for
            sizeIndex.push(fullSize);
            fullSize = fullSize + await cellInfo[1].bocSerializationSize(cellsIndex, sBytes);
        }
        const offsetBits = fullSize.toString(2).length; // Minimal number of bits to offset/len (unused?)
        const offsetBytes = Math.max(Math.ceil(offsetBits / 8), 1);

        const serialization = new BitString((1023 + 32 * 4 + 32 * 3) * topologicalOrder.length);
        serialization.writeBytes(reachBocMagicPrefix);
        serialization.writeBitArray([hasIdx, hashCrc32, hasCacheBits]);
        serialization.writeUint(flags, 2);
        serialization.writeUint(sBytes, 3);
        serialization.writeUint8(offsetBytes);
        serialization.writeUint(cellsNum, sBytes * 8);
        serialization.writeUint(1, sBytes * 8); // One root for now
        serialization.writeUint(0, sBytes * 8); // Complete BOCs only
        serialization.writeUint(fullSize, offsetBytes * 8);
        serialization.writeUint(0, sBytes * 8); // Root shoulh have index 0
        if (hasIdx) {
            topologicalOrder.forEach(
                (cell_data, index) =>
                    serialization.writeUint(sizeIndex[index], offsetBytes * 8));
        }
        for (let cellInfo of topologicalOrder) {
            //TODO it should be async map or async for
            const refCellSer = await cellInfo[1].serializeForBoc(cellsIndex, sBytes);
            serialization.writeBytes(refCellSer);
        }
        let serSrr = serialization.getTopUppedArray();
        if (hashCrc32) {
            serSrr = concatBytes(serSrr, crc32c(serSrr));
        }

        return serSrr;
    }


    private getMaxDepthAsArray(): Uint8Array {
        const maxDepth = this.getMaxDepth();
        const d = Uint8Array.from({length: 2}, () => 0);
        d[1] = maxDepth % 256;
        d[0] = Math.floor(maxDepth / 256);
        return d;
    }

    private async treeWalk(): Promise<TreeWalkResult> {
        return treeWalk(this, [], {});
    }

    private async serializeForBoc(
        cellsIndex: IndexHashmap,
        // @todo: remove/use unused parameter
        refSize: any

    ): Promise<Uint8Array> {

        const reprArray: Uint8Array[] = [];

        reprArray.push(this.getDataWithDescriptors());
        if (this.isExplicitlyStoredHashes()) {
            throw new Error('Cell hashes explicit storing is not implemented');
        }
        for (const subCell of this.refs) {
            const refHash = await subCell.hash();
            const refHashStr = refHash.toString();
            const refIndexInt = cellsIndex[refHashStr];
            let refIndexHex = refIndexInt.toString(16);
            if (refIndexHex.length % 2) {
                refIndexHex = '0' + refIndexHex;
            }
            const reference = hexToBytes(refIndexHex);
            reprArray.push(reference);
        }
        let result = new Uint8Array();
        for (const reference of reprArray) {
            result = concatBytes(result, reference);
        }
        return result;
    }

    private async bocSerializationSize(cellsIndex: any, refSize: any): Promise<number> {
        return (await this.serializeForBoc(cellsIndex, refSize)).length;
    }

}


async function moveToTheEnd(
    indexHashmap: IndexHashmap,
    topologicalOrderArray: TopologicalOrderArray,
    target
) {
    const targetIndex = indexHashmap[target];
    for (let h in indexHashmap) {
        if (indexHashmap[h] > targetIndex) {
            indexHashmap[h] = indexHashmap[h] - 1;
        }
    }
    indexHashmap[target] = topologicalOrderArray.length - 1;
    const data = topologicalOrderArray.splice(targetIndex, 1)[0];
    topologicalOrderArray.push(data);
    for (const subCell of data[1].refs) {
        await moveToTheEnd(
            indexHashmap,
            topologicalOrderArray,
            await subCell.hash()
        );
    }
}

/**
 * @todo: add description
 */
async function treeWalk(
    cell: Cell,
    topologicalOrderArray: TopologicalOrderArray,
    indexHashmap: IndexHashmap,
    parentHash?: Uint8Array

): Promise<TreeWalkResult> {

    const cellHash = await cell.hash();
    // @todo: should we use some other way to cast
    //        `cellHash` and `parentHash` to a primitive values?
    //        Uint8Array.toString() doesn't produce very compact results
    const cellHashStr = cellHash.toString();
    if (cellHashStr in indexHashmap) {
        // Duplicate cell
        // it is possible that already seen cell is a children of more deep cell
        if (parentHash) {
            const parentHashStr = parentHash.toString();
            if (indexHashmap[parentHashStr] > indexHashmap[cellHashStr]) {
                await moveToTheEnd(indexHashmap, topologicalOrderArray, cellHash);
            }
        }
        return [topologicalOrderArray, indexHashmap];
    }
    indexHashmap[cellHashStr] = topologicalOrderArray.length;
    topologicalOrderArray.push([cellHash, cell]);
    for (let subCell of cell.refs) {
        const res = await treeWalk(subCell, topologicalOrderArray, indexHashmap, cellHash);
        topologicalOrderArray = res[0];
        indexHashmap = res[1];
    }

    return [topologicalOrderArray, indexHashmap];
}


function parseBocHeader(serializedBoc) {
    // snake_case is used to match TON docs
    if (serializedBoc.length < 4 + 1)
        throw 'Not enough bytes for magic prefix';
    const inputData = serializedBoc; // Save copy for crc32
    const prefix = serializedBoc.slice(0, 4);
    serializedBoc = serializedBoc.slice(4);
    let has_idx, hash_crc32, has_cache_bits, flags, size_bytes;
    if (compareBytes(prefix, reachBocMagicPrefix)) {
        const flags_byte = serializedBoc[0];
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
        size_bytes = serializedBoc[0];
    }
    if (compareBytes(prefix, leanBocMagicPrefixCRC)) {
        has_idx = 1;
        hash_crc32 = 1;
        has_cache_bits = 0;
        flags = 0;
        size_bytes = serializedBoc[0];
    }
    serializedBoc = serializedBoc.slice(1);
    if (serializedBoc.length < 1 + 5 * size_bytes)
        throw 'Not enough bytes for encoding cells counters';
    const offset_bytes = serializedBoc[0];
    serializedBoc = serializedBoc.slice(1);
    const cells_num = readNBytesUIntFromArray(size_bytes, serializedBoc);
    serializedBoc = serializedBoc.slice(size_bytes);
    const roots_num = readNBytesUIntFromArray(size_bytes, serializedBoc);
    serializedBoc = serializedBoc.slice(size_bytes);
    const absent_num = readNBytesUIntFromArray(size_bytes, serializedBoc);
    serializedBoc = serializedBoc.slice(size_bytes);
    const tot_cells_size = readNBytesUIntFromArray(offset_bytes, serializedBoc);
    serializedBoc = serializedBoc.slice(offset_bytes);
    if (serializedBoc.length < roots_num * size_bytes)
        throw 'Not enough bytes for encoding root cells hashes';
    let root_list = [];
    for (let c = 0; c < roots_num; c++) {
        root_list.push(readNBytesUIntFromArray(size_bytes, serializedBoc));
        serializedBoc = serializedBoc.slice(size_bytes);
    }
    let index: (number[] | false) = false;
    if (has_idx) {
        index = [];
        if (serializedBoc.length < offset_bytes * cells_num)
            throw 'Not enough bytes for index encoding';
        for (let c = 0; c < cells_num; c++) {
            index.push(readNBytesUIntFromArray(offset_bytes, serializedBoc));
            serializedBoc = serializedBoc.slice(offset_bytes);
        }
    }

    if (serializedBoc.length < tot_cells_size)
        throw 'Not enough bytes for cells data';
    const cells_data = serializedBoc.slice(0, tot_cells_size);
    serializedBoc = serializedBoc.slice(tot_cells_size);
    if (hash_crc32) {
        if (serializedBoc.length < 4)
            throw 'Not enough bytes for crc32c hashsum';
        const length = inputData.length;
        if (!compareBytes(crc32c(inputData.slice(0, length - 4)), serializedBoc.slice(0, 4)))
            throw 'Crc32c hashsum mismatch';
        serializedBoc = serializedBoc.slice(4);
    }
    if (serializedBoc.length)
        throw 'Too much bytes in BoC serialization';
    return {
        has_idx: has_idx, hash_crc32: hash_crc32, has_cache_bits: has_cache_bits, flags: flags, size_bytes: size_bytes,
        off_bytes: offset_bytes, cells_num: cells_num, roots_num: roots_num, absent_num: absent_num,
        tot_cells_size: tot_cells_size, root_list: root_list, index: index,
        cells_data: cells_data
    };
}

function deserializeCellData(cellData, referenceIndexSize) {
    if (cellData.length < 2)
        throw 'Not enough bytes to encode cell descriptors';
    const d1 = cellData[0], d2 = cellData[1];
    cellData = cellData.slice(2);
    // @todo: remove/use unused variable `level`
    // const level = Math.floor(d1 / 32);
    const isExotic = d1 & 8;
    const refNum = d1 % 8;
    const dataBytesize = Math.ceil(d2 / 2);
    const fulfilledBytes = !(d2 % 2);
    let cell = new Cell();
    cell.isExotic = isExotic;
    if (cellData.length < dataBytesize + referenceIndexSize * refNum)
        throw 'Not enough bytes to encode cell data';
    cell.bits.setTopUppedArray(cellData.slice(0, dataBytesize), fulfilledBytes);
    cellData = cellData.slice(dataBytesize);
    for (let r = 0; r < refNum; r++) {
        cell.refs.push(
            // @todo: right now we are storing cell references as numbers in `refs`
            //        and resolve them to Cell objects later on,
            //        however, this breaks typing and is not a best practice,
            //        the temporary structure should be introduced instead to support parsing.
            <any> readNBytesUIntFromArray(referenceIndexSize, cellData)
        );
        cellData = cellData.slice(referenceIndexSize);
    }
    return { cell, residue: cellData };
}


/**
 * @param serializedBoc  {string | Uint8Array} hex or bytearray
 * @return {Cell[]} root cells
 */
function deserializeBoc(serializedBoc) {
    if (typeof (serializedBoc) == 'string') {
        serializedBoc = hexToBytes(serializedBoc);
    }
    const header = parseBocHeader(serializedBoc);
    let cellsData = header.cells_data;
    let cellsArray = [];
    for (let ci = 0; ci < header.cells_num; ci++) {
        let dd = deserializeCellData(cellsData, header.size_bytes);
        cellsData = dd.residue;
        cellsArray.push(dd.cell);
    }
    for (let ci = header.cells_num - 1; ci >= 0; ci--) {
        let c = cellsArray[ci];
        for (let ri = 0; ri < c.refs.length; ri++) {
            const r = c.refs[ri];
            if (r < ci) {
                throw 'Topological order is broken';
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
