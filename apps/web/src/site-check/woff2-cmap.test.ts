import { readFileSync } from 'node:fs';
import { brotliCompressSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import {
  codePointsOf,
  glyphProblems,
  parseCmap,
  readWoff2Tables,
  SPANISH_CODE_POINTS,
} from './woff2-cmap.ts';

const u16 = (...values: number[]): number[] => values.flatMap((value) => [value >> 8, value & 255]);
const u32 = (...values: number[]): number[] =>
  values.flatMap((value) => [...u16(Math.floor(value / 65_536)), ...u16(value % 65_536)]);
const bytes = (...parts: (number[] | Uint8Array)[]): Uint8Array =>
  Uint8Array.from(parts.flatMap((part) => [...part]));

/**
 * Format 4, three segments, hand-checked:
 * - A..C (0x41..0x43), idDelta -0x40, no range offset: glyphs 1, 2, 3
 * - 0xE1..0xE2, idDelta 0, range offset 4 into glyphIdArray [5, 0]: 0xE1 is glyph 5, 0xE2 is glyph 0 (missing)
 * - the 0xFFFF terminator (glyph 0, missing)
 * The offset 4 is the distance from idRangeOffset[1] to glyphIdArray[0] (one remaining entry, 2 B, plus the 2 B of idRangeOffset[2]).
 */
const FORMAT_4 = bytes(
  u16(4, 16 + 8 * 3 + 4, 0, 6, 4, 1, 2),
  u16(0x43, 0xe2, 0xffff),
  u16(0),
  u16(0x41, 0xe1, 0xffff),
  u16(0xffc0, 0, 1),
  u16(0, 4, 0),
  u16(5, 0),
);
const FORMAT_4_CODES = [0x41, 0x42, 0x43, 0xe1];

/**
 * Format 12, three groups: U+1F600..1F602 from glyph 10; U+F1 from glyph 7; U+20..21 from glyph 0
 * (so U+20 maps to glyph 0, missing, and U+21 to glyph 1).
 */
const FORMAT_12 = bytes(
  u16(12, 0),
  u32(16 + 12 * 3, 0, 3),
  u32(0x1f600, 0x1f602, 10),
  u32(0xf1, 0xf1, 7),
  u32(0x20, 0x21, 0),
);

/** A cmap table: version 0 and one encoding record per `[platform, encoding, subtable]`. */
const cmap = (...records: [number, number, Uint8Array][]): Uint8Array => {
  let offset = 4 + 8 * records.length;
  const directory = records.flatMap(([platform, encoding, subtable]) => {
    const entry = [...u16(platform, encoding), ...u32(offset)];
    offset += subtable.length;
    return entry;
  });
  return bytes(u16(0, records.length), directory, ...records.map(([, , subtable]) => subtable));
};

const sorted = (set: ReadonlySet<number>): number[] => [...set].sort((a, b) => a - b);

describe('cmap parser (site-shell › [SS10])', () => {
  it('reads a format 4 subtable: delta segments, glyph arrays and the terminator', () => {
    expect(sorted(parseCmap(cmap([3, 1, FORMAT_4])))).toEqual(FORMAT_4_CODES);
  });

  it('reads a format 12 subtable and drops code points that map to glyph 0', () => {
    expect(sorted(parseCmap(cmap([3, 10, FORMAT_12])))).toEqual([
      0x21, 0xf1, 0x1f600, 0x1f601, 0x1f602,
    ]);
  });

  it('joins every Unicode subtable and skips records of other platforms', () => {
    const mac = bytes(u16(6, 10, 0, 0, 1), u16(1));
    expect(sorted(parseCmap(cmap([1, 0, mac], [3, 1, FORMAT_4], [0, 4, FORMAT_12])))).toEqual([
      0x21, 0x41, 0x42, 0x43, 0xe1, 0xf1, 0x1f600, 0x1f601, 0x1f602,
    ]);
  });

  it('reads the Unicode platform (0) with BMP and full repertoire encodings', () => {
    expect(sorted(parseCmap(cmap([0, 3, FORMAT_4])))).toEqual(FORMAT_4_CODES);
    expect(sorted(parseCmap(cmap([0, 4, FORMAT_12])))).toEqual([
      0x21, 0xf1, 0x1f600, 0x1f601, 0x1f602,
    ]);
  });

  it('ignores a variation-selector subtable (format 14) of the Unicode platform', () => {
    expect(sorted(parseCmap(cmap([0, 5, bytes(u16(14, 0))], [3, 1, FORMAT_4])))).toEqual(
      FORMAT_4_CODES,
    );
  });

  it('throws for a Unicode subtable of an unsupported format', () => {
    expect(() => parseCmap(cmap([3, 1, bytes(u16(6, 10, 0, 0, 1), u16(1))]))).toThrow(
      'unsupported cmap format 6',
    );
  });

  it('throws when there is no Unicode subtable, or no record at all', () => {
    expect(() => parseCmap(cmap([1, 0, bytes(u16(0))]))).toThrow('no Unicode cmap subtable');
    expect(() => parseCmap(cmap())).toThrow('no Unicode cmap subtable');
  });
});

/** The bytes of a UIntBase128 number. */
const base128 = (value: number): number[] => {
  const groups: number[] = [];
  let rest = value;
  do {
    groups.unshift(rest % 128);
    rest = Math.floor(rest / 128);
  } while (rest > 0);
  return groups.map((group, index) => (index < groups.length - 1 ? group | 0x80 : group));
};

interface TableSpec {
  readonly tag: string;
  readonly data: number[];
  /** Original length when it differs from the stored data (a transformed table). */
  readonly original?: number;
  /** The transform version of the directory flags (bits 6 and 7); 0 when omitted. */
  readonly version?: number;
}

const KNOWN: Record<string, number> = { cmap: 0, head: 1, glyf: 10, loca: 11 };

/** A WOFF2 file: header, table directory and one Brotli stream holding every table in order. */
const woff2 = (
  tables: TableSpec[],
  overrides: { signature?: number[]; trim?: number } = {},
): Uint8Array => {
  const directory = tables.flatMap(({ tag, data, original, version = 0 }) => {
    const index = KNOWN[tag];
    // glyf and loca are transformed at version 0; every other table is transformed at any other version
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    const flags = (version << 6) | (index ?? 0x3f);
    return [
      ...(index === undefined
        ? [flags, ...Array.from(tag, (char) => char.charCodeAt(0))]
        : [flags]),
      ...base128(original ?? data.length),
      ...(transformed ? base128(data.length) : []),
    ];
  });
  const stream = brotliCompressSync(Uint8Array.from(tables.flatMap(({ data }) => data)));
  const header = [
    ...(overrides.signature ?? [0x77, 0x4f, 0x46, 0x32]),
    ...u32(0x10000, 0), // flavor, length
    ...u16(tables.length, 0), // numTables, then 2 reserved bytes, so the next field starts at 16
    ...u32(0, stream.length), // totalSfntSize, totalCompressedSize (at byte 20)
    ...new Array<number>(24).fill(0),
  ];
  return bytes(header, directory, stream).subarray(0, undefined);
};

describe('WOFF2 table reader (site-shell › [SS10])', () => {
  const CMAP = [...cmap([3, 1, FORMAT_4])];

  it('finds cmap after other tables, with a two-byte length and an arbitrary tag', () => {
    const head = new Array<number>(300).fill(7);
    const tables = readWoff2Tables(
      woff2([
        { tag: 'head', data: head },
        { tag: 'TEST', data: [1, 2, 3] },
        { tag: 'cmap', data: CMAP },
      ]),
    );
    expect([...tables.keys()]).toEqual(['head', 'TEST', 'cmap']);
    expect([...(tables.get('cmap') ?? [])]).toEqual(CMAP);
    expect(tables.get('head')).toHaveLength(300);
    expect([...(tables.get('TEST') ?? [])]).toEqual([1, 2, 3]);
  });

  it('keeps the stored length of a transformed table, so cmap still lines up', () => {
    const tables = readWoff2Tables(
      woff2([
        { tag: 'glyf', data: new Array<number>(12).fill(9), original: 100 },
        { tag: 'loca', data: [], original: 8 },
        { tag: 'cmap', data: CMAP },
      ]),
    );
    expect(tables.get('glyf')).toHaveLength(12);
    expect(tables.get('loca')).toHaveLength(0);
    expect([...(tables.get('cmap') ?? [])]).toEqual(CMAP);
  });

  it('reads a stored length for any other table with a non-zero transform version, and none for glyf at version 3', () => {
    const tables = readWoff2Tables(
      woff2([
        { tag: 'head', data: [1, 2, 3], original: 50, version: 2 },
        { tag: 'glyf', data: [4, 5], version: 3 },
        { tag: 'cmap', data: CMAP },
      ]),
    );
    expect([...(tables.get('head') ?? [])]).toEqual([1, 2, 3]);
    expect([...(tables.get('glyf') ?? [])]).toEqual([4, 5]);
    expect([...(tables.get('cmap') ?? [])]).toEqual(CMAP);
  });

  it('returns the code points of a font through its cmap', () => {
    expect(sorted(codePointsOf(woff2([{ tag: 'cmap', data: CMAP }])))).toEqual(FORMAT_4_CODES);
    expect(() => codePointsOf(woff2([{ tag: 'head', data: [1] }]))).toThrow('no cmap table');
  });

  it('rejects a bad signature, a truncated header and a truncated directory', () => {
    const good = woff2([{ tag: 'cmap', data: CMAP }]);
    expect(() =>
      readWoff2Tables(woff2([{ tag: 'cmap', data: CMAP }], { signature: [0, 1, 2, 3] })),
    ).toThrow('not a WOFF2 file');
    expect(() => readWoff2Tables(good.subarray(0, 40))).toThrow('truncated WOFF2 header');
    expect(() => readWoff2Tables(good.subarray(0, 49))).toThrow('truncated WOFF2 table directory');
  });

  it('rejects a truncated compressed stream', () => {
    const good = woff2([{ tag: 'cmap', data: CMAP }]);
    expect(() => readWoff2Tables(good.subarray(0, good.length - 3))).toThrow(
      'truncated WOFF2 data',
    );
  });

  it('rejects table lengths that run past the decompressed data', () => {
    const lying = woff2([{ tag: 'cmap', data: CMAP, original: CMAP.length + 50 }]);
    expect(() => readWoff2Tables(lying)).toThrow('table cmap runs past the data');
  });

  it.each([
    ['a leading 0x80', [0x80, 0x01]],
    ['more than five bytes', [0x81, 0x80, 0x80, 0x80, 0x80, 0x01]],
    ['a value above 32 bits', [0xff, 0xff, 0xff, 0xff, 0x7f]],
  ])('rejects a table length with %s', (_name, length) => {
    const file = Uint8Array.from([...woff2([{ tag: 'cmap', data: CMAP }])]);
    // replace the one-byte length that follows the flags byte of the only directory entry
    const broken = bytes([...file.subarray(0, 48)], [0], length, [...file.subarray(50)]);
    expect(() => readWoff2Tables(broken)).toThrow(/invalid UIntBase128/);
  });
});

const SPANISH = [0xa1, 0xbf, 0xe1, 0xe9, 0xed, 0xf1, 0xf3, 0xfa, 0xfc];

describe('Spanish glyph coverage (site-shell › [SS10])', () => {
  it('lists the nine code points the design names', () => {
    expect([...SPANISH_CODE_POINTS]).toEqual(SPANISH);
  });

  const font = (name: string): Uint8Array =>
    readFileSync(fromRoot('node_modules/@fontsource/barlow/files', name));

  it('finds all nine in the real latin subset of Barlow', () => {
    const codes = codePointsOf(font('barlow-latin-400-normal.woff2'));
    expect(SPANISH.filter((code) => !codes.has(code))).toEqual([]);
  });

  it('misses U+00F1 in the latin-ext subset (the negative)', () => {
    expect(codePointsOf(font('barlow-latin-ext-400-normal.woff2')).has(0xf1)).toBe(false);
  });

  it('reports nothing for fonts that hold every code point, naming no file', () => {
    const full = new Map([['a.woff2', font('barlow-latin-400-normal.woff2')]]);
    expect(glyphProblems(full)).toEqual([]);
  });

  it('names the file and each missing code point', () => {
    const fonts = new Map([['_astro/fonts/x.woff2', font('barlow-latin-ext-400-normal.woff2')]]);
    const problems = glyphProblems(fonts);
    expect(
      problems.every(({ file, rule }) => file === '_astro/fonts/x.woff2' && rule === 'glyphs'),
    ).toBe(true);
    expect(problems.map(({ message }) => message)).toContain('U+00F1 is missing from the font');
  });

  it('reports a file that cannot be read as a WOFF2 font', () => {
    expect(glyphProblems(new Map([['_astro/fonts/bad.woff2', Uint8Array.of(1, 2, 3)]]))).toEqual([
      {
        file: '_astro/fonts/bad.woff2',
        rule: 'glyphs',
        message: 'cannot read the font: truncated WOFF2 header',
      },
    ]);
  });
});
