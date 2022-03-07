
import { HttpProvider } from '../../../providers/http-provider';
import { Contract, ContractMethods, ContractOptions } from '../../contract';


export interface JettonMinterOptions extends ContractOptions {
}

export interface JettonMinterMethods extends ContractMethods {
}


export class JettonMinter extends Contract<
    JettonMinterOptions,
    JettonMinterMethods
> {

    constructor(
        provider: HttpProvider,
        options: JettonMinterOptions
    ) {
        super(provider, options);
        // @todo: implement this
    }

}
