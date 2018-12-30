import * as fs from "fs";
import { promisify } from "util";
import zlib from "zlib";
import { ICMap, parseCmapTable } from "./cmap";
import { parseLtagTable } from "./ltag";
import { INames, parseNameTable } from "./name";
import { getTag, getULong, getUShort } from "./parse";
interface ITableEntry {
  checkSum?: number;
  length: number;
  offset: number;
  compression: string | boolean;
  compressedLength?: number;
}
interface ITable {
  cmap?: ITableEntry;
  name?: ITableEntry;
  ltag?: ITableEntry;
}

function parseOpenTypeTableEntry(buf: Buffer, numTables: number) {
  let p = 12;
  const tableEntries: ITable = {};
  for (let i = 0; i < numTables; i++) {
    const tag = getTag(buf, p);
    const entry = {
      checkSum: getULong(buf, p + 4),
      compression: false,
      length: getULong(buf, p + 12),
      offset: getULong(buf, p + 8)
    };
    if (tag === "cmap") {
      tableEntries.cmap = entry;
    } else if (tag === "name") {
      tableEntries.name = entry;
    } else if (tag === "ltag") {
      tableEntries.ltag = entry;
    }
    p += 16;
  }
  return tableEntries;
}
function parseWOFFTableEntry(buf: Buffer, numTables: number) {
  let p = 44;
  const tableEntries: ITable = {};
  for (let i = 0; i < numTables; i += 1) {
    const tag = getTag(buf, p);
    const offset = getULong(buf, p + 4);
    const compLength = getULong(buf, p + 8);
    const origLength = getULong(buf, p + 12);
    let compression;
    if (compLength < origLength) {
      compression = "WOFF";
    } else {
      compression = false;
    }
    const entry = {
      compressedLength: compLength,
      compression,
      length: origLength,
      offset
    };
    if (tag === "cmap") {
      tableEntries.cmap = entry;
    } else if (tag === "name") {
      tableEntries.name = entry;
    } else if (tag === "ltag") {
      tableEntries.ltag = entry;
    }
    p += 20;
  }
  return tableEntries;
}
function uncompressTable(buf: Buffer, cmapEntry: ITableEntry) {
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
function parseBuffer(buf: Buffer) {
  const signature = getTag(buf, 0);
  let numTables: number;
  let tables: ITable;
  if (
    signature === String.fromCharCode(0, 1, 0, 0) ||
    signature === "true" ||
    signature === "typ1"
  ) {
    numTables = getUShort(buf, 4);
    tables = parseOpenTypeTableEntry(buf, numTables);
  } else if (signature === "OTTO") {
    numTables = getUShort(buf, 4);
    tables = parseOpenTypeTableEntry(buf, numTables);
  } else if (signature === "wOFF") {
    numTables = getUShort(buf, 12);
    tables = parseWOFFTableEntry(buf, numTables);
  } else {
    throw new Error("Unsupported OpenType signature" + signature);
  }
  if (tables.cmap == null || tables.name == null) {
    throw new Error("Unsupported Font");
  }
  const cmapTableUn = uncompressTable(buf, tables.cmap);
  // tslint:disable-next-line:variable-name
  const cmapTable = parseCmapTable(cmapTableUn.buffer, cmapTableUn.offset);
  let ltagTable = null;
  if (tables.ltag) {
    const ltagTableUn = uncompressTable(buf, tables.ltag);
    ltagTable = parseLtagTable(ltagTableUn.buffer, ltagTableUn.offset);
  }

  const namesTableUn = uncompressTable(buf, tables.name);
  const namesTable: INames = parseNameTable(
    namesTableUn.buffer,
    namesTableUn.offset,
    ltagTable
  );
  return {
    cmap: cmapTable,
    namesTable
  };
}
export function loadInfo(
  fontPath: string,
  callback?: (
    err: Error | null,
    info: null | { cmap: ICMap; namesTable: INames }
  ) => void
) {
  if (callback) {
    fs.readFile(fontPath, (err, buf) => {
      if (err) {
        callback(err, null);
      } else {
        try {
          // tslint:disable-next-line:variable-name
          const info = parseBuffer(buf);
          console.log(info);
          callback(null, info);
        } catch (err) {
          callback(err, null);
        }
      }
    });
  } else {
    const readFileAsync = promisify(fs.readFile);
    // tslint:disable-next-line:arrow-parens
    return readFileAsync(fontPath).then(buf => {
      return parseBuffer(buf);
    });
  }
}
export function loadInfoSync(fontPath: string) {
  const buffer = fs.readFileSync(fontPath);
  return parseBuffer(buffer);
}
export type CMap = ICMap;
