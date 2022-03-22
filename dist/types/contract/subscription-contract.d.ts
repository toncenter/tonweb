import BN from 'bn.js';
import { Cell } from '../boc/cell';
import { HttpProvider } from '../providers/http-provider';
import { Address } from '../utils/address';
import { Contract, ContractMethods, ContractOptions, Method } from './contract';
export interface SubscriptionContractOptions extends ContractOptions {
    wallet?: Address;
    beneficiary?: Address;
    amount?: BN;
    period?: number;
    timeout?: number;
    startAt?: number;
    subscriptionId?: number;
}
export interface SubscriptionContractMethods extends ContractMethods {
    pay: () => Method;
    getSubscriptionData: () => Promise<SubscriptionData>;
}
export interface PayExternalMessage {
    address: Address;
    message: Cell;
    body: Cell;
    signature?: Uint8Array;
    cell?: Cell;
    resultMessage?: Cell;
}
export interface SubscriptionData {
    wallet: string;
    beneficiary: string;
    amount: BN;
    period: number;
    startAt: number;
    timeout: number;
    lastPayment: number;
    lastRequest: number;
    failedAttempts: number;
    subscriptionId: number;
}
export declare class SubscriptionContract extends Contract<SubscriptionContractOptions, SubscriptionContractMethods> {
    constructor(provider: HttpProvider, options: SubscriptionContractOptions);
    /**
     * Creates payment body (from wallet to subscription).
     */
    createBody(): Cell;
    /**
     * Destroys plugin body (from wallet to subscription OR
     * from beneficiary to subscription).
     */
    createSelfDestructBody(): Cell;
    getSubscriptionData(): Promise<SubscriptionData>;
    protected createDataCell(): Cell;
    protected createPayExternalMessage(): Promise<PayExternalMessage>;
}
