class BufferReader {
  /**
   * @param {Buffer} buf
   * @param {boolean} [big] endiasnness
   * @param {number} [off]
   */
  constructor(buf, big = true, off = 0) {
    this.buf = buf;
    this.big = big;
    this.off = off;
  }

  /**
   * @param {number} len
   */
  skip(len) {
    this.off += len;
    return this;
  }

  /**
   * @param {number} pos
   */
  seek(pos) {
    this.off = pos;
    return this;
  }

  uint8() {
    const val = this.buf.readUInt8(this.off);
    this.off += 1;
    return val;
  }

  uint16() {
    const val = this.big
      ? this.buf.readUInt16BE(this.off)
      : this.buf.readUInt16LE(this.off);

    this.off += 2;
    return val;
  }

  uint32() {
    const val = this.big
      ? this.buf.readUInt32BE(this.off)
      : this.buf.readUInt32LE(this.off);

    this.off += 4;
    return val;
  }

  /**
   * @param {number} len
   */
  lstring(len, encoding = 'utf8') {
    const end = this.off + len;
    const val = this.buf.toString(encoding, this.off, end);
    this.off = end;
    return val;
  }

  /**
   * @param {number} len
   */
  blob(len) {
    const end = this.off + len;
    const val = this.buf.slice(this.off, end);
    this.off = end;
    return val;
  }
}

export default BufferReader;
