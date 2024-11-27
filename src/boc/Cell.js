const {BitString} = require("./BitString");
const {
    bytesToBase64,
    compareBytes,
    concatBytes,
    crc32c,
    hexToBytes,
    readNBytesUIntFromArray,
    sha256,
    bytesToHex
} = require("../utils");
const {Slice} = require("./Slice");

const reachBocMagicPrefix = hexToBytes('B5EE9C72');
const leanBocMagicPrefix = hexToBytes('68ff65f3');
const leanBocMagicPrefixCRC = hexToBytes('acc3a728');

class Cell {
    constructor() {
        this.bits = new BitString(1023);
        this.refs = [];
        this.isExotic = false;
    }

    /**
     * @param serializedBoc  {string | Uint8Array} hex or bytearray
     * @return {Cell[]} root cells
     */
    static fromBoc(serializedBoc) {
        return deserializeBoc(serializedBoc);
    }

    /**
     * @param serializedBoc  {string | Uint8Array} hex or bytearray
     * @return {Cell} root cell
     */
    static oneFromBoc(serializedBoc) {
        const cells = deserializeBoc(serializedBoc);
        if (cells.length !== 1) throw new Error('expected 1 root cell but have ' + cells.length);
        return cells[0];
    }

    /**
     * Write another cell to this cell
     * @param anotherCell  {Cell}
     */
    writeCell(anotherCell) {
        // XXX we do not check that there are anough place in cell
        this.bits.writeBitString(anotherCell.bits);
        this.refs = this.refs.concat(anotherCell.refs);
    }

    /**
     * @return {number}
     */
    getMaxLevel() {
        //TODO level calculation differ for exotic cells
        let maxLevel = 0;
        for (let k in this.refs) {
            const i = this.refs[k];
            if (i.getMaxLevel() > maxLevel) {
                maxLevel = i.getMaxLevel();
            }
        }
        return maxLevel;
    }

    /**
     * @return {number}
     */
    isExplicitlyStoredHashes() {
        return 0;
    }

    /**
     * @return {number}
     */
    getMaxDepth() {
        let maxDepth = 0;
        if (this.refs.length > 0) {
            for (let k = 0; k < this.refs.length; k++) {
                const child = this.refs[k];
                let childMaxDepth = child.getMaxDepth();
                if (childMaxDepth > maxDepth) {
                    maxDepth = childMaxDepth;
                }
            }
            maxDepth = maxDepth + 1;
        }
        return maxDepth;
    }

    /**
     * @private
     * @return {Uint8Array}
     */
    getMaxDepthAsArray() {
        const maxDepth = this.getMaxDepth();
        const d = Uint8Array.from({length: 2}, () => 0);
        d[1] = maxDepth % 256;
        d[0] = Math.floor(maxDepth / 256);
        return d;
    }

    /**
     * @return {Uint8Array}
     */
    getRefsDescriptor() {
        const d1 = Uint8Array.from({length: 1}, () => 0);
        d1[0] = this.refs.length + this.isExotic * 8 + this.getMaxLevel() * 32;
        return d1;
    }

    /**
     * @return {Uint8Array}
     */
    getBitsDescriptor() {
        const d2 = Uint8Array.from({length: 1}, () => 0);
        d2[0] = Math.ceil(this.bits.cursor / 8) + Math.floor(this.bits.cursor / 8);
        return d2;
    }

    /**
     * @return {Uint8Array}
     */
    getDataWithDescriptors() {
        const d1 = this.getRefsDescriptor();
        const d2 = this.getBitsDescriptor();
        const tuBits = this.bits.getTopUppedArray();
        return concatBytes(concatBytes(d1, d2), tuBits);
    }

    /**
     * @return {Promise<Uint8Array>}
     */
    async getRepr() {
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
     * @return {Promise<Uint8Array>}
     */
    async hash() {
        return new Uint8Array(
            await sha256(await this.getRepr())
        );
    }

    beginParse() {
        const refs = this.refs.map(ref => ref.beginParse());
        return new Slice(this.bits.array.slice(), this.bits.length, refs);
    }

    /**
     * Recursively prints cell's content like Fift
     * @return  {string}
     */
    print(indent) {
        indent = indent || '';
        let s = indent + 'x{' + this.bits.toHex() + '}\n';
        for (let k in this.refs) {
            const i = this.refs[k];
            s += i.print(indent + ' ');
        }
        return s;
    }

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
    /**
     * create boc bytearray
     * @param has_idx? {boolean}
     * @param hash_crc32?  {boolean}
     * @param has_cache_bits?  {boolean}
     * @param flags? {number}
     * @return {Promise<Uint8Array>}
     */
    async toBoc(has_idx = true, hash_crc32 = true, has_cache_bits = false, flags = 0) {
        const root_cell = this;

        const allcells = await root_cell.treeWalk();
        const topologicalOrder = allcells[0];
        const cellsIndex = allcells[1];

        const cells_num = topologicalOrder.length;
        const s = cells_num.toString(2).length; // Minimal number of bits to represent reference (unused?)
        const s_bytes = Math.min(Math.ceil(s / 8), 1);
        let full_size = 0;
        let sizeIndex = [];
        for (let cell_info of topologicalOrder) {
            //TODO it should be async map or async for
            sizeIndex.push(full_size);
            full_size = full_size + await cell_info[1].bocSerializationSize(cellsIndex, s_bytes);
        }
        const offset_bits = full_size.toString(2).length; // Minimal number of bits to offset/len (unused?)
        const offset_bytes = Math.max(Math.ceil(offset_bits / 8), 1);

        const serialization = new BitString((1023 + 32 * 4 + 32 * 3) * topologicalOrder.length);
        serialization.writeBytes(reachBocMagicPrefix);
        serialization.writeBitArray([has_idx, hash_crc32, has_cache_bits]);
        serialization.writeUint(flags, 2);
        serialization.writeUint(s_bytes, 3);
        serialization.writeUint8(offset_bytes);
        serialization.writeUint(cells_num, s_bytes * 8);
        serialization.writeUint(1, s_bytes * 8); // One root for now
        serialization.writeUint(0, s_bytes * 8); // Complete BOCs only
        serialization.writeUint(full_size, offset_bytes * 8);
        serialization.writeUint(0, s_bytes * 8); // Root shoulh have index 0
        if (has_idx) {
            topologicalOrder.forEach(
                (cell_data, index) =>
                    serialization.writeUint(sizeIndex[index], offset_bytes * 8));
        }
        for (let cell_info of topologicalOrder) {
            //TODO it should be async map or async for
            const refcell_ser = await cell_info[1].serializeForBoc(cellsIndex, s_bytes);
            serialization.writeBytes(refcell_ser);
        }
        let ser_arr = serialization.getTopUppedArray();
        if (hash_crc32) {
            ser_arr = concatBytes(ser_arr, crc32c(ser_arr));
        }

        return ser_arr;
    }

    /**
     * @private
     * @param cellsIndex
     * @param refSize
     * @return {Promise<Uint8Array>}
     */
    async serializeForBoc(cellsIndex, refSize) {
        const reprArray = [];

        reprArray.push(this.getDataWithDescriptors());
        if (this.isExplicitlyStoredHashes()) {
            throw new Error("Cell hashes explicit storing is not implemented");
        }
        for (let k in this.refs) {
            const i = this.refs[k];
            const refHash = await i.hash();
            const refIndexInt = cellsIndex[refHash];
            let refIndexHex = refIndexInt.toString(16);
            if (refIndexHex.length % 2) {
                refIndexHex = "0" + refIndexHex;
            }
            const reference = hexToBytes(refIndexHex);
            reprArray.push(reference);
        }
        let x = new Uint8Array();
        for (let k in reprArray) {
            const i = reprArray[k];
            x = concatBytes(x, i);
        }
        return x;
    }

    /**
     * @private
     * @param cellsIndex
     * @param refSize
     * @return {Promise<number>}
     */
    async bocSerializationSize(cellsIndex, refSize) {
        return (await this.serializeForBoc(cellsIndex, refSize)).length;
    }

    /**
     * @private
     * @return {[[], {}]} topologicalOrderArray and indexHashmap
     */
    async treeWalk() {
        return treeWalk(this, [], {});
    }
}

async function moveToTheEnd(indexHashmap, topologicalOrderArray, target) {
    const targetIndex = indexHashmap[target];
    for (let h in indexHashmap) {
        if (indexHashmap[h] > targetIndex) {
            indexHashmap[h] = indexHashmap[h] - 1;
        }
    }
    indexHashmap[target] = topologicalOrderArray.length - 1;
    const data = topologicalOrderArray.splice(targetIndex, 1)[0];
    topologicalOrderArray.push(data);
    for (let subCell of data[1].refs) {
        await moveToTheEnd(indexHashmap, topologicalOrderArray, await subCell.hash());
    }
}

/**
 * @param cell  {Cell}
 * @param topologicalOrderArray array of pairs: cellHash: Uint8Array, cell: Cell, ...
 * @param indexHashmap cellHash: Uint8Array -> cellIndex: number
 * @return {[[], {}]} topologicalOrderArray and indexHashmap
 */
async function treeWalk(cell, topologicalOrderArray, indexHashmap, parentHash = null) {
    const cellHash = await cell.hash();
    if (cellHash in indexHashmap) { // Duplication cell
        //it is possible that already seen cell is a children of more deep cell
        if (parentHash) {
            if (indexHashmap[parentHash] > indexHashmap[cellHash]) {
                await moveToTheEnd(indexHashmap, topologicalOrderArray, cellHash);
            }
        }
        return [topologicalOrderArray, indexHashmap];
    }
    indexHashmap[cellHash] = topologicalOrderArray.length;
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
        throw "Not enough bytes for magic prefix";
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
        throw "Not enough bytes for encoding cells counters";
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
        throw "Not enough bytes for encoding root cells hashes";
    let root_list = [];
    for (let c = 0; c < roots_num; c++) {
        root_list.push(readNBytesUIntFromArray(size_bytes, serializedBoc));
        serializedBoc = serializedBoc.slice(size_bytes);
    }
    let index = false;
    if (has_idx) {
        index = [];
        if (serializedBoc.length < offset_bytes * cells_num)
            throw "Not enough bytes for index encoding";
        for (let c = 0; c < cells_num; c++) {
            index.push(readNBytesUIntFromArray(offset_bytes, serializedBoc));
            serializedBoc = serializedBoc.slice(offset_bytes);
        }
    }

    if (serializedBoc.length < tot_cells_size)
        throw "Not enough bytes for cells data";
    const cells_data = serializedBoc.slice(0, tot_cells_size);
    serializedBoc = serializedBoc.slice(tot_cells_size);
    if (hash_crc32) {
        if (serializedBoc.length < 4)
            throw "Not enough bytes for crc32c hashsum";
        const length = inputData.length;
        if (!compareBytes(crc32c(inputData.slice(0, length - 4)), serializedBoc.slice(0, 4)))
            throw "Crc32c hashsum mismatch";
        serializedBoc = serializedBoc.slice(4);
    }
    if (serializedBoc.length)
        throw "Too much bytes in BoC serialization";
    return {
        has_idx: has_idx, hash_crc32: hash_crc32, has_cache_bits: has_cache_bits, flags: flags, size_bytes: size_bytes,
        off_bytes: offset_bytes, cells_num: cells_num, roots_num: roots_num, absent_num: absent_num,
        tot_cells_size: tot_cells_size, root_list: root_list, index: index,
        cells_data: cells_data
    };
}

function deserializeCellData(cellData, referenceIndexSize) {
    if (cellData.length < 2)
        throw "Not enough bytes to encode cell descriptors";
    const d1 = cellData[0], d2 = cellData[1];
    cellData = cellData.slice(2);
    const level = Math.floor(d1 / 32);
    const isExotic = d1 & 8;
    const refNum = d1 % 8;
    const dataBytesize = Math.ceil(d2 / 2);
    const fullfilledBytes = !(d2 % 2);
    let cell = new Cell();
    cell.isExotic = isExotic;
    if (cellData.length < dataBytesize + referenceIndexSize * refNum)
        throw "Not enough bytes to encode cell data";
    cell.bits.setTopUppedArray(cellData.slice(0, dataBytesize), fullfilledBytes);
    cellData = cellData.slice(dataBytesize);
    for (let r = 0; r < refNum; r++) {
        cell.refs.push(readNBytesUIntFromArray(referenceIndexSize, cellData));
        cellData = cellData.slice(referenceIndexSize);
    }
    return {cell: cell, residue: cellData};
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
    let cells_data = header.cells_data;
    let cells_array = [];
    for (let ci = 0; ci < header.cells_num; ci++) {
        let dd = deserializeCellData(cells_data, header.size_bytes);
        cells_data = dd.residue;
        cells_array.push(dd.cell);
    }
    for (let ci = header.cells_num - 1; ci >= 0; ci--) {
        let c = cells_array[ci];
        for (let ri = 0; ri < c.refs.length; ri++) {
            const r = c.refs[ri];
            if (r < ci) {
                throw "Topological order is broken";
            }
            c.refs[ri] = cells_array[r];
        }
    }
    let root_cells = [];
    for (let ri of header.root_list) {
        root_cells.push(cells_array[ri]);
    }
    return root_cells;
}

module.exports = {Cell};
