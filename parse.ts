export function getUShort(buffer: Buffer, offset: number) {
  return buffer.readUInt16BE(offset);
}
export function getTag(buffer: Buffer, offset: number) {
  let tag = "";
  for (let i = offset; i < offset + 4; i++) {
    tag += String.fromCharCode(buffer.readInt8(i));
  }
  return tag;
}
export function getULong(buffer: Buffer, offset: number) {
  return buffer.readUInt32BE(offset);
}
interface ITypeOffset {
  [x: string]: number;
}
const typeOffsets: ITypeOffset = {
  byte: 1,
  fixed: 4,
  longDateTime: 8,
  short: 2,
  tag: 4,
  uLong: 4,
  uShort: 2
};
export class Parser {
  public offset: number;
  public relativeOffset: number;
  private data: Buffer;
  constructor(data: Buffer, offset: number) {
    this.data = data;
    this.offset = offset;
    this.relativeOffset = 0;
  }
  public parseByte() {
    const v = this.data.readUInt8(this.offset + this.relativeOffset);
    this.relativeOffset += 1;
    return v;
  }
  public parseChar() {
    const v = this.data.readInt8(this.offset + this.relativeOffset);
    this.relativeOffset += 1;
    return v;
  }
  public parseUShort() {
    const v = getUShort(this.data, this.offset + this.relativeOffset);
    this.relativeOffset += 2;
    return v;
  }
  public parseShort() {
    const v = this.data.readInt16BE(this.offset + this.relativeOffset);
    this.relativeOffset += 2;
    return v;
  }
  public parseULong() {
    const v = getULong(this.data, this.offset + this.relativeOffset);
    this.relativeOffset += 4;
    return v;
  }
  public skip(type: string, amount: number) {
    if (amount === undefined) {
      amount = 1;
    }

    this.relativeOffset += (typeOffsets[type] || 0) * amount;
  }
}
