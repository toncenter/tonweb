import BN from 'bn.js';
import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { AddressType } from '../../../utils/address';
import { Method } from '../../contract';
import { ExternalMessage } from '../wallet-contract';
import { WalletV4ContractBase, WalletV4ContractMethods, WalletV4ContractOptions } from './wallet-v4-contract-base';
export interface WalletV4ContractR2Methods extends WalletV4ContractMethods {
    deployAndInstallPlugin: (params: DeployAndInstallPluginParams) => Method;
    installPlugin: (params: SetPluginParams) => Method;
    removePlugin: (params: SetPluginParams) => Method;
    getWalletId: () => Promise<number>;
    isPluginInstalled: (pluginAddress: AddressType) => Promise<boolean>;
    getPluginsList: () => Promise<string[]>;
}
export interface DeployAndInstallPluginParams {
    secretKey: Uint8Array;
    seqno: number;
    pluginWc: number;
    amount: BN;
    stateInit: Cell;
    body: Cell;
    expireAt?: number;
}
export interface SetPluginParams {
    secretKey: Uint8Array;
    seqno: number;
    pluginAddress: AddressType;
    amount?: BN;
    queryId?: number;
    expireAt?: number;
}
export declare class WalletV4ContractR2 extends WalletV4ContractBase<WalletV4ContractOptions, WalletV4ContractR2Methods> {
    constructor(provider: HttpProvider, options: WalletV4ContractOptions);
    getName(): string;
    deployAndInstallPlugin(params: DeployAndInstallPluginParams): Promise<ExternalMessage>;
    installPlugin(params: SetPluginParams): Promise<ExternalMessage>;
    removePlugin(params: SetPluginParams): Promise<ExternalMessage>;
    getWalletId(): Promise<number>;
    isPluginInstalled(pluginAddress: AddressType): Promise<boolean>;
    /**
     * Returns plugins addresses.
     */
    getPluginsList(): Promise<string[]>;
    private setPlugin;
}
