
import { HttpProvider } from '../../http-provider/http-provider';
import { SimpleWalletContractR1 } from './simple/simple-wallet-contract-r1';
import { SimpleWalletContractR2 } from './simple/simple-wallet-contract-r2';
import { SimpleWalletContractR3 } from './simple/simple-wallet-contract-r3';
import { WalletV4ContractR1 } from './v4/wallet-v4-contract-r1';
import { WalletV4ContractR2 } from './v4/wallet-v4-contract-r2';
import { WalletV2ContractR1 } from './v2/wallet-v2-contract-r1';
import { WalletV2ContractR2 } from './v2/wallet-v2-contract-r2';
import { WalletV3ContractR1 } from './v3/wallet-v3-contract-r1';
import { WalletV3ContractR2 } from './v3/wallet-v3-contract-r2';


const ALL = {
    'simpleR1': SimpleWalletContractR1,
    'simpleR2': SimpleWalletContractR2,
    'simpleR3': SimpleWalletContractR3,
    'v2R1': WalletV2ContractR1,
    'v2R2': WalletV2ContractR2,
    'v3R1': WalletV3ContractR1,
    'v3R2': WalletV3ContractR2,
    'v4R1': WalletV4ContractR1,
    'v4R2': WalletV4ContractR2
};

const LIST = [
    SimpleWalletContractR1,
    SimpleWalletContractR2,
    SimpleWalletContractR3,
    WalletV2ContractR1,
    WalletV2ContractR2,
    WalletV3ContractR1,
    WalletV3ContractR2,
    WalletV4ContractR1,
    WalletV4ContractR2,
];

export class Wallets {

    public static all = ALL;
    public static list = LIST;

    public readonly all = ALL;
    public readonly list = LIST;
    public readonly defaultVersion = 'v3R1';
    public readonly default = ALL[this.defaultVersion];


    constructor(public readonly provider: HttpProvider) {
    }


    public create(options: any) {
        return new this.default(this.provider, options);
    }

}
