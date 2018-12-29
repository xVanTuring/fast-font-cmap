import * as fs from "fs";
import zlib from "zlib";
import { ICMap, parseCmapTable } from "./cmap";
import { getTag, getULong, getUShort } from "./parse";
interface ICMapEntry {
  checkSum?: number;
  length: number;
  offset: number;
  compression: string | boolean;
  compressedLength?: number;
}
function parseOpenTypeCMapEntry(buf: Buffer, numTables: number): ICMapEntry {
  let p = 12;
  for (let i = 0; i < numTables; i++) {
    const tag = getTag(buf, p);
    if (tag === "cmap") {
      return {
        checkSum: getULong(buf, p + 4),
        compression: false,
        length: getULong(buf, p + 12),
        offset: getULong(buf, p + 8)
      };
    }
    p += 16;
  }
  throw new Error("No Cmap Founded");
}
function parseWOFFCMapEntry(buf: Buffer, numTables: number) {
  let p = 44;
  for (let i = 0; i < numTables; i += 1) {
    const tag = getTag(buf, p);
    if (tag === "cmap") {
      const offset = getULong(buf, p + 4);
      const compLength = getULong(buf, p + 8);
      const origLength = getULong(buf, p + 12);
      let compression;
      if (compLength < origLength) {
        compression = "WOFF";
      } else {
        compression = false;
      }
      return {
        compressedLength: compLength,
        compression,
        length: origLength,
        offset
      };
    }
    p += 20;
  }
  throw new Error("No Cmap Founded");
}
function uncompressTable(buf: Buffer, cmapEntry: ICMapEntry) {
  if (cmapEntry.compression === "WOFF") {
    const inBuffer = buf.slice(
      cmapEntry.offset,
      cmapEntry.offset + cmapEntry.compressedLength!
    );

    try {
      const outBuffer = zlib.inflateSync(inBuffer);
      if (outBuffer.length !== cmapEntry.length) {
        throw new Error("Wrong Position");
      }
      return { buffer: outBuffer, offset: 0 };
    } catch (error) {
      throw error;
    }
  } else {
    return { buffer: buf, offset: cmapEntry.offset };
  }
}
export function loadCMap(
  fontPath: string,
  callback: (err: any, cmap: ICMap | null) => void
) {
  fs.readFile(fontPath, (err, buf) => {
    if (err) {
      callback(err, null);
    } else {
      const signature = getTag(buf, 0);
      let numTables: number;
      let cmapEntry: ICMapEntry;
      if (
        signature === String.fromCharCode(0, 1, 0, 0) ||
        signature === "true" ||
        signature === "typ1"
      ) {
        numTables = getUShort(buf, 4);
        cmapEntry = parseOpenTypeCMapEntry(buf, numTables);
      } else if (signature === "OTTO") {
        numTables = getUShort(buf, 4);
        cmapEntry = parseOpenTypeCMapEntry(buf, numTables);
      } else if (signature === "wOFF") {
        numTables = getUShort(buf, 12);
        cmapEntry = parseWOFFCMapEntry(buf, numTables);
      } else {
        callback(new Error("Unsupported OpenType signature" + signature), null);
        return;
      }
      try {
        const table = uncompressTable(buf, cmapEntry);
        // tslint:disable-next-line:variable-name
        const _cmap = parseCmapTable(table.buffer, table.offset);
        callback(null, _cmap);
      } catch (error) {
        callback(error, null);
      }
    }
  });
}
