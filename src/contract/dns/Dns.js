const {parseAddress} = require("../token/nft/NftUtils");
const {Cell} = require("../../boc");
const {bytesToBase64} = require("../../utils");
const Address = require("../../utils/Address").default;

// ATTENTION: This is BETA, will be changed

const DNS_CATEGORY_ALL = 0;
const DNS_CATEGORY_ADNL_ADDRESS = 1;
const DNS_CATEGORY_WALLET_ADDRESS = 2;

// Need to get this address from network Config #4
const rootDnsAddress = '-1:EAC391A15AD065447024AE74D55EB5E61F8B7FCE48F68EEF5981B07ECC4C094A';

/**
 * @param cell  {Cell}
 * @return {Address|null}
 */
const parseAddressFromDns = (cell) => {
    // cell.bits.array = cell.bits.array.slice(2); // skip first 16 bits
    return parseAddress(cell);
}

/**
 * @private
 * @param provider  {HttpProvider}
 * @param dnsAddress   {string}
 * @param rawDomainBytes {Uint8Array}
 * @param category  {number}
 * @param noRecursive {boolean}
 * @returns {Promise<Cell|Address|null>}
 */
const dnsResolveImpl = async (provider, dnsAddress, rawDomainBytes, category, noRecursive) => {
    const len = rawDomainBytes.length * 8;
    // console.log('>', len)

    const domainCell = new Cell()
    domainCell.bits.writeBytes(rawDomainBytes)

    const result = await provider.call2(dnsAddress, 'dnsresolve', [['tvm.Slice', bytesToBase64(await domainCell.toBoc(false))], ['num', category]]);
    const resultLen = result[0].toNumber();
    const cell = result[1];
    // console.log('<', resultLen, cell);
    if (resultLen > len) {
        throw new Error('invalid response ' + resultLen + '/' + len);
    } else if (resultLen === len) {
        if (category === DNS_CATEGORY_WALLET_ADDRESS) {
            return parseAddressFromDns(cell);
        } else {
            return cell;
        }
    } else {
        if (cell === null) {
            return null; // domain cannot be resolved
        } else {
            const nextAddress = parseAddressFromDns(cell);
            // console.log('NEXT=', nextAddress.toString(true, true, true));
            if (noRecursive) {
                return nextAddress;
            } else {
                return await dnsResolveImpl(provider, nextAddress.toString(), rawDomainBytes.slice(0, resultLen / 8), category);
            }
        }
    }
}

/**
 * @param provider  {HttpProvider}
 * @param rootDnsAddress {string}
 * @param domain    {string} e.g "sub.alice.ton"
 * @param category  {number}
 * @param noRecursive {boolean}
 * @returns {Promise<Cell|Address|null>}
 */
const dnsResolve = async (provider, rootDnsAddress, domain, category, noRecursive) => {
    domain = domain.toLowerCase();

    for (let i = 0; i < domain.length; i++) {
        if (domain.charAt(i) <= 32) {
            throw new Error('Bytes in range 0..32 are not allowed in domain names');
        }
    }

    const arr = domain.split('.');

    arr.forEach(part => {
        if (!part.length) {
            throw new Error('Invalid domain');
        }
    });

    const rawDomain = arr.reverse().join('\0') + '\0';
    const rawDomainBytes = new TextEncoder().encode(rawDomain);
    // console.log('>', domain, rawDomainBytes)
    return dnsResolveImpl(provider, rootDnsAddress, rawDomainBytes, category, noRecursive);
}

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
        return new Address(rootDnsAddress);
    }

    /**
     * @param domain    {string} e.g "sub.alice.ton"
     * @param category  {number}
     * @returns {Promise<Cell|Address|null>}
     */
    resolve(domain, category) {
        return dnsResolve(this.provider, rootDnsAddress, domain, category)
    }
}

Dns.resolve = dnsResolve;
Dns.DNS_CATEGORY_ALL = DNS_CATEGORY_ALL;
Dns.DNS_CATEGORY_ADNL_ADDRESS = DNS_CATEGORY_ADNL_ADDRESS;
Dns.DNS_CATEGORY_WALLET_ADDRESS = DNS_CATEGORY_WALLET_ADDRESS;

module.exports.default = Dns;