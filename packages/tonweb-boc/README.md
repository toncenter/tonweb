# tonweb-boc

This is a sub package of [TonWeb](https://github.com/toncenter/tonweb).

Serialization of BOC (Bag of Cells)

## Install

tonweb-boc is already included in the main package:

`npm install tonweb`

```
import TonWeb from "tonweb";
TonWeb.boc;

const tonweb = new TonWeb();
tonweb.boc;
```

You can use the tonweb-boc separately, without the main package:

`npm install tonweb-boc`

```
import {BitString, Cell} from "tonweb-boc"
```

## BitString

```
const bitString = new BitString(1023); // create BitString with length 1023 bits

bitString.array: Uint8Array

bitString.length: number

bitString.cursor: number

bitString.getFreeBits(): number

bitString.getUsedBits(): number

bitString.get(n: number): boolean // bit value at position `n`

bitString.on(n: number): void // Set bit value to 1 at position `n`

bitString.off(n: number): void // Set bit value to 0 at position `n`

bitString.toggle(n: number): void // Toggle bit value at position `n`

bitString.forEach(callback: function(boolean): void): void // forEach every bit

bitString.writeBit(b: boolean | number): void; // Write bit and increase cursor

bitString.writeBitArray(b: Array<boolean | number>): void;

bitString.writeUint(number: number | BN, bitLength: number): void; // Write unsigned int

bitString.writeInt(number: number | BN, bitLength: number): void; // Write signed int

bitString.writeBytes(array: Uint8Array): void; 

bitString.writeString(s: string): void; 

bitString.writeGrams(amount: number | BN): void; // amount in nanograms

bitString.writeAddress(address: Address | null): void; 

bitString.writeBitString(anotherBitString  BitString): void; // write another BitString to this BitString 

bitString.clone(): BitString

bitString.toHex(): string // prints BitString like Fift

```

## Cell
 
```
const cell = new Cell();

cell.bits: BitString // with length 1023

cell.refs: Array<cell> // with length 4

cell.writeCell(anotherCell: Cell): void // Write another cell to this cell

cell.hash(): Promise<Uint8Array> // Hash of cell

cell.print(): string // Recursively prints cell's content like Fift

cell.toBoc(has_idx?: boolean, hash_crc32?: boolean, has_cache_bits?: boolean, flags?: number): Promise<string> // create boc bytearray; toBoc(false) is equialent `2 boc+>B` in Fift

``` 
 
## Authors

@rulon and @tolyayanot