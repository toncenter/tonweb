const BIT_NUMBER_SIZE = 10n; // 10 bit
const SHIFT_SIZE = 13n; // 13 bit
const MAX_BIT_NUMBER = 1022n;
const MAX_SHIFT = 8191n; // 2^13 = 8192

class HighloadQueryId {
    constructor() {
        /**
         * @private
         * @type {bigint} [0 .. 8191]
         */
        this.shift = 0n;
        /**
         * @private
         * @type {bigint} [0 .. 1022]
         */
        this.bitnumber = 0n;
    }

    /**
     * @param shift {bigint}
     * @param bitnumber {bigint}
     * @return {HighloadQueryId}
     */
    static fromShiftAndBitNumber(shift, bitnumber) {
        const q = new HighloadQueryId();
        q.shift = shift;
        if (q.shift < 0) throw new Error('invalid shift');
        if (q.shift > MAX_SHIFT) throw new Error('invalid shift');
        q.bitnumber = bitnumber;
        if (q.bitnumber < 0) throw new Error('invalid bitnumber');
        if (q.bitnumber > MAX_BIT_NUMBER) throw new Error('invalid bitnumber');
        return q;
    }

    getNext() {
        let newBitnumber = this.bitnumber + 1n;
        let newShift = this.shift;

        if (newShift === MAX_SHIFT && newBitnumber > (MAX_BIT_NUMBER - 1n)) {
            throw new Error('Overload'); // NOTE: we left one queryId for emergency withdraw
        }

        if (newBitnumber > MAX_BIT_NUMBER) {
            newBitnumber = 0n;
            newShift += 1n;
            if (newShift > MAX_SHIFT) {
                throw new Error('Overload')
            }
        }

        return HighloadQueryId.fromShiftAndBitNumber(newShift, newBitnumber);
    }

    hasNext() {
        const isEnd = this.bitnumber >= (MAX_BIT_NUMBER - 1n) && this.shift === MAX_SHIFT; // NOTE: we left one queryId for emergency withdraw;
        return !isEnd;
    }

    /**
     * @return {bigint}
     */
    getShift() {
        return this.shift;
    }

    /**
     * @return {bigint}
     */
    getBitNumber() {
        return this.bitnumber;
    }

    /**
     * @return {bigint}
     */
    getQueryId() {
        return (this.shift << BIT_NUMBER_SIZE) + this.bitnumber;
    }

    /**
     * @param queryId   {bigint}
     * @return {HighloadQueryId}
     */
    static fromQueryId(queryId) {
        const shift = queryId >> BIT_NUMBER_SIZE;
        const bitnumber = queryId & 1023n;
        return this.fromShiftAndBitNumber(shift, bitnumber);
    }

    /**
     * @param i {bigint}
     * @return {HighloadQueryId}
     */
    static fromSeqno(i) {
        const shift = i / 1023n;
        const bitnumber = i % 1023n;
        return this.fromShiftAndBitNumber(shift, bitnumber);
    }

    /**
     * @return {bigint} [0 .. 8380415]
     */
    toSeqno() {
        return this.bitnumber + this.shift * 1023n;
    }
}

module.exports = {HighloadQueryId};
