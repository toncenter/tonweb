
import nacl from 'tweetnacl';

import { TestHttpProvider } from '../http-provider/test-http-provider';
import { Address } from '../utils/address';


/**
 * Uint8Array(32) [
 *   1, 2, 3, 4, 5, 6, 7, 8, 9,
 *   1, 2, 3, 4, 5, 6, 7, 8, 9,
 *   1, 2, 3, 4, 5, 6, 7, 8, 9,
 *   1, 2, 3, 4, 5
 * ]
 */
export const testSeedArray = (
    Uint8Array.from(<any> '12345678912345678912345678912345')
);

export const testKeyPair = nacl.sign.keyPair.fromSeed(
    testSeedArray
);

export const testAddressStr = 'UQBhK88OC8wm21NbmS3ElxpJqybSQHZN8FdXWISVP8SWeiMn';
export const testAddress = new Address(testAddressStr);

export const testProvider = new TestHttpProvider();

export const NonNumbers: Array<[string, any]> = [
    ['Date', new Date()],
    ['string', 'string'],
    ['String', new String()],
    ['null', null],
    ['undefined', undefined],
    ['NaN', NaN],
    ['Uint8Array', new Uint8Array()],
    ['[]', []],
    ['{}', {}],
    ['true', true],
    ['false', false],
    ['string number', '100'],
    ['string zero', '0'],
    ['string one', '1'],
];

export const BadIntegers = [
    ['too big', Number.MAX_SAFE_INTEGER + 1],
    ['too small', Number.MIN_SAFE_INTEGER - 1],
    ['float', 1.23],
    ['NaN', NaN],
];
