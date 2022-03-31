
import BN from 'bn.js';
import { Cell } from '../boc/cell';


export function expectArray<Type = any>(value: any): Array<Type> {

    if (!Array.isArray(value)) {
        throw new Error(`Value must be an array`);
    }

    return value;

}

export function expectBN(value: any): BN {

    if (!BN.isBN(value)) {
        throw new Error(
            `Value must be a BN instance (big number)`
        );
    }

    return value;

}

export function expectCell(value: any): Cell {

    if (!(value instanceof Cell)) {
        throw new Error(
            `Value must be a Cell instance`
        );
    }

    return value;

}

export function expectBoolean(value: any): boolean {

    if (value !== true && value !== false) {
        throw new Error(`Value must be a boolean`);
    }

    return value;

}

export function expectNonNullObject(value: any): object {

    if (typeof value !== 'object' || value === null) {
        throw new Error(`Value must be a non-null object`);
    }

    return value;

}

export function expectString(value: any): string {

    if (typeof value !== 'string') {
        throw new Error(`Value must be a string`);
    }

    return value;

}

export function expectNumber(value: any): number {

    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`Value must be a valid number`);
    }

    return value;

}
