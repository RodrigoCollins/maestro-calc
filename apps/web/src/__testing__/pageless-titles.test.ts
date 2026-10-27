import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { esRectangleArea } from '@maestro-calc/i18n/catalogs/es/rectangle-area';
import { describe, expect, it } from 'vitest';
import { PAGELESS } from '../routing/templates.ts';
import { calculatorTitle, pagelessTitles } from './pageless-titles.ts';

describe('pageless calculator titles (trust-pages › [TP31] test support)', () => {
  it('reads the title of a calculator from its own catalog module, in each locale', async () => {
    expect(await calculatorTitle('rectangle-area', 'en')).toBe(
      enRectangleArea['calc.rectangle-area.title'],
    );
    expect(await calculatorTitle('rectangle-area', 'es')).toBe(
      esRectangleArea['calc.rectangle-area.title'],
    );
  });

  it('reads both locales of every PAGELESS id by default', async () => {
    expect(await pagelessTitles()).toHaveLength(PAGELESS.length * 2);
  });

  it('reads nothing when there is no pageless id', async () => {
    expect(await pagelessTitles([])).toEqual([]);
  });

  it('throws naming the key and the locale when the catalog module is missing', async () => {
    await expect(calculatorTitle('no-such-calculator', 'es')).rejects.toThrow(
      'calc.no-such-calculator.title: no es catalog module',
    );
  });

  it('throws naming the key and the locale when the module has no title', async () => {
    await expect(calculatorTitle('common', 'en')).rejects.toThrow(
      'calc.common.title is missing in the en catalog module',
    );
  });
});
