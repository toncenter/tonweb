
export const tag_init = 0x696e6974;
export const tag_cooperative_close = 0x436c6f73;
export const tag_cooperative_commit = 0x43436d74;
export const tag_start_uncooperative_close = 0x556e436c;
export const tag_challenge_state = 0x43686751;
export const tag_settle_conditionals = 0x436c436e;
export const tag_state = 0x43685374;

/**
 * crc32("
 *   top_up_balance
 *     add_A:Coins
 *     add_B:Coins
 *   = InternalMsgBody
 * ");
 */
export const op_top_up_balance = 1741148801;

/**
 * crc32("
 *   init_channel
 *     is_A:Bool
 *     signature:bits512
 *     tag:# = tag 1768843636
 *     channel_id:uint128
 *     balance_A:Coins
 *     balance_B:Coins
 *   = InternalMsgBody
 * ");
 */
export const op_init_channel = 235282626;

/**
 * crc32("
 *   cooperative_close
 *     sig_A:^bits512
 *     sig_B:^bits512
 *     tag:# = tag 1131179891
 *     channel_id:uint128
 *     balance_A:Coins
 *     balance_B:Coins
 *     seqno_A:uint64
 *     seqno_B:uint64
 *   = InternalMsgBody
 * ");
 */
export const op_cooperative_close = 1433884798;

/**
 * crc32("
 *   cooperative_commit
 *     sig_A:^bits512
 *     sig_B:^bits512
 *     tag:# = tag 1128492404
 *     channel_id:uint128
 *     seqno_A:uint64
 *     seqno_B:uint64
 *   = InternalMsgBody
 * ");
 */
export const op_cooperative_commit = 2040604399;

/**
 * crc32("
 *   start_uncooperative_close
 *     signed_by_A:Bool
 *     signature:bits512
 *     tag:# = tag 1433289580
 *     channel_id:uint128
 *     sch_A:^SignedSemiChannel
 *     sch_B:^SignedSemiChannel
 *   = InternalMsgBody
 * ");
 */
export const op_start_uncooperative_close = 521476815;

/**
 * crc32("
 *   challenge_quarantined_state
 *     challenged_by_A:Bool
 *     signature:bits512
 *     tag:# = tag 1130915665
 *     channel_id:uint128
 *     sch_A:^SignedSemiChannel
 *     sch_B:^SignedSemiChannel
 *   = InternalMsgBody
 * ");
 */
export const op_challenge_quarantined_state = 143567410;

/**
 * crc32("
 *   settle_conditionals
 *     from_A:Bool
 *     signature:bits512
 *     tag:# = tag 1131168622
 *     channel_id:uint128
 *     conditionals_to_settle:HashmapE 32 Cell
 *   = InternalMsgBody
 * ");
 */
export const op_settle_conditionals = 1727459433;

/**
 * crc32("
 *   finish_uncooperative_close = InternalMsgBody
 * ");
 */
export const op_finish_uncooperative_close = 625158801;

/**
 * crc32("
 *   channel_closed channel_id:uint128 = InternalMsgBody
 * ");
 */
export const op_channel_closed = -572749638;
