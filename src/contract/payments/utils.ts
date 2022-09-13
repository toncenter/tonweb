
import BN from 'bn.js';

import { Cell } from '../../boc/cell/cell';

import {
    op_finish_uncooperative_close,
    op_top_up_balance,
    tag_challenge_state,
    tag_cooperative_close,
    tag_cooperative_commit,
    tag_init,
    tag_settle_conditionals,
    tag_start_uncooperative_close,
    tag_state,

} from './consts';


/**
 * Writes the specified public key (in bytes) to the
 * specified cell.
 *
 * @param cell - A cell to write public key to.
 * @param publicKey - A 32 bytes public key to write.
 *
 * @todo move this to CellBuilder
 */
export function writePublicKey(
    cell: Cell,
    publicKey: Uint8Array

): void {

    if (publicKey.length !== (256 / 8)) {
        throw new Error('Invalid public key length');
    }

    cell.bits.writeBytes(publicKey);

}

/**
 * Writes the specified signature (in bytes) to the
 * specified cell.
 *
 * @param cell - A cell to write signature to.
 * @param signature - A 64 bytes signature to write.
 *
 * @todo move this to CellBuilder
 */
export function writeSignature(
    cell: Cell,
    signature: Uint8Array

): void {

    if (signature.length !== (512 / 8)) {
        throw new Error('Invalid signature length');
    }

    cell.bits.writeBytes(signature);

}

/**
 * Creates a cell that holds the specified signature (in bytes).
 *
 * @param signature - A 64 bytes signature to create cell from.
 *
 * @todo make this a static method of the Cell, e.g. fromSignature()
 */
export function createSignatureCell(
    signature: Uint8Array

): Cell {

    const cell = new Cell();

    writeSignature(cell, signature);

    return cell;

}

/**
 * Creates a cell representing a balance top-up operation.
 *
 * @param params.coinsA - "A" party number of coins.
 * @param params.coinsB - "B" party number of coins.
 */
export function createTopUpBalance(params: {
    coinsA: BN;
    coinsB: BN;

}): Cell {

    const { coinsA, coinsB } = params;

    const cell = new Cell();

    // Operation ID
    cell.bits.writeUint(op_top_up_balance, 32);

    cell.bits.writeCoins(coinsA);
    cell.bits.writeCoins(coinsB);

    return cell;

}

/**
 * Creates a cell for channel initialization body.
 *
 * @param params.channelId - A channel ID.
 * @param params.balanceA - "A" party balance of coins.
 * @param params.balanceB - "B" party balance of coins.
 */
export function createInitChannelBody(params: {
    channelId: BN;
    balanceA: BN;
    balanceB: BN;

}): Cell {

    const cell = new Cell();

    cell.bits.writeUint(tag_init, 32);

    cell.bits.writeUint(params.channelId, 128);

    cell.bits.writeCoins(params.balanceA);
    cell.bits.writeCoins(params.balanceB);

    return cell;

}

/**
 * Creates a cell for cooperative channel close body.
 *
 * @param params.channelId - A channel ID.
 * @param params.balanceA - "A" party balance of coins.
 * @param params.balanceB - "B" party balance of coins.
 * @param params.seqnoA - A sequence number for "A" party.
 * @param params.seqnoB - A sequence number for "B" party.
 */
export function createCooperativeCloseChannelBody(params: {
    channelId: BN;
    balanceA: BN;
    balanceB: BN;
    seqnoA: BN;
    seqnoB: BN;

}): Cell {

    const cell = new Cell();

    cell.bits.writeUint(tag_cooperative_close, 32);

    cell.bits.writeUint(params.channelId, 128);

    cell.bits.writeCoins(params.balanceA);
    cell.bits.writeCoins(params.balanceB);

    cell.bits.writeUint(params.seqnoA, 64);
    cell.bits.writeUint(params.seqnoB, 64);

    return cell;

}

/**
 * Creates a cell for cooperative commit body.
 *
 * @param params.channelId - A channel ID.
 * @param params.seqnoA - A sequence number for "A" party.
 * @param params.seqnoB - A sequence number for "B" party.
 */
export function createCooperativeCommitBody(params: {
    channelId: BN;
    seqnoA: BN;
    seqnoB: BN;

}): Cell {

    const cell = new Cell();

    cell.bits.writeUint(tag_cooperative_commit, 32);

    cell.bits.writeUint(params.channelId, 128);

    cell.bits.writeUint(params.seqnoA, 64);
    cell.bits.writeUint(params.seqnoB, 64);

    return cell;

}

/**
 * Creates a cell with conditional payment.
 *
 * @param params.amount - An amount of coins.
 * @param params.condition - A code.
 */
export function createConditionalPayment(params: {
    amount: BN;
    condition: Cell;

}): Cell {

    const cell = new Cell();

    cell.bits.writeCoins(params.amount);

    cell.writeCell(params.condition);

    return cell;

}

/**
 * Creates a cell fo semi-channel body.
 *
 * @param params.seqno - A sequence number.
 *
 * @param params.sentCoins - A number of coins sent.
 *
 * @param params.conditionals - Dictionary with uint32 keys
 *                              and values created by
 *                              `createConditionalPayment`.
 */
export function createSemiChannelBody(params: {
    seqno: BN;
    sentCoins: BN;
    conditionals?: (Cell | null);

}): Cell {

    const cell = new Cell();

    // Body start
    cell.bits.writeUint(params.seqno, 64);

    cell.bits.writeCoins(params.sentCoins);

    // HashmapE 32 ConditionalPayment
    writeDict(cell, params.conditionals);

    return cell;

}

/**
 * Creates a cell representing a semi-channel state.
 *
 * @param params.channelId - A channel ID.
 *
 * @param params.semiChannelBody - A semi-channel body Cell created by
 *                                 `createSemiChannelBody()`.

 * @param params.counterpartySemiChannelBody - An optional counterparty
 *                                             semi-channel body Cell created by
 *                                            `createSemiChannelBody()`.
 */
export function createSemiChannelState(params: {
    channelId: BN;
    semiChannelBody: Cell;
    counterpartySemiChannelBody?: Cell;

}): Cell {

    const cell = new Cell();

    cell.bits.writeUint(tag_state, 32);
    cell.bits.writeUint(params.channelId, 128);

    cell.writeCell(params.semiChannelBody);

    writeMayBe(cell, params.counterpartySemiChannelBody);

    return cell;

}

/**
 * Creates a cell representing a signed semi-channel state.
 *
 * @param params.signature - A 64 bytes signature.
 *
 * @param params.state - A `state` created by
 *                       `createSemiChannelState()`.
 */
export function createSignedSemiChannelState(params: {
    signature: Uint8Array;
    state: Cell;

}): Cell {

    const cell = new Cell();

    writeSignature(cell, params.signature);

    cell.writeCell(params.state);

    return cell;

}

/**
 * Creates a cell for uncooperative close body.
 *
 * @param params.channelId - A channel ID.
 *
 * @param params.signedSemiChannelStateA - A signed semi-channel state created
 *                                         by `createSignedSemiChannelState()`.
 *
 * @param params.signedSemiChannelStateB - A signed semi-channel state created
 *                                         by `createSignedSemiChannelState()`.
 */
export function createStartUncooperativeCloseBody(params: {
    channelId: BN;
    signedSemiChannelStateA: Cell;
    signedSemiChannelStateB: Cell;

}): Cell {

    const cell = new Cell();

    cell.bits.writeUint(tag_start_uncooperative_close, 32);
    cell.bits.writeUint(params.channelId, 128);

    cell.refs[0] = params.signedSemiChannelStateA;
    cell.refs[1] = params.signedSemiChannelStateB;

    return cell;

}

/**
 * Creates a cell for quarantined state challenge body.
 *
 * @param params.channelId - A channel ID.
 *
 * @param params.signedSemiChannelStateA - A signed semi-channel state created
 *                                         by `createSignedSemiChannelState()`.
 *
 * @param params.signedSemiChannelStateB - A signed semi-channel state created
 *                                         by `createSignedSemiChannelState()`.
 */
export function createChallengeQuarantinedStateBody(params: {
    channelId: BN;
    signedSemiChannelStateA: Cell;
    signedSemiChannelStateB: Cell;

}): Cell {

    const cell = new Cell();

    cell.bits.writeUint(tag_challenge_state, 32);
    cell.bits.writeUint(params.channelId, 128);

    cell.refs[0] = params.signedSemiChannelStateA;
    cell.refs[1] = params.signedSemiChannelStateB;

    return cell;

}

/**
 * Creates a cell for settle conditionals body.
 *
 * @param params.channelId - A channel ID.
 *
 * @param params.conditionalsToSettle - An optional dictionary with uint32 keys
 *                                      and values created by
 *                                      `createConditionalPayment()`.
 */
export function createSettleConditionalsBody(params: {
    channelId: BN;
    conditionalsToSettle?: (Cell | null);

}): Cell {

    const cell = new Cell();

    cell.bits.writeUint(tag_settle_conditionals, 32);
    cell.bits.writeUint(params.channelId, 128);

    // HashmapE 32 Cell
    writeDict(cell, params.conditionalsToSettle);

    return cell;

}

/**
 * Creates a cell representing finish uncooperative
 * close operation.
 */
export function createFinishUncooperativeClose(): Cell {

    const cell = new Cell();

    // Operation ID
    cell.bits.writeUint(op_finish_uncooperative_close, 32);

    return cell;

}

/**
 * Creates a cell representing a single signature.
 *
 * @param params.op - An operation ID.
 *
 * @param params.isA - Whether the party is "A" or "B".
 *
 * @param params.signature - A 64 bytes signature of the
 *                           specified party.
 *
 * @param params.cell - A cell to write.
 */
export function createOneSignature(params: {
    op: number;
    isA: boolean;
    signature: Uint8Array;
    cell: Cell;

}): Cell {

    const cell = new Cell();

    // Operation ID
    cell.bits.writeUint(params.op, 32);

    cell.bits.writeBit(params.isA);

    writeSignature(cell, params.signature);

    cell.writeCell(params.cell);

    return cell;

}

/**
 * Creates a cell representing two signatures of both parties.
 *
 * @param params.op - An operation ID.
 *
 * @param params.signatureA - A 64 bytes signature of
 *                            the "A" party.
 *
 * @param params.signatureB - A 64 bytes signature of the
 *                            "B" party.
 *
 * @param params.cell - A cell to write.
 */
export function createTwoSignature(params: {
    op: number;
    signatureA: Uint8Array;
    signatureB: Uint8Array;
    cell: Cell;

}): Cell {

    const cell = new Cell();

    // Operation ID
    cell.bits.writeUint(params.op, 32);

    cell.refs[0] = createSignatureCell(params.signatureA);
    cell.refs[1] = createSignatureCell(params.signatureB);

    cell.writeCell(params.cell);

    return cell;

}


//===================//
// PRIVATE FUNCTIONS //
//===================//

/**
 * @internal
 *
 * Writes the specified reference cell to the specified cell,
 * or writes a single zero bit to indicate that the reference
 * cell is missing when it's not specified.
 *
 * @param cell - A cell to write reference cell.
 * @param refCell - A reference cell to write.
 */
function writeMayBe(
    cell: Cell,
    refCell?: Cell

): void {

    if (refCell) {
        if (cell.refs.length >= 4) {
            throw new Error('Cell references overflow');
        }
        cell.bits.writeBit(1);
        cell.refs.push(refCell);

    } else {
        cell.bits.writeBit(0);

    }

}

/**
 * @internal
 *
 * An alias for `writeMayBe()`.
 */
const writeDict = writeMayBe;
