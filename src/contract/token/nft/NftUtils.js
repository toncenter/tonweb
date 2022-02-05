const {base64ToBytes, Address} = require("../../../utils");
const {Cell} = require("../../../boc");

const readIntFromBitString = (bs, cursor, bits) => {
    let n = BigInt(0);
    for (let i = 0; i < bits; i++) {
        n *= BigInt(2);
        n += BigInt(bs.get(cursor + i));
    }
    return n;
}

const parseAddress = x => {
    const bytes = base64ToBytes(x.bytes);
    const cell = Cell.oneFromBoc(bytes);
    let n = readIntFromBitString(cell.bits, 3, 8);
    if (n > BigInt(127)) {
        n = n - BigInt(256);
    }
    const hashPart = readIntFromBitString(cell.bits, 3 + 8, 256);
    return new Address(n.toString(10) + ":" + hashPart.toString(16));
};

module.exports = {parseAddress};