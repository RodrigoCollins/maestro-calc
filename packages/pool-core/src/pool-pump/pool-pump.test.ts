import { gal, isQuantityOf, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolPump } from './pool-pump.ts';

// ANSI/APSP/ICC-15, referenced by the 2021 ISPSC: the residential filtration flow is the 6-hour
// turnover rate or 36 gpm, whichever is greater. The outputs are the gallons to move each minute.
const gpm = (raw: Readonly<Record<string, unknown>>, key: string): Rational => {
  const result = poolPump.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  const value = result.value.outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'volume')) throw new Error(`${key} is not a volume`);
  return valueIn(value, gal);
};

describe('pool pump', () => {
  it('reads the default: 20,000 gallons', () => {
    const state = poolPump.validate({});
    expect(state.ok && state.value).toEqual({ gallons: Rational.of(20_000) });
  });

  // 20,000 / 360 = 55.56 gpm; the gentler 8-hour turnover is 20,000 / 480 = 41.67 gpm
  it('turns 20,000 gallons over in 6 hours at 55.56 gpm, 41.67 gpm over 8 hours', () => {
    expect(gpm({}, 'flow')).toEqual(Rational.of(500, 9));
    expect(gpm({}, 'eightHour')).toEqual(Rational.of(125, 3));
  });

  // 10,000 / 360 = 27.8 gpm, below the 36 gpm floor of the standard
  it('never goes below 36 gpm for a small pool', () => {
    expect(gpm({ gallons: '10000' }, 'flow')).toEqual(Rational.of(36));
    expect(gpm({ gallons: '10000' }, 'eightHour')).toEqual(Rational.of(125, 6));
  });

  it('meets the floor exactly at 12,960 gallons', () => {
    expect(gpm({ gallons: '12960' }, 'flow')).toEqual(Rational.of(36));
  });

  it('rejects a negative volume', () => {
    expect(poolPump.run({ gallons: '-1' }).ok).toBe(false);
  });
});
