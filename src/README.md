# tonweb

Root of [TonWeb](https://github.com/toncenter/tonweb).

## Usage

* TonWeb.version - current version

* TonWeb.utils - [utils](https://github.com/toncenter/tonweb/blob/master/src/utils/README.md) class

* TonWeb.Address - [Address class](https://github.com/toncenter/tonweb/blob/master/src/utils/README.md#address-class)

* TonWeb.boc - [boc](https://github.com/toncenter/tonweb/blob/master/src/boc/README.md) class

* TonWeb.Contract - [Contract class](https://github.com/toncenter/tonweb/blob/master/src/contract/README.md)

* tonweb.wallet - [wallets object](https://github.com/toncenter/tonweb/blob/master/src/contract/wallet/README.md)

* tonweb.getTransactions(address: Address | string, limit?: number) - Use this method to get transaction history of a given address.

* tonweb.getBalance(address: Address | string) - The current balance for the given address in nanograms.

* tonweb.sendBoc(bytes: Uint8Array) - Use this method to send serialized boc file: fully packed and serialized external message.

* tonweb.call(address: Address | string, method: string | number, params: Array) - Invoke get-method of smart contract

## Additional

* tonweb.provider.getAddressInfo(address: string) - Use this method to get information about address: balance, code, data, last_transaction_id.

* tonweb.provider.getExtendedAddressInfo(address: string) - Similar to previous one but tries to parse additional information for known contract types. This method is based on generic.getAccountState thus number of recognizable contracts may grow. For wallets we recommend to use getWalletInformation.

* tonweb.provider.getWalletInfo(address: string) - Use this method to retrieve wallet information, this method parse contract state and currently supports more wallet types than getExtendedAddressInformation: simple wallet, stadart wallet and v3 wallet.

## Authors

[Emelyanenko Kirill](https://github.com/EmelyanenkoK), mail: emelyanenko.kirill@gmail.com
 
[Anatoliy Makosov](https://github.com/tolya-yanot), mail: info@coding.studio