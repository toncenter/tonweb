
export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder();

export function stringToBytes(text: string): Uint8Array {
    return textEncoder.encode(text);
}

export function bytesToString(bytes: Uint8Array): string {
    return textDecoder.decode(bytes);
}
