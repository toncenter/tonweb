const {Cell} = require("../../boc");
const {BN, Address} = require("../../utils");
const {
    DNS_CATEGORY_NEXT_RESOLVER,
    DNS_CATEGORY_SITE,
    DNS_CATEGORY_WALLET,
    createSmartContractAddressRecord,
    createAdnlAddressRecord,
    createNextResolverRecord,
    parseNextResolverRecord,
    parseSmartContractAddressRecord,
    dnsResolve
} = require("./DnsUtils");

// Need to get this address from network Config #4
const rootDnsAddress = 'Ef_BimcWrQ5pmAWfRqfeVHUCNV8XgsLqeAMBivKryXrghFW3';

class Dns {
    /**
     * @param provider  {HttpProvider}
     */
    constructor(provider) {
        this.provider = provider;
    }

    /**
     * @returns {Promise<Address>}
     */
    async getRootDnsAddress() {
        if (this.provider.host.indexOf('testnet') === -1) { // mainnet
            return null;
        }
        return new Address(rootDnsAddress);
    }

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @param category  {string | undefined} category of requested DNS record, null for all categories
     * @param oneStep {boolean | undefined}  non-recursive
     * @returns {Promise<Cell | Address | BN | null>}
     */
    resolve(domain, category, oneStep) {
        if (this.provider.host.indexOf('testnet') === -1) { // mainnet
            return null;
        }
        return dnsResolve(this.provider, rootDnsAddress, domain, category, oneStep)
    }

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @returns {Promise<Address | null>}
     */
    getWalletAddress(domain) {
        if (this.provider.host.indexOf('testnet') === -1) { // mainnet
            return null;
        }
       return this.resolve(domain, DNS_CATEGORY_WALLET);
    }
}

Dns.resolve = dnsResolve;
Dns.createSmartContractAddressRecord = createSmartContractAddressRecord;
Dns.createAdnlAddressRecord = createAdnlAddressRecord;
Dns.createNextResolverRecord = createNextResolverRecord;
Dns.parseNextResolverRecord = parseNextResolverRecord;
Dns.parseSmartContractAddressRecord = parseSmartContractAddressRecord;
Dns.DNS_CATEGORY_NEXT_RESOLVER = DNS_CATEGORY_NEXT_RESOLVER;
Dns.DNS_CATEGORY_WALLET = DNS_CATEGORY_WALLET;
Dns.DNS_CATEGORY_SITE = DNS_CATEGORY_SITE;

module.exports.default = Dns;