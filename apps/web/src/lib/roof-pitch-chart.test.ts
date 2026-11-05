import { readFileSync } from 'node:fs';
import { decode, deg, valueIn } from '@maestro-calc/core';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { JOBS } from '../routing/jobs.ts';
import { LOCALES } from '../routing/routes.ts';
import {
  IRC_R905,
  pitchOfAngle,
  REVERSE_ANGLES,
  roofPitchChartBasis,
  roofPitchChartTable,
  roofPitchReverse,
} from './roof-pitch-chart.ts';

const { cases } = JOBS['roof-pitch-chart'];

describe('roof pitch chart (growth plan › reference charts)', () => {
  // hand-verified: atan(1/12) = 4.764°, 100/12 = 8.33%, √(1 + 1/144) = 1.00347; atan(1/2) = 26.565°,
  // √1.25 = 1.11803; atan(0.625) = 32.005°, √1.390625 = 1.17925; atan(1) = 45°, √2 = 1.41421;
  // atan(2) = 63.435°, √5 = 2.23607
  it('works every pitch out with the roof pitch engine: angle, grade and rafter multiplier', () => {
    const table = roofPitchChartTable(cases, 'en');
    expect(table.rows).toHaveLength(cases.length);
    const row = (label: string) => table.rows.find((each) => each.label === label)?.cells;
    expect(row('1/12')?.slice(0, 3)).toEqual(['4.76°', '8.33%', '1.003']);
    expect(row('6/12')?.slice(0, 3)).toEqual(['26.57°', '50.00%', '1.118']);
    expect(row('7.5/12')?.slice(0, 3)).toEqual(['32.01°', '62.50%', '1.179']);
    expect(row('12/12')?.slice(0, 3)).toEqual(['45.00°', '100.00%', '1.414']);
    expect(row('24/12')?.slice(0, 3)).toEqual(['63.43°', '200.00%', '2.236']);
    expect(table.columns).toHaveLength(5);
  });

  // IRC 2021 R905: roll 1, asphalt 2, tile 2 1/2, metal and wood 3, slate 4 in 12; asphalt and
  // tile take two layers of underlayment below 4 in 12
  it('names the coverings the IRC allows at each pitch, as the calculator checks them', () => {
    const coverings = (locale: (typeof LOCALES)[number], label: string) =>
      roofPitchChartTable(cases, locale).rows.find((each) => each.label === label)?.cells[3];
    expect(coverings('en', '1/12')).toBe('Roll');
    expect(coverings('en', '2/12')).toBe('Asphalt (2 layers), Roll');
    expect(coverings('en', '3/12')).toBe('Asphalt (2 layers), Tile (2 layers), Metal, Roll, Wood');
    expect(coverings('en', '4/12')).toBe('All six');
    expect(coverings('en', '24/12')).toBe('All six');
    expect(coverings('es', '4/12')).toBe('Las seis');
  });

  it.each(LOCALES)('links each pitch to the calculator with its rise and run in %s', (locale) => {
    const table = roofPitchChartTable(cases, locale);
    table.rows.forEach((row, index) => {
      const query = row.href.split('?')[1] ?? '';
      const state = roofPitch.validate(cases[index] ?? {});
      expect(state.ok && decode(roofPitch, query).state).toEqual(state.ok && state.value);
    });
  });

  it.each(LOCALES)('states the IRC minimum slope of every covering in %s', (locale) => {
    const facts = roofPitchChartBasis(cases, locale);
    expect(facts).toHaveLength(6);
    if (locale === 'en') {
      expect(facts).toEqual([
        { label: 'Asphalt', value: '2 in 12, two layers of underlayment below 4 in 12' },
        { label: 'Tile', value: '2.5 in 12, two layers of underlayment below 4 in 12' },
        { label: 'Metal', value: '3 in 12' },
        { label: 'Roll', value: '1 in 12' },
        { label: 'Slate', value: '4 in 12' },
        { label: 'Wood', value: '3 in 12' },
      ]);
    }
  });

  // hand-verified: 12 × tan 15° = 3.215, tan 20° = 0.36397 → 4.368, tan 22.5° = 0.41421 → 4.971,
  // tan 30° = 0.57735 → 6.928, tan 35° = 0.70021 → 8.403, tan 40° = 0.83910 → 10.069,
  // tan 45° = 1 → 12, tan 60° = 1.73205 → 20.785
  it('turns the common angles into a rise in 12 and back through the engine', () => {
    expect(REVERSE_ANGLES).toEqual([15, 20, 22.5, 30, 35, 40, 45, 60]);
    expect(REVERSE_ANGLES.map((angle) => pitchOfAngle(angle).toFixed(2))).toEqual([
      '3.22',
      '4.37',
      '4.97',
      '6.93',
      '8.40',
      '10.07',
      '12.00',
      '20.78',
    ]);
    for (const angle of REVERSE_ANGLES) {
      const state = roofPitch.validate({ rise: `${String(pitchOfAngle(angle))}in`, run: '12in' });
      if (!state.ok) throw new Error(`invalid rise for ${String(angle)}°`);
      const { outputs } = roofPitch.compute(state.value);
      expect(valueIn(outputs.angle, deg).toNumber(), String(angle)).toBeCloseTo(angle, 9);
    }
    expect(() => pitchOfAngle(0)).toThrow();
    expect(() => pitchOfAngle(90)).toThrow();
  });

  it.each(LOCALES)('writes the degrees to pitch table in %s', (locale) => {
    const reverse = roofPitchReverse(locale);
    expect(reverse.rows.map(({ label }) => label)).toEqual(
      REVERSE_ANGLES.map((angle) => `${String(angle)}°`),
    );
    expect(reverse.columns).toHaveLength(3);
    expect(reverse.rows.at(-1)?.cells).toEqual([
      locale === 'en' ? '20.78 in 12' : '20.78 en 12',
      '173.21%',
    ]);
    expect(reverse.rows[0]?.cells[1]).toBe('26.79%');
    expect(reverse.heading).toMatch(/\S/);
    expect(reverse.lead).toMatch(/\S/);
  });

  // the source is the one the roof pitch calculator page lists: a drift guard on its frontmatter
  it.each(LOCALES)('rests on the IRC source the calculator page lists in %s', (locale) => {
    const entry = readFileSync(
      fromRoot(`apps/web/src/content/calculators/${locale}/roof-pitch.md`),
      'utf8',
    );
    expect(entry).toContain(`  - name: ${IRC_R905.name}\n`);
    expect(entry).toContain(`    url: ${IRC_R905.url}\n`);
    expect(entry).toContain(`    retrieved: ${IRC_R905.retrieved}\n`);
  });
});
