import { Workchain } from './workchain';
export declare type AddressType = (Address | string);
export declare class Address {
    static isValid(anyForm: AddressType): boolean;
    wc: Workchain;
    hashPart: Uint8Array;
    isTestOnly: boolean;
    isUserFriendly: boolean;
    isBounceable: boolean;
    isUrlSafe: boolean;
    constructor(address: AddressType);
    toString(isUserFriendly?: boolean, isUrlSafe?: boolean, isBounceable?: boolean, isTestOnly?: boolean): string;
    /**
     * Copies the address data from the specified Address
     * instance to this instance.
     */
    private initFromInstance;
    private initFromString;
    private parseFriendlyAddress;
    private checkWorkchainOrThrow;
}
