/**
 * BoundedCache wraps a standard Map and enforces a maximum size.
 * When the limit is exceeded, it evicts the oldest entry (FIFO).
 */
class BoundedCache extends Map {
  constructor(maxSize) {
    super();
    this.maxSize = maxSize;
  }

  set(key, value) {
    super.set(key, value);
    if (this.size > this.maxSize) {
      const oldestKey = this.keys().next().value;
      this.delete(oldestKey);
    }
    return this;
  }
}

module.exports = { BoundedCache };
