import BN from 'bn.js';
import { Cell } from '../boc/cell';
import { HttpProvider } from '../providers/http-provider';
import { Address, AddressType } from '../utils/address';
export interface ContractOptions {
    code?: Cell;
    address?: AddressType;
    wc?: number;
}
export interface ContractMethods {
}
export interface Method {
    getQuery(): Promise<Cell>;
    send(): Promise<any>;
    estimateFee(): Promise<any>;
}
export interface StateInit {
    stateInit: Cell;
    address: Address;
    code: Cell;
    data: Cell;
}
/**
 * @todo: this type is created on indirect data
 *        and needs proper revision
 */
export interface Query {
    address: Address;
    message: Cell;
    code?: Cell;
    body: Cell;
    data?: Cell;
    signature?: Uint8Array;
    signingMessage?: Cell;
    stateInit?: Cell;
}
export declare class Contract<OptionsType extends ContractOptions = ContractOptions, MethodsType extends ContractMethods = ContractMethods> {
    readonly provider: HttpProvider;
    readonly options: OptionsType;
    static createStateInit(code: Cell, data: Cell, library?: undefined, splitDepth?: undefined, ticktock?: undefined): Cell;
    static createInternalMessageHeader(dest: AddressType, nanograms?: (number | BN), ihrDisabled?: boolean, bounce?: boolean, bounced?: boolean, src?: AddressType, currencyCollection?: undefined, ihrFees?: (number | BN), fwdFees?: (number | BN), createdLt?: (number | BN), createdAt?: (number | BN)): Cell;
    static createExternalMessageHeader(dest: AddressType, src?: AddressType, importFee?: (number | BN)): Cell;
    /**
     * Creates CommonMsgInfo cell that contains specified
     * header, stateInit and body.
     */
    static createCommonMsgInfo(header: Cell, stateInit?: Cell, body?: Cell): Cell;
    static createMethod(provider: HttpProvider, queryPromise: Promise<Query>): Method;
    address?: Address;
    methods: MethodsType;
    constructor(provider: HttpProvider, options?: OptionsType);
    getAddress(): Promise<Address>;
    createStateInit(): Promise<StateInit>;
    /**
     * Return cell that contains contract data.
     */
    protected createDataCell(): Cell;
    /**
     * Returns cell that contains contact code.
     */
    private createCodeCell;
}
