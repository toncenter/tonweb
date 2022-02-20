export declare type AddressType = (Address | string);
export default class Address {
    static isValid(anyForm: AddressType): boolean;
    wc: number;
    hashPart: Uint8Array;
    isTestOnly: boolean;
    isUserFriendly: boolean;
    isBounceable: boolean;
    isUrlSafe: boolean;
    constructor(anyForm: AddressType);
    toString(isUserFriendly?: boolean, isUrlSafe?: boolean, isBounceable?: boolean, isTestOnly?: boolean): string;
}
