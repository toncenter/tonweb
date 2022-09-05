
import BN from 'bn.js';

import { Cell } from '../../boc/cell/cell';
import { HttpProvider } from '../../http-provider/http-provider';
import { Address, AddressType } from '../../utils/address';
import { parseAddressFromCell } from '../../utils/parsing';
import { expectCell } from '../../utils/type-guards';
import { Contract, ContractMethods, ContractOptions } from '../contract';
import { parseOffchainUriCell } from '../token/nft/utils';
import { DnsCategory } from './categories';
import { DnsItem } from './dns-item';
import { dnsResolve, DnsResolveResponse } from './utils';


/**
 * Implementation of the DNS collection smart contract.
 *
 * Contract source code:
 * {@link https://github.com/ton-blockchain/dns-contract/blob/main/func/nft-collection.fc | nft-collection.fc}
 */
export namespace DnsCollection {

    export interface Options extends ContractOptions {
        collectionContent: Cell;
        dnsItemCodeHex: string;
        address?: AddressType;
        code?: Cell;
    }

    export interface Methods extends ContractMethods {

        getCollectionData(): Promise<CollectionData>;

        getNftItemAddressByIndex(): Promise<Address>;

        getNftItemContent(): Promise<DnsItem.Data>;

        resolve(
            domain: string,
            category?: DnsCategory,
            oneStep?: boolean

        ): Promise<DnsResolveResponse>;

    }

    export interface CollectionData {
        collectionContentUri: string;
        collectionContent: Cell;
        ownerAddress: null;
        nextItemIndex: 0;
    }

}

/**
 * Contract's source code:
 * {@link https://github.com/ton-blockchain/dns-contract/blob/main/func/nft-collection.fc | nft-collection.fc}
 */
const CODE_HEX = (
    'B5EE9C724102170100020E000114FF00F4A413F4BCF2C80B0102016202030202CC0405020120111202012006070201D40F1002012008090201200D0E01F543221C70094840FF2F0DED0D3030171B0915BE0FA403001D31FED44D0D4D4303122C0008E5032F00320D74920C218F2E0C8208103F0BBF2E0C978A908C000F2E0CA20F004F2E0CB20F9018050F833206EB38E10D0F4043052108307F40E6FA131F2D0CC9130E2C858CF16C9C85004CF1613CCC9F009E010235F0380A0201200B0C000EC007DC840FF2F000331C27C074C1C07000082CE500A98200B784B98C4830003CB43260004F3223880875D244B5C61673C58875D2883000082CE6C070007CB83280B50C3400A44C78B98C727420007F47021D7498E355CBA20B38E2E3002D30721C02D23C200B024A6F85240B9B022C22F23C13AB0B122C26003C17B13B012B1B320B39402A60802DE13DEE66C12BA8002D501C8CBFFF828CF16C97020C8CB0113F400F400CB00C98001B3E401D3232C084B281F2FFF274200039167C01DC087C021DE0063232C15633C59C3E80B2DAF3333260103EC020020120131402012015160007B8B5D318001FBA7A3ED44D0D4D43031F0077001F00880019B905BED44D0D4D4303070016D8009DBA30C3020D74978A908C000F2E04620D70A07C00021D749C0085210B0935B786DE0209501D3073101DE21F0025122D71830F9018200BA93C8CB0F01820167A3ED43D8CF16C90191789170E212A0018467EBCAB'
);


/**
 * DNS collection contract that is based on NFT collection.
 *
 * @todo extend NftCollection?
 */
export class DnsCollection extends Contract<
    DnsCollection.Options,
    DnsCollection.Methods
> {

    constructor(
        provider: HttpProvider,
        options: DnsCollection.Options
    ) {
        options.wc = 0;
        options.code = (options.code || Cell.oneFromBoc(CODE_HEX));
        super(provider, options);

        if (!options.collectionContent && !options.address) {
            throw new Error(
                'Missing required collection content cell'
            );
        }

        this.methods.getCollectionData = (
            this.getCollectionData.bind(this)
        );

        this.methods.getNftItemAddressByIndex = (
            this.getNftItemAddressByIndex.bind(this)
        );

        this.methods.getNftItemContent = (
            this.getNftItemContent.bind(this)
        );

        this.methods.resolve = (
            this.resolve.bind(this)
        );

    }


    /**
     * Returns DNS collection's data.
     */
    public async getCollectionData(): (
        Promise<DnsCollection.CollectionData>
    ) {
        const address = await this.getAddress();

        const result = await this.provider.call2(
            address.toString(),
            'get_collection_data'
        );

        const collectionContent = expectCell(result[1]);

        const collectionContentUri = (
            parseOffchainUriCell(collectionContent)
        );

        return {
            collectionContentUri,
            collectionContent,
            ownerAddress: null,
            nextItemIndex: 0,
        };

    }

    public getNftItemContent(nftItem: DnsItem): (
        Promise<DnsItem.Data>
    ) {
        return nftItem.getData();
    }

    /**
     * Returns DNS (NFT) item address by the specified index.
     *
     * @param index - Index of the DNS (NFT) item.
     */
    public async getNftItemAddressByIndex(index: BN): (
        Promise<Address>
    ) {

        const myAddress = await this.getAddress();

        // @todo: type request & response

        const result = await this.provider.call2(
            myAddress.toString(),
            'get_nft_address_by_index', [
                ['num', index.toString()],
            ]
        );

        return parseAddressFromCell(result);

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
     * @returns Cell containing DNS collection's data.
     */
    protected createDataCell(): Cell {
        const cell = new Cell();
        cell.refs.push(
            this.options.collectionContent,
            Cell.oneFromBoc(
                this.options.dnsItemCodeHex
            )
        );
        return cell;
    }

}
