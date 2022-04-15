
import BN from 'bn.js';

import { Cell } from '../../../boc/cell';
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
    'B5EE9C72410211010002FA000114FF00F4A413F4BCF2C80B0102016202030202CC0405001BA0F605DA89A1F401F481F481A8610201D40607020148080900B70CC8B1C02497C0F83434C0C05C6C24D6FC02F83E903E900C7E800C5C75C87E800C7E800C00F4C7E08403E29FA954882EA54C5408FC0238208405E3514654882EA54C4CCC7C027820841657C1EF04AEA51408FC02B817C12103FCBC2000113E910C1C2EBCB853600201200A0B0201200F1001F500F4CFFE803E90087C007B51343E803E903E90350C144DA8548AB1C17CB8B04A30BFFCB8B0950D109C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C032483E401C1D3232C0B281F2FFF274013E903D010C7E801DE0063232C1540233C59C3E8085F2DAC4F3208405E351467232C7C6600C02F53B51343E803E903E90350C0174CFFE80145468017E903E9014D631C1551CDA9C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C0327E401C1D3232C0B281F2FFF2741402B1C1466C7CB8B0C1FE80086497C138C34935C2C070C0248C0CF8C35000F214013E809633C58073C5B3327B55200D0E008ECB3F5007FA0222CF165006CF1625FA025003CF16C95005CC07AA0013A08208989680AA008208989680A0A014BCF2E2C504C98040FB001023C85004FA0258CF1601CF16CCC9ED54005E8209B26D24C8CB1F5250CB3F5004FA0225CF1658CF1658CF16C9718018C8CB0526CF165003FA0212CB6ACCC971FB000052820898968072FB028210D53276DB708010C8CB055007CF1626FA0216CB6A15CB1F14CB3FC98042FB0000DB3B51343E803E903E90350C01F4CFFE803E900C145468549271C17CB8B049F0BFFCB8B0A0822625A02A8005A805AF3CB8B0E0841EF765F7B232C7C572CFD400FE8088B3C58073C5B25C60043232C14933C59C3E80B2DAB33260103EC01004F214013E809633C58073C5B3327B55200083200835C87B51343E803E903E90350C0134C7E08405E3514654882EA0841EF765F784EE84AC7CB8B174CFCC7E800C04E81408F214013E809633C58073C5B3327B55203451BEC5'
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
