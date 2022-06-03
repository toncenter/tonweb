# tonweb-contract-wallet

Part of [TonWeb](https://github.com/toncenter/tonweb).

Interaction with wallet's smart contracts.

## Info

There is currently no single standard wallet in TON.

This code implements wallet's smart contracts published in the [TON repository](https://github.com/ton-blockchain/ton/tree/master/crypto/smartcont).

They all have almost the same interface.

## Usage

```js
const nacl = TonWeb.utils.nacl; // use nacl library for key pairs
const tonweb = new TonWeb();

const keyPair = nacl.sign.keyPair(); // create new random key pair

let wallet = tonweb.wallet.create({publicKey: keyPair.publicKey, wc: 0}); // create interface to wallet smart contract (wallet v3 by default)

OR

wallet = tonweb.wallet.create({address: 'EQDjVXa_oltdBP64Nc__p397xLCvGm2IcZ1ba7anSW0NAkeP'}); // if your know only address at this moment


const address = await wallet.getAddress();

const seqno = await wallet.methods.seqno().call(); // call get-method `seqno` of wallet smart contract

// DEPLOY

const deploy = wallet.deploy(keyPair.secretKey); // deploy method

const deployFee = await deploy.estimateFee()  // get estimate fee of deploy

const deploySended = await deploy.send() // deploy wallet contract to blockchain

const deployQuery = await deploy.getQuery();   // get deploy query Cell 

// TRANSFER TON COINS

const transfer = wallet.methods.transfer({
    secretKey: keyPair.secretKey,
    toAddress: 'EQDjVXa_oltdBP64Nc__p397xLCvGm2IcZ1ba7anSW0NAkeP',
    amount: TonWeb.utils.toNano('0.01'), // 0.01 TON
    seqno: seqno,
    payload: 'Hello',
    sendMode: 3,
});

const transferFee = await transfer.estimateFee();   // get estimate fee of transfer

const transferSended = await transfer.send();  // send transfer query to blockchain

const transferQuery = await transfer.getQuery(); // get transfer query Cell

```

## Usage non-default wallet

```js
tonweb.wallet.all
-> {SimpleWalletContract, StandardWalletContract, WalletV3Contract}

const simpleWallet = new tonweb.wallet.all.SimpleWalletContract({publicKey})

```

## Low level

[Comparison with new-wallet.fif](https://github.com/toncenter/tonweb/blob/master/test/test-new-wallet-fif.html)

[Comparison with wallet.fif](https://github.com/toncenter/tonweb/blob/master/test/test-wallet-fif.html)
