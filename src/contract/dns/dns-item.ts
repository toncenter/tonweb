
import BN from 'bn.js';

import { Cell, MaybeCell } from '../../boc/cell/cell';
import { HttpProvider } from '../../http-provider/http-provider';
import { Address, MaybeAddress, MaybeAddressType } from '../../utils/address';
import { parseAddressFromCell } from '../../utils/parsing';
import { bytesToString } from '../../utils/text-encoding';
import { expectBN, expectCell } from '../../utils/type-guards';
import { Contract, ContractMethods, ContractOptions } from '../contract';
import { DnsCategory } from './categories';
import { categoryToBN, dnsResolve, DnsResolveResponse } from './utils';


const CODE_HEX = (
    'B5EE9C7241022C010006F8000114FF00F4A413F4BCF2C80B0102016202030202CC0405020120232402012006070201481F2002014808090201201B1C03F7007434C0C05C6C2497C1383E903E900C7E800C5C75C87E800C7E800C3C0249ECF8C094D671C1462C238CC426D7C2FE900C1C14C01B60101C20043232C15401F3C594017E808572DA84B2C7F2CFC89BACE51633C5C0644CB88072407EC0380A71C0245C254274C7D42AB8887C01FE08C86F09300038C08C4374CFC9600A0B0C00113E910C1C2EBCB8536002FC5F056C22355242C705F2E19501FA40D4306D21D08B42E746F6E8F00682F082A3537FF0DBCE7EEC35D69EDC3A189EE6F17D82F353A553F9AA96CB0BE3CE89588307F4168BA544F4E20446F6D61696E86DF00682F0C9046F7A37AD0EA7CEE73355984FA5428982F8B37C8F7BCEC91F7AC71A7CD104588307F4168922D0F0060D0E013C343A3A3B8E1636363737375135C705F2E196102510241023F823F00AE30E0F03FC6EB31FB08E5A343652DDA1820AFAF0805210A15260BC9835820AFAF08015A1923004E220C2FF8E2F77706D722951454434708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00DE0C6D0DA150CC0B04923E5BE2F82328A18209E14320BC226EB0E30282105FCC3D145210BAE302101112003A68747470733A2F2F646E732E746F6E2E6F72672F69636F6E2E706E672300C682F06105D6CC76AF400325E94D588CE511BE5BFDBB73B437DC51ECA43917D7A43E3D588307F41670C8CB07F400C981012C8050F833206EB38E14D0F4043070018307F40E6FA19431D31F309130E29130E2F82301A0F0054466F00810351034F823F00A00F0302680698064A98452A0BCF2E197820AFAF08052B0A15270BC9836820AFAF0801AA1933A0905E220C2FF8E2C70206D21105B708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00923036E27A23F823A1A120C2009313A0029130E24464F00810451024F823F00A00305B6C55F005F82381012CA04470F0081045103412F823F00A0128305383C705F2E191105A104910381027103655021303FE82102FCB26A25210BA8E3F5F0535365B7082108B77173505C8CBFF5003CF164440138040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00E082101A0B9D515210BA8E193032353537375135C705F2E19A03D4304015045033F823F00AE020C00AE3023A09C00BE3025F0B840F14151603F63603FA4021F001FA40D20031FA00820AFAF0801EA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E192218E3E821005138D91C8500CCF16500ECF1671244C145449D0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00107A94102D3A5BE202E30F105618191A0086303739395155C705F2E19B05D3FF20D74AC20009D0D30701C000F2E19CF404300999D430D040188307F416983050078307F45B30E270C8CB07F400C91045034444F00A01DA8050F833D0F4043052508307F40E6FA18ED7D30721C0008E932510BD107A09105810471046105C4313504C1D96303B5F036C61E201C0018E2D7053006D8100A0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB009130E2925F0CE2170004F2F003F83603FA4021F001FA40D20031FA00820AFAF0801EA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E192218E3E821005138D91C8500CCF16500ECF1671244C145449D0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00107A94102D3A5BE202E30F10560118191A006A29F0018210D53276DB103A47046D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00000A10293335300010104510344033F00A000D570C8CB01C9D080201201D1E00531C3232C1C8B3C5885BACE385C0B5D24875D2682040FDEEE4B3C5A5F20073C5B2407338A49B0878B274200021081BA50C1B5C0838343E903E8034CFCC200201202122002B406C8CBFF5005CF165003CF16CCCCF400CB3FC9ED5480017321400F3C5807E80B2CFF26000513B513434FFFE900835D2708027DFC07E9035353D0134CFCC0415C415B80C1C1B5B5B5B490415C415A0020120252602012027280013BBB39F009175F07F0078000DBA559F0096C718000DB8FCFF0095F038020120292A0013B64A5E012204EBE0FA1001FBB461843AE9240F152118001E5C08DE012206EBE0FA1A60E038001E5C339E8086047AE140E68078001E5C33B80111C344180012660F003C003060FE81CDF432CF190B19E2D93C060F0DBC06105E033E04883DCB11FB64DDC4964AD1BA06B879240DC23572F37CC5CAAAB143A2FFE03060FE81CDF432CF190B19E2D93C06102B0004786DA9E7FD01'
);


/**
 * Implementation of the DNS item smart contract.
 *
 * Smart contract source code:
 * {@link https://github.com/ton-blockchain/dns-contract/blob/main/func/nft-item.fc | nft-item.fc}
 */
export namespace DnsItem {

    export interface Options extends ContractOptions {
        index: BN;
        collectionAddress: Address;
        address?: MaybeAddressType;
        code?: Cell;
    }

    export interface Methods extends ContractMethods {

        getData: () => Promise<Data>;

        getDomain: () => Promise<string>;

        getAuctionInfo: () => Promise<AuctionInfo>;

        getLastFillUpTime: () => Promise<number>;

        resolve(
            domain: string,
            category?: DnsCategory,
            oneStep?: boolean

        ): Promise<DnsResolveResponse>;

    }

    export interface AuctionInfo {
        maxBidAddress: MaybeAddress;
        maxBidAmount: BN;
        auctionEndTime: number;
    }

    export interface Data {
        isInitialized: boolean;
        index: BN;
        collectionAddress: MaybeAddress;
        ownerAddress: MaybeAddress;
        contentCell: Cell;
    }

    export interface TransferBodyParams {
        queryId?: number;
        newOwnerAddress: Address;
        forwardAmount?: BN;
        forwardPayload?: Uint8Array;
        responseAddress: Address;
    }

}


export class DnsItem extends Contract<
    DnsItem.Options,
    DnsItem.Methods
> {

    /**
     * BOC of the DNS item smart contract's source code
     * in HEX format.
     *
     * Contract's source code:
     * {@link https://github.com/ton-blockchain/dns-contract/blob/main/func/nft-item.fc | nft-item.fc}
     */
    public static codeHex = CODE_HEX;


    public static async createChangeContentEntryBody(params: {
        category: DnsCategory;
        value?: MaybeCell;
        queryId?: number;

    }): Promise<Cell> {

        const {
            category,
            value,
            queryId = 0,

        } = params;

        const body = new Cell();

        // Operation ID
        body.bits.writeUint(10, 32);

        body.bits.writeUint(queryId, 64);

        body.bits.writeUint(
            await categoryToBN(category),
            256
        );

        if (value) {
            body.refs.push(value);
        }

        return body;

    }


    constructor(
        provider: HttpProvider,
        options: DnsItem.Options
    ) {

        options.wc = 0;
        options.code = options.code || Cell.oneFromBoc(DnsItem.codeHex);

        super(provider, options);

        this.methods.getData = this.getData.bind(this);
        this.methods.getDomain = this.getDomain.bind(this);
        this.methods.getAuctionInfo = this.getAuctionInfo.bind(this);
        this.methods.getLastFillUpTime = this.getLastFillUpTime.bind(this);
        this.methods.resolve = this.resolve.bind(this);

    }


    /**
     * Gets data of the DNS (NFT) item.
     */
    public async getData(): Promise<DnsItem.Data> {

        const address = await this.getAddress();

        const result = await this.provider.call2(
            address.toString(),
            'get_nft_data'
        );

        const isInitialized = (expectBN(result[0])
            .eqn(-1)
        );

        return {
            isInitialized,
            index: expectBN(result[1]),
            collectionAddress: parseAddressFromCell(result[2]),
            ownerAddress: (isInitialized
                ? parseAddressFromCell(result[3])
                : null
            ),
            contentCell: expectCell(result[4]),
        };

    }

    public async createTransferBody(
        params: DnsItem.TransferBodyParams

    ): Promise<Cell> {

        const {
            queryId = 0,
            newOwnerAddress,
            forwardAmount = new BN(0),
            forwardPayload,
            responseAddress,

        } = params;

        const cell = new Cell();

        // Operation ID
        cell.bits.writeUint(0x5fcc3d14, 32);

        cell.bits.writeUint(queryId, 64);
        cell.bits.writeAddress(newOwnerAddress);
        cell.bits.writeAddress(responseAddress);

        // Null custom_payload
        cell.bits.writeBit(false);

        cell.bits.writeCoins(forwardAmount);

        // Flag indicating that `forward_payload` is in
        // this slice, not in a separate cell.
        cell.bits.writeBit(false);

        if (forwardPayload) {
            cell.bits.writeBytes(forwardPayload);
        }

        return cell;

    }

    public createGetStaticDataBody(params: {
        queryId?: number;

    }): Cell {

        const { queryId = 0 } = params;

        const body = new Cell();

        // Operation ID
        body.bits.writeUint(0x2fcb26a2, 32);

        // Query ID
        body.bits.writeUint(queryId, 64);

        return body;

    }

    /**
     * Returns domain name of this DNS item.
     */
    public async getDomain(): Promise<string> {

        const address = await this.getAddress();

        const result = await this.provider.call2(
            address.toString(),
            'get_domain'
        );

        const cell = expectCell(result);

        return cell.parse().loadString();

    }

    /**
     * Returns auction information of this DNS item.
     */
    public async getAuctionInfo(): (
        Promise<DnsItem.AuctionInfo>
    ) {

        const address = await this.getAddress();

        const result = await this.provider.call2(
            address.toString(),
            'get_auction_info'
        );

        return {
            maxBidAddress: parseAddressFromCell(result[0]),
            maxBidAmount: expectBN(result[1]),
            auctionEndTime: expectBN(result[2]).toNumber(),
        };

    }

    /**
     * Returns last fill-up time.
     */
    public async getLastFillUpTime(): Promise<number> {

        const address = await this.getAddress();

        const result = await this.provider.call2(
            address.toString(),
            'get_last_fill_up_time'
        );

        return expectBN(result).toNumber();

    }

    /**
     * Makes a call to "dnsresolve" get method of this smart
     * contract to resolve the specified domain name
     * and category. Makes recursive calls if `oneStep` flag
     * is not set.
     *
     * @param domain - Domain name.
     * @param category - DNS resolution category.
     * @param oneStep - Whether to not resolve recursively.
     */
    public async resolve(
        domain: string,
        category?: DnsCategory,
        oneStep?: boolean

    ): Promise<DnsResolveResponse> {

        const address = await this.getAddress();

        return dnsResolve(
            this.provider,
            address.toString(),
            domain,
            category,
            oneStep
        );

    }


    /**
     * @override
     *
     * @returns Cell containing DNS (NFT) item's data.
     */
    protected createDataCell() {
        const cell = new Cell();
        cell.bits.writeUint(this.options.index, 256);
        cell.bits.writeAddress(this.options.collectionAddress);
        return cell;
    }

}
