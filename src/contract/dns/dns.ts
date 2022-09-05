
import type { DnsResolveResponse } from './utils';
import type { HttpProvider } from '../../http-provider/http-provider';
import type { DnsCategory } from './categories';

import { Address } from '../../utils/address';
import { DnsCategories } from './categories';

import {
    createAdnlAddressRecord,
    createNextResolverRecord,
    createSmartContractAddressRecord,
    dnsResolve,
    parseNextResolverRecord,
    parseSmartContractAddressRecord,

} from './utils';


// @todo get this address from network Config #4
const rootDnsAddress = 'Ef_BimcWrQ5pmAWfRqfeVHUCNV8XgsLqeAMBivKryXrghFW3';


export class Dns {

    public static resolve = dnsResolve;

    public static createSmartContractAddressRecord = (
        createSmartContractAddressRecord
    );

    public static createAdnlAddressRecord = (
        createAdnlAddressRecord
    );

    public static createNextResolverRecord = (
        createNextResolverRecord
    );

    public static parseNextResolverRecord = (
        parseNextResolverRecord
    );

    public static parseSmartContractAddressRecord = (
        parseSmartContractAddressRecord
    );

    public static DNS_CATEGORY_NEXT_RESOLVER = (
        DnsCategories.NextResolver
    );

    public static DNS_CATEGORY_WALLET = (
        DnsCategories.Wallet
    );

    public static DNS_CATEGORY_SITE = (
        DnsCategories.Site
    );


    constructor(private readonly provider: HttpProvider) {
    }


    /**
     * Returns address of the root DNS smart contract
     * based on the network used.
     */
    public async getRootDnsAddress(): Promise<Address> {

        // @todo: this check will work only for public
        //        toncenter servers and will not work
        //        for private ones!

        return (this.provider.host.includes('testnet')
            ? new Address(rootDnsAddress)
            : null
        );

    }

    /**
     * Makes a call to "dnsresolve" get method of the root
     * smart contract to resolve the specified domain name
     * and category. Makes recursive calls if `oneStep`
     * flag is not set.
     *
     * @param domain - e.g. "sub.alice.ton".
     * @param category - category of requested DNS record,
     *                   omit for all categories.
     * @param oneStep - Whether to not resole recursively.
     */
    public resolve(
        domain: string,
        category?: DnsCategory,
        oneStep = false

    ): Promise<DnsResolveResponse> {

        if (!this.provider.host.includes('testnet')) {
            return null;
        }

        return dnsResolve(
            this.provider,
            rootDnsAddress,
            domain,
            category,
            oneStep
        );

    }

    /**
     * Returns wallet address for the specified domain name.
     *
     * @param domain - e.g. "sub.alice.ton".
     */
    public async getWalletAddress(
        domain: string

    ): Promise<Address | null> {

        if (!this.provider.host.includes('testnet')) {
            return null;
        }

        const address = await this.resolve(
            domain,
            DnsCategories.Wallet
        );

        if (!address) {
            return null;
        }

        if (address instanceof Address) {
            return address;

        } else {
            throw new Error(`Incorrect address format`);

        }

    }

}
