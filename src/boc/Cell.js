import {BitString} from "./BitString";
import {bytesToHex, bytesToBase64, concatBytes, crc32c, hexToBytes} from "../utils";

class Cell {
    constructor() {
        this.bits = new BitString(1023);
        this.refs = [];
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
    isSpecial() {
        return 0;
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
            for (let k in this.refs) {
                const i = this.refs[k];
                if (i.getMaxDepth() > maxDepth) {
                    maxDepth = i.getMaxDepth();
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
        d1[0] = this.refs.length + this.isSpecial() * 8 + this.getMaxLevel() * 32;
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
            await crypto.subtle.digest("SHA-256", await this.getRepr())
        );
    }

    /**
     * @return {{}}
     */
    toObject() {
        const res = {};
        res['data'] = {
            'b64': bytesToBase64(this.bits.array.slice(0, Math.ceil(this.bits.cursor / 8))),
            'len': this.bits.cursor
        };
        res['refs'] = []
        for (let k in this.refs) {
            const i = this.refs[k];
            res['refs'].push(i.toObject());
        }
        return res;
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
        const topological_order = allcells[0];
        const index_hashmap = allcells[1];

        const cells_num = topological_order.length;
        const s = cells_num.toString(2).length; // Minimal number of bits to represent reference (unused?)
        const s_bytes = Math.min(Math.ceil(s / 8), 1);
        let full_size = 0;
        for (let cell_info of topological_order) {
            //TODO it should be async map or async for
            full_size = full_size + await cell_info[1].bocSerializationSize(index_hashmap, s_bytes);
        }
        const offset_bits = full_size.toString(2).length; // Minimal number of bits to offset/len (unused?)
        const offset_bytes = Math.max(Math.ceil(offset_bits / 8), 1);

        const magic = hexToBytes("B5EE9C72");
        const serialization = new BitString((1023 + 32 * 4 + 32 * 3) * topological_order.length);
        serialization.writeBytes(magic);
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
            topological_order.forEach(
                (cell_data, index) =>
                    serialization.writeUint(cell_data[1].bits.getUsedBytes(), offset_bytes * 8));
        }
        for (let cell_info of topological_order) {
            //TODO it should be async map or async for
            const refcell_ser = await cell_info[1].serializeForBoc(index_hashmap, s_bytes);
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

/**
 * @param cell  {Cell}
 * @param topologicalOrderArray array of pairs: cellHash: Uint8Array, cell: Cell, ...
 * @param indexHashmap cellHash: Uint8Array -> length: number
 * @return {[[], {}]} topologicalOrderArray and indexHashmap
 */
async function treeWalk(cell, topologicalOrderArray, indexHashmap) {
    const cellHash = await cell.hash();
    indexHashmap[cellHash] = topologicalOrderArray.length;
    topologicalOrderArray.push([cellHash, cell]);
    for (let subCell of cell.refs) {
        const res = await treeWalk(subCell, topologicalOrderArray, indexHashmap);
        topologicalOrderArray = res[0];
        indexHashmap = res[1];
    }
    return [topologicalOrderArray, indexHashmap];
}

export {Cell};