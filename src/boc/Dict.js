const {Cell} = require("./Cell");
const {BitString} = require("./BitString");

function dropCellCursors(cell) {
  cell.bits.dropCursor();
  for(subcell of cell.refs)
    dropCellCursors(subcell);
}

function deserUnary(bitstring) {
    // unary_zero$0 = Unary ~0;
    // unary_succ$1 {n:#} x:(Unary ~n) = Unary ~(n + 1);
    let n = 0;
    while(true) {
      const r = bitstring,readBit();
      if(r) {
        n = n + 1;
      } else {
        return n;
      }
    }
}

function bitLength(x) {
  return Math.ceil(Math.log(x+1)/Math.log(2));
}

function deserHashMapLabel(bitstring, m) {
    // hml_short$0 {m:#} {n:#} len:(Unary ~n) s:(n * Bit) = HmLabel ~n m;
    // hml_long$10 {m:#} n:(#<= m) s:(n * Bit) = HmLabel ~n m;
    // hml_same$11 {m:#} v:Bit n:(#<= m) = HmLabel ~n m;
    const _type = bitstring.readBit() ? (bitstring.readBit() ? 'same' : 'long') : 'short';
    let suffix;
    switch (_type) {
      case 'short':
        const _len = deserUnary(bitstring);
        suffix = bitstring.readBitstring(_len);
        break;
      case 'long':
        const _len = bitstring.readUint(bitLength(m));
        suffix = bitstring.readBitstring(_len);
        break;
      default: //same
        const bit = bitstring.readBit();
        suffix = new BitString(m);
        if(bit)
          for(let i=0; i<m; i++)
            suffix.on(i);
        break;
    }
    return suffix;
}

function deserHashMapNode(cell, m, resultDict, prefix, maxElements) {
    // hmn_leaf#_ {X:Type} value:X = HashmapNode 0 X;
    // hmn_fork#_ {n:#} {X:Type} left:^(Hashmap n X) right:^(Hashmap n X) = HashmapNode (n + 1) X;

    if(Object.keys(resultDict).length > maxElements)
      throw Error("Too many elements in dictionary");
    if(m == 0) { //leaf
      resultDict[prefix] = cell;
      return;
    }
    let l_prefix = new BitString(prefix.length+1);
    let r_prefix = new BitString(prefix.length+1);
    l_prefix.writeBitString(prefix);
    r_prefix.writeBitString(prefix); r_prefix.writeBit(true);
    l_prefix.dropMode();
    r_prefix.dropMode();

    parse_hashmap(cell.refs[0].clone(), m-1, resultDict, l_prefix, maxElements)
    parse_hashmap(cell.refs[1].clone(), m-1, resultDict, r_prefix, maxElements)
}

function parseHashMap(cell, bitSize, resultDict, prefix, maxElements) {
    // hm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
    //     {n = (~m) + l} node:(HashmapNode m X) = Hashmap n X;
    suffix = deserHashMapLabel(cell.bits, bitSize);
    let new_prefix = new BitString(prefix.length + suffix.length);
    new_prefix.writeBitString(prefix); new_prefix.writeBitString(suffix);
    const m = bitSize - suffix.length;
    deserHashMapNode(cell, m, resultDict, new_prefix, maxElements);
}

function parseDict(cell, type, maxElements = 10000) {
    const _type = type.split("int");
    const unsigned = _type[0] == "u";
    const bitSize = _type[1];
    const tempDict = {};
    parseHashMap(cell, bitSize, tempDict, new BitString(0), maxElements);
    const resultDict = {};
    for (const [key, value] of Object.entries(tempDict)) {
          let _key = unsigned? key.readUint(bitSize) : key.readInt(bitSize);
          resultDict[_key] = value;
      }
    return resultDict;
}

module.exports = {parseDict};
