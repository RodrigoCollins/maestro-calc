import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { describe, expect, it } from 'vitest';
import { PATHS, PAY_CONVERTER_TEXTS } from './texts.ts';

describe('pay converter texts', () => {
  it('names every period and every output of the engine in both languages', () => {
    const per = payConverter.inputs[1];
    for (const texts of Object.values(PAY_CONVERTER_TEXTS)) {
      expect(Object.keys(texts.periods)).toEqual(per.options);
      expect(Object.keys(texts.outputs)).toEqual(payConverter.outputs.map(({ key }) => key));
    }
  });

  it('starts each page at an amount the engine accepts', () => {
    for (const texts of Object.values(PAY_CONVERTER_TEXTS)) {
      for (const variant of Object.values(texts.variants)) {
        expect(payConverter.run({ amount: variant.amount, per: variant.per }).ok).toBe(true);
      }
    }
  });

  it('keeps English paths at the root and Spanish ones under /es/', () => {
    for (const paths of Object.values(PATHS)) {
      expect(paths.en.startsWith('/es/')).toBe(false);
      expect(paths.es.startsWith('/es/')).toBe(true);
    }
  });

  it('keeps titles under 70 characters and descriptions under 160', () => {
    for (const texts of Object.values(PAY_CONVERTER_TEXTS)) {
      for (const variant of Object.values(texts.variants)) {
        expect(variant.title.length, variant.title).toBeLessThanOrEqual(70);
        expect(variant.description.length, variant.description).toBeLessThanOrEqual(160);
      }
    }
  });

  it('links the note to the time card of its language', () => {
    expect(PAY_CONVERTER_TEXTS.en.timeCard.href).toBe('/time-card-calculator');
    expect(PAY_CONVERTER_TEXTS.es.timeCard.href).toBe('/es/calculadora-de-horas-trabajadas');
  });
});
