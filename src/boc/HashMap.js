const {BN} = require("../utils");
const {Cell} = require("./Cell");
const {BitString} = require("./BitString");
const {
    loadBit,
    loadUint,
    loadUintLEQ,
    loadMaybeRefX,
    loadUnary,
    loadHmLabel
} = require("./CellParsing");

class HashMap {

    /**
     * Creates empty hashmap with keys of `n`-bit length
     * 
     * @param {number} n key bitsize
     * @param {function} parser Parser of the leafs
     */
    constructor(n, maxMembers=10000) {
        this.elements = [];
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
      if(this.elements.length > this.maxMembers) {
        return; //overflow    
      }
      if (n == 0) { // leaf
        var key_slice = new Cell();
        key_slice.bits = prefix;
        this.elements.push({key:key_slice, value:slice});
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
     * @param {number} n
     * @param {Function} key_parser function to parse keys
     * @param {Object} key_parser_params Additional params for X parsing
     * @param {Function} value_parser function to parse values
     * @param {Object} value_parser_params Additional params for X parsing
    */
    loadHashMapX2Y(slice, n, key_parser, key_parser_params, value_parser, value_parser_params) {
      this.loadHashMap(slice, n, new BitString(n));
      this.deserialized_map = {};
      for (let element of this.elements) {
         var key = element.key;
         var value = element.value;
         var dkey = key_parser(key, ...key_parser_params);
         var dvalue = value_parser(value, ...value_parser_params);
         this.deserialized_map[dkey] = dvalue;
      }
    }

}

module.exports = {HashMap};
