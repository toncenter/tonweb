
import BN from 'bn.js';

import { Cell } from '../../boc/cell/cell';
import { HttpProvider } from '../../http-provider/http-provider';
import { Address } from '../../utils/address';
import { bytesToBase64 } from '../../utils/base64';
import { sha256 } from '../../utils/common';
import { bytesToHex } from '../../utils/hex';
import { stringToBytes } from '../../utils/text-encoding';
import { expectBN, expectCell } from '../../utils/type-guards';
import { DnsCategories, DnsCategory } from './categories';


export type DnsResolveResponse = (Cell | Address | null);


// @todo: rename to createAddressRecord()
export function createSmartContractAddressRecord(
    address: Address

): Cell {

    // @url https://github.com/ton-blockchain/ton/blob/7e3df93ca2ab336716a230fceb1726d81bac0a06/crypto/block/block.tlb#L827
    //
    // dns_smc_address#9fd3
    //   smc_addr:MsgAddressInt
    //   flags:(## 8) { flags <= 1 }
    //   cap_list:flags . 0?SmcCapList
    // = DNSRecord;
    //

    const cell = new Cell();

    cell.bits.writeUint(0x9fd3, 16);
    cell.bits.writeAddress(address);
    cell.bits.writeUint(0, 8); // flags

    return cell;

}

export function createAdnlAddressRecord(
    adnlAddress: BN

): Cell {

    /**
     * {@link https://github.com/ton-blockchain/ton/blob/7e3df93ca2ab336716a230fceb1726d81bac0a06/crypto/block/block.tlb#L821}
     *
     * dns_adnl_address#ad01
     *   adnl_addr:bits256
     *   flags:(## 8) { flags <= 1 }
     *   proto_list:flags . 0?ProtoList
     *
     * = DNSRecord;
     */

    const cell = new Cell();

    cell.bits.writeUint(0xad01, 16);
    cell.bits.writeUint(adnlAddress, 256);
    cell.bits.writeUint(0, 8); // flags

    return cell;

}

export function createNextResolverRecord(
    address: Address

): Cell {

    /**
     * {@link https://github.com/ton-blockchain/ton/blob/7e3df93ca2ab336716a230fceb1726d81bac0a06/crypto/block/block.tlb#L819}
     *
     * dns_next_resolver#ba93
     *   resolver:MsgAddressInt
     *
     * = DNSRecord;
     */

    const cell = new Cell();

    cell.bits.writeUint(0xba93, 16);
    cell.bits.writeAddress(address);

    return cell;

}

export function parseSmartContractAddressRecord(
    cell: Cell

): (Address | null) {

    /**
     * {@link https://github.com/ton-blockchain/ton/blob/1c356a190dd5baee9d9547a460887efb56cfa159/crypto/block/block.tlb#L834-L835}
     *
     * dns_smc_address#9fd3
     *   smc_addr:MsgAddressInt
     *   flags:(## 8) { flags <= 1 }
     *   cap_list:flags . 0?SmcCapList = DNSRecord;
     */

    return parseAddressWithPrefix(cell, 0x9fd3);

}

export function parseNextResolverRecord(
    cell: Cell

): (Address | null) {

    /**
     * {@link https://github.com/ton-blockchain/ton/blob/1c356a190dd5baee9d9547a460887efb56cfa159/crypto/block/block.tlb#L826}
     *
     * dns_next_resolver#ba93
     *   resolver:MsgAddressInt
     *   = DNSRecord;
     */

    return parseAddressWithPrefix(cell, 0xba93);

}

/**
 * Makes a call to "dnsresolve" get method of the specified
 * root smart contract to resolve the specified domain name
 * and category. Makes recursive calls if `oneStep` flag
 * is not set.
 *
 * @param provider - An HTTP provider.
 * @param dnsAddress - Address of the DNS smart contract.
 * @param domain - Domain name.
 * @param category - Resolution category.
 * @param oneStep - Whether to not resolve recursively.
 */
export function dnsResolve(
    provider: HttpProvider,
    dnsAddress: string,
    domain: string,
    category?: DnsCategory,
    oneStep?: boolean

): Promise<DnsResolveResponse> {

    const rawDomainBytes = domainToBytes(domain);

    return dnsResolveImpl(
        provider,
        dnsAddress,
        rawDomainBytes,
        category,
        oneStep
    );

}


//=================//
// PRIVATE METHODS //
//=================//

/**
 * Verifies and converts domain.
 *
 * @param domain - Domain name.
 *
 * @throws {@link Error}
 * Throws on incorrect domain name format.
 */
function domainToBytes(
    domain: string

): Uint8Array {

    if (!domain) {
        throw new Error(
            'Domain name must be specified as a string'
        );
    }

    if (domain === '.') {
        return new Uint8Array([0]);
    }

    domain = domain.toLowerCase();

    // @todo check and refactor these range checks

    for (let i = 0; i < domain.length; i++) {
        if (domain.charCodeAt(i) <= 32) {
            throw new Error(
                `Bytes in range 0..32 are not allowed ` +
                `in domain names`
            );
        }
    }

    for (let i = 0; i < domain.length; i++) {
        const char = domain[i];
        for (let code = 127; code <= 159; code++) {
            // Another control codes range
            if (char === String.fromCharCode(code)) {
                throw new Error(
                    `Bytes in range 127..159 are ` +
                    `not allowed in domain names`
                );
            }
        }
    }

    const parts = domain.split('.');

    for (const part of parts) {
        if (!part) {
            throw new Error(
                `Domain name can't have empty components`
            );
        }
    }

    const rawDomain = '\0' + parts.reverse().join('\0') + '\0';

    return stringToBytes(rawDomain);

}

/**
 * Represents category as a number.
 *
 * @internal
 *
 * @param category - Category to cast to a number.
 */
export async function categoryToBN(
    category?: DnsCategory

): Promise<BN> {

    if (!category) {
        // All categories
        return new BN(0);
    }

    const categoryBytes = stringToBytes(category);

    const categoryHash = new Uint8Array(
        await sha256(categoryBytes)
    );

    return new BN(bytesToHex(categoryHash), 16);

}

/**
 * Verifies that cell starts with the specified prefix and
 * then loads the address from it.
 *
 * @param cell - A cell to parse.
 * @param prefix - A 16-bit byte-prefix to verify.
 */
function parseAddressWithPrefix(
    cell: Cell,
    prefix: number

): (Address | null) {

    const slice = cell.parse();

    if (!slice.loadUint(16).eqn(prefix)) {
        throw new Error('Invalid DNS record value prefix');
    }

    return slice.loadAddress();

}

/**
 * Makes a call to "dnsresolve" get method of the specified SMC
 * to resolve the specified domain name. Makes recursive calls if
 * `oneStep` flag is not set.
 *
 * @param provider - An HTTP provider.
 * @param dnsAddress - Address of the DNS smart contract.
 * @param rawDomainBytes - Domain name represented as bytes.
 * @param category - Resolution category.
 * @param oneStep - Whether to not resolve recursively.
 */
async function dnsResolveImpl(
    provider: HttpProvider,
    dnsAddress: string,
    rawDomainBytes: Uint8Array,
    category?: DnsCategory,
    oneStep = false

): Promise<DnsResolveResponse> {

    const bitLength = (rawDomainBytes.length * 8);

    const domainCell = new Cell();
    domainCell.bits.writeBytes(rawDomainBytes);

    const categoryBN = await categoryToBN(category);

    /**
     * {@link https://github.com/ton-blockchain/dns-contract/blob/8864d3f6e1743910dc6ec6708540806283df09c4/func/root-dns.fc#L7}
     * {@link https://github.com/ton-blockchain/dns-contract/blob/8864d3f6e1743910dc6ec6708540806283df09c4/func/nft-collection.fc#L119}
     * {@link https://github.com/ton-blockchain/dns-contract/blob/8864d3f6e1743910dc6ec6708540806283df09c4/func/nft-item.fc#L295}
     */

    type RequestParamsType = [
        ['tvm.Slice', string],
        ['num', string],
    ];

    type ResponseType = [
        BN, Cell
    ];

    const requestParams: RequestParamsType = [

        // slice subdomain
        ['tvm.Slice', bytesToBase64(
            await domainCell.toBoc(false)
        )],

        // int category
        ['num', categoryBN.toString()]

    ];

    const result = await provider.call2<
        RequestParamsType,
        ResponseType
    >(
        dnsAddress,
        'dnsresolve',
        requestParams
    );

    if (result.length !== 2) {
        throw new Error('Invalid HTTP API response');
    }

    const resultLength = expectBN(result[0]).toNumber();

    if (resultLength === 0) {
        return null; // domain cannot be resolved
    }

    if ((resultLength % 8) !== 0) {
        throw new Error(
            'Domain name split not at a component boundary'
        );
    }

    if (resultLength > bitLength) {
        throw new Error('Incorrect dnsresolve response length');
    }

    let cell = result[1];

    if ((cell instanceof Array) && cell.length === 0) {
        return null;
    }

    expectCell(cell);

    if (resultLength === bitLength) {

        switch (category) {
            case DnsCategories.NextResolver: {
                return parseNextResolverRecord(cell);
            }
            case DnsCategories.Wallet: {
                return parseSmartContractAddressRecord(cell);
            }
            case DnsCategories.Site: {
                // todo: convert to BN
                return cell;
            }
            default: {
                return cell;
            }
        }

    } else {
        const nextAddress = parseNextResolverRecord(cell);

        if (oneStep) {
            return (category === DnsCategories.NextResolver
                ? nextAddress
                : null
            );

        } else {
            // Recursive call
            return dnsResolveImpl(
                provider,
                nextAddress.toString(),
                rawDomainBytes.slice(resultLength / 8),
                category,
                false
            );

        }

    }

}
