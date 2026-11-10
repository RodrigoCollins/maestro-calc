import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ABOUT_TEXTS } from '../about/texts.ts';
import { CONTACT_EMAIL } from '../legal/texts.ts';
import { METHODOLOGY_TEXTS } from '../methodology/texts.ts';
import { ROUTES } from '../routes.ts';
import { BYLINE_PAGES } from './bylines.ts';
import { BYLINE_TEXTS, EDITORIAL_PATHS, EDITORIAL_TEXTS } from './texts.ts';

const LANGS = ['en', 'es'] as const;
const pageFile = (path: string): string =>
  resolve(import.meta.dirname, '../pages', `${path.slice(1)}.astro`);
const layout = readFileSync(resolve(import.meta.dirname, '../components/SiteLayout.astro'), 'utf8');
const textOf = (lang: 'en' | 'es'): string =>
  [
    EDITORIAL_TEXTS[lang].h1,
    EDITORIAL_TEXTS[lang].lead,
    ...EDITORIAL_TEXTS[lang].sections.flatMap(({ heading, paragraphs, sources = [] }) => [
      heading,
      ...paragraphs,
      ...sources.map(({ label }) => label),
    ]),
  ].join('\n');
/** Every address the site cites: the sources of the byline pages and of the methodology. */
const cited = new Set([
  ...BYLINE_PAGES.flatMap(({ sources }) => sources),
  ...Object.values(METHODOLOGY_TEXTS).flatMap(({ sections }) =>
    sections.flatMap(({ sources }) => sources.map(({ href }) => href)),
  ),
]);

describe('the editorial policy', () => {
  it('is routed as an article pair at /editorial-policy and /es/politica-editorial', () => {
    expect(EDITORIAL_PATHS).toEqual({ en: '/editorial-policy', es: '/es/politica-editorial' });
    expect(ROUTES).toContainEqual({ id: 'editorial-policy', kind: 'article', ...EDITORIAL_PATHS });
    for (const lang of LANGS) expect(existsSync(pageFile(EDITORIAL_PATHS[lang])), lang).toBe(true);
  });

  it('is linked from the footer of every page and from the about page, in each language', () => {
    const footer = /<footer[\s\S]*<\/footer>/.exec(layout)?.[0] ?? '';
    expect(footer).toContain('EDITORIAL_PATHS[lang]');
    for (const lang of LANGS) {
      const links = ABOUT_TEXTS[lang].sections.flatMap(({ link }) => link?.href ?? []);
      expect(links, lang).toContain(EDITORIAL_PATHS[lang]);
    }
  });

  it('keeps titles under 70 characters and descriptions search engines can show whole', () => {
    for (const texts of Object.values(EDITORIAL_TEXTS)) {
      expect(texts.title).toContain('Cuenta Horas');
      expect(texts.title.length).toBeLessThanOrEqual(70);
      expect(texts.description.length).toBeGreaterThan(50);
      expect(texts.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('has the same sections in both languages, each with a unique id and a paragraph', () => {
    const ids = (lang: 'en' | 'es') => EDITORIAL_TEXTS[lang].sections.map(({ id }) => id);
    expect(ids('es')).toEqual(ids('en'));
    expect(new Set(ids('en')).size).toBe(ids('en').length);
    expect(ids('en')).toEqual([
      'who',
      'sources',
      'checks',
      'reviews',
      'errors',
      'advice',
      'affiliate',
    ]);
    for (const lang of LANGS)
      for (const { paragraphs } of EDITORIAL_TEXTS[lang].sections)
        expect(paragraphs.length).toBeGreaterThan(0);
  });

  // the team is the author: no person is named, and no credential is claimed
  it('credits the editorial team, names no person and says what the team is not', () => {
    expect(textOf('en')).toContain('Cuenta Horas editorial team');
    expect(textOf('en')).toContain('not lawyers, CPAs or payroll providers');
    expect(textOf('es')).toContain('equipo editorial de Cuenta Horas');
    expect(textOf('es')).toContain('no somos abogados, contadores ni proveedores de nómina');
    for (const lang of LANGS) expect(textOf(lang)).not.toMatch(/Rodrigo|Collins/i);
  });

  it('links only sources the site cites, the Department of Labor and the IRS among them', () => {
    for (const lang of LANGS) {
      const sources = EDITORIAL_TEXTS[lang].sections.flatMap(({ sources = [] }) => sources);
      expect(sources.length, lang).toBeGreaterThan(4);
      for (const { href } of sources) expect(cited.has(href), href).toBe(true);
      const hosts = new Set(sources.map(({ href }) => new URL(href).hostname));
      expect([...hosts]).toEqual(expect.arrayContaining(['www.dol.gov', 'www.irs.gov']));
    }
    const hrefs = (lang: 'en' | 'es') =>
      EDITORIAL_TEXTS[lang].sections.flatMap(({ sources = [] }) => sources.map(({ href }) => href));
    expect(hrefs('es')).toEqual(hrefs('en'));
  });

  it('links the methodology of its language, gives the contact address and disclaims advice', () => {
    const links = (lang: 'en' | 'es') =>
      EDITORIAL_TEXTS[lang].sections.flatMap(({ link }) => link?.href ?? []);
    expect(links('en')).toContain('/methodology');
    expect(links('es')).toContain('/es/metodologia');
    // the site's own address, which the error reports go to
    expect(CONTACT_EMAIL).toBe('hola@cuentahoras.com');
    for (const lang of LANGS) expect(textOf(lang)).toContain(CONTACT_EMAIL);
    expect(textOf('en')).toContain('not legal or tax advice');
    expect(textOf('en')).toContain('Wage and Hour Division');
    expect(textOf('es')).toContain('no son asesoría legal ni fiscal');
    expect(textOf('es')).toContain('División de Horas y Salarios');
  });

  it('discloses paid links: the label, the commission and the Amazon statement', () => {
    const affiliate = (lang: 'en' | 'es'): string =>
      EDITORIAL_TEXTS[lang].sections
        .filter(({ id }) => id === 'affiliate')
        .flatMap(({ paragraphs }) => paragraphs)
        .join('\n');
    expect(affiliate('en')).toContain('"Paid link"');
    expect(affiliate('en')).toContain('commission at no extra cost to you');
    expect(affiliate('en')).toContain('As an Amazon Associate we earn from qualifying purchases');
    expect(affiliate('es')).toContain('"Enlace pagado"');
    expect(affiliate('es')).toContain('comisión sin costo extra para ti');
    expect(affiliate('es')).toContain(
      'Como Asociado de Amazon, ganamos con las compras que cumplen los requisitos',
    );
  });

  it('says when the state tables are rechecked: before January 1 and July 1', () => {
    expect(textOf('en')).toMatch(/before every January 1 and July 1/);
    expect(textOf('es')).toMatch(/antes de cada 1 de enero y 1 de julio/);
  });

  it('gives the byline words of each language, the team linked to the policy', () => {
    expect(BYLINE_TEXTS.en).toEqual({
      by: 'By the',
      team: 'Cuenta Horas editorial team',
      reviewed: 'Reviewed',
      sources: 'Sources',
    });
    expect(BYLINE_TEXTS.es).toEqual({
      by: 'Por el',
      team: 'equipo editorial de Cuenta Horas',
      reviewed: 'Revisado el',
      sources: 'Fuentes',
    });
  });
});
