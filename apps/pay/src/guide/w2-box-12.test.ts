import { usd, type Money } from '@maestro-calc/core';
import { noTaxOnOvertime } from '@maestro-calc/pay-core/no-tax-on-overtime';
import { noTaxOnTips } from '@maestro-calc/pay-core/no-tax-on-tips';
import { describe, expect, it } from 'vitest';
import { DEDUCTION_PATHS } from '../deductions/texts.ts';
import { moneyText } from '../format.ts';
import { ROUTES } from '../routes.ts';
import { GUIDE_PATHS } from './texts.ts';
import {
  W2_BOX_12_EXAMPLE,
  W2_BOX_12_GUIDE,
  W2_BOX_12_GUIDE_PATHS,
  W2_BOX_12_LEDGER,
} from './w2-box-12.ts';

type Engine = typeof noTaxOnOvertime | typeof noTaxOnTips;

const outputsOf = (engine: Engine, raw: Readonly<Record<string, string>>) => {
  const ran = engine.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

const LANGS = ['en', 'es'] as const;
/** A whole-dollar amount as the prose prints it: `$1,176`. */
const dollars = (money: unknown): string => moneyText(money as Money).replace(/\.00$/, '');
const body = (lang: 'en' | 'es'): string =>
  W2_BOX_12_GUIDE[lang].sections.flatMap(({ paragraphs }) => paragraphs).join(' ');
const amountOf = (id: string) => {
  const line = W2_BOX_12_LEDGER.find((candidate) => candidate.id === id);
  if (line === undefined) throw new Error(`no ledger line ${id}`);
  return line.amount;
};

describe('the W-2 box 12 guide', () => {
  const { tips, overtime, filing, magi, bracket } = W2_BOX_12_EXAMPLE;
  const tipsOut = outputsOf(noTaxOnTips, { tips, filing, magi, bracket });
  const overtimeOut = outputsOf(noTaxOnOvertime, {
    source: 'amount',
    premium: overtime,
    filing,
    magi,
    bracket,
  });

  it('works the example W-2 out with the two calculators’ own engines', () => {
    expect(amountOf('tp')).toEqual(usd(Number(tips)));
    expect(amountOf('tt')).toEqual(usd(Number(overtime)));
    expect(amountOf('tips-deduction')).toEqual(tipsOut['deduction']);
    expect(amountOf('overtime-deduction')).toEqual(overtimeOut['deduction']);
    expect(amountOf('tips-savings')).toEqual(tipsOut['savings']);
    expect(amountOf('overtime-savings')).toEqual(overtimeOut['savings']);
    expect(W2_BOX_12_LEDGER.find(({ id }) => id === 'total')?.kind).toBe('total');
  });

  it('gets the TT amount the same way the overtime calculator does from hours: the half only', () => {
    const fromHours = outputsOf(noTaxOnOvertime, {
      source: 'hours',
      rate: W2_BOX_12_EXAMPLE.rate,
      overtimeHours: W2_BOX_12_EXAMPLE.overtimeHours,
      filing,
      magi,
      bracket,
    });
    expect(fromHours['deduction']).toEqual(overtimeOut['deduction']);
  });

  it.each(LANGS)('%s: prints the example figures and the caps the engines apply', (lang) => {
    const text = `${W2_BOX_12_GUIDE[lang].lead} ${body(lang)}`;
    for (const figure of [tipsOut['savings'], overtimeOut['savings']])
      expect(text).toContain(dollars(figure));
    // the caps and the phase-out the engines apply, so the prose never drifts from them
    const capOf = (engine: Engine, raw: Readonly<Record<string, string>>) =>
      dollars(outputsOf(engine, raw)['deduction']);
    expect(text).toContain(capOf(noTaxOnTips, { tips: '900000', filing: 'joint', magi: '0' }));
    expect(text).toContain(
      capOf(noTaxOnOvertime, { source: 'amount', premium: '900000', filing: 'single', magi: '0' }),
    );
    expect(text).toContain('$150,000');
    expect(text).toContain('$300,000');
    expect(text).toMatch(/2025/);
    expect(text).toMatch(/2028/);
  });

  it.each(LANGS)('%s: names both codes, box 14b and what to do when a code is missing', (lang) => {
    const text = body(lang);
    for (const term of ['TP', 'TT', '14b', 'W-2c', '4137', '4852', '800-829-1040', '000'])
      expect(text, term).toContain(term);
  });

  it('has the same sections in both languages, each with an IRS source', () => {
    const { en, es } = W2_BOX_12_GUIDE;
    expect(es.sections.map(({ sources }) => sources)).toEqual(
      en.sections.map(({ sources }) => sources),
    );
    for (const { sources } of en.sections) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { href } of sources) expect(href).toMatch(/^https:\/\/www\.irs\.gov\//);
    }
  });

  it('keeps titles short and links both calculators and the tax guide in its own language', () => {
    for (const lang of LANGS) {
      const texts = W2_BOX_12_GUIDE[lang];
      expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
      expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
      expect(texts.disclaimer).toMatch(/not tax advice|no asesoría fiscal/);
      expect(texts.ctas.map(({ href }) => href)).toEqual([
        DEDUCTION_PATHS.tips[lang],
        DEDUCTION_PATHS.overtime[lang],
        GUIDE_PATHS[lang],
      ]);
    }
    expect(W2_BOX_12_GUIDE_PATHS.es.startsWith('/es/guias/')).toBe(true);
  });

  it('is an article of the route table', () => {
    expect(ROUTES).toContainEqual(
      expect.objectContaining({ id: 'w2-box-12-guide', kind: 'article', ...W2_BOX_12_GUIDE_PATHS }),
    );
  });
});
