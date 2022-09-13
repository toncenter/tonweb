
import { HttpProvider } from '../../http-provider/http-provider';
import { PaymentChannel } from './payment-channel';


export class Payments {

    constructor(public readonly provider: HttpProvider) {
    }


    public createChannel(options: PaymentChannel.Options) {
        return new PaymentChannel(this.provider, options);
    }

}
