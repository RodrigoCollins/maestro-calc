import { brotliDecompressSync } from 'node:zlib';
import { problem } from './types.ts';
import type { Problem } from './types.ts';

/** The nine Spanish code points every font file must cover (site-shell › [SS10]): ¡ ¿ á é í ñ ó ú ü. */
export const SPANISH_CODE_POINTS = [
  0x00a1, 0x00bf, 0x00e1, 0x00e9, 0x00ed, 0x00f1, 0x00f3, 0x00fa, 0x00fc,
] as const;

const HEADER_BYTES = 48;
/** `numTables` (u16) follows signature, flavor and length (4 + 4 + 4 bytes). */
const NUM_TABLES_AT = 12;
/**
 * `totalCompressedSize` (u32): after `numTables` (2 bytes), the 2 reserved bytes that follow it
 * and `totalSfntSize` (4 bytes), so 12 + 2 + 2 + 4.
 */
const COMPRESSED_SIZE_AT = 20;
const SIGNATURE = 0x774f4632; // "wOF2"
const ARBITRARY_TAG = 63;

/** The 63 table tags a WOFF2 directory entry can name by index (WOFF2 specification, 5.1). */
const KNOWN_TAGS = [
  'cmap',
  'head',
  'hhea',
  'hmtx',
  'maxp',
  'name',
  'OS/2',
  'post',
  'cvt ',
  'fpgm',
  'glyf',
  'loca',
  'prep',
  'CFF ',
  'VORG',
  'EBDT',
  'EBLC',
  'gasp',
  'hdmx',
  'kern',
  'LTSH',
  'PCLT',
  'VDMX',
  'vhea',
  'vmtx',
  'BASE',
  'GDEF',
  'GPOS',
  'GSUB',
  'EBSC',
  'JSTF',
  'MATH',
  'CBDT',
  'CBLC',
  'COLR',
  'CPAL',
  'SVG ',
  'sbix',
  'acnt',
  'avar',
  'bdat',
  'bloc',
  'bsln',
  'cvar',
  'fdsc',
  'feat',
  'fmtx',
  'fvar',
  'gvar',
  'hsty',
  'just',
  'lcar',
  'mort',
  'morx',
  'opbd',
  'prop',
  'trak',
  'Zapf',
  'Silf',
  'Glat',
  'Gloc',
  'Feat',
  'Sill',
] as const;

/** A cursor over bytes that fails loudly instead of reading past the end. */
class Reader {
  position: number;
  readonly bytes: Uint8Array;
  readonly view: DataView;
  readonly overrun: string;

  constructor(bytes: Uint8Array, start = 0, overrun = 'unexpected end of data') {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.position = start;
    this.overrun = overrun;
  }

  private take(count: number): number {
    if (this.position + count > this.bytes.length) throw new Error(this.overrun);
    const at = this.position;
    this.position += count;
    return at;
  }

  u8(): number {
    return this.view.getUint8(this.take(1));
  }

  u16(): number {
    return this.view.getUint16(this.take(2));
  }

  u32(): number {
    return this.view.getUint32(this.take(4));
  }

  tag(): string {
    const at = this.take(4);
    return String.fromCharCode(...this.bytes.subarray(at, at + 4));
  }

  /** A UIntBase128 number: big-endian groups of seven bits, at most five bytes, no leading zero. */
  base128(): number {
    let value = 0;
    for (let index = 0; index < 5; index += 1) {
      const byte = this.u8();
      if (index === 0 && byte === 0x80) throw new Error('invalid UIntBase128 (leading zero)');
      if (value > 0x1ffffff) throw new Error('invalid UIntBase128 (overflow)');
      value = value * 128 + (byte & 0x7f);
      if ((byte & 0x80) === 0) return value;
    }
    throw new Error('invalid UIntBase128 (longer than five bytes)');
  }
}

/**
 * The tables of a WOFF2 file by tag. A transformed table (`glyf`, `loca`) keeps its stored,
 * transformed bytes; `cmap` is never transformed, which is all the glyph check reads.
 */
export const readWoff2Tables = (file: Uint8Array): Map<string, Uint8Array> => {
  if (file.length < HEADER_BYTES) throw new Error('truncated WOFF2 header');
  const header = new Reader(file);
  if (header.u32() !== SIGNATURE) throw new Error('not a WOFF2 file');
  header.position = NUM_TABLES_AT;
  const count = header.u16();
  header.position = COMPRESSED_SIZE_AT;
  const compressedSize = header.u32();

  const directory = new Reader(file, HEADER_BYTES, 'truncated WOFF2 table directory');
  const entries = Array.from({ length: count }, () => {
    const flags = directory.u8();
    const index = flags & 0x3f;
    const tag = index === ARBITRARY_TAG ? directory.tag() : String(KNOWN_TAGS[index]);
    const original = directory.base128();
    // glyf and loca are transformed when the version bits are 0; every other table when they are not
    const version = flags >> 6;
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    return { tag, stored: transformed ? directory.base128() : original };
  });

  const compressed = file.subarray(directory.position, directory.position + compressedSize);
  if (compressed.length < compressedSize) throw new Error('truncated WOFF2 data');
  const data = brotliDecompressSync(compressed);
  let offset = 0;
  return new Map(
    entries.map(({ tag, stored }) => {
      if (offset + stored > data.length) throw new Error(`table ${tag} runs past the data`);
      const table = data.subarray(offset, offset + stored);
      offset += stored;
      return [tag, table];
    }),
  );
};

/** The code points a Unicode `cmap` subtable maps to a glyph other than 0 (format 4). */
const format4 = (reader: Reader, start: number): number[] => {
  reader.position = start + 6;
  const segments = reader.u16() / 2;
  const endCodes = start + 14;
  const startCodes = endCodes + 2 * segments + 2;
  const deltas = startCodes + 2 * segments;
  const offsets = deltas + 2 * segments;
  const codes: number[] = [];
  for (let segment = 0; segment < segments; segment += 1) {
    reader.position = endCodes + 2 * segment;
    const last = reader.u16();
    reader.position = startCodes + 2 * segment;
    const first = reader.u16();
    reader.position = deltas + 2 * segment;
    const delta = reader.u16();
    reader.position = offsets + 2 * segment;
    const range = reader.u16();
    for (let code = first; code <= last; code += 1) {
      let glyph = (code + delta) & 0xffff;
      if (range !== 0) {
        reader.position = offsets + 2 * segment + range + 2 * (code - first);
        const indexed = reader.u16();
        glyph = indexed === 0 ? 0 : (indexed + delta) & 0xffff;
      }
      if (glyph !== 0) codes.push(code);
    }
  }
  return codes;
};

/** The code points a Unicode `cmap` subtable maps to a glyph other than 0 (format 12). */
const format12 = (reader: Reader, start: number): number[] => {
  reader.position = start + 12;
  const groups = reader.u32();
  return Array.from({ length: groups }, () => {
    const first = reader.u32();
    const last = reader.u32();
    const glyph = reader.u32();
    return Array.from(
      { length: last - first + 1 },
      (_, step) => [first + step, glyph + step] as const,
    )
      .filter(([, mapped]) => mapped !== 0)
      .map(([code]) => code);
  }).flat();
};

/** Encoding records that hold Unicode: platform 0, or Windows with BMP (1) or full (10) encoding. */
const isUnicode = (platform: number, encoding: number): boolean =>
  (platform === 0 && encoding !== 5) || (platform === 3 && (encoding === 1 || encoding === 10));

/**
 * The code points a `cmap` table covers, from its Unicode subtables (formats 4 and 12). Subtables of
 * other platforms and the variation-selector subtable are ignored; any other format on a Unicode
 * record is an error rather than a silent gap.
 */
export const parseCmap = (table: Uint8Array): Set<number> => {
  const reader = new Reader(table, 2);
  const count = reader.u16();
  const offsets = Array.from({ length: count }, () => {
    const platform = reader.u16();
    const encoding = reader.u16();
    return { platform, encoding, offset: reader.u32() };
  }).filter(({ platform, encoding }) => isUnicode(platform, encoding));
  if (offsets.length === 0) throw new Error('no Unicode cmap subtable');
  const codes = offsets.flatMap(({ offset }) => {
    reader.position = offset;
    const format = reader.u16();
    if (format === 4) return format4(reader, offset);
    if (format === 12) return format12(reader, offset);
    throw new Error(`unsupported cmap format ${String(format)}`);
  });
  return new Set(codes);
};

/** The code points a WOFF2 font file covers. */
export const codePointsOf = (file: Uint8Array): Set<number> => {
  const cmap = readWoff2Tables(file).get('cmap');
  if (cmap === undefined) throw new Error('no cmap table');
  return parseCmap(cmap);
};

const hex = (code: number): string => `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;

/** Spanish letters and marks that a built font lacks, or a font that cannot be read at all. */
export const glyphProblems = (fonts: ReadonlyMap<string, Uint8Array>): Problem[] =>
  [...fonts].flatMap(([file, bytes]) => {
    try {
      const codes = codePointsOf(bytes);
      return SPANISH_CODE_POINTS.filter((code) => !codes.has(code)).map((code) =>
        problem(file, 'glyphs', `${hex(code)} is missing from the font`),
      );
    } catch (error) {
      return [
        problem(file, 'glyphs', `cannot read the font: ${String(error).replace(/^Error: /, '')}`),
      ];
    }
  });
