
import { WithType } from './shared';
import { Fees as NoNsFees } from './no-namespace';


export namespace Query {

    type WithNSType<T extends string> = WithType<`query.${T}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L156
     */
    export interface Fees extends WithNSType<'fees'> {
        source_fees: NoNsFees;
        destination_fees: NoNsFees;
    }

}
