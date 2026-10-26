import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import CalculatorField from './CalculatorField.astro';

const field = { key: 'length', label: 'Length', value: '12 ft', mode: 'decimal' } as const;

describe('CalculatorField (calculator-page › Form controls, [CP12], [CP41] static)', () => {
  // spec: calculator-page › [CP12] a label tied to its input, the keyboard, no autocomplete
  it('renders the label tied to a disabled input named after the key', async () => {
    const root = await renderComponent(CalculatorField, { field });
    expect(root.querySelector('label')?.getAttribute('for')).toBe('calc-length');
    expect(root.querySelector('label')?.text).toBe('Length');
    const input = root.querySelector('input');
    expect(input?.getAttribute('id')).toBe('calc-length');
    expect(input?.getAttribute('name')).toBe('length');
    expect(input?.getAttribute('inputmode')).toBe('decimal');
    expect(input?.getAttribute('autocomplete')).toBe('off');
    expect(input?.getAttribute('value')).toBe('12 ft');
    expect(input?.hasAttribute('disabled')).toBe(true);
    expect(input?.hasAttribute('placeholder')).toBe(false);
  });

  it('adds the placeholder only when the field has one', async () => {
    const root = await renderComponent(CalculatorField, {
      field: { ...field, mode: 'numeric', placeholder: '0.00' },
    });
    expect(root.querySelector('input')?.getAttribute('placeholder')).toBe('0.00');
    expect(root.querySelector('input')?.getAttribute('inputmode')).toBe('numeric');
  });

  it('tags the shapes it belongs to and hides itself when asked', async () => {
    const root = await renderComponent(CalculatorField, {
      field,
      shapes: ['slab', 'footing'],
      hidden: true,
    });
    const wrapper = root.querySelector('.calc-field');
    expect(wrapper?.getAttribute('data-shapes')).toBe('slab footing');
    expect(wrapper?.hasAttribute('hidden')).toBe(true);
  });

  it('is visible and untagged by default, and renders its slot after the input', async () => {
    const root = await renderComponent(
      CalculatorField,
      { field },
      { slots: { default: '<p class="calc-help">Help</p>' } },
    );
    const wrapper = root.querySelector('.calc-field');
    expect(wrapper?.hasAttribute('data-shapes')).toBe(false);
    expect(wrapper?.hasAttribute('hidden')).toBe(false);
    expect(wrapper?.querySelector('input + .calc-help')?.text).toBe('Help');
  });
});
