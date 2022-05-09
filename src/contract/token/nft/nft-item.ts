
import BN from 'bn.js';

import { Cell } from '../../../boc/cell/cell';
import { HttpProvider } from '../../../http-provider/http-provider';
import { Address } from '../../../utils/address';
import { Contract, ContractMethods, ContractOptions } from '../../contract';
import { parseAddress } from './utils';


export interface NftItemOptions extends ContractOptions {
    index?: number;
    collectionAddress?: Address;
}

export interface NftItemMethods extends ContractMethods {
    getData: () => Promise<NftItemData>;
}

export interface NftItemData {
    isInitialized: boolean;
    index: number;
    collectionAddress: Address;
    contentCell: Cell;
    ownerAddress?: Address;
}

export interface CreateTransferBodyParams {
    newOwnerAddress: Address;
    responseAddress: Address;
    queryId?: number;
    forwardAmount?: BN;
    forwardPayload?: Uint8Array;
}

export interface CreateGetStaticDataBodyParams {
    queryId?: number;
}


/**
 * Contract source code:
 * ${link https://github.com/ton-blockchain/token-contract/blob/1ad314a98d20b41241d5329e1786fc894ad811de/nft/nft-item.fc}
 */
const NFT_ITEM_CODE_HEX = (
    'B5EE9C7241020D010001D0000114FF00F4A413F4BCF2C80B0102016202030202CE04050009A11F9FE00502012006070201200B0C02D70C8871C02497C0F83434C0C05C6C2497C0F83E903E900C7E800C5C75C87E800C7E800C3C00812CE3850C1B088D148CB1C17CB865407E90350C0408FC00F801B4C7F4CFE08417F30F45148C2EA3A1CC840DD78C9004F80C0D0D0D4D60840BF2C9A884AEB8C097C12103FCBC20080900113E910C1C2EBCB8536001F65135C705F2E191FA4021F001FA40D20031FA00820AFAF0801BA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E192218E3E821005138D91C85009CF16500BCF16712449145446A0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00104794102A375BE20A00727082108B77173505C8CBFF5004CF1610248040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB000082028E3526F0018210D53276DB103744006D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0093303234E25502F003003B3B513434CFFE900835D27080269FC07E90350C04090408F80C1C165B5B60001D00F232CFD633C58073C5B3327B5520BF75041B'
);


export class NftItem extends Contract<
    NftItemOptions,
    NftItemMethods
> {

    public static codeHex = NFT_ITEM_CODE_HEX;


    constructor(provider: HttpProvider, options: NftItemOptions) {
        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc(NFT_ITEM_CODE_HEX);
        super(provider, options);

        this.methods.getData = () => this.getData();
    }


    public async getData(): Promise<NftItemData> {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_nft_data');

        const isInitialized = result[0].toNumber() === -1;
        const index = result[1].toNumber();
        const collectionAddress = parseAddress(result[2]);
        const ownerAddress = isInitialized ? parseAddress(result[3]) : null;

        const contentCell = result[4];

        return {
            isInitialized,
            index,
            collectionAddress,
            ownerAddress,
            contentCell,
        };

    }

    public async createTransferBody(
        params: CreateTransferBodyParams

    ): Promise<Cell> {

        const cell = new Cell();
        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
        cell.bits.writeUint(params.queryId || 0, 64);
        cell.bits.writeAddress(params.newOwnerAddress);
        cell.bits.writeAddress(params.responseAddress);
        cell.bits.writeBit(false); // null custom_payload
        cell.bits.writeCoins(params.forwardAmount || new BN(0));
        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell

        if (params.forwardPayload) {
            cell.bits.writeBytes(params.forwardPayload);
        }
        return cell;
    }

    public createGetStaticDataBody(
        params: CreateGetStaticDataBodyParams

    ): Cell {

        const body = new Cell();
        body.bits.writeUint(0x2fcb26a2, 32); // OP
        body.bits.writeUint(params.queryId || 0, 64); // query_id
        return body;
    }


    /**
     * Returns cell that contains NFT data.
     */
    protected createDataCell(): Cell {
        const cell = new Cell();
        cell.bits.writeUint(this.options.index, 64);
        cell.bits.writeAddress(this.options.collectionAddress);
        return cell;
    }

}
