
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
