![splash_js_sdk](https://user-images.githubusercontent.com/1449561/154848382-e89fef68-3aee-4ca6-8d52-1466bfdf2c89.png)

# TonWeb - JavaScript SDK for [The Open Network](https://ton.org)

[![NPM](https://img.shields.io/npm/v/tonweb.svg)](https://www.npmjs.org/package/tonweb)

## Install Web

`npm install tonweb` or `yarn add tonweb`

```js
import TonWeb from "tonweb";

const tonweb = new TonWeb();
```

or

`<script src="tonweb.js"></script>`

`const tonweb = new window.TonWeb();`

## Install NodeJS

`npm install tonweb` or `yarn add tonweb`

```js
const TonWeb = require('tonweb');

const tonweb = new TonWeb();
```

## Overview example

```js
const tonweb = new TonWeb();

const wallet = tonweb.wallet.create({publicKey});

const address = await wallet.getAddress();

const nonBounceableAddress = address.toString(true, true, false);

const seqno = await wallet.methods.seqno().call();

await wallet.deploy(secretKey).send(); // deploy wallet to blockchain

const fee = await wallet.methods.transfer({
    secretKey,
    toAddress: 'EQDjVXa_oltdBP64Nc__p397xLCvGm2IcZ1ba7anSW0NAkeP',
    amount: TonWeb.utils.toNano(0.01), // 0.01 TON
    seqno: seqno,
    payload: 'Hello',
    sendMode: 3,
}).estimateFee();

const Cell = TonWeb.boc.Cell;
const cell = new Cell();
cell.bits.writeUint(0, 32);
cell.bits.writeAddress(address);
cell.bits.writeGrams(1);
console.log(cell.print()); // print cell data like Fift
const bocBytes = cell.toBoc();

const history = await tonweb.getTransactions(address);

const balance = await tonweb.getBalance(address);

tonweb.sendBoc(bocBytes);

```

## API

By default, mainnet [toncenter.com](https://toncenter.com) API is used. Please note that without the API key there will be a request rate limit.

You can start your own TON HTTP API instance as it is [open source](https://github.com/toncenter/ton-http-api).

Use mainnet TonCenter API with high ratelimit API key:

```js
const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {apiKey: 'YOUR_MAINNET_TONCENTER_API_KEY'}));
```

Use testnet TonCenter API with high ratelimit API key:

```js
const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: 'YOUR_TESTNET_TONCENTER_API_KEY'}));
```

## Documentation

Each part is documented separately:

[tonweb](https://github.com/toncenter/tonweb/blob/master/src/README.md) - root class and methods

[tonweb-contract-wallet](https://github.com/toncenter/tonweb/blob/master/src/contract/wallet/README.md) - interaction with wallet's smart contracts.

[tonweb-contract](https://github.com/toncenter/tonweb/blob/master/src/contract/README.md) - abstract interface to interact with TON smart contracts.

[tonweb-boc](https://github.com/toncenter/tonweb/blob/master/src/boc/README.md) - serializations of Cell and BitString

[tonweb-utils](https://github.com/toncenter/tonweb/blob/master/src/utils/README.md) - work with TON Addresses, coin values, byte arrays, hex, hash functions.


**Also we use JSDoc in code**

## Roadmap

1. Unit-tests

2. Typescript

## Build

```bash
npm install 

npm run build
```

## Use as alternative to Fift for building binary messages to smart-contracts

```bash
npm install -g tonweb

export NODE_PATH=$(npm root --quiet -g)
```

Then create your_script.js

```js
const TonWeb = require('tonweb');

const tonweb = new TonWeb();

. . .

```

run script

```bash
node your_script.js
```
