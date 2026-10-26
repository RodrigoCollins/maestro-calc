import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import ShoppingLine from './ShoppingLine.astro';
import type { ShoppingLineView } from './model.ts';

const line: ShoppingLineView = {
  unit: 'bag-80',
  qty: '74',
  label: { name: 'bagLb', before: 'Concrete mix, ', value: '80', after: ' lb bags' },
  note: { name: 'yield', before: 'About ', value: '0.60', after: ' cubic feet per bag' },
};

describe('ShoppingLine (calculator-page › Result panel, [CP4], [CP15], [CP54])', () => {
  // spec: calculator-page › [CP4] one data-shopping element, addressed by the purchase unit
  it('shows the label, the quantity under the purchase unit and the note', async () => {
    const root = await renderComponent(ShoppingLine, { line, index: 0 });
    expect(root.querySelectorAll('[data-shopping]')).toHaveLength(1);
    expect(root.querySelector('[data-shopping="bag-80"]')?.text).toBe('74');
    expect(root.querySelector('.calc-label')?.text).toBe('Concrete mix, 80 lb bags');
    expect(root.querySelector('[data-line-note="0"]')?.text).toBe('About 0.60 cubic feet per bag');
  });

  // spec: calculator-page › [CP54] the line, its fills and its note carry the line index
  it('numbers the line and its note and names the fill of each', async () => {
    const root = await renderComponent(ShoppingLine, { line, index: 0 });
    expect(root.querySelectorAll('[data-line="0"]')).toHaveLength(1);
    expect(root.querySelector('[data-line="0"] .calc-label [data-fill="bagLb"]')?.text).toBe('80');
    expect(root.querySelector('[data-line-note="0"] [data-fill="yield"]')?.text).toBe('0.60');
  });

  it('follows the unit, the quantity and the index it is given', async () => {
    const root = await renderComponent(ShoppingLine, {
      line: { ...line, unit: 'bag-40', qty: '1,527,778' },
      index: 3,
    });
    expect(root.querySelector('[data-shopping="bag-40"]')?.text).toBe('1,527,778');
    expect(root.querySelector('[data-shopping="bag-80"]')).toBeNull();
    expect(root.querySelector('[data-line="3"]')).not.toBeNull();
    expect(root.querySelector('[data-line-note="3"]')).not.toBeNull();
  });

  it('writes a label and a note with no fill as plain text and a line with no note without one', async () => {
    const root = await renderComponent(ShoppingLine, {
      line: { unit: 'bag-b', qty: '7', label: { before: 'Bags', value: '', after: '' } },
      index: 1,
    });
    expect(root.querySelector('.calc-label')?.text.trim()).toBe('Bags');
    expect(root.querySelectorAll('[data-fill]')).toHaveLength(0);
    expect(root.querySelectorAll('[data-line-note]')).toHaveLength(0);
    const plain = await renderComponent(ShoppingLine, {
      line: {
        unit: 'bag-b',
        qty: '7',
        label: { before: 'Bags', value: '', after: '' },
        note: { before: 'No fill here', value: '', after: '' },
      },
      index: 1,
    });
    expect(plain.querySelector('[data-line-note="1"]')?.text.trim()).toBe('No fill here');
    expect(plain.querySelectorAll('[data-fill]')).toHaveLength(0);
  });
});
