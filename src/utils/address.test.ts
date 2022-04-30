
import { Address, AddressType } from './address';
import { base64ToBytes, bytesToBase64 } from './base64';
import { bytesToHex, crc16 } from './common';
import { WorkchainId } from './workchain';


/**
 * LEGEND:
 *
 * [F] - User-friendly
 * [S] - URL-safe
 * [B] - Bounceable
 * [T] - Test-only
 * [N] - Not
 */

/**
 * Boolean flags for better test readability.
 */
const $ = {
    _F: true,
    NF: false,
    _S: true,
    NS: false,
    _B: true,
    NB: false,
    _T: true,
    NT: false,
};

/**
 * This is the same reference address in various forms.
 */
const A = {
    // Reference values are taken from the legacy (vanilla) version of the library
    NF: '0:2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422e3',
    F_NS_NB_NT: 'UQAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi41+E',
    F__S_NB_NT: 'UQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi41-E',
    F_NS_NB__T: '0QAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi4+QO',
    F__S_NB__T: '0QAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4-QO',
    F_NS__B_NT: 'EQAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi4wJB',
    F__S__B_NT: 'EQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4wJB',
    F_NS__B__T: 'kQAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi47nL',
    F__S__B__T: 'kQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi47nL'
};

/**
 * Wrong addresses.
 */
const WA = {
    EMPTY_STRING: '',
    TYPE: Date as any,
    PARTIAL: A.F_NS_NB_NT.substring(0, 24),
    CHECKSUM: (
        A.F_NS_NB_NT
            .substring(0, A.F_NS_NB_NT.length - 1) + 'X'
    ),
    MULTIPLE_COLONS: '0:1:2',
    HEX_LENGTH: '0:123',
    TAG: changeFriendlyAddress(
        A.F_NS_NB_NT,
        data => (data[0] = 254)
    ),
    WORKCHAIN: changeFriendlyAddress(
        A.F_NS_NB_NT,
        data => (data[1] = 10)
    ),
    EXTRA_CHAR: A.F_NS_NB_NT + 'X',
    EXTRA_CHARS: A.F_NS_NB_NT + 'typo',
};

/**
 * This is the map of test addresses to flags.
 */
const AF = {
    NF: [$.NF, $.NS, $.NB, $.NT],
    F_NS_NB_NT: [$._F, $.NS, $.NB, $.NT],
    F__S_NB_NT: [$._F, $._S, $.NB, $.NT],
    F_NS_NB__T: [$._F, $.NS, $.NB, $._T],
    F__S_NB__T: [$._F, $._S, $.NB, $._T],
    F_NS__B_NT: [$._F, $.NS, $._B, $.NT],
    F__S__B_NT: [$._F, $._S, $._B, $.NT],
    F_NS__B__T: [$._F, $.NS, $._B, $._T],
    F__S__B__T: [$._F, $._S, $._B, $._T],
};

const flagNames = [
    'user-friendly',
    'url-safe',
    'bounceable',
    'test-only',
];

/**
 * A helper function that creates group of test addresses,
 * based on the specified flag value.
 */
const filter = (index: number, match: boolean) => (
    Object.fromEntries(
        Object.entries(AF)
            .filter(([_, flags]) => flags[index] === match)
            .map(([key]) => [key, A[key]])
    )
);

const friendly = filter(0, true);
const urlSafe = filter(1, true);
const nonUrlSafe = filter(1, false);
const bounceable = filter(2, true);
const nonBounceable = filter(2, false);
const testOnly = filter(3, true);
const nonTestOnly = filter(3, false);


/**
 * Shortcut to Address constructor.
 */
const $A = (address:AddressType) => new Address(address);


describe('Address', () => {

    describe('constructor()', () => {

        it('should throw on empty string', () => {
            expect(() => $A(WA.EMPTY_STRING)).toThrow(
                'Empty address specified'
            );
        });

        it('should throw on unknown value', () => {
            expect(() => $A(WA.TYPE)).toThrow(
                'Incorrect address format'
            );
        });

        it('should throw on incorrect string length', () => {
            expect(() => $A(WA.PARTIAL)).toThrow(
                /address.*should contain.*48 characters/
            );
        });

        it('should throw on incorrect checksum', () => {
            expect(() => $A(WA.CHECKSUM)).toThrow(
                'Wrong CRC-16 checksum'
            );
        });

        it('should throw on incorrect tag', () => {
            expect(() => $A(WA.TAG)).toThrow(
                'Unknown address tag'
            );
        });

        it(`should clear user-friendly flag for non user-friendly address`, () => {
            expect($A(A.NF).isUserFriendly).toEqual(false);
        });

        for (const [key, addressStr] of Object.entries(friendly)) {
            it(`should set user-friendly flag for: [${key}] address`, () => {
                expect($A(addressStr).isUserFriendly).toEqual(true);
            });
        }

        for (const [key, addressStr] of Object.entries(urlSafe)) {
            it(`should set url-safe flag for: [${key}] address`, () => {
                expect($A(addressStr).isUrlSafe).toEqual(true);
            });
        }

        for (const [key, addressStr] of Object.entries(nonUrlSafe)) {
            it(`should clear url-safe flag for: [${key}] address`, () => {
                expect($A(addressStr).isUrlSafe).toEqual(false);
            });
        }

        for (const [key, addressStr] of Object.entries(bounceable)) {
            it(`should set bounceable flag for: [${key}] address`, () => {
                expect($A(addressStr).isBounceable).toEqual(true);
            });
        }

        for (const [key, addressStr] of Object.entries(nonBounceable)) {
            it(`should clear bounceable flag for: [${key}] address`, () => {
                expect($A(addressStr).isBounceable).toEqual(false);
            });
        }

        for (const [key, addressStr] of Object.entries(testOnly)) {
            it(`should set test-only flag for: [${key}] address`, () => {
                expect($A(addressStr).isTestOnly).toEqual(true);
            });
        }

        for (const [key, addressStr] of Object.entries(nonTestOnly)) {
            it(`should clear test-only flag for: [${key}] address`, () => {
                expect($A(addressStr).isTestOnly).toEqual(false);
            });
        }

        it('should throw on multiple colons in address', () => {
            expect(() => $A(WA.MULTIPLE_COLONS)).toThrow(
                /Invalid address.*single colon/
            );
        });

        it('should throw on incorrect address HEX length', () => {
            expect(() => $A(WA.HEX_LENGTH)).toThrow(
                'Invalid address HEX'
            );
        });

        for (const [key, flags] of Object.entries(AF)) {
            for (const flag of flagNames) {
                it(`should copy [${flag}] flag from [${key}] address instance`, () => {
                    const addressStr = A[key];
                    const source = $A(addressStr);
                    const address = $A(source);
                    switch (flag) {
                        case 'user-friendly':
                            expect(address.isUserFriendly).toEqual(flags[0]);
                            break;
                        case 'url-safe':
                            expect(address.isUrlSafe).toEqual(flags[1]);
                            break;
                        case 'bounceable':
                            expect(address.isBounceable).toEqual(flags[2]);
                            break;
                        case 'test-only':
                            expect(address.isTestOnly).toEqual(flags[3]);
                            break;
                    }

                });
            }
        }

        it(`should copy workchain property from address instance`, () => {
            const source = $A(A.NF);
            const address = $A(source);
            expect(address.wc).toEqual(WorkchainId.Basic);
        });

        it(`should copy hash-part property from address instance`, () => {
            const source = $A(A.NF);
            const address = $A(source);
            expect(bytesToHex(address.hashPart)).toEqual(
                '2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422e3'
            );
        });

        const supportedWorkchains = [
            WorkchainId.Master,
            WorkchainId.Basic,
        ];

        for (const workchain of supportedWorkchains) {

            it(`should support workchain [${workchain}]`, () => {

                const addressStr = changeFriendlyAddress(
                    A.F_NS_NB_NT,
                    data => {
                        // Changing the workchain
                        data[1] = workchain;
                    }
                );

                expect($A(addressStr).wc).toEqual(workchain);

            });

        }

        it(`should throw on unsupported workchains`, () => {

            const wrongWorkchains = [-10, -2, 1, 10, 100];

            for (const workchain of wrongWorkchains) {
                const addressStr = changeFriendlyAddress(
                    A.F_NS_NB_NT,
                    data => {
                        // Setting the wrong tag
                        data[1] = workchain;
                    }
                );

                expect(() => $A(addressStr)).toThrow(
                    'Invalid address workchain'
                );

            }

        });

        it('should throw on string with single extra character', () => {

            // Single extra character could be ignored by
            // the base64 decoding process of the address.
            expect(() => $A(WA.EXTRA_CHAR)).toThrow(
                /address.*should contain.*48 characters/
            );

        });

        it('should throw on string with extra characters', () => {
            expect(() => $A(WA.EXTRA_CHARS)).toThrow(
                /address.*should contain.*48 characters/
            );
        });

        it('parses masterchain addresses', () => {

            const addressStr = (
                '-1:3674ec71a2854a6bc36335c39eb9cc9c0a69d23cdc52c870181b4ae703bcca83'
            );

            const address = $A(addressStr);

            expect(address.wc).toEqual(-1);

            expect(address.isUserFriendly).toEqual(false);
            expect(address.isUrlSafe).toEqual(false);
            expect(address.isBounceable).toEqual(false);
            expect(address.isTestOnly).toEqual(false);

        });

    });

    describe('toString()', () => {

        const address = $A(A.NF);

        for (const [key, flags] of Object.entries(AF)) {

            it(`should serialize address to [${key}] format correctly`, () => {

                const addressStr = address.toString(
                    flags[0],
                    flags[1],
                    flags[2],
                    flags[3]
                );

                expect(addressStr).toEqual(A[key]);

            });

        }

        for (const [key, addressStr] of Object.entries(A)) {

            it(`should preserve the original [${key}] format`, () => {
                expect(addressStr).toEqual(
                    $A(addressStr).toString()
                );
            });

        }

        // @todo: add tests that modifies address flags directly

    });

    describe('static isValid()', () => {

        for (const [key, addressStr] of Object.entries(A)) {
            it(`should return [true] on valid addresses [${key}]`, () => {
                expect(Address.isValid(addressStr)).toEqual(true);
            });
        }

        for (const [key, addressStr] of Object.entries(WA)) {
            it(`should return [false] on invalid addresses [${key}]`, () => {
                expect(Address.isValid(addressStr)).toEqual(false);
            });
        }

    });

});


function changeFriendlyAddress(
    address: string,
    handler: (data: Uint8Array) => void

): string {

    // Destructuring some address
    const data = base64ToBytes(address);

    handler(data);

    // Calculating valid checksum
    const checksum = crc16(data.slice(0, 34));
    data.set(checksum, 34);

    return bytesToBase64(data);

}
