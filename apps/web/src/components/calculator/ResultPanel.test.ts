import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import ResultPanel from './ResultPanel.astro';
import type { ResultView } from './model.ts';

const result: ResultView = {
  heading: 'Result',
  primary: { key: 'volumeYd3', prefixed: false, before: '', value: '1.63', after: ' cubic yards' },
  rows: [
    { key: 'volumeYd3', label: 'Concrete needed (cubic yards)', value: '1.63', hidden: true },
    { key: 'volumeFt3', label: 'Concrete needed (cubic feet)', value: '44.00' },
    { key: 'volumeM3', label: 'Concrete needed (cubic meters)', value: '1.25' },
    { key: 'netVolume', label: 'Volume before extra (cubic feet)', value: '40.00' },
  ],
  shopping: [
    {
      unit: 'bag-80',
      qty: '74',
      label: { name: 'bagLb', before: 'Concrete mix, ', value: '80', after: ' lb bags' },
      note: { name: 'yield', before: 'About ', value: '0.60', after: ' cubic feet per bag' },
    },
  ],
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
  costsNote:
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
      'Concrete needed (cubic yards)',
      'Concrete needed (cubic feet)',
      'Concrete needed (cubic meters)',
      'Volume before extra (cubic feet)',
    ]);
    expect(root.querySelector('h2')?.text).toBe('Result');
    expect(root.querySelector('section')?.getAttribute('aria-labelledby')).toBe(
      root.querySelector('h2')?.getAttribute('id'),
    );
  });

  // the large figure mirrors the row of its volume; the script swaps the system and the hidden row
  it('mirrors the primary volume in the large figure and hides its own row', async () => {
    const root = await renderComponent(ResultPanel, { result });
    expect(root.querySelector('[data-primary]')?.text).toBe('1.63');
    expect(root.querySelector('[data-primary]')?.getAttribute('data-primary')).toBe('volumeYd3');
    expect(root.querySelector('[data-primary]')?.hasAttribute('data-output')).toBe(false);
    expect(root.querySelector('[data-primary-after]')?.text).toBe(' cubic yards');
    expect(root.querySelectorAll('.calc-row').map((el) => el.hasAttribute('hidden'))).toEqual([
      true,
      false,
      false,
      false,
    ]);
    const metric = {
      ...result,
      primary: { key: 'volumeM3', prefixed: true, before: 'Total ', value: '1.25', after: ' m3' },
    };
    const swapped = await renderComponent(ResultPanel, { result: metric });
    expect(swapped.querySelector('[data-primary-before]')?.text).toBe('Total ');
    expect(swapped.querySelector('[data-primary]')?.getAttribute('data-primary')).toBe('volumeM3');
  });

  // the script writes the prefix of the other unit system into the span, so the page holds it empty
  it('renders the prefix span empty when a unit system has a prefix the imperial sentence lacks', async () => {
    const root = await renderComponent(ResultPanel, { result });
    expect(root.querySelector('[data-primary-before]')).toBeNull();
    const prefixed = await renderComponent(ResultPanel, {
      result: { ...result, primary: { ...result.primary, prefixed: true } },
    });
    expect(prefixed.querySelector('[data-primary-before]')?.text).toBe('');
    expect(prefixed.querySelector('.calc-primary')?.text.trim()).toBe('1.63 cubic yards');
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
    expect(notes).toContain(result.costsNote);
    expect(notes).toContain(`${result.estimateNote} Terms`);
    expect(root.querySelector('.calc-note a')?.getAttribute('href')).toBe('/terms');
    expect(root.querySelector('[data-shopping="bag-80"]')?.text).toBe('74');
  });

  // spec: calculator-web-core › [CWC3] two lines render in the declared order, one hook set each
  it('renders each shopping line with its own index, in order, with no wrapper element', async () => {
    const second = {
      unit: 'box-a',
      qty: '1,234',
      label: { before: 'Boxes', value: '', after: '' },
    };
    const root = await renderComponent(ResultPanel, {
      result: { ...result, shopping: [...result.shopping, second] },
    });
    expect(root.querySelectorAll('[data-line]').map((el) => el.getAttribute('data-line'))).toEqual([
      '0',
      '1',
    ]);
    expect(
      root
        .querySelectorAll('[data-shopping]')
        .map((el) => [el.getAttribute('data-shopping'), el.text]),
    ).toEqual([
      ['bag-80', '74'],
      ['box-a', '1,234'],
    ]);
    expect(
      root.querySelectorAll('[data-line]').every((el) => el.parentNode?.tagName === 'SECTION'),
    ).toBe(true);
    expect(root.querySelectorAll('[data-line-note]')).toHaveLength(1);
  });

  it('renders no shopping line and no costs note for a result without either', async () => {
    const bare: ResultView = {
      heading: result.heading,
      primary: result.primary,
      rows: result.rows,
      shopping: [],
      costs: [],
      estimateNote: result.estimateNote,
      termsLabel: result.termsLabel,
      termsHref: result.termsHref,
    };
    const root = await renderComponent(ResultPanel, { result: bare });
    expect(root.querySelectorAll('[data-line], [data-shopping], [data-cost-row]')).toHaveLength(0);
    expect(root.querySelectorAll('.calc-note').map((el) => el.text.trim())).toEqual([
      'Estimates only. Check quantities with your supplier and the local building code. Terms',
    ]);
  });
});
