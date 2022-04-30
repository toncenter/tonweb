
import BN from 'bn.js';

import { Cell } from '../../../boc/cell/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
import { parseAddress } from '../nft/utils';


export interface JettonWalletOptions extends ContractOptions {
    wc?: 0;
}

export interface JettonWalletMethods extends ContractMethods {
}

export interface WalletData {
    balance: BN;
    ownerAddress: Address;
    jettonMinterAddress: Address;
    jettonWalletCode: Cell;
}

export interface TransferBodyParams {
    queryId?: number;
    jettonAmount: BN;
    toAddress: Address;
    responseAddress: Address;
    forwardAmount: BN;
    forwardPayload: Uint8Array;
}

export interface BurnBodyParams {
    queryId?: number;
    jettonAmount: BN;
    responseAddress: Address;
}


const codeHex = (
    'B5EE9C7241021101000319000114FF00F4A413F4BCF2C80B0102016202030202CC0405001BA0F605DA89A1F401F481F481A8610201D40607020148080900BB0831C02497C138007434C0C05C6C2544D7C0FC02F83E903E900C7E800C5C75C87E800C7E800C00B4C7E08403E29FA954882EA54C4D167C0238208405E3514654882EA58C4CD00CFC02780D60841657C1EF2EA4D67C02B817C12103FCBC2000113E910C1C2EBCB853600201200A0B0201200F1001F500F4CFFE803E90087C007B51343E803E903E90350C144DA8548AB1C17CB8B04A30BFFCB8B0950D109C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C032483E401C1D3232C0B281F2FFF274013E903D010C7E801DE0063232C1540233C59C3E8085F2DAC4F3208405E351467232C7C6600C02F13B51343E803E903E90350C01F4CFFE80145468017E903E9014D6B1C1551CDB1C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C0327E401C1D3232C0B281F2FFF274140331C146EC7CB8B0C27E8020822625A020822625A02806A8486544124E17C138C34975C2C070C00930802C200D0E008ECB3F5007FA0222CF165006CF1625FA025003CF16C95005CC07AA0013A08208989680AA008208989680A0A014BCF2E2C504C98040FB001023C85004FA0258CF1601CF16CCC9ED54006C5219A018A182107362D09CC8CB1F5240CB3F5003FA0201CF165007CF16C9718018C8CB0525CF165007FA0216CB6A15CCC971FB00103400828E2A820898968072FB028210D53276DB708010C8CB055008CF165005FA0216CB6A13CB1F13CB3FC972FB0058926C33E25502C85004FA0258CF1601CF16CCC9ED5400DB3B51343E803E903E90350C01F4CFFE803E900C145468549271C17CB8B049F0BFFCB8B0A0822625A02A8005A805AF3CB8B0E0841EF765F7B232C7C572CFD400FE8088B3C58073C5B25C60043232C14933C59C3E80B2DAB33260103EC01004F214013E809633C58073C5B3327B55200083200835C87B51343E803E903E90350C0134C7E08405E3514654882EA0841EF765F784EE84AC7CB8B174CFCC7E800C04E81408F214013E809633C58073C5B3327B55204F664B79'
);


/**
 * ATTENTION: this is a DRAFT, there will be changes.
 */
export class JettonWallet extends Contract<
    JettonWalletOptions,
    JettonWalletMethods
> {

    public static codeHex = codeHex;


    constructor(
        provider: HttpProvider,
        options: JettonWalletOptions
    ) {

        options.wc = 0;

        options.code = (
            options.code ||
            Cell.oneFromBoc(codeHex)
        );

        super(provider, options);

    }


    public async getData(): Promise<WalletData> {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(
            myAddress.toString(),
            'get_wallet_data'
        );

        return {
            balance: result[0],
            ownerAddress: parseAddress(result[1]),
            jettonMinterAddress: parseAddress(result[2]),
            jettonWalletCode: result[3],
        };

    }

    /**
     * @todo: should it be async?
     */
    public async createTransferBody(
        params: TransferBodyParams

    ): Promise<Cell> {

        const cell = new Cell();

        cell.bits.writeUint(0xf8a7ea5, 32); // request_transfer op
        cell.bits.writeUint((params.queryId || 0), 64);
        cell.bits.writeCoins(params.jettonAmount);
        cell.bits.writeAddress(params.toAddress);
        cell.bits.writeAddress(params.responseAddress);
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(params.forwardAmount || new BN(0));

        // forward_payload in this slice, not separate cell
        cell.bits.writeBit(false);

        if (params.forwardPayload) {
            cell.bits.writeBytes(params.forwardPayload);
        }

        return cell;

    }

    /**
     * @todo: should it be async?
     */
    public async createBurnBody(
        params: BurnBodyParams

    ): Promise<Cell> {

        const cell = new Cell();

        cell.bits.writeUint(0x595f07bc, 32); // burn op
        cell.bits.writeUint((params.queryId || 0), 64);
        cell.bits.writeCoins(params.jettonAmount);
        cell.bits.writeAddress(params.responseAddress);

        return cell;

    }

}
