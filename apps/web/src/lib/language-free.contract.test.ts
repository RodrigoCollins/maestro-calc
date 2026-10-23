import { describe, expect, it } from 'vitest';
import { languageFreeProblems } from '../contract/language-free.ts';
import { calculators } from './calculators.ts';

describe('registry-wide language-free results (calculator-contract › Language-free results [CC25])', () => {
  // spec: calculator-contract › Language-free results [CC25]; PR 10 review R1-3 (the check covers
  // every shipped calculator, not `fixture-box` alone)
  it('holds for the defaults of every calculator in the registry', () => {
    expect(calculators.length).toBeGreaterThan(0);
    expect(calculators.flatMap((calculator) => languageFreeProblems(calculator))).toEqual([]);
  });

  it('reports a result whose strings are prose, markup or not canonical Rationals', () => {
    const run = (strings: readonly string[]) => ({
      id: 'probe',
      run: () => ({ ok: true, value: { strings } }),
    });
    expect(languageFreeProblems(run(['areaFt2', '125', '25/2', 'USD']))).toEqual([]);
    expect(languageFreeProblems(run(['A sheet', '<b>', '2/4', '1/1']))).toEqual([
      'probe: "A sheet" is not language-free',
      'probe: "<b>" is not language-free',
      'probe: "2/4" is not language-free',
      'probe: "1/1" is not language-free',
    ]);
  });

  it('reports a calculator whose defaults do not run, and a result with no string at all', () => {
    expect(languageFreeProblems({ id: 'broken', run: () => ({ ok: false, errors: [] }) })).toEqual([
      'broken: the defaults do not run',
    ]);
    expect(languageFreeProblems({ id: 'empty', run: () => ({ ok: true, value: 7 }) })).toEqual([
      'empty: the result holds no string, so the check proves nothing',
    ]);
  });
});
