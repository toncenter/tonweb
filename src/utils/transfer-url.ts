
import BN from 'bn.js';

import { Address } from './address';


export interface ParsedTransferUrl {
    address: string;
    amount?: string;
    text?: string;
}


// @todo should we export this?
const tonTransferPrefix = 'ton://transfer/';


/**
 * Parses the specified TON-transfer URL into its individual
 * parts, throws error if URL format is invalid.
 */
export function parseTransferUrl(url: string): ParsedTransferUrl {

    // Examples:
    // ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG
    // ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000
    // ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000&text=data
    // ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000&text=foo%3A%2F%2Fbar%2C%2Fbaz%3Famount%3D1%26text%3D%D1%80%D1%83
    // -----

    if (!url.startsWith(tonTransferPrefix)) {
        throw new Error(`TON transfer URL must start with ${tonTransferPrefix}`);
    }

    const parts = url.substring(tonTransferPrefix.length).split('?');
    if (parts.length > 2) {
        throw new Error(
            `TON transfer URL could contain only one "?" character`
        );
    }

    const [address, rest] = parts;

    if (!Address.isValid(address)) {
        throw new Error(
            `TON transfer URL contains an incorrect address: ${address}`
        );
    }

    const result: ParsedTransferUrl = {
        address,
    };

    // @todo use the `URLSearchParams` to parse the query string!

    if (!rest) {
        return result;
    }

    const pairs = (rest.split('&')
        .map(parts => parts.split('='))
    );

    const processedKeys = new Set<string>();

    for (const pair of pairs) {

        if (pair.length !== 2) {
            throw new Error(
                `TON transfer URL contains invalid query string parameter`
            );
        }

        const [key, value] = pair;

        if (processedKeys.has(key)) {
            throw new Error(
                `Duplicate query string parameters (${key}) are ` +
                `not supported in TON transfer URL`
            );
        }

        switch (key) {
            case 'amount':
                try {
                    const bn = new BN(value);
                    if (bn.isNeg()) {
                        // noinspection ExceptionCaughtLocallyJS
                        throw new Error();
                    }

                } catch (error) {
                    throw new Error(
                        `Incorrect amount specified in the ` +
                        `TON transfer URL. The amount should ` +
                        `be a positive nanograms value`
                    );
                }
                result.amount = value;
                break;

            case 'text':
                result.text = decodeURIComponent(value);
                break;

            default:
                throw new Error(
                    `Unrecognized TON transfer URL query ` +
                    `string parameter: ${key}`
                );
        }

        processedKeys.add(key);

    }

    return result;

}

/**
 * Formats TON transfer URL from the specified individual parts.
 *
 * @todo pass all the parts as a single argument of `ParsedTransferUrl` type
 */
export function formatTransferUrl(
    address: string,
    amount?: string,
    text?: string

): string {

    let url = tonTransferPrefix + address;

    // @todo use the `URLSearchParams` to build the query string!

    const params = [];

    if (amount) {
        params.push(`amount=${amount}`);
    }

    if (text) {
        params.push(`text=${encodeURIComponent(text)}`);
    }

    if (params.length === 0) {
        return url;
    }

    return url + '?' + params.join('&');

}
