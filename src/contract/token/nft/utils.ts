
import { BitString } from '../../../boc/bit-string';
import { Cell } from '../../../boc/cell';
import { textEncoder } from '../../../utils/text-encoding';
import { Address } from '../../../utils/address';


export const SNAKE_DATA_PREFIX = 0x00;
export const CHUNK_DATA_PREFIX = 0x01;
export const ONCHAIN_CONTENT_PREFIX = 0x00;
export const OFFCHAIN_CONTENT_PREFIX = 0x01;


export function serializeUri(uri: string): Uint8Array {
    return textEncoder.encode(encodeURI(uri));
}

export function parseUri(bytes: Uint8Array): string {
    return new TextDecoder().decode(bytes);
}

export function createOffchainUriCell(uri: string): Cell {
    const cell = new Cell();
    cell.bits.writeUint(OFFCHAIN_CONTENT_PREFIX, 8);
    cell.bits.writeBytes(serializeUri(uri));
    return cell;
}

export function parseOffchainUriCell(cell: Cell): string {
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

export function parseAddress(cell: Cell): (Address | undefined) {
    let n = readIntFromBitString(cell.bits, 3, 8);
    if (n > BigInt(127)) {
        n -= BigInt(256);
    }
    const hashPart = readIntFromBitString(cell.bits, 3 + 8, 256);
    if (n.toString(10) + ":" + hashPart.toString(16) === '0:0') {
        return undefined;
    }
    const address = n.toString(10) + ":" + hashPart.toString(16).padStart(64, '0');
    return new Address(address);
}


function readIntFromBitString(
    bitString: BitString,
    cursor: number,
    bits: number

): bigint {

    let n = BigInt(0);
    for (let i = 0; i < bits; i++) {
        n *= BigInt(2);
        n += BigInt(bitString.get(cursor + i));
    }
    return n;

}
