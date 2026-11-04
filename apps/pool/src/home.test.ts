import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ALKALINITY, CHLORINE, PUMP, SALT, STABILIZER } from './doses.ts';
import { HOME_TOOLS } from './home.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('-calculator.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '')}`);

describe('home calculator cards', () => {
  it('links every calculator page once, volume first, as the pages name their paths', () => {
    const hrefs = HOME_TOOLS.map(({ href }) => href);
    expect(hrefs).toEqual([
      VOLUME_TEXTS.path,
      SALT.path,
      CHLORINE.path,
      PUMP.path,
      ALKALINITY.path,
      STABILIZER.path,
    ]);
    expect([...hrefs].sort()).toEqual([...pages].sort());
  });

  it('gives each card a short title and a one-line summary', () => {
    for (const { title, summary } of HOME_TOOLS) {
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(16);
      expect(summary.length).toBeLessThanOrEqual(90);
    }
  });

  it('promises only what the calculators do: no kidney pool and no household bleach', () => {
    const text = HOME_TOOLS.map(({ summary }) => summary.toLowerCase()).join(' ');
    expect(text).not.toContain('kidney');
    expect(text).not.toContain('bleach');
  });
});
