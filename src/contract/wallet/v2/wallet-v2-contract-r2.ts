
import { Cell } from '../../../boc/cell/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { ContractOptions } from '../../contract';
import { WalletV2ContractBase } from './wallet-v2-contract-base';


export class WalletV2ContractR2 extends WalletV2ContractBase {

    constructor(provider: HttpProvider, options: ContractOptions) {
        options.code = Cell.oneFromBoc(
            'B5EE9C724101010100630000C2FF0020DD2082014C97BA218201339CBAB19C71B0ED44D0D31FD70BFFE304E0A4F2608308D71820D31FD31F01F823BBF263ED44D0D31FD3FFD15131BAF2A103F901541042F910F2A2F800029320D74A96D307D402FB00E8D1A4C8CB1FCBFFC9ED54044CD7A1'
        );
        super(provider, options);
    }


    public getName(): string {
        return 'v2R2';
    }

}
