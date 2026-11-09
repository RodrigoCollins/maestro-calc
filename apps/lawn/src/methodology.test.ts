import { describe, expect, it } from 'vitest';
import { CALCULATORS } from './calculators.ts';
import { METHOD_PAGE, METHOD_SECTIONS, NORMALS_SOURCES, SOURCES_CHECKED } from './methodology.ts';
import { viewOf } from './view.ts';

describe('methodology', () => {
  it('has a section for every calculator and one for the frost dates', () => {
    expect(METHOD_SECTIONS.flatMap(({ calculator }) => calculator ?? [])).toEqual(
      CALCULATORS.map(({ id }) => id),
    );
    expect(METHOD_SECTIONS.at(-1)?.id).toBe('frost');
    expect(new Set(METHOD_SECTIONS.map(({ id }) => id)).size).toBe(METHOD_SECTIONS.length);
  });

  it('gives each section the formula its calculator page shows', () => {
    for (const { calculator, method, href } of METHOD_SECTIONS) {
      if (calculator === undefined) continue;
      const page = CALCULATORS.find(({ id }) => id === calculator);
      expect(method).toBe(page?.method);
      expect(href).toBe(page?.path);
    }
  });

  // every case is worked by hand in its text; the page must give exactly its result
  it.each(
    METHOD_SECTIONS.flatMap(({ calculator, cases }) => cases.map((c) => [calculator, c] as const)),
  )(
    'runs the case "%#" through the engine to its published figure',
    (calculator, { raw, units, v, result }) => {
      if (calculator === undefined) throw new Error('a case needs a calculator');
      expect(viewOf(calculator, raw, units)?.values[v]).toBe(result);
    },
  );

  it('cites every source with an address on https, and the calculators with a source or a reason', () => {
    for (const { sources, calculator } of METHOD_SECTIONS) {
      for (const { url } of sources) expect(url).toMatch(/^https:\/\//);
      // sod is geometry: its note says why it has no source
      if (calculator !== 'sod' && calculator !== undefined)
        expect(sources.length).toBeGreaterThan(0);
    }
    expect(NORMALS_SOURCES.length).toBeGreaterThanOrEqual(5);
  });

  it('dates the reading of its sources', () => {
    expect(SOURCES_CHECKED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(METHOD_PAGE.checked).toContain(SOURCES_CHECKED);
    expect(METHOD_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(METHOD_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(METHOD_PAGE.description.length).toBeLessThanOrEqual(160);
  });
});
