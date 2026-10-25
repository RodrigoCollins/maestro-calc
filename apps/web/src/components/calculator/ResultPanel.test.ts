import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import ResultPanel from './ResultPanel.astro';

const result = {
  heading: 'Result',
  primary: { key: 'volumeYd3', before: '', value: '1.63', after: ' cubic yards' },
  rows: [
    { key: 'volumeFt3', label: 'Concrete needed (cubic feet)', value: '44.00' },
    { key: 'volumeM3', label: 'Concrete needed (cubic meters)', value: '1.25' },
    { key: 'netVolume', label: 'Volume before extra (cubic feet)', value: '40.00' },
  ],
  shopping: {
    unit: 'bag-80',
    label: 'Concrete mix, 80 lb bags',
    qty: '74',
    bagYield: 'About 0.60 cubic feet per bag',
  },
  costs: [
    {
      key: 'bagCost',
      label: 'Cost of the bags',
      value: '$0.00',
      visible: false,
      hint: 'Add your price to see the cost',
    },
    {
      key: 'readyMixCost',
      label: 'Cost of ready-mix',
      value: '$0.00',
      visible: false,
      hint: 'Add your price to see the cost',
    },
  ],
  readyMixNote:
    'Ready-mix: order the volume above; your supplier sets the minimum and the increments.',
  estimateNote: 'Estimates only. Check quantities with your supplier and the local building code.',
  termsLabel: 'Terms',
  termsHref: '/terms',
};

describe('ResultPanel (calculator-page › Result panel, [CP1], [CP4], [CP15], [CP17])', () => {
  // spec: calculator-page › [CP4] one data-output per key, in order
  it('addresses each figure by its output key, in the order of the spec', async () => {
    const root = await renderComponent(ResultPanel, { result });
    expect(
      root.querySelectorAll('[data-output]').map((el) => el.getAttribute('data-output')),
    ).toEqual(['volumeYd3', 'volumeFt3', 'volumeM3', 'netVolume', 'bagCost', 'readyMixCost']);
    expect(root.querySelectorAll('[data-output]').map((el) => el.text)).toEqual([
      '1.63',
      '44.00',
      '1.25',
      '40.00',
      '$0.00',
      '$0.00',
    ]);
  });

  // spec: calculator-page › [CP15] the large figure with its unit, then the labelled rows
  it('writes the large figure with its unit words and the rows with their labels', async () => {
    const root = await renderComponent(ResultPanel, { result });
    expect(root.querySelector('.calc-primary')?.text.trim()).toBe('1.63 cubic yards');
    expect(root.querySelectorAll('.calc-row dt').map((el) => el.text)).toEqual([
      'Concrete needed (cubic feet)',
      'Concrete needed (cubic meters)',
      'Volume before extra (cubic feet)',
    ]);
    expect(root.querySelector('h2')?.text).toBe('Result');
    expect(root.querySelector('section')?.getAttribute('aria-labelledby')).toBe(
      root.querySelector('h2')?.getAttribute('id'),
    );
  });

  // spec: calculator-page › [CP1] cost rows are hidden at a price of zero and the hint shows
  it('hides a cost row without a price and shows its hint, and the reverse with one', async () => {
    const without = await renderComponent(ResultPanel, { result });
    expect(
      without.querySelectorAll('[data-cost-row]').map((el) => el.hasAttribute('hidden')),
    ).toEqual([true, true]);
    expect(
      without.querySelectorAll('[data-hint-row]').map((el) => el.hasAttribute('hidden')),
    ).toEqual([false, false]);
    expect(without.querySelector('[data-price-hint="bagCost"]')?.text).toBe(
      'Add your price to see the cost',
    );

    const costs = [{ ...result.costs[0], value: '$481.00', visible: true }, result.costs[1]];
    const withPrice = await renderComponent(ResultPanel, { result: { ...result, costs } });
    expect(withPrice.querySelector('[data-cost-row="bagCost"]')?.hasAttribute('hidden')).toBe(
      false,
    );
    expect(withPrice.querySelector('[data-hint-row="bagCost"]')?.hasAttribute('hidden')).toBe(true);
    expect(withPrice.querySelector('[data-cost-row="readyMixCost"]')?.hasAttribute('hidden')).toBe(
      true,
    );
    expect(withPrice.querySelector('[data-cost-row="bagCost"] [data-output]')?.text).toBe(
      '$481.00',
    );
  });

  // spec: calculator-page › [CP17] the estimate note and the terms link
  it('closes with the ready-mix note, the estimate note and the link to the terms', async () => {
    const root = await renderComponent(ResultPanel, { result });
    const notes = root.querySelectorAll('.calc-note').map((el) => el.text.trim());
    expect(notes).toContain(result.readyMixNote);
    expect(notes).toContain(`${result.estimateNote} Terms`);
    expect(root.querySelector('.calc-note a')?.getAttribute('href')).toBe('/terms');
    expect(root.querySelector('[data-shopping="bag-80"]')?.text).toBe('74');
  });
});
