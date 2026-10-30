import { describe, expect, it } from 'vitest';
import { Rational } from '../../rational/rational.ts';
import { deg, ft, inch, m } from '../../units/catalog.ts';
import { isQuantity, quantity, valueIn, type Quantity } from '../../units/quantity.ts';
import { roofPitch } from './index.ts';

/** The run of `raw`; a failed run is a failed test. */
const runOf = (raw: Readonly<Record<string, unknown>>) => {
  const result = roofPitch.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return result.value;
};

const exact = (
  raw: Readonly<Record<string, unknown>>,
  key: string,
  unit: Parameters<typeof valueIn>[1],
) => {
  const value = runOf(raw).outputs.find((output) => output.key === key)?.value;
  if (!isQuantity(value)) throw new Error(`${key} is not a quantity`);
  return valueIn(value as Quantity<'length'> & Quantity<'angle'>, unit as never);
};

const shown = (value: Rational) => Number(value.toNumber().toFixed(2));

describe('roof pitch defaults (calc-roof-pitch › Inputs)', () => {
  // spec: calc-roof-pitch › [RP1] 6 in of rise over 12 in of run, a 12 ft rafter run with a 12 in
  // overhang, asphalt shingles
  it('reads the defaults', () => {
    const state = roofPitch.validate({});
    expect(state.ok && state.value).toEqual({
      rise: quantity(6, inch),
      run: quantity(12, inch),
      rafterRun: quantity(144, inch),
      overhang: quantity(12, inch),
      covering: 'asphalt',
    });
  });

  it('refuses a run of zero', () => {
    const result = roofPitch.validate({ run: '0' });
    expect(result.ok).toBe(false);
  });
});

/*
 * Hand-verified: 6 in over 12 in is 6 in 12 (t = 1/2). The angle is atan(1/2) = 26.565051…°. A
 * rafter over 12 ft of run plus a 12 in overhang spans 156 in of run, times √(1 + 1/4) = √1.25 =
 * 1.11803398874989484820 (truncated): 174.41 in = 14.53 ft = 4.43 m.
 */
describe('roof pitch, angle and rafter (calc-roof-pitch › Pitch and rafter)', () => {
  // spec: calc-roof-pitch › [RP2] the default roof
  it('gives the pitch in 12, the angle and the rafter', () => {
    expect(exact({}, 'pitch', inch)).toEqual(Rational.of(6));
    expect(shown(exact({}, 'angle', deg))).toBe(26.57);
    expect(exact({}, 'rafter', inch)).toEqual(
      Rational.of(156n * 111803398874989484820n, 10n ** 20n),
    );
    expect(shown(exact({}, 'rafter', ft))).toBe(14.53);
    expect(shown(exact({}, 'rafterM', m))).toBe(4.43);
  });

  // spec: calc-roof-pitch › [RP3] the pitch is the rise per 12 of run, whatever unit they are in
  it('reads the pitch from any rise and run', () => {
    expect(exact({ rise: '9', run: '24' }, 'pitch', inch)).toEqual(Rational.of(9, 2));
    expect(exact({ rise: '1 ft', run: '1 ft' }, 'pitch', inch)).toEqual(Rational.of(12));
    expect(shown(exact({ rise: '1 ft', run: '1 ft' }, 'angle', deg))).toBe(45);
    expect(exact({ rise: '0' }, 'angle', deg)).toEqual(Rational.ZERO);
    // a flat roof's rafter is its run
    expect(exact({ rise: '0' }, 'rafter', inch)).toEqual(Rational.of(156));
  });
});

describe('the IRC check (calc-roof-pitch › IRC minimum slopes)', () => {
  const warnings = (raw: Readonly<Record<string, unknown>>) => runOf(raw).warnings;

  // spec: calc-roof-pitch › [RP4] IRC 2021 R905.2.2, R905.3.2, R905.4.2, R905.5.2, R905.6.2,
  // R905.7.2, R905.8.2: the minimum slope of each covering, in 12
  it.each([
    ['asphalt', '2'],
    ['tile', '2.5'],
    ['metal', '3'],
    ['roll', '1'],
    ['slate', '4'],
    ['wood', '3'],
  ])('warns below the minimum of %s (%s in 12) and not at it', (covering, minimum) => {
    // 1/16 in below the minimum, with the run at its 12 in default
    const just = Number(minimum) - 1 / 16;
    expect(warnings({ covering, rise: String(just) })).toEqual([
      { code: 'belowMinimum', params: { minimum: Number(minimum) } },
    ]);
    expect(warnings({ covering, rise: minimum }).map(({ code }) => code)).not.toContain(
      'belowMinimum',
    );
  });

  // spec: calc-roof-pitch › [RP5] asphalt shingles and tile take two layers of underlayment from
  // their minimum up to 4 in 12; at 4 in 12 one layer
  it.each([
    ['asphalt', '2', true],
    ['asphalt', '3.99', true],
    ['asphalt', '4', false],
    ['tile', '2.5', true],
    ['tile', '4', false],
    ['metal', '3', false],
    ['slate', '4', false],
  ])('asks for double underlayment on %s at %s in 12: %s', (covering, rise, double) => {
    expect(warnings({ covering, rise })).toEqual(
      double ? [{ code: 'doubleUnderlayment', params: {} }] : [],
    );
  });

  it('warns nothing on the default 6 in 12 asphalt roof', () => {
    expect(warnings({})).toEqual([]);
  });
});
