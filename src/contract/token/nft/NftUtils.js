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

const parseAddress = cell => {
    let n = readIntFromBitString(cell.bits, 3, 8);
    if (n > BigInt(127)) {
        n = n - BigInt(256);
    }
    const hashPart = readIntFromBitString(cell.bits, 3 + 8, 256);
    if (n.toString(10) + ":" + hashPart.toString(16) === '0:0') return null;
    const s = n.toString(10) + ":" + hashPart.toString(16).padStart(64, '0');
    return new Address(s);
};

module.exports = {parseAddress};