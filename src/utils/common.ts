
import BN from 'bn.js';
import ethUnit from 'ethjs-unit';


const isCryptoAvailable = (
    typeof self !== 'undefined' &&
    Boolean(self.crypto?.subtle)
);

let myCrypto = null;

if (isCryptoAvailable) { // web
    // nothing to do
} else { // nodejs or react-native
    myCrypto = require('isomorphic-webcrypto');
}


export function sha256(bytes: Uint8Array): Promise<ArrayBuffer> {
    if (isCryptoAvailable) { // web
        return crypto.subtle.digest('SHA-256', bytes);
    } else {  // nodejs or react-native
        return myCrypto.subtle.digest({name:'SHA-256'}, bytes);
    }
}

/**
 * Converts the specified amount from coins to nanocoins.
 */
export function toNano(amount: (BN | string)): BN {
    if (BN.isBN(amount) || typeof amount === 'string') {
        return ethUnit.toWei(amount, 'gwei');
    } else {
        throw new Error(
            `Please pass numbers as strings or BN objects ` +
            `to avoid precision errors`
        );
    }
}

/**
 * Converts the specified amount from nanocoins to coins.
 */
export function fromNano(amount: (BN | string)): string {
    if (BN.isBN(amount) || typeof amount === 'string') {
        return ethUnit.fromWei(amount, 'gwei');
    } else {
        throw new Error(
            `Please pass numbers as strings or BN objects ` +
            `to avoid precision errors`
        );
    }
}

/**
 * @deprecated: this function is no longer used in the library
 *              and will be deleted in the future.
 */
export function stringToBytes(str: string, size = 1): Uint8Array {
    let buf;
    let bufView;
    if (size === 1) {
        buf = new ArrayBuffer(str.length);
        bufView = new Uint8Array(buf);
    }
    if (size === 2) {
        buf = new ArrayBuffer(str.length * 2);
        bufView = new Uint16Array(buf);
    }
    if (size === 4) {
        buf = new ArrayBuffer(str.length * 4);
        bufView = new Uint32Array(buf);
    }
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return new Uint8Array(bufView.buffer);
}


export function crc32c(bytes: Uint8Array): Uint8Array {
    //Version suitable for crc32-c of BOC
    const int_crc = _crc32c(0, bytes);
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, int_crc, false);
    return new Uint8Array(arr).reverse();
}

/**
 * @private
 * @param crc {number}
 * @param bytes {Uint8Array}
 * @return {number}
 */
function _crc32c(crc, bytes) {
    const POLY = 0x82f63b78;

    crc ^= 0xffffffff;
    for (let n = 0; n < bytes.length; n++) {
        crc ^= bytes[n];
        crc = crc & 1 ? (crc >>> 1) ^ POLY : crc >>> 1;
        crc = crc & 1 ? (crc >>> 1) ^ POLY : crc >>> 1;
        crc = crc & 1 ? (crc >>> 1) ^ POLY : crc >>> 1;
        crc = crc & 1 ? (crc >>> 1) ^ POLY : crc >>> 1;
        crc = crc & 1 ? (crc >>> 1) ^ POLY : crc >>> 1;
        crc = crc & 1 ? (crc >>> 1) ^ POLY : crc >>> 1;
        crc = crc & 1 ? (crc >>> 1) ^ POLY : crc >>> 1;
        crc = crc & 1 ? (crc >>> 1) ^ POLY : crc >>> 1;
    }
    return crc ^ 0xffffffff;
}

export function crc16(data: ArrayLike<number>): Uint8Array {
    const poly = 0x1021;
    let reg = 0;
    const message = new Uint8Array(data.length + 2);
    message.set(data);
    for (let byte of message) {
        let mask = 0x80;
        while (mask > 0) {
            reg <<= 1;
            if (byte & mask) {
                reg += 1;
            }
            mask >>= 1
            if (reg > 0xffff) {
                reg &= 0xffff;
                reg ^= poly;
            }
        }
    }
    return new Uint8Array([Math.floor(reg / 256), reg % 256]);
}

/**
 * Concatenates two byte arrays together.
 */
export function concatBytes(
    bytes1: Uint8Array,
    bytes2: Uint8Array

): Uint8Array {

    const bytes = new Uint8Array(
        bytes1.length +
        bytes2.length
    );

    bytes.set(bytes1);
    bytes.set(bytes2, bytes1.length);

    return bytes;

}

export function compareBytes(a: Uint8Array, b: Uint8Array): boolean {
    // TODO Make it smarter
    return a.toString() === b.toString();
}

export function readNBytesUIntFromArray(
  n: number,
  ui8array: Uint8Array

): number {

    let res = 0;
    for (let c = 0; c < n; c++) {
        res *= 256;
        res += ui8array[c];
    }
    return res;

}
