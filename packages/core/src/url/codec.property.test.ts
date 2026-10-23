import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { rationalArb } from '../__testing__/arbitraries.ts';
import { numRuns } from '../__testing__/property-runs.ts';
import { checkAmount, findOption } from '../calculator/constraints.ts';
import { defineCalculator } from '../calculator/define.ts';
import type { InputDescriptor, InputsOf, UnitSystem } from '../calculator/descriptors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { decode, encode, type UrlCodable } from './codec.ts';

/** A calculator without maximums: lengths are signed and unbounded, money is not capped. */
const unbounded = defineCalculator({
  id: 'unbounded-box',
  inputs: [
    {
      kind: 'length',
      key: 'len',
      urlKey: 'a',
      default: quantity(12, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
    },
    { kind: 'count', key: 'cnt', urlKey: 'b', default: 3 },
    { kind: 'percent', key: 'pct', urlKey: 'c', default: Rational.of(10) },
    { kind: 'select', key: 'sel', urlKey: 'd', default: 'x', options: ['x', 'y-z'] },
    { kind: 'boolean', key: 'flg', urlKey: 'e', default: true },
    { kind: 'money', key: 'prc', urlKey: 'f', default: usd(Rational.of(249, 50)) },
  ],
  outputs: [{ key: 'size', measure: 'length', role: 'primary' }],
  compute: () => ({ outputs: { size: quantity(1, inch) }, shopping: [], warnings: [] }),
});

const unitSystemArb: fc.Arbitrary<UnitSystem> = fc.constantFrom('imperial', 'metric');

/** A rational between `min` and `max` inclusive whose denominator is small (thirds, cents, ...). */
const between = (min: number, max: number): fc.Arbitrary<Rational> =>
  fc
    .integer({ min: 1, max: 1000 })
    .chain((den) =>
      fc
        .bigInt({ min: BigInt(min) * BigInt(den), max: BigInt(max) * BigInt(den) })
        .map((num) => Rational.of(num, BigInt(den))),
    );

type Box = InputsOf<typeof fixtureBox.inputs>;
const boxArb: fc.Arbitrary<Box> = fc.record({
  len: fc.oneof(fc.constantFrom(0, 1200), between(0, 1200)).map((n) => quantity(n, inch)),
  cnt: fc.integer({ min: 0, max: 100 }),
  pct: between(0, 100),
  sel: fc.constantFrom('x', 'y'),
  flg: fc.boolean(),
  prc: between(0, 10000).map(usd),
});

type Unbounded = InputsOf<typeof unbounded.inputs>;
const unboundedArb: fc.Arbitrary<Unbounded> = fc.record({
  len: rationalArb.map((n) => quantity(n, inch)),
  cnt: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
  pct: between(0, 100),
  sel: fc.constantFrom('x', 'y-z'),
  flg: fc.boolean(),
  prc: rationalArb.map((n) => usd(n.abs())),
});

/** Pieces that make a query hard: escapes, separators, signs, unicode and valid-looking text. */
const TOKENS = [
  'v',
  'u',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'z',
  '=',
  '&',
  '?',
  '%',
  '%zz',
  '%2F',
  '%2f',
  '%61',
  '%75',
  '%76',
  '%6D',
  '%ff',
  '%ED%A0%80',
  '%C3%A9',
  '\uD800',
  '+',
  '/',
  '-',
  '1',
  '0',
  '7',
  '100',
  '1200',
  '1201',
  'm',
  'x',
  'y',
  'y-z',
  'é',
  '😀',
  ' ',
  "'",
  '$',
  '.',
  '1/3',
  '999999999999999999999',
];
/** The URL keys the two calculators declare, plus the reserved ones. */
const KNOWN_KEYS = ['v', 'u', 'a', 'b', 'c', 'd', 'e', 'f'];
const queryArb: fc.Arbitrary<string> = fc.oneof(
  fc.string({ maxLength: 40 }),
  fc.array(fc.constantFrom(...TOKENS), { maxLength: 30 }).map((parts) => parts.join('')),
  fc.string({ minLength: 250, maxLength: 600 }),
  // a known key with a value around the 256-character cap (digits are valid text for most kinds)
  fc
    .tuple(fc.constantFrom(...KNOWN_KEYS), fc.stringMatching(/^[0-9]{240,300}$/))
    .map(([key, digits]) => `${key}=${digits}`),
);

/** True when `value` is a value the descriptor allows: its kind, its bounds and its options. */
const allowed = (input: InputDescriptor, value: unknown): boolean => {
  switch (input.kind) {
    case 'length':
      return value instanceof Object && 'canonical' in value && value.canonical instanceof Rational
        ? checkAmount(input, value.canonical) === undefined
        : false;
    case 'percent':
      return value instanceof Rational && checkAmount(input, value) === undefined;
    case 'money':
      return (
        value instanceof Object &&
        'amount' in value &&
        value.amount instanceof Rational &&
        checkAmount(input, value.amount) === undefined
      );
    case 'count':
      return (
        typeof value === 'number' &&
        Number.isSafeInteger(value) &&
        checkAmount(input, Rational.of(value)) === undefined
      );
    case 'select':
      return findOption(input, value) !== undefined;
    case 'boolean':
      return typeof value === 'boolean';
  }
};

describe('url codec properties (url-state-codec › Round-trip properties)', () => {
  // spec: Round-trip properties › Property-based round trip [UC19]
  it('decodes what it encodes, for every valid state and unit system', () => {
    fc.assert(
      fc.property(boxArb, unitSystemArb, (state, unitSystem) => {
        const query = encode(fixtureBox, state, { unitSystem });
        expect(decode(fixtureBox, query)).toEqual({ state, unitSystem, issues: [] });
        expect(query).toMatch(/^[0-9a-z/=&-]+$/);
      }),
      { numRuns },
    );
  });

  it('keeps values beyond 64 bits, negative lengths and sub-cent money exact', () => {
    fc.assert(
      fc.property(unboundedArb, unitSystemArb, (state, unitSystem) => {
        const query = encode(unbounded, state, { unitSystem });
        expect(decode(unbounded, query)).toEqual({ state, unitSystem, issues: [] });
      }),
      { numRuns },
    );
  });

  // spec: Round-trip properties › Fuzzed queries never throw [UC20]
  it.each<[string, UrlCodable]>([
    ['fixture-box', fixtureBox],
    ['unbounded-box', unbounded],
  ])('never throws on any query and always yields a valid state (%s)', (_name, calculator) => {
    fc.assert(
      fc.property(queryArb, (query) => {
        const decoded = decode(calculator, query);
        for (const input of calculator.inputs) {
          expect(allowed(input, decoded.state[input.key]), input.key).toBe(true);
        }
        expect(['imperial', 'metric']).toContain(decoded.unitSystem);
        for (const issue of decoded.issues) {
          expect(['INVALID_VALUE', 'UNSUPPORTED_VERSION']).toContain(issue.code);
        }
      }),
      { numRuns },
    );
  });

  // spec: Round-trip properties: encode(decode(q)) is a fixed point of decode-then-encode
  it.each<[string, UrlCodable]>([
    ['fixture-box', fixtureBox],
    ['unbounded-box', unbounded],
  ])('canonicalizes any query to a fixed point (%s)', (_name, calculator) => {
    fc.assert(
      fc.property(queryArb, (query) => {
        const first = decode(calculator, query);
        const canonical = encode(calculator, first.state, { unitSystem: first.unitSystem });
        const second = decode(calculator, canonical);
        expect(second).toEqual({ state: first.state, unitSystem: first.unitSystem, issues: [] });
        expect(encode(calculator, second.state, { unitSystem: second.unitSystem })).toBe(canonical);
      }),
      { numRuns },
    );
  });
});
