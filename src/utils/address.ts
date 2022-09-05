
import { base64ToBytes, bytesToBase64 } from './base64';
import { bytesToHex, hexToBytes } from './hex';
import { Workchain, WorkchainId } from './workchain';
import { crc16 } from './common';


export type AddressType = (Address | string);

export type MaybeAddress = (Address | null);

export type MaybeAddressType = (AddressType | null);

interface ParsedAddress {
    workchain: number;
    hashPart: Uint8Array;
    isUrlSafe: boolean;
    isBounceable: boolean;
    isTestOnly: boolean;
}


enum Flags {
    Bounceable = 0x11,
    NonBounceable = 0x51,
    Test = 0x80,
}

/**
 * Chapter A.11.9. "Message and address manipulation primitives".
 * {@link https://ton-blockchain.github.io/docs/tvm.pdf}
 */
export const AddressTypes = {

    /**
     * addr_none$00 = MsgAddressExt;
     */
    None: 0b00,

    /**
     * addr_extern$01
     *   len:(## 8)
     *   external_address:(bits len)
     * = MsgAddressExt;
     */
    External: 0b01,

    /**
     * addr_std$10
     *   anycast:(Maybe Anycast)
     *   workchain_id:int8
     *   address:bits256
     * = MsgAddressInt;
     */
    InternalStandard: 0b10,

    /**
     * addr_var$11
     *   anycast:(Maybe Anycast)
     *   addr_len:(## 9)
     *   workchain_id:int32
     *   address:(bits addr_len)
     * = MsgAddressInt;
     */
    InternalVariable: 0b11,

} as const;


export class Address {

    public static isValid(anyForm: AddressType) {
        try {
            new Address(anyForm);
            return true;

        } catch (error) {
            return false;

        }

    }


    public wc: Workchain;
    public hashPart: Uint8Array;
    public isTestOnly: boolean;
    public isUserFriendly: boolean;
    public isBounceable: boolean;
    public isUrlSafe: boolean;


    constructor(address: AddressType) {

        if (!address) {
            throw new Error(
                `Empty address specified: it must be ` +
                `either Address instance or string`
            );
        }

        if (address instanceof Address) {
            this.initFromInstance(address);

        } else if (typeof address === 'string') {
            this.initFromString(address);

        } else {
            throw new Error(
                `Incorrect address format specified: ` +
                `it must be either Address instance or string`
            );

        }

    }


    public toString(
        isUserFriendly = this.isUserFriendly,
        isUrlSafe = this.isUrlSafe,
        isBounceable = this.isBounceable,
        isTestOnly = this.isTestOnly

    ): string {

        if (!isUserFriendly) {
            return this.wc + ':' + bytesToHex(this.hashPart);

        } else {
            let tag = (isBounceable
                ? Flags.Bounceable
                : Flags.NonBounceable
            );
            if (isTestOnly) {
                tag |= Flags.Test;
            }

            const address = new Int8Array(34);
            address[0] = tag;
            address[1] = this.wc;
            address.set(this.hashPart, 2);

            const addressWithChecksum = new Uint8Array(36);
            addressWithChecksum.set(address);
            addressWithChecksum.set(crc16(address), 34);

            let addressBase64 = bytesToBase64(addressWithChecksum);

            if (isUrlSafe) {
                addressBase64 = addressBase64
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                ;
            }

            return addressBase64;

        }

    }


    /**
     * Copies the address data from the specified Address
     * instance to this instance.
     */
    private initFromInstance(address: Address) {
        this.wc = address.wc;
        this.hashPart = address.hashPart;
        this.isUserFriendly = address.isUserFriendly;
        this.isUrlSafe = address.isUrlSafe;
        this.isBounceable = address.isBounceable;
        this.isTestOnly = address.isTestOnly;
    }

    private initFromString(addressStr: string) {

        if (addressStr.includes(':')) {

            // Non user-friendly address.
            // -----

            const parts = addressStr.split(':');
            if (parts.length !== 2) {
                throw new Error(
                    `Invalid address: ${addressStr}, ` +
                    `non-user-friendly address must contain ` +
                    `only a single colon`
                );
            }

            const workchain = parseInt(parts[0], 10);
            this.checkWorkchainOrThrow(workchain);

            const hex = parts[1];
            if (hex.length !== 64) {
                throw new Error(
                    `Invalid address HEX: ${addressStr}`
                );
            }

            this.isUserFriendly = false;
            this.wc = workchain;
            this.hashPart = hexToBytes(hex);
            this.isUrlSafe = false;
            this.isTestOnly = false;
            this.isBounceable = false;

        } else {

            // User-friendly address.
            // -----

            const parseResult = (
                this.parseFriendlyAddress(addressStr)
            );

            this.wc = parseResult.workchain;
            this.hashPart = parseResult.hashPart;

            this.isUserFriendly = true;
            this.isUrlSafe = parseResult.isUrlSafe;
            this.isBounceable = parseResult.isBounceable;
            this.isTestOnly = parseResult.isTestOnly;

        }

    }

    private parseFriendlyAddress(
        addressString: string

    ): ParsedAddress {

        // This check is important, because base64 decoding
        // process could ignore one extra character at the
        // end of string and the byte-length check below
        // won't be able to catch it.
        if (addressString.length !== 48) {
            throw new Error(
                `User-friendly address should contain ` +
                `strictly 48 characters`
            );
        }

        const isUrlSafe = (
            addressString.includes('-') ||
            addressString.includes('_')
        );

        if (isUrlSafe) {
            addressString = addressString
                .replace(/-/g, '+')
                .replace(/_/g, '\/')
            ;
        }

        const data = base64ToBytes(addressString);

        // SLICING BYTES
        //
        // •  1B — tag
        // •  1B — workchain
        // • 32B — hash
        // •  2B — CRC
        //
        // -----

        if (data.length !== 36) {
            throw new Error(
                `Incorrect address format: byte length must be ` +
                `equal to 36`
            );
        }

        const address = data.slice(0, 34);
        const hashPart = data.slice(2, 34);
        const crc = data.slice(34, 36);

        // CRC verification
        const checkCrc = crc16(address);
        if (
            checkCrc[0] !== crc[0] ||
            checkCrc[1] !== crc[1]
        ) {
            throw new Error('Wrong CRC-16 checksum');
        }

        // Tag
        let tag = address[0];
        let isTestOnly = false;
        if (tag & Flags.Test) {
            isTestOnly = true;
            tag = (tag ^ Flags.Test);
        }
        if (
            (tag !== Flags.Bounceable) &&
            (tag !== Flags.NonBounceable)
        ) {
            throw new Error('Unknown address tag');
        }

        // Workchain
        // @todo we should read signed integer here
        const workchain = (address[1] === 0xff ? -1 : address[1]);
        this.checkWorkchainOrThrow(workchain);

        return {
            workchain,
            hashPart,
            isUrlSafe,
            isBounceable: (tag === Flags.Bounceable),
            isTestOnly,
        };

    }

    private checkWorkchainOrThrow(workchain: Workchain) {
        if (
            workchain !== WorkchainId.Master &&
            workchain !== WorkchainId.Basic
        ) {
            throw new Error(
                `Invalid address workchain: ${workchain}, ` +
                `it must be either -1 or 0`
            );
        }
    }

}
