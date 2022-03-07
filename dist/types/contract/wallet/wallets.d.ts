import { HttpProvider } from '../../providers/http-provider';
import { SimpleWalletContractR1 } from './simple/simple-wallet-contract-r1';
import { SimpleWalletContractR2 } from './simple/simple-wallet-contract-r2';
import { SimpleWalletContractR3 } from './simple/simple-wallet-contract-r3';
import { WalletV4ContractR1 } from './v4/wallet-v4-contract-r1';
import { WalletV4ContractR2 } from './v4/wallet-v4-contract-r2';
import { WalletV2ContractR1 } from './v2/wallet-v2-contract-r1';
import { WalletV2ContractR2 } from './v2/wallet-v2-contract-r2';
import { WalletV3ContractR1 } from './v3/wallet-v3-contract-r1';
import { WalletV3ContractR2 } from './v3/wallet-v3-contract-r2';
export declare class Wallets {
    readonly provider: HttpProvider;
    static all: {
        simpleR1: typeof SimpleWalletContractR1;
        simpleR2: typeof SimpleWalletContractR2;
        simpleR3: typeof SimpleWalletContractR3;
        v2R1: typeof WalletV2ContractR1;
        v2R2: typeof WalletV2ContractR2;
        v3R1: typeof WalletV3ContractR1;
        v3R2: typeof WalletV3ContractR2;
        v4R1: typeof WalletV4ContractR1;
        v4R2: typeof WalletV4ContractR2;
    };
    static list: (typeof SimpleWalletContractR1 | typeof WalletV4ContractR1)[];
    readonly all: {
        simpleR1: typeof SimpleWalletContractR1;
        simpleR2: typeof SimpleWalletContractR2;
        simpleR3: typeof SimpleWalletContractR3;
        v2R1: typeof WalletV2ContractR1;
        v2R2: typeof WalletV2ContractR2;
        v3R1: typeof WalletV3ContractR1;
        v3R2: typeof WalletV3ContractR2;
        v4R1: typeof WalletV4ContractR1;
        v4R2: typeof WalletV4ContractR2;
    };
    readonly list: (typeof SimpleWalletContractR1 | typeof WalletV4ContractR1)[];
    readonly defaultVersion = "v3R1";
    readonly default: typeof WalletV3ContractR1;
    constructor(provider: HttpProvider);
    create(options: any): WalletV3ContractR1;
}
