const {BN} = require("../utils");
const {Cell} = require("./Cell");
const {BitString} = require("./BitString");
const {
    loadBit,
    loadUint,
    loadUintLEQ,
    loadMaybeRefX,
    loadUnary,
    loadHmLabel,
    isSliceEmpty
} = require("./CellParsing");

class HashMap {

    /**
     * Creates empty hashmap with keys of `n`-bit length
     *
     * @param {number} n key bitsize
     * @param {function} parser Parser of the leafs
     */
    constructor(n, maxMembers=10000) {
        this.raw_elements = [];
        this.elements = {};
        this.n = n;
        this.maxMembers = maxMembers;
    }

    /**
     * Loads HashMapNode label
     * hmn_leaf#_ {X:Type} value:X = HashmapNode 0 X;
     * hmn_fork#_ {n:#} {X:Type} left:^(Hashmap n X)
     *            right:^(Hashmap n X) = HashmapNode (n + 1) X;
     *
     * @param {Cell} slice object to parse
     * @param {number} n
     * @param {BN} prefix
     * @returns {number, number} (number and n)
    */
    loadHmNode(slice, n, prefix) {
      if(this.raw_elements.length > this.maxMembers) {
        return; //overflow
      }
      if (n == 0) { // leaf
        var key_slice = new Cell();
        key_slice.bits = prefix;
        this.raw_elements.push({key:key_slice, value:slice});
      } else { //fork
        var prefix_left = prefix.clone();
        prefix_left.writeBit(0);
        var prefix_right = prefix.clone();
        prefix_right.writeBit(1);
        this.loadHashMap(slice.readRef(), n-1, prefix_left);
        this.loadHashMap(slice.readRef(), n-1, prefix_right);
      }
    }

    /**
     * Loads HashMap
     * hm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
     *      {n = (~m) + l} node:(HashmapNode m X) = Hashmap n X;
     *
     * @param {Cell} slice object to parse
     * @param {number} n
     * @param {BN} prefix
     * @returns {number, number} (number and n)
    */
    loadHashMap(slice, n, prefix) {
      var suffix = loadHmLabel(slice, n);
      prefix.writeBitString(suffix);
      var m = n - suffix.writeCursor;
      this.loadHmNode(slice, m, prefix);
    }

    /**
     * Loads HashMap and parses keys and values
     * HashMap X Y;
     *
     * @param {Cell} slice object to parse
     * @param {Function} key_parser function to parse keys
     * @param {Function} value_parser function to parse values
    */
    loadHashMapX2Y(slice, key_parser, value_parser) {
      this.loadHashMap(slice, this.n, new BitString(this.n));
      for (let element of this.raw_elements) {
         var key = element.key;
         var value = element.value;
         var dkey = key_parser(key);
         var dvalue = value_parser(value);
         this.elements[dkey] = dvalue;
      }
    }

    /**
     * Read the keys in arra and return binary tree in the form of nested array
     *
     * @param {array} arr array which contains {key:Cell, value:Cell}
     * @return {array} either leaf or empty leaf or [left,right] fork
    */
    tree_split(arr) {
      let left = [], right = [];
      for(let {key, value} of arr) {
        let lr = loadBit(key);
        let el = {key:key, value:value};
        lr? right.push({key:key, value:value}) : left.push({key:key, value:value});
      }
      if(left.length > 1) {
        left = this.tree_split(left);
      }
      if(right.length > 1) {
        right = this.tree_split(right);
      }
      if ( !left.length & !right.length) {
        return [];
      }
      return [left, right];
    }
    /**
     * Flatten binary tree (by cutting empty branches) if possible:
     * [[], [[left,right]]] flatten to ["1", m, left, right]
     *
     * @param {array} arr array which contains uncutted tree
     * @param {number} m maximal possible length of prefix
     * @return {array} [prefix, maximal possible length of prefix, left branch tree, right branch tree]
    */
    flatten(arr, m) {
      if(!(typeof(arr[0])=="string")) {
        arr.unshift("", m);
      }
      if(arr.length == 3) {
        return arr;
      }
      if(arr[2].length == 0) { //left edge is empty
        return this.flatten([arr[0]+"1", arr[1], arr[3][0], arr[3][1]], m);
      } else if (arr[3].length == 0) { //right edge is empty
        return this.flatten([arr[0]+"0", arr[1], arr[2][0], arr[2][1]], m);
      } else {
        return [arr[0], arr[1], this.flatten(arr[2], m - arr[0].length -1), this.flatten(arr[3], m - arr[0].length -1)];
      }
    }

    /**
     * Serialize HashMap label
     * hml_short$0 {m:#} {n:#} len:(Unary ~n) {n <= m} s:(n * Bit) = HmLabel ~n m;
     * hml_long$10 {m:#} n:(#<= m) s:(n * Bit) = HmLabel ~n m;
     * hml_same$11 {m:#} v:Bit n:(#<= m) = HmLabel ~n m;
     *
     * @param {string} label string of zeroes and ones "010101"
     * @param {number} m maximal possible length of the label
     * @param {Cell} builder to which label will be serialized
    */
    serialize_label(label, m, builder) {
      let n = label.length;
      if(label == "") {
        builder.bits.writeBit(0); //hml_short$0
        builder.bits.writeBit(0); //Unary 0
        return;
      }
      let sizeOfM = m.toString(2).length;
      if(n < sizeOfM) {
        builder.bits.writeBit(0); // hml_short
        for(let i=0; i<n; i++) {
          builder.bits.writeBit(1); // Unary n
        }
        builder.bits.writeBit(0); // Unary 0
        for(let i of label)
          builder.bits.writeBit(i=="1");
        return;
      }
      let isSame = (label == ("0".repeat(label.length))) || (label == ("10".repeat(label.length)));
      if(isSame) {
        builder.bits.writeBit(1);
        builder.bits.writeBit(1); //hml_same
        builder.bits.writeBit(label[0]=="1");
        builder.bits.writeUint(label.length, sizeOfM);
        return;
      } else {
        builder.bits.writeBit(1);
        builder.bits.writeBit(0); //hml_long
        builder.bits.writeUint(label.length, sizeOfM);
        for(let i of label)
          builder.bits.writeBit(i=="1");
        return;
      }
    }

    /**
     * Serialize HashMap edge
     * hm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
     *      {n = (~m) + l} node:(HashmapNode m X) = Hashmap n X;
     *
     * @param {array} se array which contains [label as "0" and "1" string, maximal possible size of label, leaf or left fork, right fork]
     * @param {Cell} builder to which edge will be serialized
    */
    serialize_edge(se, builder) {
      if(se.length == 3) {
        while(se[2].key.bits.readCursor < se[2].key.bits.writeCursor)
          se[0] += loadBit(se[2].key) ? "1" : "0";
        this.serialize_label(se[0], se[1], builder);
        builder.writeCell(se[2].value);
      } else {
        this.serialize_label(se[0], se[1], builder);
        let left = new Cell();
        this.serialize_edge(se[2], left);
        let right = new Cell();
        this.serialize_edge(se[3], right);
        builder.refs.push(left);
        builder.refs.push(right);
      }
    }

    serialize(key_serializator, value_serializator) {
      let se = [];
      for (let key in this.elements) {
        let value = this.elements[key];
        se.push({key:key_serializator(key), value:value_serializator(value)});
      }
      se = this.flatten(this.tree_split(se), this.n);
      let b = new Cell();
      this.serialize_edge(se, b);
      return b;
    }

}

class PfxHashMap extends HashMap {

    /**
     * Loads PfxHashMapNode label
     * phm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
     *            {n = (~m) + l} node:(PfxHashmapNode m X)
     *            = PfxHashmap n X;

     * phmn_leaf$0 {n:#} {X:Type} value:X = PfxHashmapNode n X;
     * phmn_fork$1 {n:#} {X:Type} left:^(PfxHashmap n X)
     *             right:^(PfxHashmap n X) = PfxHashmapNode (n + 1) X;

     * phme_empty$0 {n:#} {X:Type} = PfxHashmapE n X;
     *
     * @param {Cell} slice object to parse
     * @param {number} n
     * @param {BN} prefix
     * @returns {number, number} (number and n)
    */
    loadHmNode(slice, n, prefix) {
      if(this.raw_elements.length > this.maxMembers) {
        return; //overflow
      }

      let pfx = loadBit(slice);

      if (pfx == 0) { // leaf
        var key_slice = new Cell();
        key_slice.bits = prefix;
        this.raw_elements.push({key:key_slice, value:slice});
      } else { //fork
        var prefix_left = prefix.clone();
        prefix_left.writeBit(0);
        var prefix_right = prefix.clone();
        prefix_right.writeBit(1);

        this.loadHashMap(slice.readRef(), n-1, prefix_left);
        this.loadHashMap(slice.readRef(), n-1, prefix_right);
      }
    }

    /**
     * Serialize PfxHashMap edge
     * hm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
     *      {n = (~m) + l} node:(HashmapNode m X) = Hashmap n X;
     *
     * @param {array} se array which contains [label as "0" and "1" string, maximal possible size of label, leaf or left fork, right fork]
     * @param {Cell} builder to which edge will be serialized
    */
    serialize_edge(se, builder) {
      if(se.length == 3) {
        while(se[2].key.bits.readCursor < se[2].key.bits.writeCursor)
          se[0] += loadBit(se[2].key) ? "1" : "0";
        this.serialize_label(se[0], se[1], builder);
        builder.bits.writeBit(0);
        builder.writeCell(se[2].value);
      } else {
        this.serialize_label(se[0], se[1], builder);
        builder.bits.writeBit(1);
        let left = new Cell();
        this.serialize_edge(se[2], left);
        let right = new Cell();
        this.serialize_edge(se[3], right);
        builder.refs.push(left);
        builder.refs.push(right);
      }
    }
}

module.exports = {HashMap, PfxHashMap};
