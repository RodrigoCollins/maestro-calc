import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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

describe('CalculatorBody HTML budget (calculator-page › Page anatomy; site-quality › [SQ7]; design C18, DR-16)', () => {
  // spec: site-quality › [SQ7] with full-length copy: 1,500 words, 8 FAQ answers of 450 characters,
  // the JSON-LD, every template and the inline CSS, built by the real pipeline, in both locales
  it('fits the HTML budget with full-length copy, the JSON-LD and the inlined CSS', async () => {
    const sizes = sizesOf(await build('base'));
    console.info(
      `calculator page HTML with full-length copy: en ${String(sizes.en)} B, es ${String(sizes.es)} B of ${String(HTML_BUDGET)} B`,
    );
    expect(sizes.en).toBeLessThanOrEqual(HTML_BUDGET);
    expect(sizes.es).toBeLessThanOrEqual(HTML_BUDGET);
  }, 120_000);

  // the JSON-LD of the proof is the real builder's, serialized by the real serializer
  it('carries the JSON-LD graph of calculatorJsonLd for the full-length FAQ', async () => {
    const files = await build('jsonld');
    for (const locale of ['en', 'es'] as const) {
      const routes = {
        ...ROUTES,
        concrete: { en: '/concrete-calculator', es: '/es/calculadora-de-concreto' },
      } as const;
      const view = pageView('concrete', locale);
      const expected = serializeJsonLd(
        calculatorJsonLd({ id: 'concrete', name: view.title }, locale, faqOf(locale), routes),
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
