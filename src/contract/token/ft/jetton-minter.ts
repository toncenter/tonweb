
import BN from 'bn.js';

import { Cell } from '../../../boc/cell';
import { HttpProvider } from '../../../providers/http-provider';
import { Address } from '../../../utils/Address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
import { createOffchainUriCell, parseAddress, parseOffchainUriCell } from '../nft/utils';


export interface JettonMinterOptions extends ContractOptions {
    wc?: 0;
    ownerAddress: Address;
    jettonContentUri: string;
    jettonWalletCodeHex: string;
}

export interface JettonMinterMethods extends ContractMethods {
}

export interface MintBodyParams {
    amount: BN;
    destination: Address;
    queryId?: number;
}

export interface JettonData {
    totalSupply: BN;
    isMutable: boolean;
    jettonContentUri: string;
    tokenWalletCode: Cell;
    ownerAddress?: Address;
}


const codeHex = (
    'B5EE9C724102070100012A000114FF00F4A413F4BCF2C80B0102016202030202CD0405001FA13C5BDA89A1F401F481A9A860FEAA4101A7D1968698180B8D848ADF07D201800E98FE99F98F6A2687D007D206A6A18400AA9305D47111AA8A8E382F97024817D007D2018298A7803D02099E428027D012C678B666664F6AA7040090B5D71812F834207F97840600AFF7C142180382A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064907C80383A6465816503E5FFE4E87C12C0073B400C646582A802678B4105312D007D0109E5B589E6658FE59F80FD0164B87D804009C03FA00FA4030F8282670542013541403C85004FA0258CF1601CF16CCC922C8CB0112F400F400CB00C9F9007074C8CB02CA07CBFFC9D05006C705F2E2C304A14313C85004FA0258CF16CCCCC9ED54C26789B8'
);


/**
 * ATTENTION: this is a DRAFT, there will be changes.
 */
export class JettonMinter extends Contract<
    JettonMinterOptions,
    JettonMinterMethods
> {

    constructor(
        provider: HttpProvider,
        options: JettonMinterOptions
    ) {

        options.wc = 0;

        options.code = (
            options.code ||
            Cell.oneFromBoc(codeHex)
        );

        super(provider, options);

    }


    public createMintBody(params: MintBodyParams): Cell {
        const body = new Cell();
        body.bits.writeUint(21, 32); // OP mint
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        body.bits.writeCoins(params.amount);
        body.bits.writeAddress(params.destination);
        return body;
    }

    public async getJettonData(): Promise<JettonData> {

        const myAddress = await this.getAddress();

        const result = await this.provider.call2(
            myAddress.toString(),
            'get_jetton_data'
        );

        return {
            totalSupply: result[0],
            isMutable: (result[1].toNumber() === -1),
            ownerAddress: parseAddress(result[2]),
            jettonContentUri: parseOffchainUriCell(result[3]),
            tokenWalletCode: result[4],
        };

    }


    /**
     * Returns cell that contains jetton minter data.
     */
    protected createDataCell(): Cell {
        const cell = new Cell();
        cell.bits.writeCoins(0); // total supply
        cell.bits.writeAddress(this.options.ownerAddress);
        cell.refs = [
            createOffchainUriCell(this.options.jettonContentUri),
            Cell.oneFromBoc(this.options.jettonWalletCodeHex),
        ];
        return cell;
    }

}
