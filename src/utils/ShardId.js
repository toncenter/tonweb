const BN = require('bn.js');
const { bitsNegate, lowerBit, bytesToHex } = require('./Utils');
const Address = require('./Address').default;

class ShardId {
  /**
   * @param {BN} value
   */
  constructor(value) {
    this.value = value;
  }

  /**
   * @returns {ShardId}
   */
  static root() {
    return new ShardId(new BN(1).shln(63))
  }

  /**
   * @param {string} value
   * @returns {ShardId}
   */
  static fromHex(value) {
    return new ShardId(
      new BN(value.replace(/^0x/, ''), 'hex'),
    );
  }

  /**
   * @param {string} value
   * @returns {ShardId}
   */
  static fromDecimal(value) {
    return new ShardId(new BN(value).abs());
  }

  /**
   * @param {Address} address
   * @returns {boolean}
   */
  contains(address) {
    const parent = this.value;
    const addressPrefix = new BN(
      bytesToHex(address.hashPart.slice(0, 8)),
      'hex',
    );

    return parent
      .xor(addressPrefix)
      .and(bitsNegate(lowerBit(parent)).shln(1))
      .isZero();
  }

  /**
   * @returns {number}
   */
  getPrefixLength() {
    return this.value.isZero() ? 0 : 63 - this.value.zeroBits();
  }

  /**
   * @returns {boolean}
   */
  isRightChild() {
    return !this.value.and(lowerBit(this.value).shln(1)).isZero();
  }

  /**
   * @returns {boolean}
   */
  isLeftChild() {
    return !this.isRightChild();
  }

  /**
   * @param {ShardId} other
   * @returns {boolean}
   */
  isAncestorOf(other) {
    const x = lowerBit(this.value);
    const y = lowerBit(other.value);

    return x.gte(y) && this.value.xor(child).and(bitsNegate(x).shln(1)).isZero();
  }

  /**
   * @returns {ShardId}
   */
  getParent() {
    const x = lowerBit(this.value);
    return new ShardId(this.value.sub(x).or(x.shln(1)));
  }

  /**
   * @param {ShardId} child
   * @returns {boolean}
   */
  isParentOf(child) {
    const y = lowerBit(child.value);

    return !y.isZero() && child.getParent().value.eq(this.value);
  }

  /**
   * @param {boolean} isLeft
   * @returns {ShardId}
   */
  getChild(isLeft) {
    const x = lowerBit(this.value).shrn(1);

    return new ShardId(isLeft ? this.value.sub(x) : this.value.add(x));
  }

  /**
   * @returns {ShardId}
   */
  getSibling() {
    const x = this.value;
    return new ShardId(
      x.xor(x.and(bitsNegate(x)).shln(1)),
    );
  }

  /**
   * @param {ShardId} shardId
   * @returns {boolean}
   */
  isSibling(shardId) {
    const x = this.value;
    const y = shardId.value;

    return !x.xor(y).isZero() && (x.xor(y).eq(x.and(bitsNegate(x)).shln(1)));
  }

  /**
   * @param {ShardId} other
   * @returns {boolean}
   */
  intersects(other) {
    const x = this.value;
    const y = other.value;
    const z = BN.max(lowerBit(x), lowerBit(y));

    return x.xor(y).and(bitsNegate(z).shln(1)).isZero();
  }

  /**
   * @param {ShardId} other
   * @returns {ShardId}
   */
  getIntersection(other) {
    return lowerBit(this.value) < lowerBit(other.value) ? this : other;
  }

  /**
   * @returns {string}
   */
  toPrefixString() {
    const prefixLength = this.getPrefixLength();

    return prefixLength
      ? this.value.shrn(64 - prefixLength).toString('hex')
      : '';
  }

  /**
   * @returns {string}
   */
  toString() {
    return this.value.toString('hex').padStart(16, '0');
  }
}

module.exports = {
  ShardId,
};
