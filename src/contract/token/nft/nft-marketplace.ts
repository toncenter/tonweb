
import { Cell } from '../../../boc/cell/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';


export namespace NftMarketplace {

    export interface Options extends ContractOptions {
        ownerAddress?: Address;
        cell?: Cell;
    }

    export interface Methods extends ContractMethods {
    }

}


const HEX_CODE = (
    'B5EE9C7241010401006D000114FF00F4A413F4BCF2C80B01020120020300AAD23221C700915BE0D0D3030171B0915BE0FA40ED44D0FA403012C705F2E19101D31F01C0018E2BFA003001D4D43021F90070C8CA07CBFFC9D077748018C8CB05CB0258CF165004FA0213CB6BCCCCC971FB00915BE20004F2308EF7CCE7'
);


/**
 * Work in progress, will be changed.
 */
export class NftMarketplace extends Contract<
    NftMarketplace.Options,
    NftMarketplace.Methods
> {

    constructor(
        provider: HttpProvider,
        options: NftMarketplace.Options
    ) {
        options.wc = 0;

        options.code = (options.code || Cell.oneFromBoc(HEX_CODE));

        super(provider, options);

    }


    /**
     * Returns cell that contains NFT marketplace data.
     */
    protected createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(this.options.ownerAddress);
        return cell;
    }

}
