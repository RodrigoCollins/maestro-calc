import { existsSync, readFileSync } from 'node:fs';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { faqOf } from '../content/faq.ts';
import { h2Ids } from '../contract/content.ts';
import { fromRoot } from '../contract/root.ts';
import { concreteView } from '../lib/page-view.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { calculatorJsonLd, serializeJsonLd } from '../seo/json-ld.ts';
import CatchAll from '../pages/[...path].astro';
import CalculatorView from './CalculatorView.astro';

const render = (locale: 'en' | 'es') =>
  renderComponent(CalculatorView, { id: 'concrete', locale }, { partial: false });

/** The entry of the concrete calculator: its frontmatter and its Markdown body. */
const entryOf = (locale: 'en' | 'es') => {
  const text = readFileSync(
    fromRoot(`apps/web/src/content/calculators/${locale}/concrete.md`),
    'utf8',
  );
  const [, header = '', body = ''] = /^---\n(.*?)\n---\n(.*)$/s.exec(text) ?? [];
  const data = parse(header) as {
    updated: string;
    sources: { name: string; url: string; retrieved: string }[];
  };
  return { ...data, body };
};

const PAGES = {
  en: { catalog: enSite, path: '/concrete-calculator', other: '/es/calculadora-de-concreto' },
  es: { catalog: esSite, path: '/es/calculadora-de-concreto', other: '/concrete-calculator' },
} as const;

describe('CalculatorView head (site-seo › [SE1]–[SE3], [SE16], [SE17], [SE2])', () => {
  // spec: site-seo › [SE16], [SE17] the title and description come from the catalog, the canonical has no query
  it.each(['en', 'es'] as const)('writes the %s head from the catalog', async (locale) => {
    const document = await render(locale);
    const { catalog, path } = PAGES[locale];
    expect(document.querySelector('title')?.text).toBe(catalog['page.concrete.title']);
    expect(document.querySelector('meta[name=description]')?.getAttribute('content')).toBe(
      catalog['page.concrete.description'],
    );
    expect(document.querySelector('link[rel=canonical]')?.getAttribute('href')).toBe(
      `https://maestrocalc.com${path}`,
    );
    expect(document.querySelector('meta[name=robots]')).toBeNull();
  });

  // spec: site-seo › [SE2] three reciprocal hreflang alternates
  it.each(['en', 'es'] as const)(
    'lists the three reciprocal alternates on the %s page',
    async (locale) => {
      const alternates = (await render(locale))
        .querySelectorAll('link[rel=alternate][hreflang]')
        .map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]);
      expect(alternates).toEqual([
        ['en-US', 'https://maestrocalc.com/concrete-calculator'],
        ['es-US', 'https://maestrocalc.com/es/calculadora-de-concreto'],
        ['x-default', 'https://maestrocalc.com/concrete-calculator'],
      ]);
    },
  );

  it.each(['en', 'es'] as const)(
    'points the language switch at the other page of the pair (%s)',
    async (locale) => {
      expect((await render(locale)).querySelector('a.lang-switch')?.getAttribute('href')).toBe(
        PAGES[locale].other,
      );
    },
  );
});

describe('CalculatorView body (calculator-page › [CP5], [CP8], [CP17]; site-seo › [SE18]; site-shell › [SS1])', () => {
  // spec: site-seo › [SE18] one H1 equal to the calculator title
  it.each(['en', 'es'] as const)('has one h1 equal to the title in %s', async (locale) => {
    const document = await render(locale);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('main h1')?.text).toBe(concreteView(locale).title);
  });

  // spec: calculator-page › [CP5] the result h2, then the five content sections with their ids
  it.each(['en', 'es'] as const)(
    'orders the h2 headings in %s: result, then the five sections',
    async (locale) => {
      const document = await render(locale);
      const ids = document.querySelectorAll('main h2').map((heading) => heading.getAttribute('id'));
      const sections = h2Ids(entryOf(locale).body);
      expect(sections).toHaveLength(5);
      expect(ids).toEqual(['calc-result-heading', ...sections]);
      const faq = sections.at(-1) ?? '';
      const questions = document.querySelectorAll('main h3');
      expect(questions.length).toBeGreaterThanOrEqual(4);
      expect(questions).toHaveLength(faqOf(entryOf(locale).body).length);
      expect(faq).not.toBe('');
    },
  );

  // spec: calculator-page › [CP5], site-shell › [SS1] the breadcrumb list above the h1 and one nav
  it.each(['en', 'es'] as const)(
    'puts one labelled breadcrumb list above the h1 and one nav in %s',
    async (locale) => {
      const document = await render(locale);
      const order = document.querySelectorAll('main ol, main h1').map((el) => el.tagName);
      expect(order.slice(0, 2)).toEqual(['OL', 'H1']);
      expect(document.querySelector('main ol')?.getAttribute('aria-label')).toBe(
        PAGES[locale].catalog['site.calculator.breadcrumb'],
      );
      expect(document.querySelectorAll('nav')).toHaveLength(1);
    },
  );

  // spec: site-seo › [SE19], [SE20] the three types, built from the real entry
  it.each(['en', 'es'] as const)(
    'embeds the calculator JSON-LD of the real entry in %s',
    async (locale) => {
      const document = await render(locale);
      const blocks = document.querySelectorAll('script[type="application/ld+json"]');
      expect(blocks).toHaveLength(1);
      const expected = serializeJsonLd(
        calculatorJsonLd(
          { id: 'concrete', name: concreteView(locale).title },
          locale,
          faqOf(entryOf(locale).body),
        ),
      );
      expect(blocks[0]?.text).toBe(expected);
      const graph = (JSON.parse(expected) as { '@graph': { '@type': string }[] })['@graph'];
      expect(graph.map((node) => node['@type'])).toEqual([
        'WebApplication',
        'BreadcrumbList',
        'FAQPage',
      ]);
    },
  );

  // spec: calculator-page › [CP17] the terms link of the locale
  it.each([
    ['en', '/terms'],
    ['es', '/es/terminos'],
  ] as const)('links the terms page of the %s locale from the panel', async (locale, href) => {
    expect((await render(locale)).querySelector('.calc-result a')?.getAttribute('href')).toBe(href);
  });

  // spec: calculator-page › [CP8] the sources and the review date of the entry
  it.each(['en', 'es'] as const)(
    'shows the sources and the review date of the %s entry',
    async (locale) => {
      const document = await render(locale);
      const entry = entryOf(locale);
      expect(document.querySelectorAll('main time')).toHaveLength(1);
      expect(document.querySelector('main time')?.getAttribute('datetime')).toBe(entry.updated);
      expect(
        document.querySelectorAll('.calc-sources a').map((link) => link.getAttribute('href')),
      ).toEqual(entry.sources.map(({ url }) => url));
    },
  );
});

describe('CalculatorView script (site-shell › [SS20])', () => {
  // spec: site-shell › [SS20] one module script, chosen from SCRIPTS by the page id
  it.each(['en', 'es'] as const)(
    'loads exactly one module script on the %s page',
    async (locale) => {
      const scripts = (await render(locale)).querySelectorAll('script[type=module][src]');
      expect(scripts).toHaveLength(1);
      expect(scripts[0]?.getAttribute('src')).toContain('ConcreteScript.astro');
    },
  );

  it('has an island file named after every calculator page id', () => {
    for (const id of CALCULATOR_PAGES) {
      const island = `${id.charAt(0).toUpperCase()}${id.slice(1)}Script.astro`;
      expect(existsSync(fromRoot(`apps/web/src/islands/${island}`)), island).toBe(true);
    }
  });
});

describe('catch-all page (site-routing-i18n › [SR18])', () => {
  // spec: site-routing-i18n › [SR18] concrete takes the calculator template, every other id its own
  it('renders the concrete id with the calculator template', async () => {
    const document = await renderComponent(
      CatchAll,
      { id: 'concrete', locale: 'en' },
      { partial: false },
    );
    expect(document.querySelector('main h1')?.text).toBe('Concrete Calculator');
    expect(document.querySelector('.calculator')).not.toBeNull();
  });

  it.each([
    ['about', 'article.prose'],
    ['home', 'p.home-links'],
  ] as const)('still renders %s with its own template', async (id, selector) => {
    const document = await renderComponent(CatchAll, { id, locale: 'en' }, { partial: false });
    expect(document.querySelector(selector)).not.toBeNull();
    expect(document.querySelector('.calculator')).toBeNull();
  });
});
