import { globSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { AstroInlineConfig } from 'astro';
import { afterAll, describe, expect, it } from 'vitest';
import { importFromRoot } from '../../contract/root.ts';
import { ROUTES } from '../../routing/routes.ts';
import { calculatorJsonLd, serializeJsonLd } from '../../seo/json-ld.ts';
import { pageView } from '../../lib/pages.ts';
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
  if (cached !== undefined) return cached;
  const result = buildSite(name, extra);
  built.set(name, result);
  return result;
};

const built = new Map<string, ReturnType<typeof buildSite>>();

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

/** Built pages (the production pipeline) that carry no home rule: both concrete pages and a trust page. */
const PAGES_WITHOUT_HOME = [
  'concrete-calculator.html',
  'es/calculadora-de-concreto.html',
  'methodology.html',
] as const;

describe('inlined CSS of the built pages (site-shell › [SS28], [SS29], [SS32])', () => {
  // spec: site-shell › [SS32] the config pins every page to inline CSS
  it("sets build.inlineStylesheets to 'always' in the Astro config", () => {
    const config = readFileSync(join(WEB_ROOT, 'astro.config.mjs'), 'utf8');
    expect(config).toMatch(/build:\s*\{[^}]*inlineStylesheets:\s*'always'/);
  });

  // spec: site-shell › [SS32] no page links a stylesheet and no CSS file is emitted
  it('links no stylesheet, keeps the CSS in the head and emits no CSS file', async () => {
    await build('base');
    const dir = join(out, 'base');
    expect(globSync('_astro/**/*.css', { cwd: dir })).toEqual([]);
    for (const name of PAGES_WITHOUT_HOME) {
      const html = readFileSync(join(dir, name), 'utf8');
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
    const config = readFileSync(join(WEB_ROOT, 'astro.config.mjs'), 'utf8');
    expect(/scopedStyleStrategy:\s*'class'/.test(config), 'config strategy').toBe(true);
    await build('base');
    for (const name of PAGES_WITHOUT_HOME) {
      const html = readFileSync(join(out, 'base', name), 'utf8');
      expect(html.includes('data-astro-cid-'), `${name} has an attribute-scoped element`).toBe(
        false,
      );
    }
  }, 120_000);

  // spec: site-shell › [SS28], [SS29] the identity does not leak onto the calculator and trust pages
  it.each(PAGES_WITHOUT_HOME)(
    'carries no .home- selector and no gradient on %s',
    async (name) => {
      await build('base');
      const html = readFileSync(join(out, 'base', name), 'utf8');
      // booleans, so a failure does not print the whole page
      expect(html.includes('.home-'), `${name} carries a .home- selector`).toBe(false);
      expect(html.includes('linear-gradient'), `${name} carries a gradient`).toBe(false);
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
