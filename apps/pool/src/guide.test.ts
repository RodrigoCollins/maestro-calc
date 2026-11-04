import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { OPENING_GUIDE } from './guide.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)))
  .filter((name) => name.endsWith('.astro'))
  .map((name) => `/${name.replace(/\.astro$/, '').replace(/^index$/, '')}`);

describe('the spring opening guide', () => {
  it('lives at its own page', () => {
    expect(pages).toContain(OPENING_GUIDE.path);
  });

  it('numbers its steps from one, each with a title and a text', () => {
    expect(OPENING_GUIDE.steps.length).toBeGreaterThan(4);
    for (const { title, text } of OPENING_GUIDE.steps) {
      expect(title.length).toBeGreaterThan(0);
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it('sends each dose to a calculator page that exists', () => {
    const links = OPENING_GUIDE.steps.flatMap(({ link }) =>
      link === undefined ? [] : [link.href],
    );
    expect(links.length).toBeGreaterThan(0);
    for (const href of links) expect(pages, href).toContain(href);
  });

  it('cites every source it names on https, and names every source it cites', () => {
    const cited = new Set(OPENING_GUIDE.steps.flatMap(({ sources }) => sources ?? []));
    expect([...cited].sort()).toEqual(Object.keys(OPENING_GUIDE.sources).sort());
    for (const { url } of Object.values(OPENING_GUIDE.sources))
      expect(url.startsWith('https://')).toBe(true);
  });

  // the figures come from the sources as published; a changed one must be checked against them again
  it('gives the water targets exactly as CDC and Hayward publish them', () => {
    const text = OPENING_GUIDE.steps.map(({ text }) => text).join(' ');
    expect(text).toContain('at least 1 ppm');
    expect(text).toContain('at least 2 ppm');
    expect(text).toContain('pH 7.0 to 7.8');
    expect(text).toContain('7.2 to 7.8');
    expect(text).toContain('1 to 3 ppm');
  });
});
