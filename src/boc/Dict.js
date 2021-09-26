const {Cell} = require("./Cell");
const {BitString} = require("./BitString");

function dropCellCursors(cell) {
  cell.bits.dropMode();
  for(subcell of cell.refs)
    dropCellCursors(subcell);
}

function deserUnary(bitstring) {
    // unary_zero$0 = Unary ~0;
    // unary_succ$1 {n:#} x:(Unary ~n) = Unary ~(n + 1);
    let n = 0;
    while(true) {
      if(!bitstring.readBit())
        return n;
      n = n + 1;
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
        const _len2 = bitstring.readUint(bitLength(m));
        suffix = bitstring.readBitstring(_len2);
        break;
      default: //same
        const bit = bitstring.readBit();
        const _len3 = bitstring.readUint(bitLength(m));
        suffix = new BitString(_len3);
        if(bit)
          for(let i=0; i<_len3; i++)
            suffix.on(i);
        break;
    }
    return suffix;
}

function sliceToCell(cellslice) {
  x= cellslice.clone();
  x.bits = cellslice.bits.slice(cellslice.bits.cursor);
  return x;
}

function deserHashMapNode(cell, m, resultDict, prefix, maxElements, indexWrapper) {
    // hmn_leaf#_ {X:Type} value:X = HashmapNode 0 X;
    // hmn_fork#_ {n:#} {X:Type} left:^(Hashmap n X) right:^(Hashmap n X) = HashmapNode (n + 1) X;

    if(Object.keys(resultDict).length > maxElements)
      throw Error("Too many elements in dictionary");
    if(m == 0) { //leaf
      const index = indexWrapper(prefix);
      resultDict[index] = sliceToCell(cell);
      return;
    }
    let l_prefix = new BitString(prefix.length+1);
    let r_prefix = new BitString(prefix.length+1);
    l_prefix.writeBitString(prefix);
    r_prefix.writeBitString(prefix); r_prefix.writeBit(true);
    l_prefix.dropMode();
    r_prefix.dropMode();

    parseHashMap(cell.refs[0].clone(), m-1, resultDict, l_prefix, maxElements, indexWrapper)
    parseHashMap(cell.refs[1].clone(), m-1, resultDict, r_prefix, maxElements, indexWrapper)
}

function parseHashMap(cell, bitSize, resultDict, prefix, maxElements, indexWrapper) {
    // hm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n)
    //     {n = (~m) + l} node:(HashmapNode m X) = Hashmap n X;
    const suffix = deserHashMapLabel(cell.bits, bitSize);
    let new_prefix = new BitString(prefix.length + suffix.length);
    new_prefix.writeBitString(prefix); new_prefix.writeBitString(suffix);
    new_prefix.dropMode();
    const m = bitSize - suffix.length;
    deserHashMapNode(cell, m, resultDict, new_prefix, maxElements, indexWrapper);
}

function parseDict(cell, type, maxElements = 10000, bn = false) {
    dropCellCursors(cell);
    const _type = type.split("int");
    const unsigned = _type[0] == "u";
    const bitSize = parseInt(_type[1]);
    const tempDict = {};
    const indexWrapper = bn?
                           unsigned? key => key.readUint(bitSize) : key => key.readInt(bitSize) 
                           :
                           unsigned? key => key.readUint(bitSize).toNumber() : key => key.readInt(bitSize).toNumber();
    parseHashMap(cell, bitSize, tempDict, new BitString(0), maxElements, indexWrapper);
    return tempDict;
}

module.exports = {parseDict};
