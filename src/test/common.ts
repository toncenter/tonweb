
import nacl from 'tweetnacl';

import { TestHttpProvider } from '../providers/test/test-http-provider';


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

export const testProvider = new TestHttpProvider();
