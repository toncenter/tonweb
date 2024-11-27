const TonWeb = require("./index");
const HighloadQueryId = TonWeb.HighloadWallets.HighloadQueryId;

if (HighloadQueryId.fromSeqno(0n).toSeqno() !== 0n) throw new Error();

const i = HighloadQueryId.fromSeqno(1022n);
if (i.toSeqno() !== 1022n) throw new Error();
const i2 = HighloadQueryId.fromSeqno(1023n);
if (i2.toSeqno() !== 1023n) throw new Error();
const i3 = HighloadQueryId.fromSeqno(1024n);
if (i3.toSeqno() !== 1024n) throw new Error();
const i4 = HighloadQueryId.fromSeqno(8380415n);
if (i4.toSeqno() !== 8380415n) throw new Error();


let queryId = new HighloadQueryId();
console.log(queryId.getQueryId(), queryId.hasNext());

const MAX = (2n ** 13n) * 1023n - 2n;
for (let i = 0; i < MAX; i++) {
    queryId = queryId.getNext();

    const q = queryId.getQueryId();
    const q2 = HighloadQueryId.fromQueryId(q);

    if (queryId.getShift() !== q2.getShift()) throw new Error()
    if (queryId.getBitNumber() !== q2.getBitNumber()) throw new Error()
    if (q2.getQueryId() !== q) throw new Error();

    const q3 = HighloadQueryId.fromShiftAndBitNumber(queryId.getShift(), queryId.getBitNumber());
    if (queryId.getShift() !== q3.getShift()) throw new Error()
    if (queryId.getBitNumber() !== q3.getBitNumber()) throw new Error()
    if (q3.getQueryId() !== q) throw new Error();

    if (!queryId.hasNext()) {
        console.log('END')
    }
}
console.log(queryId.shift);
console.log(queryId.bitnumber);

console.log(queryId.getQueryId(), queryId.hasNext());