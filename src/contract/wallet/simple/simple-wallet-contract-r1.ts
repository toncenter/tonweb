
import { Cell } from '../../../boc/cell/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { WalletContract, WalletContractOptions } from '../wallet-contract';


/**
 * Attention: no seqno get-method in this wallet.
 */
export class SimpleWalletContractR1 extends WalletContract {

    constructor(provider: HttpProvider, options: WalletContractOptions) {
        options.code = Cell.oneFromBoc(
            `B5EE9C72410101010044000084FF0020DDA4F260810200D71820D70B1FED44D0D31FD3FFD15112BAF2A122F901541044F910F2A2F80001D31F3120D74A96D307D402FB00DED1A4C8CB1FCBFFC9ED5441FDF089`
        );
        super(provider, options);
    }


    public getName(): string {
        return 'simpleR1';
    }

}
