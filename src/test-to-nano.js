
const TonWeb = require('.');

const value = (1e-7);

const result = TonWeb.utils.toNano(value);

console.log(value.toString());

console.log(result.toString());
console.log(result.toNumber());
