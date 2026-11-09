import { describe, expect, it } from 'vitest';
import { CALCULATORS } from './calculators.ts';
import { WORKED } from './calculator-worked.ts';
import { viewOf } from './view.ts';

describe('calculator worked examples', () => {
  it('works an example on the sod and lime pages, each with what to know', () => {
    expect(Object.keys(WORKED).sort()).toEqual(['lawn-lime', 'sod']);
    for (const [id, worked] of Object.entries(WORKED)) {
      expect(CALCULATORS.some((page) => page.id === id)).toBe(true);
      expect(worked.heading).toMatch(/^Worked example/);
      expect(worked.cases.length).toBeGreaterThanOrEqual(3);
      expect(worked.know.length).toBeGreaterThanOrEqual(3);
    }
  });

  // every case is worked by hand in its text; the engine must give exactly its result
  it.each(
    Object.entries(WORKED).flatMap(([id, { cases }]) =>
      cases.map((c) => [id as keyof typeof WORKED, c] as const),
    ),
  )('runs the %s case "%#" through the engine to its published figure', (id, c) => {
    expect(viewOf(id, c.raw)?.values[c.v]).toBe(c.result);
  });

  it('cites the lime source with an address on https', () => {
    for (const { sources } of Object.values(WORKED))
      for (const { url } of sources) expect(url).toMatch(/^https:\/\//);
    expect(WORKED['lawn-lime'].sources.length).toBeGreaterThan(0);
  });
});
