import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL } from '../legal/texts.ts';
import { METHODOLOGY_TEXTS } from '../methodology/texts.ts';
import { ROUTES } from '../routes.ts';
import { ABOUT_PATHS, ABOUT_TEXTS, PRIMARY_SOURCE_HOSTS } from './texts.ts';

const pageFile = (path: string): string =>
  resolve(import.meta.dirname, '../pages', `${path.slice(1)}.astro`);
const layout = readFileSync(resolve(import.meta.dirname, '../components/SiteLayout.astro'), 'utf8');
const textOf = (lang: 'en' | 'es'): string =>
  [
    ABOUT_TEXTS[lang].lead,
    ...ABOUT_TEXTS[lang].sections.flatMap(({ paragraphs }) => paragraphs),
  ].join('\n');

describe('the about page', () => {
  it('is routed as an article pair at /about and /es/acerca, one page file each', () => {
    expect(ABOUT_PATHS).toEqual({ en: '/about', es: '/es/acerca' });
    expect(ROUTES).toContainEqual({ id: 'about', kind: 'article', ...ABOUT_PATHS });
    expect(existsSync(pageFile(ABOUT_PATHS.en))).toBe(true);
    expect(existsSync(pageFile(ABOUT_PATHS.es))).toBe(true);
  });

  it('is linked from the footer of every page, in each language', () => {
    const footer = /<footer[\s\S]*<\/footer>/.exec(layout)?.[0] ?? '';
    expect(footer).toContain('about.href');
    expect(layout).toContain("href: '/about'");
    expect(layout).toContain("href: '/es/acerca'");
  });

  it('keeps titles under 70 characters and descriptions search engines can show whole', () => {
    for (const texts of Object.values(ABOUT_TEXTS)) {
      expect(texts.title).toContain('Cuenta Horas');
      expect(texts.title.length).toBeLessThanOrEqual(70);
      expect(texts.description.length).toBeGreaterThan(50);
      expect(texts.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('has the same sections in both languages, each with a unique id and a paragraph', () => {
    expect(ABOUT_TEXTS.es.sections).toHaveLength(ABOUT_TEXTS.en.sections.length);
    for (const texts of Object.values(ABOUT_TEXTS)) {
      const ids = texts.sections.map(({ id }) => id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const { paragraphs } of texts.sections) expect(paragraphs.length).toBeGreaterThan(0);
    }
  });

  it('links the methodology and the privacy page of its own language', () => {
    const links = (lang: 'en' | 'es') =>
      ABOUT_TEXTS[lang].sections.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links('en')).toEqual(expect.arrayContaining(['/methodology', '/privacy']));
    expect(links('es')).toEqual(expect.arrayContaining(['/es/metodologia', '/es/privacidad']));
    for (const href of [...links('en'), ...links('es')]) {
      expect(existsSync(pageFile(href)), href).toBe(true);
    }
  });

  it('gives the address readers write to', () => {
    for (const lang of ['en', 'es'] as const) expect(textOf(lang)).toContain(CONTACT_EMAIL);
  });

  // The page claims primary sources only: the agencies it names are the hosts the methodology cites.
  it('names exactly the primary sources the methodology cites', () => {
    const cited = new Set(
      Object.values(METHODOLOGY_TEXTS).flatMap(({ sections }) =>
        sections.flatMap(({ sources }) => sources.map(({ href }) => new URL(href).hostname)),
      ),
    );
    expect([...PRIMARY_SOURCE_HOSTS].sort()).toEqual([...cited].sort());
    for (const lang of ['en', 'es'] as const) {
      for (const host of PRIMARY_SOURCE_HOSTS) {
        expect(textOf(lang), host).toContain(host.replace(/^www\./, ''));
      }
    }
  });

  it('says the figures are estimates, that there are no accounts and that no data is sold', () => {
    expect(textOf('en')).toContain('estimates');
    expect(textOf('en')).toContain('no accounts');
    expect(textOf('en')).toContain('We do not sell');
    expect(textOf('es')).toContain('estimaciones');
    expect(textOf('es')).toContain('no tiene cuentas');
    expect(textOf('es')).toContain('No vendemos');
  });
});
