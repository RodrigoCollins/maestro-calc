import { Rational, toCents, type Money } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { CASES } from './cases.ts';
import { CALCULATORS } from './lib/calculators.ts';
import { OCCUPATIONS } from './wages/occupations.ts';

const dollars = (value: unknown): string => {
  const { integer, fraction } = toCents(value as Money);
  return `${String(integer)}.${fraction}`;
};

describe('the published cases', () => {
  it.each(CASES.map((each) => [each.name.en, each] as const))('%s', (_name, each) => {
    const ran = CALCULATORS[each.trade].run(each.raw);
    if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
    const out = Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
    expect(dollars(out['labor'])).toBe(each.labor);
    expect(dollars(out['materials'])).toBe(each.materials);
    expect(dollars(out['total'])).toBe(each.total);
    expect(out['units']).toEqual(Rational.of(each.units));
  });

  it('covers every trade with its starting values and one more case, named in both languages', () => {
    for (const { id } of OCCUPATIONS) {
      const of = CASES.filter(({ trade }) => trade === id);
      expect(of.length, id).toBeGreaterThanOrEqual(2);
      expect(Object.keys(of[0]?.raw ?? { x: 1 }), id).toEqual([]);
    }
    for (const { name } of CASES) {
      expect(name.es.length).toBeGreaterThan(10);
      expect(name.en.length).toBeGreaterThan(10);
    }
  });
});
