
import TonWeb from '__tonweb__';
import BN from 'bn.js';

const {
    toNano,
    fromNano,

} = TonWeb.utils;


const cases = [
    [0, 0],

    [1,       1000000000],
    [10,      10000000000],
    [100,     100000000000],
    [1000,    1000000000000],
    [10000,   10000000000000],
    [100000,  100000000000000],
    [1000000, 1000000000000000],

    [.1, 100000000],
    [.01, 10000000],
    [.001, 1000000],
    [.0001, 100000],
    [.00001, 10000],
    [.000001, 1000],
    [.0000001, 100],
    [.00000001, 10],
    [.000000001, 1],

    [.123456789, 123456789],
];

const inputTypes = ['BN', 'string'];


describe('toNano()', () => {

    for (const inputType of inputTypes) {
        describe(`${inputType} input type`, () => {
            for (const [from, to] of cases) {
                if (inputType === 'BN' && from < 1) {
                    continue;
                }
                it(`should convert TONs to nano-TONs (${from} → ${to})`, () => {
                    let value: (BN | string);
                    switch (inputType) {
                        case 'BN': {
                            value = new BN(from);
                            break;
                        }
                        case 'string': {
                            value = numberToString(from);
                            break;
                        }
                    }
                    expect(
                        toNano(value).toString()
                    ).toEqual(
                        to.toString()
                    );
                });
            }
        });
    }

    it('should throw when number is passed', () => {
        expect(() => toNano(100500 as any)).toThrow(
            'pass numbers as strings or BN objects'
        );
    });

});

describe('fromNano()', () => {

    for (const inputType of inputTypes) {
        describe(`${inputType} input type`, () => {
            for (const [to, from] of cases) {
                const toStr = numberToString(to);
                it(`should convert nano-TONs to TONs (${from} → ${toStr})`, () => {
                    let value: (BN | string);
                    switch (inputType) {
                        case 'BN': {
                            value = new BN(from);
                            break;
                        }
                        case 'string': {
                            value = numberToString(from);
                            break;
                        }
                    }
                    expect(
                        fromNano(value).toString()
                    ).toEqual(
                        toStr
                    );
                });
            }
        });
    }

    it('should throw when number is passed', () => {
        expect(() => fromNano(100500 as any)).toThrow(
            'pass numbers as strings or BN objects'
        );
    });

});


function numberToString(value: number): string {

    return value.toLocaleString('en', {
        maximumFractionDigits: 20,
        useGrouping: false,
    });

}
