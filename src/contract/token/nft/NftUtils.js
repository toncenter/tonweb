const {Address, BN} = require('../../../utils');
const {Cell} = require('../../../boc');

const SNAKE_DATA_PREFIX = 0x00;
const CHUNK_DATA_PREFIX = 0x01;
const ONCHAIN_CONTENT_PREFIX = 0x00;
const OFFCHAIN_CONTENT_PREFIX = 0x01;

/**
 * @param uri   {string}
 * @returns {Uint8Array}
 */
const serializeUri = (uri) => {
    return new TextEncoder().encode(encodeURI(uri));
}

/**
 * @param bytes {Uint8Array}
 * @return {string}
 */
const parseUri = (bytes) => {
    return new TextDecoder().decode(bytes);
}

/**
 * @param uri {string}
 * @return {Cell}
 */
const createOffchainUriCell = (uri) => {
    const cell = new Cell();
    cell.bits.writeUint(OFFCHAIN_CONTENT_PREFIX, 8);
    cell.bits.writeBytes(serializeUri(uri));
    return cell;
}

/**
 * @param cell {Cell}
 * @returns {string}
 */
const parseOffchainUriCell = (cell) => {
    if (cell.bits.array[0] !== OFFCHAIN_CONTENT_PREFIX) {
        throw new Error('no OFFCHAIN_CONTENT_PREFIX');
    }

    let length = 0;
    let c = cell;
    while (c) {
        length += c.bits.array.length;
        c = c.refs[0];
    }

    const bytes = new Uint8Array(length);
    length = 0;
    c = cell;
    while (c) {
        bytes.set(c.bits.array, length)
        length += c.bits.array.length;
        c = c.refs[0];
    }
    return parseUri(bytes.slice(1)); // slice OFFCHAIN_CONTENT_PREFIX
}

/**
 * @param bs {BitString}
 * @param cursor {number}
 * @param bits {number}
 *
 * @return {BN}
 */
const readUintFromBitString = (bs, cursor, bits) => {

    if ((cursor + bits) > bs.getUsedBits()) {
        throw new Error(`Bit string offset is out of bounds`);
    }

    let n = new BN(0);
    for (let i = 0; i < bits; i++) {
        n.imuln(2);
        n.iaddn(bs.get(cursor + i) ? 1 : 0);
    }

    return n;

}

/**
 * @param cell  {Cell}
 * @return {Address|null}
 */
const parseAddress = cell => {

    const type = readUintFromBitString(cell.bits, 0, 2);

    // "none" address
    if (type.eqn(0b00)) {
        return null;
    }

    // internal standard address
    if (type.eqn(0b10)) {

        /**
         * addr_std$10
         *   anycast:(Maybe Anycast)
         *   workchain_id:int8
         *   address:bits256
         * = MsgAddressInt;
         */

        // @todo: implement readInt (signed) method instead
        let workchainId = readUintFromBitString(cell.bits, 3, 8);
        if (workchainId.gtn(127)) {
            workchainId.isubn(256);
        }

        const hashPart = readUintFromBitString(cell.bits, 3 + 8, 256);

        return new Address(
          workchainId.toString() + ':' +
          hashPart.toString(16).padStart(64, '0')
        );

    } else {
        throw new Error(
          `Unsupported address type: 0b${type.toString(2, 2)}`
        );

    }

};

/**
 * @param provider {HttpProvider}
 * @param address {string}
 * @return {Promise<{royalty: number, royaltyFactor: number, royaltyBase: number, royaltyAddress: Address}>}
 */
const getRoyaltyParams = async (provider, address) => {
    const result = await provider.call2(address, 'royalty_params');

    const royaltyFactor = result[0].toNumber();
    const royaltyBase = result[1].toNumber();
    const royalty = royaltyFactor / royaltyBase;
    const royaltyAddress = parseAddress(result[2]);

    return {royalty, royaltyBase, royaltyFactor, royaltyAddress};
}

module.exports = {
    SNAKE_DATA_PREFIX,
    CHUNK_DATA_PREFIX,
    ONCHAIN_CONTENT_PREFIX,
    OFFCHAIN_CONTENT_PREFIX,
    parseAddress,
    serializeUri,
    parseUri,
    createOffchainUriCell,
    parseOffchainUriCell,
    getRoyaltyParams
};
