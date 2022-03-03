
const {
    crc16,
    hexToBytes,
    bytesToHex,
    stringToBytes,
    base64toString,
    stringToBase64,

} = require("./index");


export type AddressType = (Address | string);

interface ParsedAddress {
    isTestOnly: boolean;
    workchain: number;
    hashPart: Uint8Array;
    isBounceable: boolean;
}


const bounceable_tag = 0x11;
const non_bounceable_tag = 0x51;
const test_flag = 0x80;


/**
 * @private
 */
function parseFriendlyAddress(addressString: string): ParsedAddress {
    const data = stringToBytes(base64toString(addressString));
    if (data.length !== 36) { // 1byte tag + 1byte workchain + 32 bytes hash + 2 byte crc
        throw "Unknown address type: byte length is not equal to 36";
    }
    const addr = data.slice(0, 34);
    const crc = data.slice(34, 36);
    const calcedCrc = crc16(addr);
    if (!(calcedCrc[0] === crc[0] && calcedCrc[1] === crc[1])) {
        throw "Wrong crc16 hashsum";
    }
    let tag = addr[0];
    let isTestOnly = false;
    let isBounceable = false;
    if (tag & test_flag) {
        isTestOnly = true;
        tag = tag ^ test_flag;
    }
    if ((tag !== bounceable_tag) && (tag !== non_bounceable_tag))
        throw "Unknown address tag";

    isBounceable = tag === bounceable_tag;

    let workchain = null;
    if (addr[1] === 0xff) { // TODO we should read signed integer here
        workchain = -1;
    } else {
        workchain = addr[1];
    }
    if (workchain !== 0 && workchain !== -1) throw new Error('Invalid address wc ' + workchain);

    const hashPart = addr.slice(2, 34);
    return {isTestOnly, isBounceable, workchain, hashPart};
}

export class Address {

    public static isValid(anyForm: AddressType) {
        try {
            new Address(anyForm);
            return true;
        } catch (e) {
            return false;
        }
    }

    public wc: number;
    public hashPart: Uint8Array;
    public isTestOnly: boolean;
    public isUserFriendly: boolean;
    public isBounceable: boolean;
    public isUrlSafe: boolean;


    /**
     * @param anyForm {string | Address}
     */
    constructor(anyForm: AddressType) {

        if (anyForm == null) {
            throw "Invalid address";
        }

        if (anyForm instanceof Address) {
            this.wc = anyForm.wc;
            this.hashPart = anyForm.hashPart;
            this.isTestOnly = anyForm.isTestOnly;
            this.isUserFriendly = anyForm.isUserFriendly;
            this.isBounceable = anyForm.isBounceable;
            this.isUrlSafe = anyForm.isUrlSafe;
            return;
        }

        if (anyForm.search(/\-/) > 0 || anyForm.search(/_/) > 0) {
            this.isUrlSafe = true;
            anyForm = anyForm.replace(/\-/g, '+').replace(/_/g, '\/');
        } else {
            this.isUrlSafe = false;
        }
        if (anyForm.indexOf(':') > -1) {
            const arr = anyForm.split(':');
            if (arr.length !== 2) throw new Error('Invalid address ' + anyForm);
            const wc = parseInt(arr[0]);
            if (wc !== 0 && wc !== -1) throw new Error('Invalid address wc ' + anyForm);
            const hex = arr[1];
            if (hex.length !== 64) throw new Error('Invalid address hex ' + anyForm);
            this.isUserFriendly = false;
            this.wc = wc;
            this.hashPart = hexToBytes(hex);
            this.isTestOnly = false;
            this.isBounceable = false;
        } else {
            this.isUserFriendly = true;
            const parseResult = parseFriendlyAddress(anyForm);
            this.wc = parseResult.workchain;
            this.hashPart = parseResult.hashPart;
            this.isTestOnly = parseResult.isTestOnly;
            this.isBounceable = parseResult.isBounceable;
        }
    }

    public toString(
        isUserFriendly?: boolean,
        isUrlSafe?: boolean,
        isBounceable?: boolean,
        isTestOnly?: boolean

    ): string {

        if (isUserFriendly === undefined) {
            isUserFriendly = this.isUserFriendly;
        }
        if (isUrlSafe === undefined) {
            isUrlSafe = this.isUrlSafe;
        }
        if (isBounceable === undefined) {
            isBounceable = this.isBounceable;
        }
        if (isTestOnly === undefined) {
            isTestOnly = this.isTestOnly;
        }

        if (!isUserFriendly) {
            return this.wc + ":" + bytesToHex(this.hashPart);
        } else {
            let tag = isBounceable ? bounceable_tag : non_bounceable_tag;
            if (isTestOnly) {
                tag |= test_flag;
            }

            const address = new Int8Array(34);
            address[0] = tag;
            address[1] = this.wc;
            address.set(this.hashPart, 2);

            const addressWithChecksum = new Uint8Array(36);
            addressWithChecksum.set(address);
            addressWithChecksum.set(crc16(address), 34);
            let addressBase64 = stringToBase64(
                // @todo: why use apply()?
                String.fromCharCode.apply(null, new Uint8Array(addressWithChecksum))
            );

            if (isUrlSafe) {
                addressBase64 = addressBase64.replace(/\+/g, '-').replace(/\//g, '_');
            }

            return addressBase64;
        }

    }

}
