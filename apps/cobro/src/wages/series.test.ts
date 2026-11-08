import { describe, expect, it } from 'vitest';
import { AREAS, slugOf } from './areas.ts';
import { OCCUPATIONS } from './occupations.ts';
import { seriesIdOf, wagesModule } from './series.ts';

describe('seriesIdOf', () => {
  // verified against the BLS API on 2026-11-08: Texas painters, hourly mean and median
  it('names a state series: OEUS, 7-digit area, 6-digit industry, SOC, data type', () => {
    expect(seriesIdOf('48', '472141', 'mean')).toBe('OEUS480000000000047214103');
    expect(seriesIdOf('48', '472141', 'median')).toBe('OEUS480000000000047214108');
  });

  it('names a national series with the national area type', () => {
    expect(seriesIdOf('US', '472141', 'mean')).toBe('OEUN000000000000047214103');
  });
});

describe('areas and occupations', () => {
  it('lists the 50 states and DC, each once, in both languages', () => {
    expect(AREAS).toHaveLength(51);
    expect(new Set(AREAS.map(({ fips }) => fips)).size).toBe(51);
    expect(new Set(AREAS.map(({ slug }) => slug.es)).size).toBe(51);
    expect(new Set(AREAS.map(({ slug }) => slug.en)).size).toBe(51);
  });

  it('slugs a name without accents or spaces', () => {
    expect(slugOf('Nuevo México')).toBe('nuevo-mexico');
    expect(AREAS.find(({ fips }) => fips === '11')?.slug.es).toBe('distrito-de-columbia');
  });

  it('holds five occupations whose code and series digits agree', () => {
    expect(OCCUPATIONS).toHaveLength(5);
    for (const { code, soc } of OCCUPATIONS) expect(code.replace('-', '')).toBe(soc);
  });
});

describe('wagesModule', () => {
  const readings = new Map([
    [seriesIdOf('48', '472141', 'mean'), 22.13],
    [seriesIdOf('48', '472141', 'median'), 21.86],
    [seriesIdOf('US', '472141', 'mean'), 25.1],
    [seriesIdOf('US', '472141', 'median'), 24.5],
    [seriesIdOf('01', '472141', 'mean'), 20.0],
  ]);
  const text = wagesModule(readings);

  it('writes numbers only, mean then median, for the areas that have both', () => {
    expect(text).toContain("painting: {\n    US: [25.1, 24.5],\n    '48': [22.13, 21.86],\n  }");
  });

  it('leaves out an area with only one of the two figures', () => {
    expect(text).not.toContain("'01'");
  });

  it('keeps an occupation with no reading as an empty record', () => {
    expect(text).toContain('cleaning: {},');
  });

  it('names the release and the access day', () => {
    expect(text).toContain("release: 'May 2025'");
    expect(text).toContain("accessed: '2026-11-08'");
  });
});
