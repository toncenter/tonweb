/**
 * TON message send mode flags.
 * Can be combined using bitwise OR (|).
 *
 * @see https://docs.ton.org/develop/smart-contracts/messages#message-modes
 *
 * @example
 * const {SendMode} = require('tonweb');
 *
 * // Send with separate fee payment + ignore errors
 * const mode = SendMode.PAY_GAS_SEPARATELY | SendMode.IGNORE_ERRORS; // = 3
 *
 * // Carry all remaining balance
 * const modeCarryAll = SendMode.CARRY_ALL_REMAINING_BALANCE; // = 128
 */
const SendMode = {
    /**
     * Ordinary message — pay transfer fees from the message value.
     * The message value is reduced by fees.
     */
    ORDINARY: 0,

    /**
     * Pay transfer fees separately from the sender's balance (not from message value).
     * @value 1
     */
    PAY_GAS_SEPARATELY: 1,

    /**
     * Ignore any errors arising while processing this message during the action phase.
     * @value 2
     */
    IGNORE_ERRORS: 2,

    /**
     * Most common combination: pay gas separately + ignore errors.
     * Equivalent to `PAY_GAS_SEPARATELY | IGNORE_ERRORS`.
     * @value 3
     */
    PAY_GAS_SEPARATELY_AND_IGNORE_ERRORS: 3,

    /**
     * Send all remaining value of the inbound message in addition to the value specified.
     * @value 64
     */
    CARRY_ALL_REMAINING_INCOMING_VALUE: 64,

    /**
     * Carry all remaining balance of the current smart contract instead of the value specified.
     * Used to empty a wallet entirely.
     * @value 128
     */
    CARRY_ALL_REMAINING_BALANCE: 128,

    /**
     * Destroy the account if its resulting balance is zero (after sending this message).
     * @value 32
     */
    DESTROY_IF_ZERO: 32,
};

module.exports = { SendMode };
