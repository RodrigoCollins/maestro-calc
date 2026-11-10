import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ABOUT_TEXTS } from './about.ts';
import {
  BYLINE_TEXTS,
  EDITORIAL_TEXTS,
  OFFICIAL_SOURCES,
  bylineOf,
  citedSources,
} from './editorial.ts';
import { footerLinksOf } from './layout.ts';
import { CONTACT_EMAIL } from './privacy.ts';
import { hrefOf, routeOf } from './routes.ts';
import { pageKindOf } from './seo/json-ld.ts';

const pagesDir = fileURLToPath(new URL('pages/', import.meta.url));
const textOf = (lang: 'en' | 'es'): string => {
  const { lead, sections } = EDITORIAL_TEXTS[lang];
  return [lead, ...sections.flatMap(({ paragraphs }) => paragraphs)].join('\n');
};

describe('the editorial policy page', () => {
  it('lives at /editorial-policy and /es/politica-editorial as an article, in both footers', () => {
    expect(routeOf('/editorial-policy')).toMatchObject({
      id: 'editorial',
      kind: 'article',
      es: '/es/politica-editorial',
    });
    expect(readdirSync(pagesDir)).toContain('editorial-policy.astro');
    expect(readdirSync(new URL('es/', `file://${pagesDir}`))).toContain('politica-editorial.astro');
    expect(pageKindOf('/es/politica-editorial')).toBe('article');
    for (const lang of ['en', 'es'] as const)
      expect(footerLinksOf(lang).map(({ href }) => href)).toContain(hrefOf('editorial', lang));
  });

  it('has the same sections in both languages, each titled, with descriptions search engines show whole', () => {
    const ids = (lang: 'en' | 'es') => EDITORIAL_TEXTS[lang].sections.map(({ id }) => id);
    expect(ids('en')).toEqual([
      'who',
      'sources',
      'checks',
      'reviews',
      'errors',
      'advice',
      'affiliate',
    ]);
    expect(ids('es')).toEqual(ids('en'));
    expect(EDITORIAL_TEXTS.en.title).toBe('Editorial policy | Pool Figures');
    expect(EDITORIAL_TEXTS.es.title).toBe('Política editorial | Pool Figures');
    for (const lang of ['en', 'es'] as const) {
      const { description } = EDITORIAL_TEXTS[lang];
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });

  // honest authorship: an organization, no invented person and no credential it does not hold
  it('is written by the editorial team, which claims no credential', () => {
    expect(textOf('en')).toContain('Pool Figures editorial team');
    expect(textOf('en')).toContain('We are not pool operators, chemists or lifeguards');
    expect(textOf('es')).toContain('equipo editorial de Pool Figures');
    expect(textOf('es')).toContain('No somos operadores de piscinas, químicos ni salvavidas');
  });

  it('lists only official sources the site cites, each linked at the address the site cites it', () => {
    const cited = new Set(citedSources().map(({ url }) => url));
    expect(OFFICIAL_SOURCES.map(({ mark }) => mark)).toEqual([
      'EPA Reg. No.',
      'Model Aquatic Health Code',
      'Taylor',
      'HASA',
      'Hayward',
      'Pentair',
      'Jandy',
      'NIST',
      'USGS',
      'Department of Energy',
      'ANSI/APSP/ICC-15',
    ]);
    for (const lang of ['en', 'es'] as const) {
      const list = EDITORIAL_TEXTS[lang].sections.find(({ id }) => id === 'sources')?.sources;
      expect(list?.length, lang).toBe(OFFICIAL_SOURCES.length);
      for (const { url } of list ?? []) {
        expect(url, lang).toMatch(/^https:\/\//);
        expect(cited.has(url), url).toBe(true);
      }
    }
  });

  it('links the methodology, gives the contact address and says it is not professional advice', () => {
    for (const lang of ['en', 'es'] as const) {
      const links = EDITORIAL_TEXTS[lang].sections.flatMap(({ link }) =>
        link === undefined ? [] : [link.href],
      );
      expect(links, lang).toContain(hrefOf('methodology', lang));
      expect(textOf(lang), lang).toContain(CONTACT_EMAIL);
    }
    expect(textOf('en')).toContain('not professional advice');
    expect(textOf('es')).toContain('no es asesoría profesional');
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

  it('is linked from the about page in both languages', () => {
    for (const lang of ['en', 'es'] as const) {
      const links = ABOUT_TEXTS[lang].sections.flatMap(({ link }) =>
        link === undefined ? [] : [link.href],
      );
      expect(links, lang).toContain(hrefOf('editorial', lang));
    }
  });
});

describe('bylineOf', () => {
  it('credits the editorial team, linked to the policy of the language, with the date and sources', () => {
    expect(bylineOf('en', { checked: '2026-11-05', sources: true })).toEqual({
      by: 'By',
      team: { href: '/editorial-policy', label: 'the Pool Figures editorial team' },
      reviewed: { label: 'Reviewed', datetime: '2026-11-05', text: 'November 5, 2026' },
      sources: { href: '#sources', label: 'Sources' },
    });
    expect(bylineOf('es', { checked: '2026-11-05', sources: true })).toEqual({
      by: 'Por',
      team: { href: '/es/politica-editorial', label: 'el equipo editorial de Pool Figures' },
      reviewed: { label: 'Revisado el', datetime: '2026-11-05', text: '5 de noviembre de 2026' },
      sources: { href: '#sources', label: 'Fuentes' },
    });
  });

  // a page with no reviewed date in its data prints none: the byline never invents a date
  it('leaves out the date and the sources link a page does not have', () => {
    expect(bylineOf('en', {})).toEqual({
      by: 'By',
      team: { href: '/editorial-policy', label: 'the Pool Figures editorial team' },
    });
  });

  it('names the sources section the link points to in both languages', () => {
    expect(BYLINE_TEXTS.en.sources).toBe('Sources');
    expect(BYLINE_TEXTS.es.sources).toBe('Fuentes');
  });
});
