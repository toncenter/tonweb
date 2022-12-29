const {Cell} = require("../../boc");
const {Address, bytesToHex} = require("../../utils");
const {
    DNS_CATEGORY_NEXT_RESOLVER,
    DNS_CATEGORY_SITE,
    DNS_CATEGORY_WALLET,
    DNS_CATEGORY_STORAGE,
    createSmartContractAddressRecord,
    createAdnlAddressRecord,
    createStorageBagIdRecord,
    createNextResolverRecord,
    parseSmartContractAddressRecord,
    parseAdnlAddressRecord,
    parseStorageBagIdRecord,
    parseSiteRecord,
    parseNextResolverRecord,
    dnsResolve
} = require("./DnsUtils");

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
        const cell = await this.provider.getConfigParam(4);
        const byteArray = cell.bits.array;
        if (byteArray.length !== 256 / 8) throw new Error('Invalid ConfigParam 4 length ' + byteArray.length);
        const hex = bytesToHex(byteArray);
        return new Address('-1:' + hex);
    }

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @param category  {string | undefined} category of requested DNS record, null for all categories
     * @param oneStep {boolean | undefined}  non-recursive
     * @returns {Promise<Cell | Address | AdnlAddress | StorageBagId | null>}
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

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @returns {Promise<AdnlAddress | StorageBagId | null>}
     */
    getSiteAddress(domain) {
        return this.resolve(domain, DNS_CATEGORY_SITE);
    }
}

Dns.resolve = dnsResolve;
Dns.createSmartContractAddressRecord = createSmartContractAddressRecord;
Dns.createAdnlAddressRecord = createAdnlAddressRecord;
Dns.createStorageBagIdRecord = createStorageBagIdRecord;
Dns.createNextResolverRecord = createNextResolverRecord;
Dns.parseNextResolverRecord = parseNextResolverRecord;
Dns.parseAdnlAddressRecord = parseAdnlAddressRecord;
Dns.parseStorageBagIdRecord = parseStorageBagIdRecord;
Dns.parseSiteRecord = parseSiteRecord;
Dns.parseSmartContractAddressRecord = parseSmartContractAddressRecord;
Dns.DNS_CATEGORY_NEXT_RESOLVER = DNS_CATEGORY_NEXT_RESOLVER;
Dns.DNS_CATEGORY_WALLET = DNS_CATEGORY_WALLET;
Dns.DNS_CATEGORY_SITE = DNS_CATEGORY_SITE;
Dns.DNS_CATEGORY_STORAGE = DNS_CATEGORY_STORAGE;

module.exports.default = Dns;