const {BN} = require("../../utils");

/**
 * @param slice {Slice}
 * @return {{seqno: number, bounce: boolean, payload: string, expireAt: number, toAddress: Address, value: BN}}
 */
function parseWalletV3TransferBody(slice) {
    const signature = slice.loadBits(512);

    // signing message

    const walletId = slice.loadUint(32).toNumber();
    if (walletId !== 698983191) throw new Error('invalid walletId');

    const expireAt = slice.loadUint(32).toNumber();

    const seqno = slice.loadUint(32).toNumber();

    const sendMode = slice.loadUint(8).toNumber();
    if (sendMode !== 3) throw new Error('invalid sendMode');

    let order = slice.loadRef();

    // order internal header
    if (order.loadBit()) throw Error('invalid internal header');
    if (!order.loadBit()) throw Error('invalid ihrDisabled');
    const bounce = order.loadBit();
    if (order.loadBit()) throw Error('invalid bounced');
    const sourceAddress = order.loadAddress();
    if (sourceAddress !== null) throw Error('invalid externalSourceAddress');
    const destAddress = order.loadAddress();
    const value = order.loadCoins();

    if (order.loadBit()) throw Error('invalid currencyCollection');
    const ihrFees = order.loadCoins();
    if (!ihrFees.eq(new BN(0))) throw new Error('invalid ihrFees');
    const fwdFees = order.loadCoins();
    if (!fwdFees.eq(new BN(0))) throw new Error('invalid fwdFees');
    const createdLt = order.loadUint(64);
    if (!createdLt.eq(new BN(0))) throw new Error('invalid createdLt');
    const createdAt = order.loadUint(32);
    if (!createdAt.eq(new BN(0))) throw new Error('invalid createdAt');

    // order stateInit
    if (order.loadBit()) {
        order.loadRef();  // don't parse stateInit
    }

    // order body
    let payload = null;

    if (order.getFreeBits() > 0) {
        if (order.loadBit()) {
            order = order.loadRef();
        }

        if (order.getFreeBits() > 32) {
            const op = order.loadUint(32);
            const payloadBytes = order.loadBits(order.getFreeBits());
            payload = op.eq(new BN(0)) ? new TextDecoder().decode(payloadBytes) : '';
        }
    }

    // console.log(bytesToHex(signature));
    // console.log(walletId);
    // console.log(expireAt);
    // console.log(seqno);
    // console.log(sendMode);
    // console.log(bounce);
    // console.log(sourceAddress?.toString(true, true, true));
    // console.log(destAddress?.toString(true, true, true));
    // console.log(value.toNumber());
    // console.log(ihrFees);
    // console.log(fwdFees);
    // console.log(createdLt);
    // console.log(createdAt);
    // console.log(payload);

    return {
        toAddress: destAddress,
        value,
        bounce,
        seqno,
        expireAt,
        payload
    };
}

/**
 * @param cell {Cell}
 * @return {{seqno: number, bounce: boolean, payload: string, fromAddress: Address|null, expireAt: number, toAddress: Address, value: BN}}
 */
function parseWalletV3TransferQuery(cell) {
    const slice = cell.beginParse();

    // header

    if (slice.loadUint(2).toNumber() !== 2) throw Error('invalid header');

    const externalSourceAddress = slice.loadAddress();
    if (externalSourceAddress !== null) throw Error('invalid externalSourceAddress');

    const externalDestAddress = slice.loadAddress();

    const externalImportFee = slice.loadCoins();
    if (!externalImportFee.eq(new BN(0))) throw new Error('invalid externalImportFee');

    // stateInit

    if (slice.loadBit()) {
        if (slice.loadBit()) {
            slice.loadRef(); // don't parse stateInit
        }
    }

    // body

    const bodySlice = slice.loadBit() ? slice.loadRef() : slice;

    // console.log(externalSourceAddress);
    // console.log(externalDestAddress.toString(true, true, true));
    // console.log(externalImportFee);

    return {
        fromAddress: externalDestAddress,
        ...parseWalletV3TransferBody(bodySlice)
    };
}

module.exports = {parseWalletV3TransferQuery, parseWalletV3TransferBody};
