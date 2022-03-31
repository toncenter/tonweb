
import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { ContractOptions } from '../../contract';
import { WalletContract } from '../wallet-contract';


export class SimpleWalletContractR2 extends WalletContract {

    constructor(provider: HttpProvider, options: ContractOptions) {
        options.code = Cell.oneFromBoc(
            `B5EE9C724101010100530000A2FF0020DD2082014C97BA9730ED44D0D70B1FE0A4F260810200D71820D70B1FED44D0D31FD3FFD15112BAF2A122F901541044F910F2A2F80001D31F3120D74A96D307D402FB00DED1A4C8CB1FCBFFC9ED54D0E2786F`
        );
        super(provider, options);
    }


    public getName(): string {
        return 'simpleR2';
    }

}
