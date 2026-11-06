import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ALKALINITY,
  CALCIUM,
  CHLORINE,
  FILL_TIME,
  HEATER,
  PH,
  PUMP,
  SALT,
  STABILIZER,
} from './doses.ts';
import { HOME_TEXTS, HOME_TOOLS, NAV_LINKS, toolsOf } from './home.ts';
import { hrefOf, routeOf } from './routes.ts';
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
      CALCIUM.path,
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

describe('the Spanish home', () => {
  it('lists the same calculators in the same order, each at its Spanish page once it is built', () => {
    const cards = toolsOf('es');
    expect(cards).toHaveLength(HOME_TOOLS.length);
    for (const [index, { href }] of HOME_TOOLS.entries()) {
      const id = routeOf(href)?.id ?? href;
      expect(cards[index]?.href, href).toBe(hrefOf(id, 'es'));
    }
    expect(toolsOf('en')).toEqual(HOME_TOOLS);
  });

  it('says on a Spanish card when its calculator is still in English', () => {
    for (const { href, summary } of toolsOf('es'))
      expect(summary.endsWith(' (en inglés)'), href).toBe(!href.startsWith('/es/'));
  });

  it('gives each card a short Spanish title and a one-line summary', () => {
    for (const { title, summary } of toolsOf('es')) {
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(16);
      expect(summary.length).toBeLessThanOrEqual(90);
    }
  });

  // US units stay, and "alberca" once for the readers who search it (plans/pool/SPANISH.md)
  it('keeps US units and says alberca once', () => {
    const text = JSON.stringify([HOME_TEXTS.es, toolsOf('es')]);
    expect(text).toContain('galones');
    expect(text).toContain('libras');
    expect(text.match(/alberca/g)).toHaveLength(1);
  });

  it('titles the Spanish home for search, its own title and description', () => {
    const { title, description } = HOME_TEXTS.es;
    expect(title.length).toBeLessThanOrEqual(65);
    expect(description.length).toBeGreaterThanOrEqual(50);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(title).not.toBe(HOME_TEXTS.en.title);
  });
});
