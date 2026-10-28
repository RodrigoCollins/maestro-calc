import { describe, expect, it } from 'vitest';
import { enSite } from './catalogs/en/site.ts';
import { esSite } from './catalogs/es/site.ts';
import { placeholdersOf } from './translate.ts';

type Module = Readonly<Record<string, string>>;

const modules: Record<string, Module> = { en: enSite, es: esSite };

/** The page ids the `page.<id>.title` keys of a module name, in key order. */
const pageIds = (module: Module): string[] => [
  ...new Set(
    Object.keys(module)
      .map((key) => /^page\.([A-Za-z0-9-]+)\.title$/.exec(key)?.[1])
      .filter((id): id is string => id !== undefined),
  ),
];

const entriesOf = (suffix: 'title' | 'description') =>
  Object.entries(modules).flatMap(([locale, module]) =>
    pageIds(module).map((id) => ({
      locale,
      id,
      text: module[`page.${id}.${suffix}`] ?? '',
    })),
  );

describe('site catalog: shell strings (i18n-catalog › Site scope)', () => {
  // spec: i18n-catalog › [ICW2]
  it('says the skip link in English and Spanish', () => {
    expect(enSite['site.skipLink']).toBe('Skip to main content');
    expect(esSite['site.skipLink']).toBe('Saltar al contenido principal');
  });

  // spec: i18n-catalog › [ICW8]
  it('says the tagline exactly', () => {
    expect(enSite['site.tagline']).toBe('Jobsite calculators that estimate what to buy');
    expect(esSite['site.tagline']).toBe('Calcula tu obra y sabe qué comprar');
  });

  // Every result is an estimate (terms, about), so no shell copy promises an exact purchase.
  it('never promises exact purchases', () => {
    const values = [...Object.values(enSite), ...Object.values(esSite)];
    expect(
      values.filter((value) => /exactly what to buy|exactamente qué comprar/i.test(value)),
    ).toEqual([]);
  });

  it('labels the navigation, the language switch and the footer links', () => {
    expect([
      enSite['site.nav.label'],
      enSite['site.nav.methodology'],
      enSite['site.nav.about'],
      enSite['site.switch.label'],
      enSite['site.footer.privacy'],
      enSite['site.footer.terms'],
      enSite['site.footer.contact'],
      enSite['site.footer.contactLabel'],
    ]).toEqual([
      'Main navigation',
      'Methodology',
      'About',
      'Español',
      'Privacy',
      'Terms',
      'Contact',
      'Contact us at',
    ]);
    expect([
      esSite['site.nav.label'],
      esSite['site.nav.methodology'],
      esSite['site.nav.about'],
      esSite['site.switch.label'],
      esSite['site.footer.privacy'],
      esSite['site.footer.terms'],
      esSite['site.footer.contact'],
      esSite['site.footer.contactLabel'],
    ]).toEqual([
      'Navegación principal',
      'Metodología',
      'Sobre nosotros',
      'English',
      'Privacidad',
      'Términos',
      'Contacto',
      'Escríbenos a',
    ]);
  });

  it('holds no placeholder in either locale', () => {
    for (const [locale, module] of Object.entries(modules)) {
      const withPlaceholders = Object.entries(module).filter(
        ([, message]) => placeholdersOf(message).length > 0,
      );
      expect(Object.keys(module).length, locale).toBeGreaterThan(10);
      expect(withPlaceholders, locale).toEqual([]);
    }
  });
});

describe('site catalog: page metadata (site-seo › Titles and descriptions)', () => {
  it('has the routable pages and the not-found page in both locales', () => {
    const ids = [
      'home',
      'methodology',
      'about',
      'privacy',
      'terms',
      'contact',
      'concrete',
      'rectangle-area',
      'notFound',
    ];
    expect(pageIds(enSite)).toEqual(ids);
    expect(pageIds(esSite)).toEqual(ids);
  });

  // spec: site-seo › [SE1]
  it('keeps every title between 10 and 60 characters', () => {
    const titles = entriesOf('title');
    expect(titles).toHaveLength(pageIds(enSite).length * 2);
    for (const { locale, id, text } of titles) {
      expect(text.length, `${locale} ${id}`).toBeGreaterThanOrEqual(10);
      expect(text.length, `${locale} ${id}`).toBeLessThanOrEqual(60);
    }
  });

  it('ends every title but the home ones with the brand suffix', () => {
    for (const { locale, id, text } of entriesOf('title')) {
      if (id === 'home') expect(text, `${locale} ${id}`).not.toMatch(/\| Maestro Calc$/);
      else expect(text, `${locale} ${id}`).toMatch(/ \| Maestro Calc$/);
    }
  });

  it('keeps titles unique across ids and locales', () => {
    const texts = entriesOf('title').map(({ text }) => text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('keeps every description between 70 and 160 characters', () => {
    const descriptions = entriesOf('description');
    expect(descriptions).toHaveLength(pageIds(enSite).length * 2);
    for (const { locale, id, text } of descriptions) {
      expect(text.length, `${locale} ${id}`).toBeGreaterThanOrEqual(70);
      expect(text.length, `${locale} ${id}`).toBeLessThanOrEqual(160);
    }
  });

  it('keeps descriptions unique across the indexable pages', () => {
    const texts = entriesOf('description')
      .filter(({ id }) => id !== 'notFound')
      .map(({ text }) => text);
    expect(texts).toHaveLength((pageIds(enSite).length - 1) * 2);
    expect(new Set(texts).size).toBe(texts.length);
  });
});

/** key, en, es: the calculator-page UI table of ICW17. */
const CALCULATOR_ROWS = [
  ['site.calculator.breadcrumb', 'Breadcrumb', 'Ruta de navegación'],
  ['site.calculator.breadcrumbHome', 'Home', 'Inicio'],
  ['site.calculator.resultHeading', 'Result', 'Resultado'],
  ['site.calculator.unitsLabel', 'Units', 'Unidades'],
  ['site.calculator.unitsUs', 'US (ft, in)', 'EE. UU. (ft, in)'],
  ['site.calculator.unitsMetric', 'Metric (m, cm)', 'Métrico (m, cm)'],
  ['site.calculator.copyLink', 'Copy link', 'Copiar enlace'],
  ['site.calculator.linkCopied', 'Link copied', 'Enlace copiado'],
  [
    'site.calculator.copyFailed',
    'Could not copy. Select the link and copy it.',
    'No se pudo copiar. Selecciona el enlace y cópialo.',
  ],
  [
    'site.calculator.noscript',
    'This page needs JavaScript to recalculate. If it is off or did not load, the result below is the example.',
    'Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo.',
  ],
  [
    'site.calculator.estimateNote',
    'Estimates only. Check quantities with your supplier and the local building code.',
    'Son estimaciones. Confirma las cantidades con tu proveedor y el código de construcción local.',
  ],
  ['site.calculator.hintFt', 'feet', 'pies'],
  ['site.calculator.hintIn', 'inches', 'pulgadas'],
  ['site.calculator.hintM', 'meters', 'metros'],
  ['site.calculator.hintCm', 'centimeters', 'centímetros'],
] as const;

describe('site catalog: calculator page UI (i18n-catalog › [ICW17])', () => {
  it.each(CALCULATOR_ROWS)('resolves %s exactly in English and Spanish', (key, en, es) => {
    expect(enSite[key]).toBe(en);
    expect(esSite[key]).toBe(es);
  });

  it('holds exactly the fifteen keys in both locales, and they have no placeholder', () => {
    const keys = CALCULATOR_ROWS.map(([key]) => key);
    for (const module of [enSite, esSite]) {
      expect(Object.keys(module).filter((key) => key.startsWith('site.calculator.'))).toEqual(keys);
    }
  });
});
