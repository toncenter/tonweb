
import BN from 'bn.js';

import { Cell } from '../../../boc/cell/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { Address } from '../../../utils/address';
import { bytesToBase64 } from '../../../utils/base64';
import { parseAddressFromCell } from '../../../utils/parsing';
import { expectBN, expectCell } from '../../../utils/type-guards';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
import { createOffchainUriCell, parseOffchainUriCell } from '../nft/utils';


export namespace JettonMinter {

    export interface Options extends ContractOptions {
        wc?: 0;
        adminAddress: Address;
        jettonContentUri: string;
        jettonWalletCodeHex: string;
    }

    export interface Methods extends ContractMethods {
    }

    export interface MintBodyParams {
        jettonAmount: BN;
        destination: Address;
        amount: BN;
        queryId?: number;
    }

    export interface JettonData {
        totalSupply: BN;
        isMutable: boolean;
        jettonContentUri: string;
        jettonWalletCode: Cell;
        adminAddress?: Address;
    }

    export interface ChangeAdminBodyParams {
        newAdminAddress: Address;
        queryId?: number;
    }

    export interface EditContentBodyParams {
        jettonContentUri: string;
        queryId?: number;
    }

}


const codeHex = (
    'B5EE9C7241020B010001ED000114FF00F4A413F4BCF2C80B0102016202030202CC040502037A60090A03EFD9910E38048ADF068698180B8D848ADF07D201800E98FE99FF6A2687D007D206A6A18400AA9385D47181A9AA8AAE382F9702480FD207D006A18106840306B90FD001812881A28217804502A906428027D012C678B666664F6AA7041083DEECBEF29385D71811A92E001F1811802600271812F82C207F97840607080093DFC142201B82A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064907C80383A6465816503E5FFE4E83BC00C646582AC678B28027D0109E5B589666664B8FD80400FE3603FA00FA40F82854120870542013541403C85004FA0258CF1601CF16CCC922C8CB0112F400F400CB00C9F9007074C8CB02CA07CBFFC9D05008C705F2E04A12A1035024C85004FA0258CF16CCCCC9ED5401FA403020D70B01C3008E1F8210D53276DB708010C8CB055003CF1622FA0212CB6ACB1FCB3FC98042FB00915BE200303515C705F2E049FA403059C85004FA0258CF16CCCCC9ED54002E5143C705F2E049D43001C85004FA0258CF16CCCCC9ED54007DADBCF6A2687D007D206A6A183618FC1400B82A1009AA0A01E428027D012C678B00E78B666491646580897A007A00658064FC80383A6465816503E5FFE4E840001FAF16F6A2687D007D206A6A183FAA904051007F09'
);


export class JettonMinter extends Contract<
    JettonMinter.Options,
    JettonMinter.Methods
> {

    constructor(
        provider: HttpProvider,
        options: JettonMinter.Options
    ) {

        options.wc = 0;

        options.code = (
            options.code ||
            Cell.oneFromBoc(codeHex)
        );

        super(provider, options);

    }


    public createMintBody(
        params: JettonMinter.MintBodyParams

    ): Cell {

        const {
            jettonAmount,
            destination,
            amount,
            queryId = 0,

        } = params;

        const body = new Cell();

        body.bits.writeUint(21, 32); // OP mint
        body.bits.writeUint(queryId, 64); // query_id
        body.bits.writeAddress(destination);
        body.bits.writeCoins(amount); // in Toncoins

        // Internal transfer
        const transferBody = new Cell();

        // internal_transfer op
        transferBody.bits.writeUint(0x178d4519, 32);

        transferBody.bits.writeUint(queryId, 64);
        transferBody.bits.writeCoins(jettonAmount);

        // from_address
        transferBody.bits.writeAddress(null);

        // response_address
        transferBody.bits.writeAddress(null);

        // forward_amount
        transferBody.bits.writeCoins(new BN(0));

        // forward_payload in this slice, not separate cell
        transferBody.bits.writeBit(false);

        body.refs[0] = transferBody;

        return body;

    }

    public createChangeAdminBody(
        params: JettonMinter.ChangeAdminBodyParams

    ): Cell {

        const {
            newAdminAddress,
            queryId = 0

        } = params;

        if (!newAdminAddress) {
            throw new Error(
                `Missing required option: "newAdminAddress"`
            );
        }

        const body = new Cell();

        // OP
        body.bits.writeUint(3, 32);

        // query_id
        body.bits.writeUint(queryId, 64);

        body.bits.writeAddress(params.newAdminAddress);

        return body;

    }

    public createEditContentBody(
        params: JettonMinter.EditContentBodyParams

    ): Cell {

        const {
            jettonContentUri,
            queryId = 0,

        } = params;

        const body = new Cell();

        // OP
        body.bits.writeUint(4, 32);

        // query_id
        body.bits.writeUint(queryId, 64);

        body.refs[0] = createOffchainUriCell(
            jettonContentUri
        );

        return body;

    }

    public async getJettonData(): (
        Promise<JettonMinter.JettonData>
    ) {

        const myAddress = await this.getAddress();

        const result = await this.provider.call2(
            myAddress.toString(),
            'get_jetton_data'
        );

        return {
            totalSupply: expectBN(result[0]),
            isMutable: (expectBN(result[1]).toNumber() === -1),
            adminAddress: parseAddressFromCell(result[2]),
            jettonContentUri: parseOffchainUriCell(
                expectCell(result[3])
            ),
            jettonWalletCode: expectCell(result[4]),
        };

    }

    public async getJettonWalletAddress(
        ownerAddress: Address

    ): Promise<Address> {

        const myAddress = await this.getAddress();

        // Serializing owner's address to a cell
        const cell = new Cell();
        cell.bits.writeAddress(ownerAddress);
        const bytes = await cell.toBoc(false);

        const result = await this.provider.call2(
            myAddress.toString(),
            'get_wallet_address',
            [['tvm.Slice', bytesToBase64(bytes)]],
        );

        return parseAddressFromCell(result);

    }


    /**
     * Returns cell that contains jetton minter data.
     */
    protected createDataCell(): Cell {
        const cell = new Cell();
        cell.bits.writeCoins(0); // total supply
        cell.bits.writeAddress(this.options.adminAddress);
        cell.refs = [
            createOffchainUriCell(this.options.jettonContentUri),
            Cell.oneFromBoc(this.options.jettonWalletCodeHex),
        ];
        return cell;
    }

}
