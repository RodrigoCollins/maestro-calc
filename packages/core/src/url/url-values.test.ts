import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import type {
  CountDescriptor,
  InputDescriptor,
  LengthDescriptor,
} from '../calculator/descriptors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { readUrlValue } from './url-values.ts';

const field = (urlKey: string): InputDescriptor => {
  const found = fixtureBox.inputs.find((input) => input.urlKey === urlKey);
  if (found === undefined) throw new Error(`no fixture field ${urlKey}`);
  return found;
};
const len = field('a');
const cnt = field('b');
const pct = field('c');
const sel = field('d');
const flg = field('e');
const prc = field('f');

const r = (n: number, d = 1): Rational => Rational.of(n, d);
const inches = (n: number, d = 1) => quantity(r(n, d), inch);

const openLength: LengthDescriptor = {
  kind: 'length',
  key: 'open',
  urlKey: 'o',
  default: inches(1),
  defaultUnit: 'in',
  metricDefaultUnit: 'cm',
};
const openCount: CountDescriptor = { kind: 'count', key: 'n', urlKey: 'n', default: 0 };

describe('url value parsers (url-state-codec › Decoding)', () => {
  // spec: Round trip of a full state; Non-canonical but valid values
  it.each([
    ['127/2', inches(127, 2)],
    ['150', inches(150)],
    ['0', inches(0)],
    ['24/2', inches(12)],
    ['1200', inches(1200)],
    ['007', inches(7)],
  ])('reads the length %s as canonical inches', (raw, expected) => {
    expect(readUrlValue(len, raw)).toEqual(expected);
  });

  // spec: Non-canonical but valid values (498/100 normalizes to 249/50); money in dollars
  it.each([
    ['249/50', usd(r(249, 50))],
    ['498/100', usd(r(249, 50))],
    ['37/100', usd(r(37, 100))],
    ['0', usd(0)],
    ['10000', usd(10000)],
  ])('reads the money %s as canonical dollars', (raw, expected) => {
    expect(readUrlValue(prc, raw)).toEqual(expected);
  });

  it.each([
    ['25/2', r(25, 2)],
    ['10', r(10)],
    ['100', r(100)],
    ['0', Rational.ZERO],
  ])('reads the percent %s in percent points', (raw, expected) => {
    expect(readUrlValue(pct, raw)).toEqual(expected);
  });

  // spec: user-input spellings are not URL values
  it.each(['1/0', "5'", '63.5in', '4.98', '$5', '1 m', '', '+1', 'abc', '1/', '/2', '1/2/3', ' 5'])(
    'rejects the rational spelling %j',
    (raw) => {
      expect(readUrlValue(len, raw)).toBeUndefined();
      expect(readUrlValue(pct, raw)).toBeUndefined();
      expect(readUrlValue(prc, raw)).toBeUndefined();
    },
  );

  // spec: Out-of-range and zero denominator (bounds are checked after parsing)
  it.each(['-1', '1201', '2401/2'])('rejects the length %s outside 0..1200', (raw) => {
    expect(readUrlValue(len, raw)).toBeUndefined();
  });
  it.each(['-1', '10001'])('rejects the money %s outside $0..$10000', (raw) => {
    expect(readUrlValue(prc, raw)).toBeUndefined();
  });
  it.each(['-1', '101', '201/2'])('rejects the percent %s outside 0..100', (raw) => {
    expect(readUrlValue(pct, raw)).toBeUndefined();
  });
  it('accepts a negative length when the descriptor has no minimum', () => {
    expect(readUrlValue(openLength, '-5/2')).toEqual(inches(-5, 2));
  });

  // spec: count accepts ^[0-9]+$ only; 007 is valid
  it.each([
    ['7', 7],
    ['007', 7],
    ['0', 0],
    ['100', 100],
  ])('reads the count %s as %d', (raw, expected) => {
    expect(readUrlValue(cnt, raw)).toBe(expected);
  });
  it.each(['-1', '1.5', '1e3', '', '+1', '1/2', '101', ' 7', '٣'])(
    'rejects the count %j',
    (raw) => {
      expect(readUrlValue(cnt, raw)).toBeUndefined();
    },
  );
  it('bounds a count with the safe-integer range when no maximum is declared', () => {
    expect(readUrlValue(openCount, '9007199254740991')).toBe(9007199254740991);
    expect(readUrlValue(openCount, '9007199254740992')).toBeUndefined();
    expect(readUrlValue(openCount, '9'.repeat(200))).toBeUndefined();
  });

  // spec: select accepts an exact option id
  it('reads a select option id exactly', () => {
    expect(readUrlValue(sel, 'x')).toBe('x');
    expect(readUrlValue(sel, 'y')).toBe('y');
    expect(readUrlValue(sel, 'z')).toBeUndefined();
    expect(readUrlValue(sel, 'X')).toBeUndefined();
    expect(readUrlValue(sel, '')).toBeUndefined();
    expect(readUrlValue(sel, 'toString')).toBeUndefined();
  });

  // spec: boolean accepts only 1 or 0
  it('reads a boolean only as 1 or 0', () => {
    expect(readUrlValue(flg, '1')).toBe(true);
    expect(readUrlValue(flg, '0')).toBe(false);
    for (const raw of ['true', 'false', '', '2', '01', '-1', 'on']) {
      expect(readUrlValue(flg, raw)).toBeUndefined();
    }
  });

  // spec: keys and values are percent-decoded; a malformed escape makes the value invalid
  it('percent-decodes the value before reading it', () => {
    expect(readUrlValue(len, '127%2F2')).toEqual(inches(127, 2));
    expect(readUrlValue(len, '127%2f2')).toEqual(inches(127, 2));
    expect(readUrlValue(sel, '%79')).toBe('y');
    expect(readUrlValue(cnt, '%37')).toBe(7);
    expect(readUrlValue(len, '1%zz')).toBeUndefined();
    expect(readUrlValue(len, '1%')).toBeUndefined();
    expect(readUrlValue(len, '%ff')).toBeUndefined();
    expect(readUrlValue(len, '1+2')).toBeUndefined();
  });

  // spec: a raw value longer than 256 characters is invalid, counted before decoding
  it('caps the raw value at 256 characters', () => {
    const ones = (digits: number) => quantity(Rational.of(BigInt('1'.repeat(digits))), inch);
    expect(readUrlValue(openLength, '1'.repeat(256))).toEqual(ones(256));
    expect(readUrlValue(openLength, '1'.repeat(257))).toBeUndefined();
    // 100 escapes are 300 raw characters that decode to 100 digits
    expect(readUrlValue(openLength, '%31'.repeat(100))).toBeUndefined();
    expect(readUrlValue(openLength, '%31'.repeat(85))).toEqual(ones(85));
  });
});
