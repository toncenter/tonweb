const {BN} = require("../utils");
const {BitString} = require("./BitString");

/**
 * Loads Bit
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @returns {number}
 */
function loadBit(slice) {
    return slice.bits.readBit();
}

/**
 * Loads Bits
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @returns {BitString}
 */
function loadBits(slice, n) {
    return slice.bits.readBits(n);
}

/**
 * Loads Uint
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @returns {BN}
 */
function loadUint(slice, n) {
    if (slice.bits.readCursor + n > slice.bits.writeCursor) {
        // read operation would through anyway, but here we get more
        // detailed error
        throw Error("cannot load uint: no enough bits");
    }
    return slice.bits.readUint(n);
}

/**
 * Loads signed int
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @returns {BN}
 */
function loadInt(slice, n) {
    if (slice.bits.readCursor + n > slice.bits.writeCursor) {
        // read operation would through anyway, but here we get more
        // detailed error
        throw Error("cannot load int: no enough bits");
    }
    return slice.bits.readInt(n);
}

/**
 * Loads unsigned integer less or equal n by reading minimal number of bits encoding n
 * 
 * #<= p
 * 
 * @param {Cell} slice object to parse
 * @param {number} n parameter
 * @returns {BN}
 */
function loadUintLEQ(slice, n) {
  var result = loadUint(slice, (new BN(n)).toString(2).length);
  if(result > n) {
    throw Error("cannot load {<= x}: encoded number is too high");
  }
  return result;
}

/**
 * Loads unsigned integer less than n by reading minimal number of bits encoding n-1
 * 
 * #<= p
 * 
 * @param {Cell} slice object to parse
 * @param {number} n parameter
 * @returns {BN}
 */
function loadUintLess(slice, n) {
  return loadUintLEQ(slice, n - 1);
}

/**
 * Loads VarUInteger 
 * 
 * var_uint$_ {n:#} len:(#< n) value:(uint (len * 8)) = VarUInteger n;
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @param {number} n size of the VarUInteger
 * @returns {BN}
 */
function loadVarUInteger(slice, n) {
    
    len = loadUintLess(slice, n);
    if (len == 0) {
        return new BN(0);
    } else {
        return loadUint(slice, len * 8);
    }
}

/**
 * Loads coins amount
 * 
 * nanograms$_ amount:(VarUInteger 16) = Grams;  
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @returns {BN}
 */
function loadCoins(slice) {
    return loadVarUInteger(slice, 16);
}

/**
 * Loads ^X
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @param {Function} parser Function to parse X
 * @returns {Object}
 */
function loadRefX(slice, parser) {
    var ref = slice.readRef();
    return parser(ref);
}

/**
 * Loads Maybe X
 * 
 * nothing$0 {X:Type} = Maybe X; <br>
 * just$1 {X:Type} value:X = Maybe X;
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @param {Function} parser Function to parse X
 * @returns {Object}
 */
function loadMaybeX(slice, parser) {
    const maybe = loadBit(slice);
    if (!maybe || !parser) {
        return null;
    }
    return parser(slice);

}



/**
 * Loads Maybe ^X
 * 
 * Maybe ^X;
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @param {Function} parser function to parse X
 * @returns {Object}
 */
function loadMaybeRefX(slice, parser) {
  return loadMaybeX(slice, s => loadRefX(s, parser));
}

/**
 * Loads Either X Y
 * 
 * left$0 {X:Type} {Y:Type} value:X = Either X Y;
 * right$1 {X:Type} {Y:Type} value:Y = Either X Y;
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @param {Function} parser_x function to parse X
 * @param {Function} parser_y function to parse Y
 * @returns {Object}
 */
function loadEither(slice, parser_x, parser_y) {
    const b = loadBit(slice);
    if (b == 0) {
        return parser_x(slice);
    }
    else {
        return parser_y(slice);
    }
}

/**
 * Loads Either X ^X
 * 
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @param {Function} parser_x function to parse X
 * @param {Function} parser_y function to parse Y
 * @returns {Object}
 */
function loadEitherXorRefX(slice, parser) {
    const b = loadBit(slice);
    if (b == 0) {
        return parser(slice);
    }
    else {
        return loadRefX(slice, parser);
    }
}

/**
 * Loads Unary
 * 
 * unary_zero$0 = Unary ~0;
 * unary_succ$1 {n:#} x:(Unary ~n) = Unary ~(n + 1);
 * @throws {Error} Error object with description
 * @param {Cell} slice object to parse
 * @returns {number}
 */

function loadUnary(slice) {
        const pfx = loadBit(slice);
        if (pfx == 0) {
            // unary_zero
            return 0;
        } else {
            // unary_succ
            const x = loadUnary(slice);
            return x + 1;
        }
}
/**
 * Loads HashMap label
 * hml_short$0 {m:#} {n:#} len:(Unary ~n) {n <= m} s:(n * Bit) = HmLabel ~n m;
 * hml_long$10 {m:#} n:(#<= m) s:(n * Bit) = HmLabel ~n m;
 * hml_same$11 {m:#} v:Bit n:(#<= m) = HmLabel ~n m;
 *
 * @param {Cell} slice object to parse
 * @param {number} m 
 * @returns {Bitstring} prefix part
*/
function loadHmLabel(slice, m) {
        var temp = slice.bits.clone();
        var pfx = loadBit(slice);
        if (pfx == 0) {
            // hml_short$0 {m:#} {n:#} len:(Unary ~n) s:(n * Bit) = HmLabel ~n m;
            const n = loadUnary(slice);
            return loadBits(slice, n);
        }
        else {
            pfx = loadBit(slice);
            if (pfx == 0) {
                // hml_long$10 {m:#} n:(#<= m) s:(n * Bit) = HmLabel ~n m;
                const n = loadUintLEQ(slice, m);
                return loadBits(slice, n);
            }
            else {
                // hml_same$11 {m:#} v:Bit n:(#<= m) = HmLabel ~n m;
                const v = loadBit(slice);
                const n = loadUintLEQ(slice, m);
                
                const r = new BitString(n);
                for(var i=0; i<n; i++) {
                  r.writeBit(v);
                }
                return r;
            }
        }
}

/**
 * Check whether slice was read to the end
 * 
 * @param {Cell} slice object to parse
 * @returns {bool}
 */
function isSliceEmpty(slice) {
    return slice.bits.readCursor == slice.bits.writeCursor;
}


module.exports = {loadBit, loadUint, loadInt, 
                  loadVarUInteger, loadCoins, 
                  loadRefX, loadMaybeX, loadMaybeRefX, loadEither, loadEitherXorRefX,
                  loadUnary, loadHmLabel, isSliceEmpty};
