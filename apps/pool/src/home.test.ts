import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ALKALINITY, CHLORINE, FILL_TIME, HEATER, PH, PUMP, SALT, STABILIZER } from './doses.ts';
import { HOME_TOOLS, NAV_LINKS } from './home.ts';
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
      PH.path,
      ALKALINITY.path,
      STABILIZER.path,
      HEATER.path,
      FILL_TIME.path,
    ]);
    expect([...hrefs].sort()).toEqual([...pages].sort());
  });

  // eight uppercase links wrap to four rows on a phone: the header keeps the first four and a link
  // to every card of the home
  it('keeps the header to the first four calculators and a link to all of them', () => {
    expect(NAV_LINKS).toEqual([
      ...HOME_TOOLS.slice(0, 4).map(({ href, title }) => ({ href, title })),
      { href: '/#pool-tools', title: 'All calculators' },
    ]);
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
