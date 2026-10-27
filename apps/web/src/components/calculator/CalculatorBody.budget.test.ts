import { globSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import type { AstroInlineConfig, AstroUserConfig } from 'astro';
import { parse } from 'node-html-parser';
import { afterAll, describe, expect, it } from 'vitest';
import { pagelessTitles } from '../../__testing__/pageless-titles.ts';
import { importFromRoot } from '../../contract/root.ts';
import { pathOf, ROUTES } from '../../routing/routes.ts';
import { CALCULATOR_PAGES } from '../../routing/templates.ts';
import { calculatorJsonLd, serializeJsonLd } from '../../seo/json-ld.ts';
import { directoryOrder } from '../../lib/home-directory.ts';
import { PAGES, pageView } from '../../lib/pages.ts';
import {
  FAQ_ANSWER_LENGTH,
  FAQ_ITEMS,
  WORDS,
  copyOf,
  faqOf,
} from '../../contract/__testing__/budget-copy.ts';

/** The page HTML budget of site-quality (SQ7), in bytes. */
const HTML_BUDGET = 40_960;
/** The Spanish full-length proof must not grow past the size it had when the home-directory change began ([CP66]). */
const ES_FULL_LENGTH_PIN = 40_836;
const WEB_ROOT = resolve(import.meta.dirname, '../../..');
const PAGE = join(WEB_ROOT, 'src/contract/__testing__/budget-page.astro');
const out = mkdtempSync(join(tmpdir(), 'calculator-budget-'));

afterAll(() => {
  rmSync(out, { recursive: true, force: true });
  delete process.env['BUDGET_EXTRA_EN'];
  delete process.env['BUDGET_EXTRA_ES'];
});

type Locales = Record<'en' | 'es', number>;

/** The bytes the injected `<p></p>` of the seeded copy adds around its text. */
const PARAGRAPH = '<p></p>'.length;

/**
 * Builds the site with the production pipeline plus one injected route, the placeholder page, and
 * returns its two HTML files. `extra` characters of copy are added to each page, by locale.
 */
const build = async (name: string, extra: Locales = { en: 0, es: 0 }) => {
  // the production site is built once per name: the built-HTML assertions below read the same output
  const cached = built.get(name);
  if (cached !== undefined) {
    if (cached.extra.en !== extra.en || cached.extra.es !== extra.es) {
      throw new Error(`build '${name}' was already made with other extra copy`);
    }
    return cached.result;
  }
  const result = buildSite(name, extra);
  built.set(name, { extra, result });
  return result;
};

const built = new Map<string, { extra: Locales; result: ReturnType<typeof buildSite> }>();

const buildSite = async (name: string, extra: Locales) => {
  // `astro` must load as the Node package, not through the test bundler
  const { build: astroBuild } = await importFromRoot<{
    build: (config: AstroInlineConfig) => Promise<void>;
  }>('node_modules/astro/dist/index.js');
  process.env['BUDGET_EXTRA_EN'] = String(extra.en);
  process.env['BUDGET_EXTRA_ES'] = String(extra.es);
  const outDir = join(out, name);
  await astroBuild({
    root: WEB_ROOT,
    outDir,
    logLevel: 'silent',
    integrations: [
      {
        name: 'budget-page',
        hooks: {
          'astro:config:setup': ({ injectRoute }) => {
            injectRoute({ pattern: '/zz-budget/[locale]', entrypoint: PAGE, prerender: true });
          },
        },
      },
    ],
  });
  const read = (locale: 'en' | 'es') => readFileSync(join(outDir, 'zz-budget', `${locale}.html`));
  return { en: read('en'), es: read('es') };
};

const sizesOf = (files: Record<'en' | 'es', Buffer>): Locales => ({
  en: files.en.length,
  es: files.es.length,
});

/** The resolved Astro config: the same object the build reads, not the text of the file. */
const { default: config } = await importFromRoot<{ default: AstroUserConfig }>(
  'apps/web/astro.config.mjs',
);

/** The home pages: the only built pages that may carry the home's rules. */
const HOMES = ['index.html', 'es.html'];

/**
 * Every page of the production build but the two homes and the injected budget route: the
 * calculator, trust and not-found pages of both locales, whatever the route table holds.
 */
const pagesWithoutHome = async (): Promise<string[]> => {
  await build('base');
  return globSync('**/*.html', { cwd: join(out, 'base') })
    .filter((name) => !HOMES.includes(name) && !name.startsWith('zz-budget/'))
    .sort();
};

const builtPage = (name: string): string => readFileSync(join(out, 'base', name), 'utf8');

describe('inlined CSS of the built pages (site-shell › [SS28], [SS29], [SS32])', () => {
  // spec: site-shell › [SS32] the config pins every page to inline CSS
  it("sets build.inlineStylesheets to 'always' in the resolved Astro config", () => {
    expect(config.build?.inlineStylesheets).toBe('always');
  });

  // the guards below glob the build: the list is every page but the homes, both 404 pages included
  it('guards every built page but the two homes, both not-found pages included', async () => {
    const pages = await pagesWithoutHome();
    expect(pages).toEqual(expect.arrayContaining(['404.html', 'es/404.html']));
    expect(pages).toEqual(expect.arrayContaining(['concrete-calculator.html', 'methodology.html']));
    expect(pages.some((name) => HOMES.includes(name) || name.startsWith('zz-budget/'))).toBe(false);
  }, 120_000);

  // spec: site-shell › [SS32] no page links a stylesheet and no CSS file is emitted
  it('links no stylesheet, keeps the CSS in the head and emits no CSS file', async () => {
    const pages = await pagesWithoutHome();
    expect(globSync('_astro/**/*.css', { cwd: join(out, 'base') })).toEqual([]);
    for (const name of [...HOMES, ...pages]) {
      const html = builtPage(name);
      const head = html.slice(html.indexOf('<head'), html.indexOf('</head>'));
      expect(/<link[^>]+rel=["']?stylesheet/.test(html), `${name} links a stylesheet`).toBe(false);
      expect(head.includes('<style'), `${name} has no <style> in the head`).toBe(true);
      expect(
        html.slice(html.indexOf('</head>')).includes('<style'),
        `${name} has <style> in the body`,
      ).toBe(false);
    }
  }, 120_000);

  // design K9, [CP66]: class scoping saves bytes on every scoped element, which pays for the tokens
  it("sets scopedStyleStrategy to 'class' and builds no data-astro-cid attribute", async () => {
    expect(config.scopedStyleStrategy).toBe('class');
    for (const name of [...HOMES, ...(await pagesWithoutHome())]) {
      expect(
        builtPage(name).includes('data-astro-cid-'),
        `${name} has an attribute-scoped element`,
      ).toBe(false);
    }
  }, 120_000);

  // positive control: the home rules exist in the build, so their absence below means something
  it.each(HOMES)(
    'carries the .home- rules on the home %s',
    async (name) => {
      await build('base');
      expect(builtPage(name).includes('.home-'), `${name} carries no .home- selector`).toBe(true);
    },
    120_000,
  );

  // spec: site-shell › [SS28], [SS29] the identity does not leak onto any other built page
  it('carries no .home- selector and no gradient on any page but the homes', async () => {
    for (const name of await pagesWithoutHome()) {
      const html = builtPage(name);
      // booleans, so a failure does not print the whole page
      expect(html.includes('.home-'), `${name} carries a .home- selector`).toBe(false);
      expect(html.includes('linear-gradient'), `${name} carries a gradient`).toBe(false);
    }
  }, 120_000);
});

/** The bound of [TP35] on each built home, in bytes. */
const HOME_BUDGET = 24_576;

describe('built home pages (site-shell › [SS28]; trust-pages › [TP31], [TP34], [TP35])', () => {
  // spec: site-shell › [SS28], trust-pages › [TP31], [TP34], [TP35]
  it.each(HOMES)(
    'carries the hero, no script but JSON-LD, no pageless name and fits on %s',
    async (name) => {
      await build('base');
      const html = builtPage(name);
      expect(html.includes('.home-hero') && html.includes('linear-gradient')).toBe(true);
      // [TP21], [TP28]: one card per routed calculator, linking its route path in this locale
      // a rule for the card itself, not only for the `.home-cards` list
      expect(/\.home-card(?![\w-])/.test(html)).toBe(true);
      const locale = name === 'es.html' ? 'es' : 'en';
      const cards = parse(html).querySelectorAll('main ul.home-cards li');
      expect(cards).toHaveLength(CALCULATOR_PAGES.length);
      expect(cards.map((card) => card.querySelector('a')?.getAttribute('href'))).toEqual(
        CALCULATOR_PAGES.map((id) => pathOf(id, locale)),
      );
      const types = parse(html)
        .querySelectorAll('script')
        .map((tag) => tag.getAttribute('type'));
      expect(types).toEqual(['application/ld+json']);
      expect(/<[^>]+\son[a-z]+=/i.test(html)).toBe(false);
      const text = parse(html).querySelector('main')?.text.toLowerCase() ?? '';
      expect(text).toContain('maestro');
      // the titles of PAGELESS in both locales: none once every calculator has a page
      for (const title of await pagelessTitles()) {
        expect(text.includes(title.toLowerCase()), title).toBe(false);
      }
      const bytes = Buffer.byteLength(html);
      console.info(`[TP35] ${name}: ${String(bytes)} B of ${String(HOME_BUDGET)} B`);
      expect(bytes).toBeLessThanOrEqual(HOME_BUDGET);
    },
    120_000,
  );

  // spec: trust-pages › [TP28] each card is a list item: one title link, the summary, the example
  it.each([
    ['index.html', 'en', enSite],
    ['es.html', 'es', esSite],
  ] as const)(
    'renders each card on %s as an item of a list with its title link, summary and example',
    async (name, locale, catalog) => {
      await build('base');
      const main = parse(builtPage(name)).querySelector('main');
      const lists = main?.querySelectorAll('ul[role=list]') ?? [];
      expect(lists).toHaveLength(1);
      const items = lists[0]?.querySelectorAll(':scope > li') ?? [];
      const ids = directoryOrder(ROUTES, CALCULATOR_PAGES);
      expect(ids.length).toBeGreaterThan(0);
      expect(items).toHaveLength(ids.length);
      ids.forEach((id, index) => {
        const item = items[index];
        const links = item?.querySelectorAll('a') ?? [];
        expect(links, id).toHaveLength(1);
        expect(item?.querySelector('h2 > a')).toBe(links[0]);
        expect(links[0]?.getAttribute('href'), id).toBe(pathOf(id, locale));
        expect(links[0]?.text.trim(), id).toBe(catalog[`page.home.cards.${id}.title`]);
        const texts = item?.querySelectorAll(':scope > p').map((p) => p.text.trim());
        expect(texts, id).toEqual([
          catalog[`page.home.cards.${id}.summary`],
          PAGES[id].catalogs[locale][`calc.${id}.page.example`],
        ]);
      });
    },
    120_000,
  );

  // spec: trust-pages › [TP21] the cards are the only way main links a calculator page
  it.each([
    ['index.html', 'en'],
    ['es.html', 'es'],
  ] as const)(
    'links a calculator page from main on %s only through its card',
    async (name, locale) => {
      await build('base');
      const calculatorPaths = new Set(
        CALCULATOR_PAGES.flatMap((id) => [pathOf(id, 'en'), pathOf(id, 'es')]),
      );
      const linked = parse(builtPage(name))
        .querySelectorAll('main a[href]')
        .map((link) => link.getAttribute('href') ?? '')
        .filter((href) => calculatorPaths.has(href));
      expect(linked).toEqual(
        directoryOrder(ROUTES, CALCULATOR_PAGES).map((id) => pathOf(id, locale)),
      );
    },
    120_000,
  );
});

describe('CalculatorBody HTML budget (calculator-page › Page anatomy; site-quality › [SQ7]; design C18, DR-16)', () => {
  // spec: site-quality › [SQ7] with full-length copy: 1,500 words, 8 FAQ answers of 450 characters,
  // the JSON-LD, every template, the inline CSS, the real head and the script island, built by the
  // real pipeline, in both locales
  it('fits the HTML budget with full-length copy, the JSON-LD and the inlined CSS', async () => {
    const sizes = sizesOf(await build('base'));
    console.info(
      `calculator page HTML with full-length copy: en ${String(sizes.en)} B, es ${String(sizes.es)} B of ${String(HTML_BUDGET)} B`,
    );
    expect(sizes.en).toBeLessThanOrEqual(HTML_BUDGET);
    expect(sizes.es).toBeLessThanOrEqual(HTML_BUDGET);
  }, 120_000);

  // spec: calculator-page › [CP66] the Spanish full-length proof stays at or under 40,836 B at every PR tip
  it('keeps the Spanish full-length proof at 40,836 B or less', async () => {
    const { es } = sizesOf(await build('base'));
    console.info(
      `[CP66] Spanish full-length proof: ${String(es)} B of ${String(ES_FULL_LENGTH_PIN)} B`,
    );
    expect(es).toBeLessThanOrEqual(ES_FULL_LENGTH_PIN);
  }, 120_000);

  // the JSON-LD of the proof is the real builder's, serialized by the real serializer
  it('carries the JSON-LD graph of calculatorJsonLd for the full-length FAQ', async () => {
    const files = await build('jsonld');
    for (const locale of ['en', 'es'] as const) {
      const view = pageView('concrete', locale);
      const expected = serializeJsonLd(
        calculatorJsonLd({ id: 'concrete', name: view.title }, locale, faqOf(locale), ROUTES),
      );
      expect(files[locale].toString('utf8')).toContain(
        `<script type="application/ld+json">${expected}</script>`,
      );
    }
  }, 120_000);

  // seeded: one byte past the measured headroom fails, so a copy that is too long cannot pass unnoticed
  it('is exactly one byte over the budget once the measured headroom plus one byte is added', async () => {
    const base = sizesOf(await build('base-again'));
    const headroom = (locale: 'en' | 'es') => HTML_BUDGET - base[locale];
    const seeded = sizesOf(
      await build('seeded', {
        en: headroom('en') + 1 - PARAGRAPH,
        es: headroom('es') + 1 - PARAGRAPH,
      }),
    );
    expect(seeded).toEqual({ en: HTML_BUDGET + 1, es: HTML_BUDGET + 1 });
  }, 120_000);

  it('uses the sizes the spec fixes: 8 answers of 450 characters and 1,500 words', () => {
    for (const locale of ['en', 'es'] as const) {
      const faq = faqOf(locale);
      expect(faq).toHaveLength(FAQ_ITEMS);
      expect(faq.every(({ answer }) => answer.length === FAQ_ANSWER_LENGTH)).toBe(true);
      const prose = copyOf(locale).replaceAll(/<[^>]+>/g, ' ');
      expect(prose.split(/\s+/).filter(Boolean).length).toBeGreaterThan(WORDS);
    }
  });
});
