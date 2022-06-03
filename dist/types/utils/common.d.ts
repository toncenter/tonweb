import BN from 'bn.js';
export declare function sha256(bytes: Uint8Array): Promise<ArrayBuffer>;
/**
 * Converts the specified amount from coins to nanocoins.
 */
export declare function toNano(amount: (BN | string)): BN;
/**
 * Converts the specified amount from nanocoins to coins.
 */
export declare function fromNano(amount: (BN | string)): string;
/**
 * Converts the specified bytes array to hex string
 * using lookup table.
 */
export declare function bytesToHex(buffer: Uint8Array): string;
/**
 * Converts the specified hex string to bytes array
 * using lookup table.
 */
export declare function hexToBytes(hex: string): Uint8Array;
export declare function stringToBytes(str: string, size?: number): Uint8Array;
export declare function crc32c(bytes: Uint8Array): Uint8Array;
export declare function crc16(data: ArrayLike<number>): Uint8Array;
export declare function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array;
export declare function compareBytes(a: Uint8Array, b: Uint8Array): boolean;
export declare function bytesToBase64(bytes: Uint8Array): string;
export declare function base64toString(base64: string): string;
export declare function stringToBase64(str: string): string;
export declare function base64ToBytes(base64: string): Uint8Array;
export declare function readNBytesUIntFromArray(n: number, ui8array: Uint8Array): number;
