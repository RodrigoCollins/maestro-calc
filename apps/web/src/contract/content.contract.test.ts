import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pathOf, ROUTES } from '../routing/routes.ts';
import { CALCULATOR_PAGES, PAGELESS, templateOf } from '../routing/templates.ts';
import { SITE } from '../site.config.ts';
import {
  emailsIn,
  entryRegisterProblems,
  frontmatterProblems,
  h1Count,
  h2Count,
  h2Ids,
  parseEntry,
  present,
  readEntries,
  sectionOf,
  setProblems,
} from './content.ts';
import { fromRoot } from './root.ts';

const LOCALES = ['en', 'es'] as const;
const entries = readEntries(fromRoot('apps/web/src/content/pages'));
const trustIds = Object.keys(ROUTES).filter((id) => templateOf(id) === 'trust');
const bodyOf = (path: string): string => entries.find((entry) => entry.path === path)?.body ?? '';

describe('content entries (trust-pages › [TP1], [TP3])', () => {
  // spec: trust-pages › [TP1] derived form
  it('holds one entry per trust id of the route table and locale', () => {
    expect(trustIds.length).toBeGreaterThan(0);
    expect(entries).toHaveLength(2 * trustIds.length);
    expect(setProblems(entries, trustIds, LOCALES)).toEqual([]);
  });

  // spec: trust-pages › [TP3]
  it('names the page and the locale of a missing counterpart', () => {
    const lone = [parseEntry('en/privacy.md', '---\nid: privacy\n---\n# Privacy\n')];
    expect(setProblems(lone, ['privacy'], LOCALES)).toEqual(['missing entry privacy/es']);
  });

  it('names an entry the table does not list', () => {
    const extra = [parseEntry('en/pricing.md', '# Pricing')];
    expect(setProblems(extra, [], LOCALES)).toEqual(['unexpected entry pricing/en']);
  });

  // spec: trust-pages › [TP2] contract side (the build enforces the same schema)
  it('has valid frontmatter whose id and locale equal its path', () => {
    expect(entries.flatMap(frontmatterProblems)).toEqual([]);
  });

  it('flags an id or locale that differs from the path and a schema violation', () => {
    const wrong = parseEntry(
      'en/about.md',
      '---\nid: privacy\nlocale: es\nupdated: 23/10/2026\nownerReview: pending\n---\n# About\n',
    );
    expect(frontmatterProblems(wrong)).toEqual([
      'en/about.md: updated: Invalid string: must match pattern /^(\\d{4})-(\\d{2})-(\\d{2})$/',
      'en/about.md: updated: not a calendar day',
      'en/about.md: id differs from the path',
      'en/about.md: locale differs from the path',
    ]);
  });

  it('writes every updated date as plain ISO text, so no loader can roll an impossible day over', () => {
    for (const entry of entries) {
      expect(entry.fields['updated'], entry.path).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('has exactly one H1 per body', () => {
    for (const entry of entries)
      expect({ path: entry.path, h1: h1Count(entry.body) }).toEqual({ path: entry.path, h1: 1 });
  });

  // spec: trust-pages › [TP20]
  it('has the same number of h2 sections in both locales of a page', () => {
    for (const id of trustIds) {
      expect({ id, es: h2Count(bodyOf(`es/${id}.md`)) }).toEqual({
        id,
        es: h2Count(bodyOf(`en/${id}.md`)),
      });
    }
  });

  it('counts Markdown and raw h2 headings', () => {
    expect(h2Count('# T\n## One\n<h2 id="two">Two</h2>\ntext ## not a heading\n')).toBe(2);
  });

  it('reads every address in a file as the contact address', () => {
    for (const entry of entries) {
      expect(
        emailsIn(entry.body).filter((email) => email !== SITE.contactEmail),
        entry.path,
      ).toEqual([]);
    }
    expect(emailsIn('write to a@b.co or c.d@e-f.org.')).toEqual(['a@b.co', 'c.d@e-f.org']);
  });
});

describe('Spanish register in Markdown (trust-pages › [TP19])', () => {
  it('finds no formal imperative or voseo in any Spanish entry', () => {
    expect(entries.flatMap(entryRegisterProblems)).toEqual([]);
  });

  it('names the entry and the form of a formal imperative', () => {
    const seeded = parseEntry('es/about.md', '---\nid: about\n---\n# Sobre\n\nConsulte la guía.\n');
    expect(entryRegisterProblems(seeded)).toEqual(['es/about.md: Consulte']);
  });

  it('names the voseo form in a terms entry (the PLAN.md disclaimer wording)', () => {
    const seeded = parseEntry(
      'es/terms.md',
      '---\nid: terms\n---\n# Términos\n\nverificá con un profesional y el código local.\n',
    );
    expect(entryRegisterProblems(seeded)).toEqual(['es/terms.md: verificá']);
  });

  it('does not apply the Spanish register to an English entry', () => {
    expect(entryRegisterProblems(parseEntry('en/about.md', '# About\n\nConsulte.'))).toEqual([]);
  });
});

describe('methodology (trust-pages › [TP9])', () => {
  const corrections = {
    en: '](/about#corrections)',
    es: '](/es/sobre-nosotros#correcciones)',
  } as const;

  it.each(LOCALES)(
    'describes the approach in %s with at least two sections and a corrections link',
    (locale) => {
      const body = bodyOf(`${locale}/methodology.md`);
      expect(h2Count(body)).toBeGreaterThanOrEqual(2);
      expect(body).toContain(corrections[locale]);
    },
  );

  it.each(LOCALES)('makes no certification or licensed-review claim in %s', (locale) => {
    expect(
      present(bodyOf(`${locale}/methodology.md`), [
        'certified',
        'licensed engineer',
        'ingeniero licenciado',
        'certificado por',
      ]),
    ).toEqual([]);
  });

  it('words the Spanish commitment as a promise about what is published, not a list to follow', () => {
    expect(bodyOf('es/methodology.md')).not.toContain('seguirá todo lo que sigue');
    expect(bodyOf('es/methodology.md')).toContain(
      'Cada calculadora que publiquemos cumplirá estas reglas',
    );
  });

  it('keeps the corrections links on real paths of the table', () => {
    expect(corrections.en).toBe(`](${pathOf('about', 'en')}#corrections)`);
    expect(corrections.es).toBe(`](${pathOf('about', 'es')}#correcciones)`);
  });
});

describe('about and editorial policy (trust-pages › [TP10], [TP11])', () => {
  const anchors = {
    en: ['editorial-policy', 'ai-use', 'corrections'],
    es: ['politica-editorial', 'uso-de-ia', 'correcciones'],
  } as const;
  const team = {
    en: 'Maestro Calc Editorial Team',
    es: 'Equipo editorial de Maestro Calc',
  } as const;

  it.each(LOCALES)('anchors the three sections once each, on headings, in %s', (locale) => {
    expect(h2Ids(bodyOf(`${locale}/about.md`))).toEqual(anchors[locale]);
  });

  it.each(LOCALES)(
    'presents the editorial team and no person or structured data in %s',
    (locale) => {
      const body = bodyOf(`${locale}/about.md`);
      expect(body).toContain(team[locale]);
      expect(present(body, ['ld+json', '"@type"', '@context'])).toEqual([]);
    },
  );

  it('points the configured author at the English about page', () => {
    expect(SITE.author.url).toBe(pathOf('about', 'en'));
    expect(SITE.author.name).toBe(team.en);
  });

  it.each([
    ['en', /AI-assisted/, /verified by people/],
    ['es', /asistid[oa]s? por IA/, /verificad[oa]s? por personas/],
  ] as const)(
    'states in %s that content is AI-assisted and verified by people',
    (locale, assisted, verified) => {
      const section = sectionOf(bodyOf(`${locale}/about.md`), anchors[locale][1]);
      expect(section).toMatch(assisted);
      expect(section).toMatch(verified);
    },
  );

  it.each([
    ['en', 'exactly what to buy', 'estimate what to buy'],
    ['es', 'exactamente qué comprar', 'estiman qué comprar'],
  ] as const)('promises estimates, not exact purchases, in %s', (locale, promise, estimate) => {
    const body = bodyOf(`${locale}/about.md`);
    expect(body).not.toContain(promise);
    expect(body).toContain(estimate);
  });

  it.each([
    ['en', 'Every page says', /Each policy and methodology page says when it was last updated/],
    [
      'es',
      'Cada página dice',
      /Cada página de políticas y de metodología dice cuándo se actualizó por última vez/,
    ],
  ] as const)(
    'claims an update date only for the pages that show one in %s',
    (locale, overclaim, claim) => {
      const section = sectionOf(bodyOf(`${locale}/about.md`), anchors[locale][0]);
      expect(section).not.toContain(overclaim);
      expect(section).toMatch(claim);
    },
  );

  it.each([
    ['en', /will cite its sources/],
    ['es', /citará sus fuentes/],
  ] as const)('says in %s that sources will appear on calculator pages', (locale, future) => {
    expect(sectionOf(bodyOf(`${locale}/about.md`), anchors[locale][1])).toMatch(future);
  });

  it.each(LOCALES)('explains in a comment why %s headings use raw h2 elements (TP10)', (locale) => {
    expect(bodyOf(`${locale}/about.md`)).toMatch(/<!--[^>]*anchor[^>]*-->|<!--[^>]*ancla[^>]*-->/);
  });

  it.each(LOCALES)('explains how to report an error and the dated log in %s', (locale) => {
    const section = sectionOf(bodyOf(`${locale}/about.md`), anchors[locale][2]);
    expect(section).toContain(SITE.contactEmail);
    expect(section).toMatch(locale === 'en' ? /dated/ : /fecha/);
  });

  it('reads a section up to the next heading and is empty for an unknown id', () => {
    const body = '<h2 id="a">A</h2>\nalpha\n<h2 id="b">B</h2>\nbeta';
    expect(sectionOf(body, 'a')).toContain('alpha');
    expect(sectionOf(body, 'a')).not.toContain('beta');
    expect(sectionOf(body, 'b')).toContain('beta');
    expect(sectionOf(body, 'zz')).toBe('');
  });
});

describe('privacy (trust-pages › [TP13], [TP14])', () => {
  const required = {
    // analytics-gtm: Google Analytics through Tag Manager, the values left out, the regional and
    // Global Privacy Control defaults, and the promise kept for advertising
    en: [
      'Cloudflare',
      'Google Analytics, loaded through Google Tag Manager',
      'without the values you typed',
      'sets no cookie',
      'Global Privacy Control',
      'before we add advertising',
    ],
    es: [
      'Cloudflare',
      'Google Analytics, cargado con Google Tag Manager',
      'sin los valores que escribiste',
      'no guarda ninguna cookie',
      'Global Privacy Control',
      'antes de añadir publicidad',
    ],
  } as const;
  const forbidden = ['AdSense', 'Mediavine', 'Raptive', 'Amazon', 'affiliate', 'afiliad'];

  it.each(LOCALES)('states the required facts and the contact address in %s', (locale) => {
    const body = bodyOf(`${locale}/privacy.md`);
    expect(body).not.toBe('');
    expect(present(body, [...required[locale], SITE.contactEmail])).toHaveLength(
      required[locale].length + 1,
    );
  });

  it.each(LOCALES)('names none of the services the site does not use in %s', (locale) => {
    expect(present(bodyOf(`${locale}/privacy.md`), forbidden)).toEqual([]);
  });
});

describe('the copy follows the route table (trust-pages › [TP26], [TP21], [TP27])', () => {
  const routed = Object.hasOwn(ROUTES, 'concrete');
  const mentions = (text: string): boolean => /concrete|concreto/i.test(text);

  // spec: trust-pages › [TP26] the methodology, the home link and the privacy section exist iff the page is routed
  it('names the concrete calculator in the methodology exactly when it is routed', () => {
    for (const locale of LOCALES) {
      expect(mentions(bodyOf(`${locale}/methodology.md`)), locale).toBe(routed);
    }
  });

  it('gives the home a card exactly for the calculators that are routed', () => {
    for (const [name, site] of [
      ['en', enSite],
      ['es', esSite],
    ] as const) {
      const cardIds = (part: 'title' | 'summary'): string[] =>
        Object.keys(site)
          .map((key) => new RegExp(String.raw`^page\.home\.cards\.(.+)\.${part}$`).exec(key)?.[1])
          .filter((id): id is string => id !== undefined)
          .sort();
      expect(cardIds('title'), `${name} titles`).toEqual([...CALCULATOR_PAGES].sort());
      expect(cardIds('summary'), `${name} summaries`).toEqual([...CALCULATOR_PAGES].sort());
      for (const id of PAGELESS) {
        expect(`page.home.cards.${id}.title` in site, `${name} ${id} title`).toBe(false);
        expect(`page.home.cards.${id}.summary` in site, `${name} ${id} summary`).toBe(false);
      }
    }
  });

  it('has the calculators section of the privacy page exactly when a calculator page is routed', () => {
    const routedPages = Object.keys(ROUTES).filter((id) => templateOf(id) === 'calculator');
    for (const [locale, title] of [
      ['en', '## Calculators'],
      ['es', '## Calculadoras'],
    ] as const) {
      expect(bodyOf(`${locale}/privacy.md`).includes(`\n${title}\n`), locale).toBe(
        routedPages.length > 0,
      );
    }
  });
});

describe('privacy: calculators (trust-pages › [TP27], [TP12])', () => {
  const heading = { en: '## Calculators', es: '## Calculadoras' } as const;
  const copy = {
    en: "Calculators run in your browser. Nothing you type is sent to us or to Google Analytics. The values you enter sit in the page address, so you can copy the link and share it. Opening or sharing that address sends it like any page request, so it can appear in Cloudflare's request logs. The address with your values also stays in your browser history, like any page you visit.",
    es: 'Las calculadoras funcionan en tu navegador. Nada de lo que escribes se nos envía ni llega a Google Analytics. Los valores que ingresas quedan en la dirección de la página, así que puedes copiar el enlace y compartirlo. Al abrir o compartir esa dirección, se envía como cualquier solicitud de página, por lo que puede aparecer en los registros de solicitudes de Cloudflare. La dirección con tus valores también queda en el historial de tu navegador, como cualquier página que visitas.',
  } as const;
  const cookies = {
    en: 'Advertising storage and ad personalization are off everywhere.',
    es: 'El almacenamiento publicitario y la personalización de anuncios están desactivados en todos los casos.',
  } as const;

  /** The paragraph under the `## ` heading `title`, up to the next heading; empty when the heading is absent. */
  const under = (body: string, title: string): string[] => {
    const start = body.indexOf(`\n${title}\n`);
    if (start === -1) return [];
    const rest = body.slice(start + title.length + 2);
    const next = rest.indexOf('\n## ');
    return rest
      .slice(0, next === -1 ? undefined : next)
      .split('\n\n')
      .map((part) => part.trim())
      .filter((part) => part !== '');
  };

  // spec: trust-pages › [TP27] the section exists exactly once with the exact copy
  it.each(LOCALES)(
    'has the calculators section exactly once, with the exact copy, in %s',
    (locale) => {
      const body = bodyOf(`${locale}/privacy.md`);
      expect(body.split(`\n${heading[locale]}\n`)).toHaveLength(2);
      expect(under(body, heading[locale])).toEqual([copy[locale]]);
    },
  );

  // spec: trust-pages › [TP27] the cookies sentence, and the words that must and must not appear
  it.each(LOCALES)('keeps the cookies sentence and says no forms nowhere in %s', (locale) => {
    const body = bodyOf(`${locale}/privacy.md`);
    expect(body).toContain(cookies[locale]);
    expect(present(body, locale === 'en' ? ['no forms'] : ['ni formularios'])).toEqual([]);
    expect(present(body, locale === 'en' ? ['no accounts'] : ['ni cuentas'])).toHaveLength(1);
  });

  it('reads a section that is absent as empty', () => {
    expect(under('# T\n\n## A\n\ntext', '## B')).toEqual([]);
    expect(under('# T\n\n## A\n\ntext\n\n## B\n\nmore', '## A')).toEqual(['text']);
  });
});

describe('terms and disclaimer (trust-pages › [TP15], [TP16])', () => {
  const required = {
    en: ['estimates', 'local building code', 'as is'],
    es: ['estimaciones', 'código de construcción local', 'tal cual'],
  } as const;
  const forbidden = ['governed by', 'jurisdiction', 'LLC', 'Inc.', 'se rige por', 'jurisdicción'];

  it.each(LOCALES)('uses the disclaimer wording in %s', (locale) => {
    const body = bodyOf(`${locale}/terms.md`);
    expect(body).not.toBe('');
    expect(present(body, required[locale])).toHaveLength(required[locale].length);
  });

  it.each(LOCALES)('asserts no governing law, jurisdiction or entity in %s', (locale) => {
    expect(present(bodyOf(`${locale}/terms.md`), forbidden)).toEqual([]);
  });
});

describe('contact (trust-pages › [TP17])', () => {
  const prompt = { en: 'Found an error?', es: '¿Encontraste un error?' } as const;
  const responseTime = [/\b(within|in)\s+\d+\s+(hour|day|business)/i, /\ben\s+\d+\s+(hora|día)/i];

  it.each(LOCALES)('shows the address and the prompt, with no form or script, in %s', (locale) => {
    const body = bodyOf(`${locale}/contact.md`);
    expect(body).toContain(SITE.contactEmail);
    expect(body).toContain(prompt[locale]);
    expect(present(body, ['<form', '<script'])).toEqual([]);
  });

  it.each(LOCALES)(
    'says the prompt once, so the paragraph below it does not repeat it in %s',
    (locale) => {
      expect(bodyOf(`${locale}/contact.md`).split(prompt[locale])).toHaveLength(2);
    },
  );

  it.each(LOCALES)('promises no response time in %s', (locale) => {
    const body = bodyOf(`${locale}/contact.md`);
    expect(body).not.toBe('');
    for (const pattern of responseTime) expect(body).not.toMatch(pattern);
  });

  it('recognises the response-time promises it rejects', () => {
    expect(responseTime.some((pattern) => pattern.test('We reply within 2 days.'))).toBe(true);
    expect(responseTime.some((pattern) => pattern.test('Respondemos en 24 horas.'))).toBe(true);
    expect(responseTime.some((pattern) => pattern.test('We read every message.'))).toBe(false);
  });
});
