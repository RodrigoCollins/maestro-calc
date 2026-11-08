import { dogChocolate } from '@maestro-calc/pets-core/dog-chocolate';
import { describe, expect, it } from 'vitest';
import { BANDS, CALL_NOW, CHOCOLATE_PAGE, chocolateView, POISON_LINE } from './chocolate.ts';
import { patchOf } from './view.ts';

const patch = (raw: Readonly<Record<string, string>>) => {
  const result = patchOf(dogChocolate, chocolateView, { ...CHOCOLATE_PAGE.initial, ...raw });
  if (result === undefined) throw new Error('did not run');
  return result;
};

describe('the poison line', () => {
  it('is the ASPCA number as read on its page on 2026-11-07, with a dialable link', () => {
    expect(POISON_LINE).toEqual({
      name: 'ASPCA Animal Poison Control Center',
      phone: '(888) 426-4435',
      href: 'tel:+18884264435',
      source: 'https://www.aspca.org/pet-care/animal-poison-control',
      checked: '2026-11-07',
    });
    expect(POISON_LINE.href.slice(4)).toBe(`+1${POISON_LINE.phone.replace(/\D/g, '')}`);
  });

  it('tells the reader to call a veterinarian or the poison line now, whatever the figure', () => {
    expect(CALL_NOW).toContain('Call your veterinarian or the ASPCA Animal Poison Control Center');
    expect(CALL_NOW).toContain('(888) 426-4435');
    expect(CALL_NOW).toContain('even when the figure below looks low');
    expect(CALL_NOW).toContain('24 hours a day');
    expect(CALL_NOW).toContain('consultation fee');
  });
});

describe('the chocolate page', () => {
  it('is at the address the routes pin, and starts from the engine defaults', () => {
    expect(CHOCOLATE_PAGE.path).toBe('/dog-chocolate-toxicity-calculator');
    expect(dogChocolate.validate(CHOCOLATE_PAGE.initial).ok).toBe(true);
    expect(dogChocolate.validate({}).ok).toBe(true);
  });

  it('labels every input of the engine, and every option of its choices', () => {
    for (const input of dogChocolate.inputs) {
      const copy = CHOCOLATE_PAGE.fields[input.key];
      expect(copy, input.key).toBeDefined();
      if (input.kind === 'select')
        expect(Object.keys(copy?.options ?? {}), input.key).toEqual([...input.options]);
    }
  });

  it('keeps title and description where a result shows them whole', () => {
    expect(CHOCOLATE_PAGE.title.length).toBeLessThanOrEqual(65);
    expect(CHOCOLATE_PAGE.description.length).toBeGreaterThanOrEqual(50);
    expect(CHOCOLATE_PAGE.description.length).toBeLessThanOrEqual(160);
  });

  it('has a call-now line in every band, and none says it is safe', () => {
    expect(BANDS).toHaveLength(4);
    expect(BANDS[0]).toContain('Still call now');
    for (const band of BANDS) expect(band.toLowerCase()).not.toMatch(/\bsafe\b|nothing to worry/);
  });
});

describe('the chocolate result', () => {
  it('writes the default, 1 oz of milk chocolate for 20 lb, as 7.2 mg/kg in the lowest band', () => {
    const { text, vars, flags } = patch({});
    expect(text['figure']).toBe('7.2');
    expect(text['unit']).toBe('mg/kg');
    expect(text['total']).toBe('65 mg');
    expect(text['band']).toBe(BANDS[0]);
    expect(flags).toEqual({ band: '0' });
    expect(vars).toEqual({ pos: '9.0%' });
  });

  it('works the Merck check: 50 g of milk chocolate for 10 kg is 11.5 mg/kg', () => {
    const { text } = patch({ weight: '10', weightUnit: 'kg', amount: '50', amountUnit: 'g' });
    expect(text['figure']).toBe('11.5');
    expect(text['total']).toBe('115 mg');
  });

  it('gives the grams and ounces that reach each band: 87, 174 and 261 g for 10 kg on milk', () => {
    const { text } = patch({ weight: '10', weightUnit: 'kg' });
    expect(text['reach20']).toBe('87 g (3.1 oz)');
    expect(text['reach40']).toBe('174 g (6.1 oz)');
    expect(text['reach60']).toBe('261 g (9.2 oz)');
  });

  it('puts a dose on the band it reached and the marker along the ruler', () => {
    // 10 kg on baking chocolate (15.5 mg a gram): 30 g is 46.5 mg/kg
    const { flags, vars, text } = patch({
      weight: '10',
      weightUnit: 'kg',
      type: 'baking',
      amount: '30',
      amountUnit: 'g',
    });
    expect(flags).toEqual({ band: '2' });
    expect(vars).toEqual({ pos: '58.1%' });
    expect(text['band']).toBe(BANDS[2]);
  });

  it('keeps the marker on the end of the ruler for a dose past it, in the top band', () => {
    const { flags, vars } = patch({ weight: '5', weightUnit: 'kg', type: 'cocoa-powder', amount: '100', amountUnit: 'g' });
    expect(flags).toEqual({ band: '3' });
    expect(vars).toEqual({ pos: '100.0%' });
  });

  it('gives nothing for a field it cannot read', () => {
    expect(
      patchOf(dogChocolate, chocolateView, { ...CHOCOLATE_PAGE.initial, amount: 'lots' }),
    ).toBeUndefined();
  });
});
