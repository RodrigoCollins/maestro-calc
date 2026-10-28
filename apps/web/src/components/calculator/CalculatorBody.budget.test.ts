import { globSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import type { AstroInlineConfig, AstroUserConfig } from 'astro';
import { parse } from 'node-html-parser';
import { afterAll, describe, expect, it } from 'vitest';
import { lengthsOf, mediaBlocksOf, mediaCountOf } from '../../__testing__/css-media.ts';
import { pagelessTitles } from '../../__testing__/pageless-titles.ts';
import { importFromRoot } from '../../contract/root.ts';
import { LOCALES, pathOf, ROUTES } from '../../routing/routes.ts';
import { CALCULATOR_PAGES } from '../../routing/templates.ts';
import { calculatorJsonLd, serializeJsonLd } from '../../seo/json-ld.ts';
import { directoryOrder, exampleOf } from '../../lib/home-directory.ts';
import { PAGES, pageView } from '../../lib/pages.ts';
import {
  budgetPaths,
  buildCache,
  entryOrThrow,
  extraKey,
  extraOf,
  leakedPadding,
  type Extra,
} from '../../contract/__testing__/budget-paths.ts';
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
/** The page ids as plain strings: the seeded build pads `concrete`, the others must keep their size. */
const ALL_IDS: readonly string[] = CALCULATOR_PAGES;

/** Every environment key a build set: `afterAll` deletes them all, so no padding leaks to a later file. */
const envKeys = new Set<string>();

afterAll(() => {
  rmSync(out, { recursive: true, force: true });
  for (const key of envKeys) Reflect.deleteProperty(process.env, key);
});

type Locales = Record<'en' | 'es', number>;

/** The bytes the injected `<p></p>` of the seeded copy adds around its text. */
const PARAGRAPH = '<p></p>'.length;

/**
 * Builds the site with the production pipeline plus one injected route, the placeholder page of
 * every calculator page id, and returns their HTML files by id and locale. `extra` characters of
 * copy are added to the pages named by id and locale.
 */
const buildSite = async (name: string, extra: Extra) => {
  // `astro` must load as the Node package, not through the test bundler
  const { build: astroBuild } = await importFromRoot<{
    build: (config: AstroInlineConfig) => Promise<void>;
  }>('node_modules/astro/dist/index.js');
  for (const id of CALCULATOR_PAGES) {
    for (const locale of LOCALES) {
      const key = extraKey(id, locale);
      envKeys.add(key);
      process.env[key] = String(extra[id]?.[locale] ?? 0);
    }
  }
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
            injectRoute({
              pattern: '/zz-budget/[id]/[locale]',
              entrypoint: PAGE,
              prerender: true,
            });
          },
        },
      },
    ],
  });
  const read = (id: string, locale: 'en' | 'es') =>
    readFileSync(join(outDir, 'zz-budget', id, `${locale}.html`));
  return Object.fromEntries(
    CALCULATOR_PAGES.map((id) => [id, { en: read(id, 'en'), es: read(id, 'es') }]),
  );
};

/** The production site is built once per name: the built-HTML assertions below read the same output. */
const build = buildCache(buildSite);

/** The sizes of the pages of one id, by locale. */
const sizeOf = async (name: string, id: string, extra?: Extra): Promise<Locales> => {
  const files = Object.entries(await build(name, extra)).find(([key]) => key === id)?.[1];
  if (files === undefined) throw new Error(`no budget page was built for ${id}`);
  return { en: files.en.length, es: files.es.length };
};

/** The built HTML of one budget page. */
const pageOf = async (name: string, id: string, locale: 'en' | 'es'): Promise<string> => {
  const files = Object.entries(await build(name)).find(([key]) => key === id)?.[1];
  if (files === undefined) throw new Error(`no budget page was built for ${id}`);
  return files[locale].toString('utf8');
};

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

  // spec: calculator-page › [CP64] the built breakpoints are the source breakpoints, all rem, whatever the syntax
  it('keeps every media length of the built concrete CSS in rem, the same set as the source', async () => {
    await build('base');
    const source = readFileSync(join(WEB_ROOT, 'src/styles/calculator.css'), 'utf8');
    const built = parse(builtPage('concrete-calculator.html'))
      .querySelectorAll('style')
      .map((style) => style.text)
      .join('\n');
    const lengths = (css: string) =>
      mediaBlocksOf(css)
        .flatMap(([query]) => lengthsOf(query))
        .map(([value, unit]) => `${String(value)}${unit}`);
    expect(mediaBlocksOf(source).length).toBe(mediaCountOf(source));
    expect(mediaBlocksOf(built).length).toBe(mediaCountOf(built));
    expect(lengths(source).length).toBeGreaterThan(0);
    expect(lengths(built).filter((length) => !length.endsWith('rem'))).toEqual([]);
    expect(new Set(lengths(built))).toEqual(new Set(lengths(source)));
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
          exampleOf(PAGES[id].catalogs[locale], id, locale),
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

describe('the budget fixture by id (site-quality › [SQ33], [SQ36])', () => {
  // spec: site-quality › [SQ33] the pages are derived from the calculator page ids and the locales
  it('builds one page per id and locale, and a seeded second id adds two', () => {
    expect(budgetPaths(['concrete'], LOCALES)).toEqual([
      { params: { id: 'concrete', locale: 'en' } },
      { params: { id: 'concrete', locale: 'es' } },
    ]);
    expect(
      budgetPaths(['concrete', 'rectangle-area'], LOCALES).map(({ params }) => params),
    ).toEqual([
      { id: 'concrete', locale: 'en' },
      { id: 'concrete', locale: 'es' },
      { id: 'rectangle-area', locale: 'en' },
      { id: 'rectangle-area', locale: 'es' },
    ]);
  });

  // spec: site-quality › [SQ33] the padding variables are named by id and locale
  it('names the padding variable by id and locale', () => {
    expect(extraKey('concrete', 'es')).toBe('BUDGET_EXTRA_CONCRETE_ES');
    expect(extraKey('rectangle-area', 'es')).toBe('BUDGET_EXTRA_RECTANGLE_AREA_ES');
  });

  it('pads only the page its variable names', () => {
    const env = { BUDGET_EXTRA_RECTANGLE_AREA_ES: '12' };
    expect(extraOf(env, 'rectangle-area', 'es')).toBe(12);
    expect(extraOf(env, 'rectangle-area', 'en')).toBe(0);
    expect(extraOf(env, 'concrete', 'es')).toBe(0);
    expect(extraOf({}, 'concrete', 'es')).toBe(0);
  });

  it('makes a name once and throws when it is asked again with other padding', () => {
    let made = 0;
    const cached = buildCache((name, extra) => {
      made += 1;
      return { name, extra };
    });
    const padded = { concrete: { es: 3 } };
    expect(cached('seeded', padded)).toBe(cached('seeded', { concrete: { es: 3 } }));
    expect(cached('base')).toBe(cached('base', {}));
    expect(made).toBe(2);
    expect(() => cached('seeded')).toThrow("build 'seeded' was already made with other extra copy");
  });

  // spec: site-quality › [SQ36] the seeded build pads its id only, whatever other ids the table holds
  describe('with a seeded second id', () => {
    const IDS = ['concrete', 'rectangle-area'];
    const PADDING = { concrete: { en: 5, es: 7 } };
    const NAMES = { seeded: 'seeded', base: 'base' };
    /** A fake build of every id of `IDS`: 100 B per page plus its padding, or the largest padding when it leaks. */
    const sizesBy = (leaks: boolean) => {
      const cached = buildCache((_name, extra: Extra) =>
        Object.fromEntries(
          IDS.map((id) => {
            const pad = (locale: 'en' | 'es') =>
              leaks
                ? Math.max(0, ...Object.values(extra).map((row) => row[locale] ?? 0))
                : (extra[id]?.[locale] ?? 0);
            return [id, { en: 100 + pad('en'), es: 100 + pad('es') }];
          }),
        ),
      );
      return async (name: string, id: string, extra?: Extra) => {
        const sizes = cached(name, extra)[id];
        if (sizes === undefined) throw new Error(`no fixture page for ${id}`);
        return Promise.resolve(sizes);
      };
    };

    it('reads every other id from the seeded build and finds no leak', async () => {
      const sizeOf = sizesBy(false);
      expect(await sizeOf(NAMES.seeded, 'concrete', PADDING)).toEqual({ en: 105, es: 107 });
      expect(await leakedPadding(IDS, PADDING, sizeOf, NAMES)).toEqual([]);
    });

    it('names the id a build pads by another id’s variable', async () => {
      const sizeOf = sizesBy(true);
      expect(await sizeOf(NAMES.seeded, 'concrete', PADDING)).toEqual({ en: 105, es: 107 });
      expect(await leakedPadding(IDS, PADDING, sizeOf, NAMES)).toEqual(['rectangle-area']);
    });
  });

  it('throws naming the id when a page id has no entry', () => {
    expect(entryOrThrow({ data: 1 }, 'concrete', 'es')).toEqual({ data: 1 });
    expect(() => {
      entryOrThrow(undefined, 'rectangle-area', 'es');
    }).toThrow('no calculator entry for es/rectangle-area');
  });
});

describe('CalculatorBody HTML budget (calculator-page › Page anatomy; site-quality › [SQ7], [SQ33], [SQ34]; design C18, DR-16)', () => {
  // spec: site-quality › [SQ7], [SQ34] with full-length copy: 1,500 words, 8 FAQ answers of 450
  // characters, the JSON-LD, every template, the inline CSS, the real head and the script island,
  // built by the real pipeline, in both locales, for every calculator page id
  it.each(CALCULATOR_PAGES)(
    'fits the HTML budget with full-length copy, the JSON-LD and the inlined CSS: %s',
    async (id) => {
      const sizes = await sizeOf('base', id);
      for (const locale of LOCALES) {
        const headroom = HTML_BUDGET - sizes[locale];
        console.info(
          `[SQ34] ${id} ${locale} full-length: ${String(sizes[locale])} B of ${String(HTML_BUDGET)} B (headroom ${String(headroom)} B)`,
        );
        expect(sizes[locale]).toBeLessThanOrEqual(HTML_BUDGET);
      }
    },
    120_000,
  );

  // spec: calculator-page › [CP66] the Spanish full-length proof stays at or under 40,836 B at every PR tip
  it('keeps the Spanish full-length proof at 40,836 B or less', async () => {
    const { es } = await sizeOf('base', 'concrete');
    console.info(
      `[CP66] Spanish full-length proof: ${String(es)} B of ${String(ES_FULL_LENGTH_PIN)} B`,
    );
    expect(es).toBeLessThanOrEqual(ES_FULL_LENGTH_PIN);
  }, 120_000);

  // the JSON-LD of the proof is the real builder's, serialized by the real serializer
  it('carries the JSON-LD graph of calculatorJsonLd for the full-length FAQ', async () => {
    await build('jsonld');
    for (const locale of ['en', 'es'] as const) {
      const view = pageView('concrete', locale);
      const expected = serializeJsonLd(
        calculatorJsonLd({ id: 'concrete', name: view.title }, locale, faqOf(locale), ROUTES),
      );
      expect(await pageOf('jsonld', 'concrete', locale)).toContain(
        `<script type="application/ld+json">${expected}</script>`,
      );
    }
  }, 120_000);

  // seeded: one byte past the measured headroom fails, so a copy that is too long cannot pad unnoticed
  // (spec: site-quality › [SQ36] the seeded build pads concrete only, and the other ids stay at their size)
  it('is exactly one byte over the budget once the measured headroom plus one byte is added', async () => {
    const base = await sizeOf('base-again', 'concrete');
    const headroom = (locale: 'en' | 'es') => HTML_BUDGET - base[locale];
    // the one padding of the seeded build: every read of 'seeded' passes it
    const padding: Extra = {
      concrete: {
        en: headroom('en') + 1 - PARAGRAPH,
        es: headroom('es') + 1 - PARAGRAPH,
      },
    };
    const seeded = await sizeOf('seeded', 'concrete', padding);
    expect(seeded).toEqual({ en: HTML_BUDGET + 1, es: HTML_BUDGET + 1 });
    // no other id of the table is padded by the concrete variables
    expect(
      await leakedPadding(ALL_IDS, padding, sizeOf, { seeded: 'seeded', base: 'base-again' }),
    ).toEqual([]);
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
