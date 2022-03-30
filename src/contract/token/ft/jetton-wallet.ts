
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
    tokenWalletCode: Cell;
}

export interface TransferBodyParams {
    queryId?: number;
    tokenAmount: BN;
    toAddress: Address;
    responseAddress: Address;
    forwardAmount: BN;
    forwardPayload: Uint8Array;
}

export interface BurnBodyParams {
    queryId?: number;
    tokenAmount: BN;
    responseAddress: Address;
}


const codeHex = (
    'B5EE9C72410216010002CB000114FF00F4A413F4BCF2C80B0102016202030202CC04050009A0F605E00D02012006070201480E0F02F7D00E8698180B8D84A1818F805F07D207D2018FD0018B8EB90FD0018FD001801698FC00729105D471918B6117803290B6382F9716081E99FFD001809D0400838400864658293678B10FD0165B5658F89E59FE4C0207D802001F803F04005A9105D4A98A099F804704006A9105D4A989998F804F04008895D71812F82408090201200A0B00084133F00A0008840FF2F000115FA443070BAF2E14D80201200C0D00173B51343E803E903E90350C20001F3214013E809633C58073C5B3327B55200201201011020120141501F700F4CFFE803E90087C017C01944DA8548AB1C17CB8B04A30BFFCB8B0950D109C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C032483E401C1D3232C0B281F2FFF274013E90087C017D010C7E801DE0063232C1540233C59C3E8085F2DAC4F320037232C7C672CFD401FE8088B3C59401A01201F33C018174CFFE80145468017E903E90151C965C150804D50500F214013E809633C58073C5B33248B232C044BD003D0032C0327E401C1D3232C0B281F2FFF274140271C17CB8B0C1FE80086497C138C360822625A01CBEC0A0041C20043232C15401F3C589BE8085B2DA8572C7C532CFF2604020BEC01000FC01E013005ECF1625FA025003CF16C95005CC07AA0013A08208989680AA008208989680A0A014BCF2E2C504C98040FB001023F007005A718018C8CB0528CF165003FA0212CB6A800CC8CB1F5250CB3F5004FA0225CF1658CF1601CF16C901CCC971FB0000A73C0181F4CFFE803E900C145468549271C17CB8B049F0BFFCB8B0A0822625A02A8005A805AF3CB8B0E004B232C7C572CFD400FE8088B3C58073C5B25C60043232C14933C59C3E80B2DAB33260103EC01004FC01E00047200835C87C018134C7E00354882EA00484EE84AC7CB8B174CFCC7E800C04E81408FC01E0387A65F0'
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
            tokenWalletCode: result[3],
        };

    }

    /**
     * @todo: should it be async?
     */
    public async createTransferBody(
        params: TransferBodyParams

    ): Promise<Cell> {

        const cell = new Cell();

        cell.bits.writeUint(11, 32); // request_transfer op
        cell.bits.writeUint((params.queryId || 0), 64);
        cell.bits.writeCoins(params.tokenAmount);
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

        cell.bits.writeUint(17, 32); // burn op
        cell.bits.writeUint((params.queryId || 0), 64);
        cell.bits.writeCoins(params.tokenAmount);
        cell.bits.writeAddress(params.responseAddress);

        return cell;

    }

}
