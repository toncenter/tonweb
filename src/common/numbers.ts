
import BN from 'bn.js';


export type BigIntInput = (
    | number
    | string
    | BN
);

export type BitInput = (
    | boolean
    | 0 | 1
    | number
);

export type Bit = boolean;


const intStringRe = /^-?\d+$/;


export function parseBigIntInput(value: BigIntInput): BN {

    if (typeof value === 'number') {
        expectSafeInteger(value);

    } else if (typeof value === 'string') {
        if (value === '') {
            throw new Error(
                `Specified string shouldn't be empty`
            );
        }
        if (!intStringRe.test(value)) {
            throw new Error(
                `Specified string contains invalid characters, ` +
                `only digits are supported`
            );
        }

    } else if (value instanceof BN) {
        // No special checks here

    } else {
        throw new Error(
            `Specified value has an incorrect type`
        );

    }

    return new BN(value);

}

export function expectSafeInteger(
    value: any,
    variableName?: string

): void {

    if (
        typeof value !== 'number' ||
        isNaN(value) ||
        !Number.isInteger(value)
    ) {
        throw Error(
            `Expected ` +
            (variableName ? `"${variableName}" ` : '') +
            `value to be a valid integer`
        );
    }

    if (!Number.isSafeInteger(value)) {
        throw new Error(
            `Expected ` +
            (variableName ? `"${variableName}" ` : '') +
            `value to be a safe integer`
        );
    }

}

export function expectBit(
    value: any,
    errorMessage?: string

): void {

    const validValues = [false, 0, true, 1];

    if (!validValues.includes(value)) {
        throw new Error(
            errorMessage || (
                'Expected value to be a bit, ' +
                'it must be either boolean or a number ' +
                '0 or 1'
            )
        );
    }

}
