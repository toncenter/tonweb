# tonweb-boc

Part of [TonWeb](https://github.com/toncenter/tonweb).

Serialization of BOC (Bag of Cells)

## BitString

```js
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
 
```js
const cell = new Cell();

cell.bits: BitString // with length 1023

cell.refs: Array<cell> // with length 4

cell.writeCell(anotherCell: Cell): void // Write another cell to this cell

cell.hash(): Promise<Uint8Array> // Hash of cell

cell.print(): string // Recursively prints cell's content like Fift

cell.toBoc(has_idx?: boolean, hash_crc32?: boolean, has_cache_bits?: boolean, flags?: number): Promise<string> // create boc bytearray; toBoc(false) is equialent `2 boc+>B` in Fift

Cell.fromBoc(boc: string | UInt8Array): Cell - decerialize boc bytearray to Cell

``` 
 
### Cell deserialization example

```js
// Create some cells
const c2 = new TonWeb.boc.Cell();
c2.bits.writeUint(42, 7);

const c3 = new TonWeb.boc.Cell();
c3.bits.writeUint(73, 255);

const c1 = new TonWeb.boc.Cell();
c1.bits.writeUint8(0);
c1.refs.push(c2);
c1.refs.push(c3); 

// Check it deserialized correctly
const deC1 = TonWeb.boc.Cell.fromBoc(await c1.toBoc());
(await deC1.hash()).toString() === (await c1.hash()).toString();
```

## HashMap

### HashMap desrialization example:

```js
//create hashmap object
x = new TonWeb.boc.HashMap(64)

//get some cell containing hashmap
t="B5EE9C7241010A010032000203CE6001020201200303020120030402012005050201CE080802012006060201200707020120080802012009090003006001FFF7D9"
cell = TonWeb.boc.Cell.fromBoc(t)[0]

//deserialize map from cell, by providing key deserializator and value deserializator
x.loadHashMapX2Y(cell, s => TonWeb.boc.CellParser.loadUint(s, 64), s => TonWeb.boc.CellParser.loadUint(s, 8));

x.elements
```

### Serialization
```js
// Given that x is a hashmap and x.elements contains key/values
b = x.serialize(k=>{let key = new TonWeb.boc.Cell(); key.bits.writeUint(k,64); return key;},
                v=>{let val = new TonWeb.boc.Cell(); val.bits.writeUint(v,8); return val;});
b; // serialized hashmap
```

### PfxMap
```js
x = new TonWeb.boc.PfxHashMap(267)
t="B5EE9C7241010501007A00020374C001020045A0E034CD6A3000596F07C3F0AB332935D3E3FC98F1E78F6AE1FC710EA4D98732772F1002057FBFB003040043BFB333333333333333333333333333333333333333333333333333333333333333400043BF955555555555555555555555555555555555555555555555555555555555555540DE161D24"
cell = TonWeb.boc.Cell.fromBoc(t)[0]
loadAddress = s => {
  console.log(s);
  flag = TonWeb.boc.CellParser.loadUint(s,3);
  console.log(1);
  if(flag != 4) {
    throw Error("Unsupported address type");
  }
  let workchain = TonWeb.boc.CellParser.loadInt(s, 8);
  let hashPart = TonWeb.boc.CellParser.loadUint(s,256);
  return workchain.toString()+":"+hashPart.toString(16).padStart(64, '0');
}

x.loadHashMapX2Y(cell, loadAddress, s => true);
serializeAddress = a => {
  console.log(a);
  let _a = new TonWeb.utils.Address(a);
  console.log(_a.toString());
  let ad = new TonWeb.boc.Cell();
  ad.bits.writeAddress(_a);
  console.log(ad.print());
  return ad;
}

b = x.serialize(serializeAddress,
                v=> (new TonWeb.boc.Cell()));
b; // serialized pfxhashmap
```
