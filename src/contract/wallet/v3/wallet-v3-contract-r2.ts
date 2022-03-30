
import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { WalletV3ContractBase, WalletV3ContractOptions } from './wallet-v3-contract-base';


export class WalletV3ContractR2 extends WalletV3ContractBase {

    constructor(provider: HttpProvider, options: WalletV3ContractOptions) {
        options.code = Cell.oneFromBoc(
            'B5EE9C724101010100710000DEFF0020DD2082014C97BA218201339CBAB19F71B0ED44D0D31FD31F31D70BFFE304E0A4F2608308D71820D31FD31FD31FF82313BBF263ED44D0D31FD31FD3FFD15132BAF2A15144BAF2A204F901541055F910F2A3F8009320D74A96D307D402FB00E8D101A4C8CB1FCB1FCBFFC9ED5410BD6DAD'
        );
        super(provider, options);
        if (!this.options.walletId) {
            this.options.walletId = 698983191 + this.options.wc
        }
    }


    public getName(): string {
        return 'v3R2';
    }

}
