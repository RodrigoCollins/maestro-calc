import { existsSync, globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { converterOf } from '../military/converter.ts';
import { describe, expect, it } from 'vitest';
import { DEDUCTION_TEXTS } from '../deductions/texts.ts';
import { DECIMAL_HOURS_TEXTS, HOURS_TEXTS } from '../hours/texts.ts';
import { OVERTIME_TEXTS } from '../overtime/texts.ts';
import { PAY_CONVERTER_TEXTS } from '../pay-converter/texts.ts';
import { PTO_TEXTS } from '../pto/texts.ts';
import { isPaired, ROUTES } from '../routes.ts';
import { SHIFT_TEXTS } from '../shift/texts.ts';
import { TIPPED_TEXTS } from '../tipped/texts.ts';
import { CALCULATOR_PAGES, EMBED_PAGES } from '../site-check/pages.ts';
import { TIME_CARD_TEXTS } from '../time-card/texts.ts';
import { EMBEDS, snippetsFor } from './embeds.ts';
import { EMBED_PATHS, EMBED_TEXTS } from './texts.ts';

const pagesDir = resolve(import.meta.dirname, '../pages');
const sourceOf = (path: string): string => resolve(pagesDir, `${path.slice(1)}.astro`);
// a one-language calculator (the Spanish days between dates) has no embed
const calculators = ROUTES.filter(isPaired).filter(({ kind }) => kind === 'calculator');
const layout = readFileSync(resolve(import.meta.dirname, '../components/SiteLayout.astro'), 'utf8');

describe('EMBEDS', () => {
  it('embeds every calculator page in both languages at /embed + its path', () => {
    expect(EMBEDS.map(({ page }) => page).sort()).toEqual(
      calculators.flatMap(({ en, es }) => [en, es]).sort(),
    );
    for (const embed of EMBEDS) expect(embed.path).toBe(`/embed${embed.page}`);
  });

  it('switches language to the same calculator embedded in the other language', () => {
    for (const { id, lang, other } of EMBEDS) {
      const twin = EMBEDS.find((embed) => embed.id === id && embed.lang !== lang);
      expect(other).toBe(twin?.path);
    }
  });

  it('has one source page per embed under src/pages/embed, and no other', () => {
    const files = globSync('embed/**/*.astro', { cwd: pagesDir }).map((file) =>
      file.replaceAll('\\', '/'),
    );
    expect(files.sort()).toEqual(EMBEDS.map(({ path }) => `${path.slice(1)}.astro`).sort());
    for (const { path } of EMBEDS) {
      expect(readFileSync(sourceOf(path), 'utf8'), path).toMatch(/\bembed\b/);
    }
  });

  it('lets each built embed load its one calculator script (the budgets of site-check)', () => {
    expect([...EMBED_PAGES].sort()).toEqual(
      EMBEDS.map(({ path }) => `${path.slice(1)}.html`).sort(),
    );
    for (const page of EMBED_PAGES) expect(CALCULATOR_PAGES).toContain(page);
  });

  it('names each calculator by the heading of its full page', () => {
    const headings = new Set(
      (['en', 'es'] as const).flatMap((lang) => [
        TIME_CARD_TEXTS[lang].h1,
        OVERTIME_TEXTS[lang].h1,
        HOURS_TEXTS[lang].h1,
        DECIMAL_HOURS_TEXTS[lang].h1,
        PTO_TEXTS[lang].h1,
        SHIFT_TEXTS[lang].h1,
        TIPPED_TEXTS[lang].h1,
        PAY_CONVERTER_TEXTS[lang].variants.hourly.h1,
        PAY_CONVERTER_TEXTS[lang].variants.salary.h1,
        DEDUCTION_TEXTS[lang].overtime.h1,
        DEDUCTION_TEXTS[lang].tips.h1,
        converterOf(lang).h1,
      ]),
    );
    for (const { name } of EMBEDS) expect(headings.has(name), name).toBe(true);
  });
});

describe('snippetsFor', () => {
  it('lists every calculator of the language, framed, then credited outside the frame', () => {
    const [first] = snippetsFor('en');
    expect(snippetsFor('en')).toHaveLength(calculators.length);
    expect(snippetsFor('es')).toHaveLength(calculators.length);
    expect(first?.code).toBe(
      [
        '<iframe src="https://cuentahoras.com/embed/time-card-calculator" title="Time card calculator with overtime" width="100%" height="1500" style="border:0" loading="lazy"></iframe>',
        '<p><a href="https://cuentahoras.com/time-card-calculator">Time card calculator with overtime by Cuenta Horas</a></p>',
      ].join('\n'),
    );
  });

  it('credits the site in Spanish on a Spanish embed', () => {
    const [first] = snippetsFor('es');
    expect(first?.code).toContain(
      '<a href="https://cuentahoras.com/es/calculadora-de-horas-trabajadas">Calculadora de horas trabajadas y horas extra de Cuenta Horas</a>',
    );
  });
});

describe('the embed page', () => {
  it('is routed as an article pair, one page file each', () => {
    expect(EMBED_PATHS).toEqual({
      en: '/embed-calculators',
      es: '/es/calculadoras-para-tu-sitio',
    });
    expect(ROUTES).toContainEqual({ id: 'embed', kind: 'article', ...EMBED_PATHS });
    expect(existsSync(sourceOf(EMBED_PATHS.en))).toBe(true);
    expect(existsSync(sourceOf(EMBED_PATHS.es))).toBe(true);
  });

  it('is linked from the footer of every page, in each language', () => {
    const footer = /<footer[\s\S]*<\/footer>/.exec(layout)?.[0] ?? '';
    expect(footer).toContain('embedLink.href');
    expect(layout).toContain(`href: '${EMBED_PATHS.en}'`);
    expect(layout).toContain(`href: '${EMBED_PATHS.es}'`);
  });

  it('keeps titles under 70 characters and descriptions search engines can show whole', () => {
    for (const texts of Object.values(EMBED_TEXTS)) {
      expect(texts.title).toContain('Cuenta Horas');
      expect(texts.title.length).toBeLessThanOrEqual(70);
      expect(texts.description.length).toBeGreaterThan(50);
      expect(texts.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('has the same steps in both languages and asks to keep the link', () => {
    expect(EMBED_TEXTS.es.steps).toHaveLength(EMBED_TEXTS.en.steps.length);
    expect(EMBED_TEXTS.en.steps.join(' ')).toContain('Keep the link');
    expect(EMBED_TEXTS.es.steps.join(' ')).toContain('Deja el enlace');
  });
});
