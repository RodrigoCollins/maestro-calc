import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import ShoppingLine from './ShoppingLine.astro';

const shopping = {
  unit: 'bag-80',
  qty: '74',
  label: { before: 'Concrete mix, ', value: '80', after: ' lb bags' },
  bagYield: { before: 'About ', value: '0.60', after: ' cubic feet per bag' },
};

describe('ShoppingLine (calculator-page › Result panel, [CP4], [CP15])', () => {
  // spec: calculator-page › [CP4] one data-shopping element, addressed by the purchase unit
  it('shows the label, the quantity under the purchase unit and the yield', async () => {
    const root = await renderComponent(ShoppingLine, { shopping });
    expect(root.querySelectorAll('[data-shopping]')).toHaveLength(1);
    expect(root.querySelector('[data-shopping="bag-80"]')?.text).toBe('74');
    expect(root.querySelector('.calc-label')?.text).toBe('Concrete mix, 80 lb bags');
    expect(root.querySelector('[data-line-note="0"]')?.text).toBe('About 0.60 cubic feet per bag');
  });

  // the script rewrites the bag size and the yield without touching the words around them
  it('wraps the two numbers the script rewrites', async () => {
    const root = await renderComponent(ShoppingLine, { shopping });
    expect(root.querySelector('.calc-label [data-fill="bagLb"]')?.text).toBe('80');
    expect(root.querySelector('[data-line-note="0"] [data-fill="yield"]')?.text).toBe('0.60');
  });

  it('follows the unit and the quantity it is given', async () => {
    const root = await renderComponent(ShoppingLine, {
      shopping: { ...shopping, unit: 'bag-40', qty: '1,527,778' },
    });
    expect(root.querySelector('[data-shopping="bag-40"]')?.text).toBe('1,527,778');
    expect(root.querySelector('[data-shopping="bag-80"]')).toBeNull();
  });
});
