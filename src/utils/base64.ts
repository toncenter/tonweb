
import { bytesToString, stringToBytes } from './text-encoding';


/**
 * Non-URL safe with optional padding.
 * Taken from the JOI library sources.
 */
const validationRegex = (
    /^(?:[A-Za-z0-9+\/]{2}[A-Za-z0-9+\/]{2})*(?:[A-Za-z0-9+\/]{2}(==)?|[A-Za-z0-9+\/]{3}=?)?$/
);

/* istanbul ignore next */
const hasNodeBuffer = (typeof Buffer !== 'undefined' && Buffer?.from);

export function bytesToBase64(bytes: Uint8Array): string {

    /* istanbul ignore else */
    if (hasNodeBuffer) {
        const proto = <any> Buffer.prototype;

        /* istanbul ignore else */
        if (proto.base64Slice) {
            // Using internal function, which performs much faster
            return proto.base64Slice
                .call(bytes, 0, bytes.length)
            ;
        } else {
            // Using safe, but slower approach as a fallback
            return Buffer.from(bytes)
                .toString('base64')
            ;
        }

    } else {
        // Browser
        return btoa(
            String.fromCharCode(...bytes)
        );
    }

}

export function base64ToBytes(base64: string): Uint8Array {

    // [RFC 4648]:
    // Implementations MUST reject the encoded data if it
    // contains characters outside the base alphabet when
    // interpreting base-encoded data.
    validateBase64orThrow(base64);

    /* istanbul ignore else */
    if (hasNodeBuffer) {
        // 1.6 times faster than browser implementation
        return new Uint8Array(
            Buffer.from(base64, 'base64')
        );

    } else {
        // Browser
        const binaryString = atob(base64);
        const length = binaryString.length;
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

}

export function isValidBase64(base64string: string) {
    return validationRegex.test(base64string);
}


/**
 * @deprecated this function is no longer used by the library
 *             and will be removed in the future
 */
export function base64toString(base64: string): string {
    return bytesToString(
        base64ToBytes(base64)
    );
}

/**
 * @deprecated this function is no longer used by the library
 *             and will be removed in the future
 */
export function stringToBase64(text: string): string {
    return bytesToBase64(
        stringToBytes(text)
    );
}


function validateBase64orThrow(base64string: string) {
    if (!isValidBase64(base64string)) {
        throw new Error(`Incorrect Base64 string`);
    }
}
