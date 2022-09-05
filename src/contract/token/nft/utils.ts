
import { Cell } from '../../../boc/cell/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { parseAddressFromCell } from '../../../utils/parsing';
import { bytesToString, stringToBytes } from '../../../utils/text-encoding';
import { Address } from '../../../utils/address';


export interface RoyaltyParams {
    royalty: number;
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
}


export const SNAKE_DATA_PREFIX = 0x00;
export const CHUNK_DATA_PREFIX = 0x01;
export const ONCHAIN_CONTENT_PREFIX = 0x00;
export const OFFCHAIN_CONTENT_PREFIX = 0x01;


export function serializeUri(uri: string): Uint8Array {
    return stringToBytes(encodeURI(uri));
}

export function parseUri(bytes: Uint8Array): string {
    return bytesToString(bytes);
}

export function createOffchainUriCell(uri: string): Cell {
    const cell = new Cell();
    cell.bits.writeUint(OFFCHAIN_CONTENT_PREFIX, 8);
    cell.bits.writeBytes(serializeUri(uri));
    return cell;
}

export function parseOffchainUriCell(cell: Cell): string {

    // Skipping the OFFCHAIN_CONTENT_PREFIX byte
    return (cell.parse()
        .skipBits(8)
        .loadSnakeDataString()
    );

}

export async function getRoyaltyParams(
    provider: HttpProvider,
    address: string

): Promise<RoyaltyParams> {

    const result = await provider.call2(
        address,
        'royalty_params'
    );

    const royaltyFactor = result[0].toNumber();
    const royaltyBase = result[1].toNumber();

    return {
        royalty: (royaltyFactor / royaltyBase),
        royaltyBase,
        royaltyFactor,
        royaltyAddress: parseAddressFromCell(result[2]),
    };

}
