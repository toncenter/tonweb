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
const testnetRootDnsAddress = 'Ef_v5x0Thgr6pq6ur2NvkWhIf4DxAxsL-Nk5rknT6n99oPKX';
const mainnetRootDnsAddress = 'Ef-OJd0IF0yc0xkhgaAirq12WawqnUoSuE9RYO3S7McG6lDh';

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
        if (this.provider.host.indexOf('testnet') > -1) {
            return new Address(testnetRootDnsAddress);
        }
        return new Address(mainnetRootDnsAddress);
    }

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @param category  {string | undefined} category of requested DNS record, null for all categories
     * @param oneStep {boolean | undefined}  non-recursive
     * @returns {Promise<Cell | Address | BN | null>}
     */
    async resolve(domain, category, oneStep) {
        const rootDnsAddress = await this.getRootDnsAddress();
        return dnsResolve(this.provider, rootDnsAddress.toString(), domain, category, oneStep)
    }

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @returns {Promise<Address | null>}
     */
    getWalletAddress(domain) {
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