
import BN from "bn.js";
import nacl from "tweetnacl";
export { BN, nacl };

import Address from './Address';
export { Address };

const ethunit = require("ethjs-unit");

let myCrypto = null;

if (typeof document !== 'undefined') { // web
    // nothing to do
} else { // nodejs or react-native
    myCrypto = require('isomorphic-webcrypto');
}

export function sha256(bytes: Uint8Array): Promise<ArrayBuffer> {
    if (typeof document !== 'undefined') { // web
        return crypto.subtle.digest("SHA-256", bytes);
    } else {  // nodejs or react-native
        return myCrypto.subtle.digest({name:"SHA-256"}, bytes);
    }
}

/**
 * Converts the specified amount from coins to nanocoins.
 */
export function toNano(amount: (number | BN | string)): BN {
    return ethunit.toWei(amount, 'gwei');
}

/**
 * Converts the specified amount from nanocoins to coins.
 */
export function fromNano(amount: (number | BN | string)): string {
    return ethunit.fromWei(amount, 'gwei');
}

// look up tables
const to_hex_array = [];
const to_byte_map = {};
for (let ord = 0; ord <= 0xff; ord++) {
    let s = ord.toString(16);
    if (s.length < 2) {
        s = "0" + s;
    }
    to_hex_array.push(s);
    to_byte_map[s] = ord;
}

/**
 * Converts the specified bytes array to hex string
 * using lookup table.
 */
export function bytesToHex(buffer: Uint8Array): string {
    const hex_array = [];
    //(new Uint8Array(buffer)).forEach((v) => { hex_array.push(to_hex_array[v]) });
    for (let i = 0; i < buffer.byteLength; i++) {
        hex_array.push(to_hex_array[buffer[i]]);
    }
    return hex_array.join("");
}

/**
 * Converts the specified hex string to bytes array
 * using lookup table.
 */
export function hexToBytes(hex: string): Uint8Array {
    hex = hex.toLowerCase();
    const length2 = hex.length;
    if (length2 % 2 !== 0) {
        throw "hex string must have length a multiple of 2";
    }
    const length = length2 / 2;
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        const i2 = i * 2;
        const b = hex.substring(i2, i2 + 2);
        if (!to_byte_map.hasOwnProperty(b)) throw new Error('invalid hex character ' + b);
        result[i] = to_byte_map[b];
    }
    return result;
}

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

export function crc32c(bytes: Uint8Array): Uint8Array {
    //Version suitable for crc32-c of BOC
    const int_crc = _crc32c(0, bytes);
    const arr = new ArrayBuffer(4);
    const view = new DataView(arr);
    view.setUint32(0, int_crc, false);
    return new Uint8Array(arr).reverse();
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

export function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
    const c = new Uint8Array(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
}

export function compareBytes(a: Uint8Array, b: Uint8Array): boolean {
    // TODO Make it smarter
    return a.toString() === b.toString();
}

const base64abc = (() => {
    const abc = []
    const A = "A".charCodeAt(0);
    const a = "a".charCodeAt(0);
    const n = "0".charCodeAt(0);
    for (let i = 0; i < 26; ++i) {
        abc.push(String.fromCharCode(A + i));
    }
    for (let i = 0; i < 26; ++i) {
        abc.push(String.fromCharCode(a + i));
    }
    for (let i = 0; i < 10; ++i) {
        abc.push(String.fromCharCode(n + i));
    }
    abc.push("+");
    abc.push("/");
    return abc;
})();

export function bytesToBase64(bytes: Uint8Array): string {
    let result = "";
    let i;
    const l = bytes.length;
    for (i = 2; i < l; i += 3) {
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
        result += base64abc[bytes[i] & 0x3f];
    }
    if (i === l + 1) {
        // 1 octet missing
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[(bytes[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) {
        // 2 octets missing
        result += base64abc[bytes[i - 2] >> 2];
        result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
        result += base64abc[(bytes[i - 1] & 0x0f) << 2];
        result += "=";
    }
    return result;
}

export function base64toString(base64: string): string {
    if (typeof window === 'undefined') {
        return Buffer.from(base64, 'base64').toString('binary'); // todo: (tolya-yanot) Buffer silently ignore incorrect base64 symbols, we need to throw error
    } else {
        return atob(base64);
    }
}

export function stringToBase64(str: string): string {
    if (typeof window === 'undefined') {
        return Buffer.from(str, 'binary').toString('base64'); // todo: (tolya-yanot) Buffer silently ignore incorrect base64 symbols, we need to throw error
    } else {
        return btoa(str);
    }
}

export function base64ToBytes(base64: string): Uint8Array {
    const binary_string = base64toString(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
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
