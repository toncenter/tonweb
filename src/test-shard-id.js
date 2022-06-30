const TonWeb = require("./index");
const { Address, ShardId } = TonWeb.utils;

console.log('ShardId.fromDecimal:', ShardId.fromDecimal('-9223372036854775808').toString());
console.log('ShardId.fromHex (with 0x prefix):', ShardId.fromHex('0x8000000000000000').toString());
console.log('ShardId.fromHex (without 0x prefix):', ShardId.fromHex('8000000000000000').toString());

const shardIds = [
  '0400000000000000',
  '0c00000000000000',
  '1400000000000000',
  '1c00000000000000',
  '2400000000000000',
  '2c00000000000000',
  '3400000000000000',
  '3c00000000000000',
  '4400000000000000',
  '4c00000000000000',
  '5400000000000000',
  '5c00000000000000',
  '6400000000000000',
  '6c00000000000000',
  '7400000000000000',
  '7c00000000000000',
  '8400000000000000',
  '8c00000000000000',
  '9400000000000000',
  '9c00000000000000',
  'a400000000000000',
  'ac00000000000000',
  'b400000000000000',
  'bc00000000000000',
  'c400000000000000',
  'cc00000000000000',
  'd400000000000000',
  'dc00000000000000',
  'e400000000000000',
  'ec00000000000000',
  'f400000000000000',
  'fc00000000000000',
].map(shardId => ShardId.fromHex(shardId));

const address = new Address('EQAzXhMb7y2c0phcCF7m9wJl6WoYSVIJb7AUeGeqqDlnukJD');

console.log(
  'Shard of',
  address.toString(),
  'is',
  shardIds.find(shardId => shardId.contains(address)).toString(),
);

console.log('ShardId cc00000000000000 prefix length:', ShardId.fromHex('cc00000000000000').getPrefixLength())
console.log('ShardId cc00000000000000 prefix:', ShardId.fromHex('cc00000000000000').toPrefixString())
