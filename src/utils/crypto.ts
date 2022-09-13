
import nacl, { SignKeyPair } from 'tweetnacl';


export function keyPairFromSeed(
    seed: Uint8Array

): SignKeyPair {

    return nacl.sign.keyPair.fromSeed(seed);

}

export function newKeyPair(): SignKeyPair {

    return nacl.sign.keyPair();

}

export function newSeed(): Uint8Array {

    const { secretKey } = newKeyPair();

    return secretKey.slice(0, 32);

}
