import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { figure } from './__testing__/figure.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { ALKALINITY, CHLORINE, SALT, STABILIZER } from './doses.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

const row = (id: string) => {
  const found = CHEMISTRY_CHART.rows.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`no row ${id}`);
  return found;
};

describe('the water chemistry chart', () => {
  it('lives at its own page, with a description search engines can show whole', () => {
    expect(pages).toContain(CHEMISTRY_CHART.path);
    expect(CHEMISTRY_CHART.title.endsWith(' | Pool Figures')).toBe(true);
    expect(CHEMISTRY_CHART.description.length).toBeGreaterThan(50);
    expect(CHEMISTRY_CHART.description.length).toBeLessThanOrEqual(160);
  });

  it('gives each row a unique id, a name, both ranges and a text', () => {
    const ids = CHEMISTRY_CHART.rows.map(({ id }) => id);
    expect(ids).toEqual(['chlorine', 'ph', 'alkalinity', 'stabilizer', 'calcium', 'salt']);
    for (const { name, home, publicPool, text } of CHEMISTRY_CHART.rows)
      for (const value of [name, home, publicPool, text]) expect(value.length).toBeGreaterThan(0);
  });

  it('sends the gallons and each dose to the calculator that works it out', () => {
    expect(CHEMISTRY_CHART.gallons.href).toBe(VOLUME_TEXTS.path);
    expect(row('chlorine').link?.href).toBe(CHLORINE.path);
    expect(row('alkalinity').link?.href).toBe(ALKALINITY.path);
    expect(row('stabilizer').link?.href).toBe(STABILIZER.path);
    expect(row('salt').link?.href).toBe(SALT.path);
    for (const { link } of CHEMISTRY_CHART.rows)
      if (link !== undefined) expect(pages, link.href).toContain(link.href);
  });

  // a dose the chart states is the calculator's own figure, to the digit
  it.each(
    CHEMISTRY_CHART.rows.flatMap(({ id, link, example }) =>
      example === undefined ? [] : [[id, link, example] as const],
    ),
  )('works out the %s example as the calculator does', (_id, link, { raw, key, result }) => {
    expect(link).toBeDefined();
    expect(figure(link?.href ?? '', raw, key)).toBe(result);
  });

  it('cites every source it names on https, and names every source it cites', () => {
    const cited = new Set(CHEMISTRY_CHART.rows.flatMap(({ sources }) => sources));
    expect([...cited].sort()).toEqual(Object.keys(CHEMISTRY_CHART.sources).sort());
    for (const { url } of Object.values(CHEMISTRY_CHART.sources))
      expect(url.startsWith('https://')).toBe(true);
  });

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the home-pool ranges as Hayward’s AquaRite manual publishes them', () => {
    expect(row('chlorine').home).toBe('1.0 to 3.0 ppm');
    expect(row('ph').home).toBe('7.2 to 7.8');
    expect(row('alkalinity').home).toBe('80 to 120 ppm');
    expect(row('stabilizer').home).toBe('30 to 50 ppm outdoors, none indoors');
    expect(row('calcium').home).toBe('200 to 400 ppm');
    expect(row('salt').home).toBe('2,700 to 3,400 ppm, 3,200 best');
  });

  it('gives the public-pool limits as the 2024 Model Aquatic Health Code publishes them', () => {
    expect(row('chlorine').publicPool).toBe('at least 1.0 ppm, 2.0 ppm with CYA');
    expect(row('ph').publicPool).toBe('7.0 to 7.8');
    expect(row('alkalinity').publicPool).toBe('60 to 180 ppm');
    expect(row('stabilizer').publicPool).toBe('90 ppm at most');
    expect(row('calcium').publicPool).toBe('2,500 ppm at most');
    expect(row('salt').publicPool).toBe('the range the cell maker gives');
  });

  it('gives CDC’s home-pool minimums where they differ from the manual', () => {
    expect(row('chlorine').text).toContain('at least 1 ppm');
    expect(row('chlorine').text).toContain('at least 2 ppm');
    expect(row('ph').text).toContain('pH 7.0 to 7.8');
  });

  it('agrees with the limits the calculator pages state', () => {
    expect(SALT.method).toContain('2,700 to 3,400 ppm');
    expect(ALKALINITY.note).toContain(row('alkalinity').publicPool);
    expect(STABILIZER.method).toContain('90 ppm');
  });
});
