
const BN = require('bn.js');

const { Cell } = require('../boc/Cell');


function expectArray(value) {
    if (!Array.isArray(value)) {
        throw new Error(`Value must be an array`);
    }
    return value;
}

function expectBN(value) {
    if (!BN.isBN(value)) {
        throw new Error(`Value must be a BN instance (big number)`);
    }
    return value;
}

function expectCell(value) {
    if (!(value instanceof Cell)) {
        throw new Error(`Value must be a Cell instance`);
    }
    return value;
}

function expectBoolean(value) {
    if (value !== true && value !== false) {
        throw new Error(`Value must be a boolean`);
    }
    return value;
}

function expectNonNullObject(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error(`Value must be a non-null object`);
    }
    return value;
}

function expectString(value) {
    if (typeof value !== 'string') {
        throw new Error(`Value must be a string`);
    }
    return value;
}

function expectNumber(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`Value must be a valid number`);
    }
    return value;
}

module.exports = {
    expectArray,
    expectBN,
    expectCell,
    expectBoolean,
    expectNonNullObject,
    expectString,
    expectNumber,
};
