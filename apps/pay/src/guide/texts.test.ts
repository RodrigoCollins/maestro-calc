import { usd } from '@maestro-calc/core';
import { noTaxOnOvertime } from '@maestro-calc/pay-core/no-tax-on-overtime';
import { noTaxOnTips } from '@maestro-calc/pay-core/no-tax-on-tips';
import { describe, expect, it } from 'vitest';
import { GUIDE_EXAMPLES, GUIDE_PATHS, GUIDE_TEXTS } from './texts.ts';

type Engine = typeof noTaxOnOvertime | typeof noTaxOnTips;

const outputsOf = (engine: Engine, raw: Readonly<Record<string, string>>) => {
  const ran = engine.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

/** A source label that ends with the date of the version read: `(created June 16, 2026)`. */
const DATED =
  /\((?:[^()]* )?(?:January|February|March|April|May|June|July|August|September|October|November|December) (?:\d{1,2}, )?\d{4}\)$/;

const money = (dollars: number): string => `$${dollars.toLocaleString('en-US')}`;

describe('the tax guide', () => {
  // the figures the guide prints are the engines' own
  it.each([
    ['overtime', noTaxOnOvertime, GUIDE_EXAMPLES.overtime],
    ['tips', noTaxOnTips, GUIDE_EXAMPLES.tips],
  ] as const)('prints the %s example as the engine works it out', (_name, engine, example) => {
    const { deduction, savings, ...raw } = example;
    const out = outputsOf(engine, raw);
    expect(out['deduction']).toEqual(usd(deduction));
    expect(out['savings']).toEqual(usd(savings));
    for (const texts of Object.values(GUIDE_TEXTS)) {
      const body = texts.sections.flatMap(({ paragraphs }) => paragraphs).join(' ');
      expect(body).toContain(money(deduction));
      expect(body).toContain(money(savings));
    }
  });

  it('has the same sections in both languages, each with an IRS or DOL source', () => {
    const [en, es] = [GUIDE_TEXTS.en, GUIDE_TEXTS.es];
    expect(es.sections.map(({ sources }) => sources)).toEqual(
      en.sections.map(({ sources }) => sources),
    );
    for (const { sources } of en.sections) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { href } of sources) expect(href).toMatch(/^https:\/\/www\.(irs|dol)\.gov\//);
    }
  });

  it('keeps titles and descriptions short and links both calculators in each language', () => {
    for (const [lang, texts] of Object.entries(GUIDE_TEXTS)) {
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.ctas).toHaveLength(2);
      for (const { href } of texts.ctas) expect(href.startsWith('/es/'), href).toBe(lang === 'es');
    }
    expect(GUIDE_PATHS.es.startsWith('/es/')).toBe(true);
  });

  // the search it answers first: "how to calculate taxes on tips"
  it('answers how tips are taxed in the first sentence, with the example the guide prints', () => {
    const first = (lead: string): string => /^.+?[.!?](?=\s|$)/.exec(lead)?.[0] ?? lead;
    expect(first(GUIDE_TEXTS.en.lead)).toMatch(/^Tips are taxed as wages, but /);
    expect(first(GUIDE_TEXTS.es.lead)).toMatch(/^Las propinas pagan impuestos como salario, pero /);
    for (const { lead } of Object.values(GUIDE_TEXTS)) {
      expect(first(lead)).toContain(money(GUIDE_EXAMPLES.tips.savings));
      expect(first(lead)).toContain(money(GUIDE_EXAMPLES.tips.deduction));
      expect(lead).toContain('Medicare');
    }
  });

  // every figure is dated: each source names the version of the IRS or DOL page that was read
  it('dates every source it cites', () => {
    for (const texts of Object.values(GUIDE_TEXTS))
      for (const { sources } of texts.sections)
        for (const { label } of sources) expect(label).toMatch(DATED);
  });

  it('gives the due date of the 2026 return and the extension in each language', () => {
    const text = (lang: 'en' | 'es') =>
      [GUIDE_TEXTS[lang].lead, ...GUIDE_TEXTS[lang].sections.flatMap((s) => s.paragraphs)].join(
        ' ',
      );
    expect(text('en')).toContain('April 15, 2027');
    expect(text('en')).toContain('Form 4868');
    expect(text('es')).toContain('15 de abril de 2027');
    expect(text('es')).toContain('Formulario 4868');
  });
});
