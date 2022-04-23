
![splash_js_sdk](https://user-images.githubusercontent.com/1449561/154848382-e89fef68-3aee-4ca6-8d52-1466bfdf2c89.png)

# TonWeb — JavaScript SDK for [The Open Network](https://ton.org)

[![NPM](https://img.shields.io/npm/v/tonweb.svg)](https://www.npmjs.org/package/tonweb)


## Install for Web or Node.js

```shell
npm install tonweb
```

```js
import TonWeb from 'tonweb';

const tonWeb = new TonWeb();
```


## Install to page directly

```html
<body>
    <!-- Page's content -->
    
    <!-- Specify a path to tonweb.js -->
    <script type="application/javascript" src="tonweb.js"></script>
    
    <script type="application/javascript">
        const tonWeb = new self.TonWeb();
    </script>

</body>
    
```


## Usage example

```js
const tonWeb = new TonWeb();

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

## TonCenter API

TonWeb communicates with TON nodes using public
[TonCenter API][toncenter] centrally hosted
by the TON FOUNDATION.

By default, `mainnet` network is used in guest mode (w/o the API key).
Please note, that without the TonCenter API key there will be
strict request limits (1 RPS currently).

You can increase the limits to 10 RPS by
[registering your own API key][toncenter-bot] for free
using a special Telegram bot.

If your requirements are even higher, you can
[start your own][toncenter-own] TON HTTP API instance and
use it without any artificial limits (you will be limited
only by the TON network capacity and your hardware).

### Use `mainnet` TonCenter API with the API key:

```js
const tonWeb = new TonWeb(
    new TonWeb.HttpProvider(
        'https://toncenter.com/api/v2/jsonRPC', {
            apiKey: 'YOUR_MAINNET_TONCENTER_API_KEY'
        }
    )
);
```

### Use `testnet` TonCenter API with the API key:

```js
const tonWeb = new TonWeb(
    new TonWeb.HttpProvider(
        'https://testnet.toncenter.com/api/v2/jsonRPC', {
            apiKey: 'YOUR_TESTNET_TONCENTER_API_KEY'
        }
    )
);
```


## Type safety

The library is covered with TypeScript types. Declaration
files are provided with the package. We are strongly recommend
to use TypeScript for your projects due to the great type safety
benefits that it provides.


## Documentation

Each part is documented separately:

| Module                                                    | Description                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| [tonweb](./src/README.md)                                 | Root class and methods.                                      |
| [tonweb-contract-wallet](./src/contract/wallet/README.md) | Interaction with wallet's smart contracts.                   |
| [tonweb-contract](./src/contract/README.md)               | Abstract interface to interact with TON smart contracts.     |
| [tonweb-boc](./src/boc/README.md)                         | Serializations of Cell and BitString.                        |
| [tonweb-utils](./src/utils/README.md)                     | Work with TON Addresses, coin values, byte arrays, hex, hash functions. |
| [tonweb-nft](./src/contract/token/nft/README.md)          | work with **TON NFT** (non-fungible tokens).                 |
| [tonweb-jettons](./src/contract/token/ft/README.md)       | work with **TON Jettons** (fungible tokens).                 |


## Support

We have Telegram chats for developers with a lively community, don't hesitate to ask any questions there:

| Link                                   | Title        | Description                                      |
| -------------------------------------- | ------------ | ------------------------------------------------ |
| [@tondev_eng](https://t.me/tondev_eng) | TON Dev Chat | TON developers community in 🇬🇧 English language. |
| [@tondev](https://t.me/tondev)         | TON Дев Чат  | TON developers community in 🇷🇺 Russian language. |




## Self-executing Node.js script

You can use TonWeb as an alternative to Fift, e.g.
to build binary messages for smart-contracts.

1. Install the TonWeb globally:
```shell
npm install -g tonweb
```

2. Create a text file with the following content:

```shell
#!/usr/bin/env bash

NODE_PATH="$(npm root -g):$NODE_PATH" node <<EOF

  const TonWeb = require('tonweb');
    
  console.log('TonWeb v' + TonWeb.version);
    
  const tonWeb = new TonWeb();
    
  // Work with tonWeb…

EOF
```

3. Make it executable:
```shell
chmod +x ./script-file
```

4. Run the script:
```shell
./script-file
```

## Roadmap

1. TypeScript support `(present, 90% done)`
2. Unit-tests `(in progress)`
3. Better documentation `(TBD)`


## Contributing

Please see the [contribution guide](./CONTRIBUTING.md).


## License

© TON FOUNDATION

GNU GENERAL PUBLIC LICENSE  Version 3, 29 June 2007

[» Read full license text](./LICENSE)


[toncenter]: https://toncenter.com/
[toncenter-own]: https://github.com/toncenter/ton-http-api#building-and-running
[toncenter-bot]: https://t.me/tonapibot
