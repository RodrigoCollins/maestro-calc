import { describe, expect, it } from 'vitest';
import { usd, type Money } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { ft, inch, mm } from '../units/catalog.ts';
import { quantity, type Quantity } from '../units/quantity.ts';
import { checkAmount, findOption, type ConstraintError } from './constraints.ts';
import type {
  CountDescriptor,
  LengthDescriptor,
  MoneyDescriptor,
  PercentDescriptor,
  SelectDescriptor,
} from './descriptors.ts';

const r = (n: number, d = 1): Rational => Rational.of(n, d);

const length = (min?: Quantity<'length'>, max?: Quantity<'length'>): LengthDescriptor => ({
  kind: 'length',
  key: 'len',
  urlKey: 'a',
  default: quantity(12, inch),
  defaultUnit: 'in',
  metricDefaultUnit: 'cm',
  ...(min === undefined ? {} : { min }),
  ...(max === undefined ? {} : { max }),
});
const count = (min?: number, max?: number): CountDescriptor => ({
  kind: 'count',
  key: 'cnt',
  urlKey: 'b',
  default: 3,
  ...(min === undefined ? {} : { min }),
  ...(max === undefined ? {} : { max }),
});
const percent = (min?: Rational, max?: Rational): PercentDescriptor => ({
  kind: 'percent',
  key: 'pct',
  urlKey: 'c',
  default: r(10),
  ...(min === undefined ? {} : { min }),
  ...(max === undefined ? {} : { max }),
});
const money = (min?: Money, max?: Money): MoneyDescriptor => ({
  kind: 'money',
  key: 'prc',
  urlKey: 'f',
  default: usd(1),
  ...(min === undefined ? {} : { min }),
  ...(max === undefined ? {} : { max }),
});
const select: SelectDescriptor = {
  kind: 'select',
  key: 'sel',
  urlKey: 'd',
  default: 'x',
  options: ['x', 'y'],
};

const below = (min: string): ConstraintError => ({ code: 'BELOW_MIN', params: { min } });
const above = (max: string): ConstraintError => ({ code: 'ABOVE_MAX', params: { max } });
const inInches = (q: Quantity<'length'>): Rational => q.canonical;

// Every bound is a canonical Rational string in the canonical unit of the kind (inches, whole
// numbers, percent points, dollars); the expected strings were written by hand from the spec.
describe('checkAmount (calculator-contract › Total validation without silent coercion)', () => {
  // spec: calculator-contract › Length bounds are inclusive [CC12]
  it('treats the length bounds as inclusive and reports them in inches', () => {
    const bounded = length(quantity(0, inch), quantity(100, ft));
    expect(checkAmount(bounded, inInches(quantity(-1, inch)))).toEqual(below('0'));
    expect(checkAmount(bounded, inInches(quantity(0, inch)))).toBeUndefined();
    expect(checkAmount(bounded, inInches(quantity(1200, inch)))).toBeUndefined();
    expect(checkAmount(bounded, inInches(quantity(r(76801, 64), inch)))).toEqual(above('1200'));
    expect(checkAmount(bounded, inInches(quantity(101, ft)))).toEqual(above('1200'));
  });

  it('reports a fractional length bound in lowest terms', () => {
    const bounded = length(undefined, quantity(r(25, 2), inch));
    expect(checkAmount(bounded, r(25, 2))).toBeUndefined();
    expect(checkAmount(bounded, r(13))).toEqual(above('25/2'));
    // 5 mm is 25/127 in, and 1 mm is 5/127 in
    expect(checkAmount(length(quantity(5, mm)), inInches(quantity(1, mm)))).toEqual(
      below('25/127'),
    );
  });

  it('has no length bound unless one is declared', () => {
    expect(checkAmount(length(), inInches(quantity(-5, ft)))).toBeUndefined();
    expect(checkAmount(length(), inInches(quantity(r(10, 3), ft)))).toBeUndefined();
    expect(checkAmount(length(quantity(0, inch)), inInches(quantity(10000, ft)))).toBeUndefined();
    expect(checkAmount(length(undefined, quantity(3, inch)), r(-1))).toBeUndefined();
  });

  it('treats the count bounds as inclusive', () => {
    const bounded = count(5, 10);
    expect(checkAmount(bounded, r(4))).toEqual(below('5'));
    expect(checkAmount(bounded, r(5))).toBeUndefined();
    expect(checkAmount(bounded, r(10))).toBeUndefined();
    expect(checkAmount(bounded, r(11))).toEqual(above('10'));
  });

  it('defaults a count to 0 through Number.MAX_SAFE_INTEGER', () => {
    expect(checkAmount(count(), r(-1))).toEqual(below('0'));
    expect(checkAmount(count(), r(0))).toBeUndefined();
    expect(checkAmount(count(), r(Number.MAX_SAFE_INTEGER))).toBeUndefined();
    expect(checkAmount(count(2), r(1))).toEqual(below('2'));
    expect(checkAmount(count(undefined, 7), r(8))).toEqual(above('7'));
    expect(checkAmount(count(undefined, 7), r(0))).toBeUndefined();
  });

  // spec: Count edge cases [CC11]: a value beyond the safe integers stays exact
  it('compares an amount beyond the safe integers without precision loss', () => {
    expect(checkAmount(count(), Rational.of(2n ** 53n))).toEqual(above('9007199254740991'));
    expect(checkAmount(count(), Rational.of(2n ** 53n - 1n))).toBeUndefined();
    expect(checkAmount(count(undefined, 100), Rational.of(101n))).toEqual(above('100'));
  });

  it('treats the percent bounds as inclusive points and defaults them to 0..100', () => {
    expect(checkAmount(percent(), r(-1, 2))).toEqual(below('0'));
    expect(checkAmount(percent(), r(0))).toBeUndefined();
    expect(checkAmount(percent(), r(100))).toBeUndefined();
    expect(checkAmount(percent(), r(201, 2))).toEqual(above('100'));
    const bounded = percent(r(1, 3), r(25, 2));
    expect(checkAmount(bounded, r(1, 4))).toEqual(below('1/3'));
    expect(checkAmount(bounded, r(1, 3))).toBeUndefined();
    expect(checkAmount(bounded, r(25, 2))).toBeUndefined();
    expect(checkAmount(bounded, r(13))).toEqual(above('25/2'));
  });

  it('treats the money bounds as inclusive dollars and defaults the minimum to $0', () => {
    expect(checkAmount(money(), r(-1, 100))).toEqual(below('0'));
    expect(checkAmount(money(), r(0))).toBeUndefined();
    expect(checkAmount(money(), r(1000000000))).toBeUndefined();
    const bounded = money(usd(r(5, 2)), usd(10000));
    expect(checkAmount(bounded, r(2))).toEqual(below('5/2'));
    expect(checkAmount(bounded, r(5, 2))).toBeUndefined();
    expect(checkAmount(bounded, r(10000))).toBeUndefined();
    expect(checkAmount(bounded, r(1000001, 100))).toEqual(above('10000'));
  });
});

describe('findOption (calculator-contract › Select and boolean [CC18])', () => {
  it('finds exactly the declared options of a select, case-sensitively', () => {
    expect(findOption(select, 'x')).toBe('x');
    expect(findOption(select, 'y')).toBe('y');
    for (const value of ['z', 'Y', '', ' x', 1, null, undefined, ['x']]) {
      expect(findOption(select, value)).toBeUndefined();
    }
  });
});
