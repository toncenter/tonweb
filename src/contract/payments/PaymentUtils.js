const {Cell} = require("../../boc");

/**
 * @param cell  {Cell}
 * @param publicKey {Uint8Array}
 */
const writePublicKey = (cell, publicKey) => {
    if (publicKey.length !== 256 / 8) {
        throw new Error('invalid publicKey length');
    }
    cell.bits.writeBytes(publicKey);
}

/**
 * @param cell  {Cell}
 * @param signature {Uint8Array}
 */
const writeSignature = (cell, signature) => {
    if (signature.length !== 512 / 8) {
        throw new Error('invalid signature length');
    }
    cell.bits.writeBytes(signature);
}

/**
 * @param signature {Uint8Array}
 * @returns {Cell}
 */
const createSignatureCell = (signature) => {
    const cell = new Cell();
    writeSignature(cell, signature);
    return cell;
}

/**
 * @param cell  {Cell}
 * @param ref   {Cell}
 */
const writeMayBe = (cell, ref) => {
    if (ref) {
        cell.bits.writeBit(1);
        if (cell.refs.length >= 4) {
            throw new Error('refs overflow')
        }
        cell.refs.push(ref);
    } else {
        cell.bits.writeBit(0);
    }
}

/**
 * @param cell  {Cell}
 * @param ref   {Cell}
 */
const writeDict = writeMayBe;

const tag_init = 0x696e6974;
const tag_cooperative_close = 0x436c6f73;
const tag_cooperative_commit = 0x43436d74;
const tag_start_uncooperative_close = 0x556e436c;
const tag_challenge_state = 0x43686751;
const tag_settle_conditionals = 0x436c436e;
const tag_state = 0x43685374;

const op_top_up_balance = 1741148801; // crc32("top_up_balance add_A:Coins add_B:Coins = InternalMsgBody");
const op_init_channel = 235282626; // crc32("init_channel is_A:Bool signature:bits512 tag:# = tag 1768843636 channel_id:uint128 balance_A:Coins balance_B:Coins = InternalMsgBody");
const op_cooperative_close = 1433884798; // crc32("cooperative_close sig_A:^bits512 sig_B:^bits512 tag:# = tag 1131179891 channel_id:uint128 balance_A:Coins balance_B:Coins seqno_A:uint64 seqno_B:uint64 = InternalMsgBody");
const op_cooperative_commit = 2040604399; // crc32("cooperative_commit sig_A:^bits512 sig_B:^bits512 tag:# = tag 1128492404 channel_id:uint128 seqno_A:uint64 seqno_B:uint64 = InternalMsgBody");
const op_start_uncooperative_close = 521476815; // crc32("start_uncooperative_close signed_by_A:Bool signature:bits512 tag:# = tag 1433289580 channel_id:uint128 sch_A:^SignedSemiChannel sch_B:^SignedSemiChannel = InternalMsgBody");
const op_challenge_quarantined_state = 143567410; // crc32("challenge_quarantined_state challenged_by_A:Bool signature:bits512 tag:# = tag 1130915665 channel_id:uint128 sch_A:^SignedSemiChannel sch_B:^SignedSemiChannel = InternalMsgBody");
const op_settle_conditionals = 1727459433; // crc32("settle_conditionals from_A:Bool signature:bits512 tag:# = tag 1131168622 channel_id:uint128 conditionals_to_settle:HashmapE 32 Cell = InternalMsgBody");
const op_finish_uncooperative_close = 625158801; // crc32("finish_uncooperative_close = InternalMsgBody");
const op_channel_closed = -572749638; // crc32("channel_closed channel_id:uint128 = InternalMsgBody");

/**
 * @param params    {{coinsA: BN, coinsB: BN}}
 * @returns {Cell}
 */
const createTopUpBalance = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(op_top_up_balance, 32); // OP
    cell.bits.writeCoins(params.coinsA);
    cell.bits.writeCoins(params.coinsB);
    return cell;
}

/**
 * @param params    {{channelId: BN, balanceA: BN, balanceB: BN}}
 * @returns {Cell}
 */
const createInitChannelBody = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(tag_init, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.bits.writeCoins(params.balanceA);
    cell.bits.writeCoins(params.balanceB);
    return cell;
}

/**
 * @param params    {{channelId: BN, balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN}}
 * @returns {Cell}
 */
const createCooperativeCloseChannelBody = (params) => {
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
 * @param params    {{channelId: BN, seqnoA: BN, seqnoB: BN}}
 * @returns {Cell}
 */
const createCooperativeCommitBody = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(tag_cooperative_commit, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.bits.writeUint(params.seqnoA, 64);
    cell.bits.writeUint(params.seqnoB, 64);
    return cell;
}

/**
 * @param params    {{amount: BN, condition: Cell}} condition is code
 * @returns {Cell}
 */
const createConditionalPayment = (params) => {
    const cell = new Cell();
    cell.bits.writeCoins(params.amount);
    cell.writeCell(params.condition);
    return cell;
}

/**
 * @param params    {{seqno: BN, sentCoins: BN, conditionals: Cell | null}} conditionals - dictionary with uint32 keys and values created by `createConditionalPayment`
 * @returns {Cell}
 */
const createSemiChannelBody = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(params.seqno, 64); // body start
    cell.bits.writeCoins(params.sentCoins);
    writeDict(cell, params.conditionals);  // HashmapE 32 ConditionalPayment
    return cell;
}

/**
 * @param params    {{channelId: BN, semiChannelBody: Cell, counterpartySemiChannelBody?: Cell}} created by `createSemiChannelBody`
 * @returns {Cell}
 */
const createSemiChannelState = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(tag_state, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.writeCell(params.semiChannelBody);
    writeMayBe(cell, params.counterpartySemiChannelBody)
    return cell;
}

/**
 * @param params    {{signature: Uint8Array, state: Cell}}  `state` created by `createSemiChannelState`
 */
const createSignedSemiChannelState = (params) => {
    const cell = new Cell();
    writeSignature(cell, params.signature);
    cell.writeCell(params.state);
    return cell;
}

/**
 * @param params    {{channelId: BN, signedSemiChannelStateA: Cell, signedSemiChannelStateB: Cell}} `signedSemiChannelState` created by `createSignedSemiChannelState`
 * @returns {Cell}
 */
const createStartUncooperativeCloseBody = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(tag_start_uncooperative_close, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.refs[0] = params.signedSemiChannelStateA;
    cell.refs[1] = params.signedSemiChannelStateB;
    return cell;
}

/**
 * @param params    {{channelId: BN, signedSemiChannelStateA: Cell, signedSemiChannelStateB: Cell}} `signedSemiChannelState` created by `createSignedSemiChannelState`
 * @returns {Cell}
 */
const createChallengeQuarantinedStateBody = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(tag_challenge_state, 32);
    cell.bits.writeUint(params.channelId, 128);
    cell.refs[0] = params.signedSemiChannelStateA;
    cell.refs[1] = params.signedSemiChannelStateB;
    return cell;
}

/**
 * @param params    {{channelId: BN, conditionalsToSettle: Cell | null}} conditionalsToSettle - dictionary with uint32 keys and values created by `createConditionalPayment`
 * @returns {Cell}
 */
const createSettleConditionalsBody = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(tag_settle_conditionals, 32);
    cell.bits.writeUint(params.channelId, 128);
    writeDict(cell, params.conditionalsToSettle); // HashmapE 32 Cell
    return cell;
}

/**
 * @returns {Cell}
 */
const createFinishUncooperativeClose = () => {
    const cell = new Cell();
    cell.bits.writeUint(op_finish_uncooperative_close, 32); // OP
    return cell;
}

/**
 * @param params    {{op: number, isA: boolean, signature: Uint8Array, cell: Cell}}
 * @return {Cell}
 */
const createOneSignature = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(params.op, 32); // OP
    cell.bits.writeBit(params.isA);
    writeSignature(cell, params.signature);
    cell.writeCell(params.cell);
    return cell;
}

/**
 * @param params    {{op: number, signatureA: Uint8Array, signatureB: Uint8Array, cell: Cell}}
 * @return {Cell}
 */
const createTwoSignature = (params) => {
    const cell = new Cell();
    cell.bits.writeUint(params.op, 32); // OP
    cell.refs[0] = createSignatureCell(params.signatureA);
    cell.refs[1] = createSignatureCell(params.signatureB);
    cell.writeCell(params.cell);
    return cell;
}

module.exports = {
    writePublicKey,
    writeSignature,
    createSignatureCell,
    tag_init,
    tag_cooperative_close,
    tag_cooperative_commit,
    tag_start_uncooperative_close,
    tag_challenge_state,
    tag_settle_conditionals,
    tag_state,
    op_top_up_balance,
    op_init_channel,
    op_cooperative_close,
    op_cooperative_commit,
    op_start_uncooperative_close,
    op_challenge_quarantined_state,
    op_settle_conditionals,
    op_finish_uncooperative_close,
    op_channel_closed,
    createTopUpBalance,
    createInitChannelBody,
    createCooperativeCloseChannelBody,
    createCooperativeCommitBody,
    createConditionalPayment,
    createSemiChannelBody,
    createSemiChannelState,
    createSignedSemiChannelState,
    createStartUncooperativeCloseBody,
    createChallengeQuarantinedStateBody,
    createSettleConditionalsBody,
    createFinishUncooperativeClose,
    createOneSignature,
    createTwoSignature
};