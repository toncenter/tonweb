# TonWeb - JavaScript API for TON (Telegram Open Network)

[![NPM](https://img.shields.io/npm/v/tonweb.svg)](https://www.npmjs.org/package/tonweb)

TonWeb interface is close as possible to the web3.js.

TonWeb has only 3 external dependencies (BN.js, tweetnacl, ethjs-unit) and is not too big (~200kb).

Used by [gram-wallet.org](https://gram-wallet.org) and [gram-wallet plugin](https://gram-wallet.org/plugin).

## Install

`npm install tonweb`

`import TonWeb from "tonweb"`

`const tonweb = new TonWeb()`

or

`<script src="tonweb.js"></script>`

`const tonweb = new window.TonWeb();`

## Overview example

```
const tonweb = new TonWeb();

const wallet = tonweb.wallet.create({publicKey});

const address = await wallet.getAddress();

const nonBounceableAddress = address.toString(true, true, false);

const seqno = await wallet.methods.seqno().call(); 

await wallet.deploy(secretKey).send(); // deploy wallet to blockchain

const fee = await wallet.methods.transfer({
    secretKey,
    toAddress: 'EQDjVXa_oltdBP64Nc__p397xLCvGm2IcZ1ba7anSW0NAkeP',
    amount: TonWeb.utils.toNano(0.01), // 0.01 Gram
    seqno: seqno,
    payload: 'Hello',
    sendMode: 3,
}).estimateFee();

const cell = new Cell();
cell.bits.writeUint(0, 32);
cell.bits.writeAddress(address);
cell.bits.writeGrams(1);
console.log(cell.print()); // print cell data like Fift
const bocBytes = cell.toBoc();

const history = await tonweb.getTransaction(address);

const balance = await tonweb.getBalance(address);

tonweb.sendBoc(bocBytes);

```

## Documentation

Each package is documented separately:

[tonweb](https://github.com/toncenter/tonweb/blob/master/packages/tonweb/README.md) - root module and methods

[tonweb-contract-wallet](https://github.com/toncenter/tonweb/blob/master/packages/tonweb-contract-wallet/README.md) - interaction with wallet's smart contracts.

[tonweb-contract](https://github.com/toncenter/tonweb/blob/master/packages/tonweb-contract/README.md) - abstract interface to interact with TON smart contracts.

[tonweb-boc](https://github.com/toncenter/tonweb/blob/master/packages/tonweb-boc/README.md) - serializations of Cell and BitString

[tonweb-utils](https://github.com/toncenter/tonweb/blob/master/packages/tonweb-utils/README.md) - work with TON Addresses, gram values, byte arrays, hex, hash functions.


**Also we use JSDoc in code** 

## Build

```
cd packages/tonweb

npx webpack --mode=none
```

## Authors

@rulon and @tolyayanot