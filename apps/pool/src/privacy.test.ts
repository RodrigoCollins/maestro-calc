import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL, PRIVACY } from './privacy.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)));
const layout = readFileSync(
  fileURLToPath(new URL('components/Layout.astro', import.meta.url)),
  'utf8',
);
const text = PRIVACY.sections.flatMap(({ paragraphs }) => paragraphs).join('\n');

describe('the privacy page', () => {
  it('lives at /privacy, linked from the footer of every page', () => {
    expect(pages).toContain('privacy.astro');
    expect(/<footer[\s\S]*href="\/privacy"[\s\S]*<\/footer>/.test(layout)).toBe(true);
  });

  it('is titled for the site, with a description search engines can show whole', () => {
    expect(PRIVACY.title).toBe('Privacy | Pool Figures');
    expect(PRIVACY.description.length).toBeGreaterThan(50);
    expect(PRIVACY.description.length).toBeLessThanOrEqual(160);
  });

  it('gives each section a unique id and at least one paragraph', () => {
    const ids = PRIVACY.sections.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { paragraphs } of PRIVACY.sections) expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('writes to the same address as Cuenta Horas and Maestro Calc', () => {
    expect(CONTACT_EMAIL).toBe('contacto@maestrocalc.com');
    expect(text).toContain(CONTACT_EMAIL);
  });

  // The loader (public/analytics.js) denies analytics storage in these regions and for a GPC
  // signal, and ad storage everywhere: the page says the same.
  it('describes the Consent Mode defaults of the analytics loader', () => {
    expect(text).toContain('Google Analytics');
    expect(text).toContain('the European Economic Area, the United Kingdom and Switzerland');
    expect(text).toContain('Global Privacy Control');
    expect(text).toContain('Advertising storage and ad personalization are off everywhere');
  });

  it('says the values you type never reach analytics', () => {
    expect(text).toContain('without the values you typed');
    expect(text).toMatch(/Nothing you type[^.]*is sent to us or to Google Analytics/);
  });
});
