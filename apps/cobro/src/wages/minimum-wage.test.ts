import { describe, expect, it } from 'vitest';
import { AREAS } from './areas.ts';
import { MINIMUM_WAGES, minimumWageOf } from './minimum-wage.ts';
import { OEWS } from './oews-2025.ts';

/** The table of Cuenta Horas this module copies, read from its source as the growth contract reads every app. */
const PAY_TABLE = new URL('../../../pay/src/guide/minimum-wage-states.ts', import.meta.url);
const { MINIMUM_WAGE_STATES } = (await import(PAY_TABLE.href)) as {
  readonly MINIMUM_WAGE_STATES: readonly {
    readonly name: { readonly en: string };
    readonly wage: number;
    readonly source: string;
  }[];
};

describe('the minimum wage of each state', () => {
  it('holds a rate for each of the 50 states and DC, never below the federal $7.25', () => {
    for (const { fips } of AREAS) expect(minimumWageOf(fips).cents).toBeGreaterThanOrEqual(725);
    expect(Object.keys(MINIMUM_WAGES)).toHaveLength(AREAS.length);
  });

  it('is the copy of the Cuenta Horas table, rate and source, state by state', () => {
    for (const area of AREAS) {
      const pay = MINIMUM_WAGE_STATES.find(({ name }) => name.en === area.name.en);
      expect(pay, area.name.en).toBeDefined();
      expect(minimumWageOf(area.fips).cents, area.name.en).toBe(pay?.wage);
      expect(minimumWageOf(area.fips).source, area.name.en).toBe(
        pay?.source === 'fl' ? 'fl' : 'dol',
      );
    }
  });

  it('sits below the median of every trade in every state, as the wage pages say', () => {
    for (const [trade, states] of Object.entries(OEWS))
      for (const [fips, [, median]] of Object.entries(states))
        if (fips !== 'US')
          expect(median * 100, `${trade} ${fips}`).toBeGreaterThan(minimumWageOf(fips).cents);
  });

  it('refuses an area it does not know', () => {
    expect(() => minimumWageOf('99')).toThrow('no minimum wage for 99');
  });
});
