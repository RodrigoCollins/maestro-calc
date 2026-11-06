import { noTaxOnOvertime } from '@maestro-calc/pay-core/no-tax-on-overtime';
import { noTaxOnTips } from '@maestro-calc/pay-core/no-tax-on-tips';
import { describe, expect, it } from 'vitest';
import { DEDUCTION_PATHS, DEDUCTION_TEXTS } from './texts.ts';

const CALCULATORS = { overtime: noTaxOnOvertime, tips: noTaxOnTips } as const;

describe('deduction texts', () => {
  for (const [lang, byDeduction] of Object.entries(DEDUCTION_TEXTS)) {
    for (const [deduction, texts] of Object.entries(byDeduction)) {
      const calculator = CALCULATORS[deduction as keyof typeof CALCULATORS];
      describe(`${lang} ${deduction}`, () => {
        it('labels every input of the engine, in its order', () => {
          expect(texts.fields.map(({ key }) => key)).toEqual(
            calculator.inputs.map(({ key }) => key),
          );
        });

        it('labels every option of each select', () => {
          for (const field of texts.fields) {
            const input = calculator.inputs.find(({ key }) => key === field.key);
            if (input?.kind === 'select')
              expect(Object.keys(field.options ?? {})).toEqual(input.options);
            else expect(field.options).toBeUndefined();
          }
        });

        it('labels every output after the leading figure', () => {
          expect(Object.keys(texts.rows)).toEqual(
            calculator.outputs.slice(1).map(({ key }) => key),
          );
        });

        it('cites the IRS Schedule 1-A and keeps the title and description short', () => {
          expect(texts.source.href).toBe('https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf');
          expect(texts.title.length, texts.title).toBeLessThanOrEqual(70);
          expect(texts.description.length, texts.description).toBeLessThanOrEqual(160);
        });
      });
    }
  }

  it('keeps English paths at the root and Spanish ones under /es/', () => {
    for (const paths of Object.values(DEDUCTION_PATHS)) {
      expect(paths.en.startsWith('/es/')).toBe(false);
      expect(paths.es.startsWith('/es/')).toBe(true);
    }
  });

  // the search the tips page answers first: "how to calculate taxes on tips"
  it('opens the tips page with how the deduction lowers the tax on tips', () => {
    expect(DEDUCTION_TEXTS.en.tips.lead).toMatch(
      /^Up to \$25,000 of qualified tips comes off your federal taxable income .*bracket\./,
    );
    expect(DEDUCTION_TEXTS.es.tips.lead).toMatch(
      /^Hasta \$25,000 de propinas calificadas se restan de tu ingreso gravable federal .*tramo\./,
    );
  });
});
