# TonWeb - JavaScript API for TON blockchain

[![NPM](https://img.shields.io/npm/v/tonweb.svg)](https://www.npmjs.org/package/tonweb)

TonWeb interface is close as possible to the web3.js.

TonWeb has only 3 external dependencies (BN.js, tweetnacl, ethjs-unit) and is not too big (~200kb).

Used by [tonwallet.me](https://tonwallet.me) and [ton-wallet plugin](https://tonwallet.me/plugin).

## Install Web

`npm install tonweb`

`import TonWeb from "tonweb"`

`const tonweb = new TonWeb()`

or

`<script src="tonweb.js"></script>`

`const tonweb = new window.TonWeb();`

## Install NodeJS

`npm install tonweb`

`const TonWeb = require('tonweb');`

`const tonweb = new TonWeb();`

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

## Usage with NEWTON

```
const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/newton_test/v2/jsonRPC'));
```


## Documentation

Each part is documented separately:

[tonweb](https://github.com/toncenter/tonweb/blob/master/src/README.md) - root class and methods

[tonweb-contract-wallet](https://github.com/toncenter/tonweb/blob/master/src/contract/wallet/README.md) - interaction with wallet's smart contracts.

[tonweb-contract](https://github.com/toncenter/tonweb/blob/master/src/contract/README.md) - abstract interface to interact with TON smart contracts.

[tonweb-boc](https://github.com/toncenter/tonweb/blob/master/src/boc/README.md) - serializations of Cell and BitString

[tonweb-utils](https://github.com/toncenter/tonweb/blob/master/src/utils/README.md) - work with TON Addresses, coin values, byte arrays, hex, hash functions.


**Also we use JSDoc in code** 

## Build

```bash
npm install 

npx webpack --mode=none
```

## Use as alternative to Fift for building binary messages to smart-contracts

```bash
npm install -g tonweb

export NODE_PATH=$(npm root --quiet -g)
```

Then create your_script.js 

```
const TonWeb = require('tonweb');

const tonweb = new TonWeb();

. . .

```

run script 

```bash
node your_script.js
```