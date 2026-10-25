import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { AstroInlineConfig } from 'astro';
import { afterAll, describe, expect, it } from 'vitest';
import { importFromRoot } from '../../contract/root.ts';
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
});

/**
 * Builds the site with the production pipeline plus one injected route, the placeholder page, and
 * returns its two HTML files in bytes. `extra` characters of copy are added to the page.
 */
const measure = async (name: string, extra = 0): Promise<Record<'en' | 'es', number>> => {
  // `astro` must load as the Node package, not through the test bundler
  const { build } = await importFromRoot<{ build: (config: AstroInlineConfig) => Promise<void> }>(
    'node_modules/astro/dist/index.js',
  );
  process.env['BUDGET_EXTRA'] = String(extra);
  const outDir = join(out, name);
  await build({
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
  const bytes = (locale: string) =>
    readFileSync(join(outDir, 'zz-budget', `${locale}.html`)).length;
  return { en: bytes('en'), es: bytes('es') };
};

describe('CalculatorBody HTML budget (calculator-page › Page anatomy; site-quality › [SQ7]; design C18, DR-16)', () => {
  // spec: site-quality › [SQ7] with full-length copy: 1,500 words, 8 FAQ answers of 600 characters,
  // the JSON-LD, every template and the inline CSS, built by the real pipeline, in both locales
  it('fits the HTML budget with full-length copy, the JSON-LD and the inlined CSS', async () => {
    const sizes = await measure('base');
    console.info(
      `calculator page HTML with full-length copy: en ${String(sizes.en)} B, es ${String(sizes.es)} B of ${String(HTML_BUDGET)} B`,
    );
    expect(sizes.en).toBeLessThanOrEqual(HTML_BUDGET);
    expect(sizes.es).toBeLessThanOrEqual(HTML_BUDGET);
  }, 120_000);

  // seeded: the assertion bites, so a copy that is too long cannot pass unnoticed
  it('exceeds the budget once 2,000 more characters of copy are added past the headroom', async () => {
    const { es, en } = await measure('seeded', 2_000 + HTML_BUDGET);
    expect(Math.min(en, es)).toBeGreaterThan(HTML_BUDGET);
  }, 120_000);

  it('uses the sizes the spec fixes: 8 answers of 600 characters and 1,500 words', () => {
    for (const locale of ['en', 'es'] as const) {
      const faq = faqOf(locale);
      expect(faq).toHaveLength(FAQ_ITEMS);
      expect(faq.every(({ answer }) => answer.length === FAQ_ANSWER_LENGTH)).toBe(true);
      const prose = copyOf(locale).replaceAll(/<[^>]+>/g, ' ');
      expect(prose.split(/\s+/).filter(Boolean).length).toBeGreaterThan(WORDS);
    }
  });
});
