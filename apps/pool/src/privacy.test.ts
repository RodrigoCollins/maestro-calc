import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { footerLinksOf } from './layout.ts';
import { hrefOf } from './routes.ts';
import { CONTACT_EMAIL, PRIVACY, PRIVACY_TEXTS } from './privacy.ts';

const pages = readdirSync(fileURLToPath(new URL('pages/', import.meta.url)));
const text = PRIVACY.sections.flatMap(({ paragraphs }) => paragraphs).join('\n');

describe('the privacy page', () => {
  it('lives at /privacy, linked from the footer of every page in both languages', () => {
    expect(pages).toContain('privacy.astro');
    for (const lang of ['en', 'es'] as const)
      expect(footerLinksOf(lang).map(({ href }) => href)).toContain(hrefOf('privacy', lang));
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

  it('writes to its own address on its own domain', () => {
    expect(CONTACT_EMAIL).toBe('hola@poolfigures.com');
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

describe('the Spanish privacy page', () => {
  const es = PRIVACY_TEXTS.es;
  const spanish = es.sections.flatMap(({ paragraphs }) => paragraphs).join('\n');

  it('is the English page in the same sections, with its own title and description', () => {
    expect(PRIVACY_TEXTS.en).toBe(PRIVACY);
    expect(es.sections.map(({ id }) => id)).toEqual(PRIVACY.sections.map(({ id }) => id));
    expect(es.sections.map(({ paragraphs }) => paragraphs.length)).toEqual(
      PRIVACY.sections.map(({ paragraphs }) => paragraphs.length),
    );
    expect(es.title).toBe('Privacidad | Pool Figures');
    expect(es.description.length).toBeGreaterThan(50);
    expect(es.description.length).toBeLessThanOrEqual(160);
  });

  it('describes the same Consent Mode defaults and the same address', () => {
    expect(spanish).toContain('Google Analytics');
    expect(spanish).toContain('el Espacio Económico Europeo, el Reino Unido y Suiza');
    expect(spanish).toContain('Global Privacy Control');
    expect(spanish).toContain('_ga');
    expect(spanish).toContain(CONTACT_EMAIL);
  });

  it('says the values you type never reach analytics', () => {
    expect(spanish).toContain('sin los valores que escribiste');
    expect(spanish).toMatch(
      /Nada de lo que escribes[^.]*se envía a nosotros ni a Google Analytics/,
    );
  });
});
