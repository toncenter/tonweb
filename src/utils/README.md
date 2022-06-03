# tonweb-utils

Part of [TonWeb](https://github.com/toncenter/tonweb).

This contains useful utility functions for Dapp developers: work with TON Addresses, coin values, byte arrays, hex, hash functions.

## Address Class
```js
const Address = TonWeb.utils.Address;

const address = new Address(anyForm: string | Address);

address.isUserFriendly: boolean

address.isUrlSafe: boolean

address.isBounceable: boolean

address.isTestOnly: boolean

address.wc: number

address.hashPart: Uint8Array

address.toString(isUserFriendly?: boolean, isUrlSafe?: boolean, isBounceable?: boolean, isTestOnly?: boolean): string
```
## Functions

TonWeb.utils.

* BN - "bn.js" library 

* nacl - "tweetnacl" library

* Address - Address class

* toNano(amount: BN | string): BN

* fromNano(amount: BN | string): string

* bytesToHex(bytes: Uint8Array): string

* hexToBytes(s: string): Uint8Array

* stringToBytes(s: string, size?: number): Uint8Array 

* crc32c(bytes: Uint8Array): Uint8Array

* crc16(data: ArrayLike<number>): Uint8Array

* concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array

* bytesToBase64(bytes: Uint8Array): string

* base64ToBytes(base64: string): Uint8Array
