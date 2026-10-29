import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import CalculatorField from './CalculatorField.astro';

const field = { key: 'length', label: 'Length', value: '12 ft', mode: 'decimal' } as const;

describe('CalculatorField (calculator-page › Form controls, [CP12], [CP41] static)', () => {
  // spec: calculator-page › [CP12] a label tied to its input, the keyboard; the form owns autocomplete
  it('renders the label tied to a disabled input named after the key', async () => {
    const root = await renderComponent(CalculatorField, { field });
    expect(root.querySelector('label')?.getAttribute('for')).toBe('calc-length');
    expect(root.querySelector('label')?.text).toBe('Length');
    const input = root.querySelector('input');
    expect(input?.getAttribute('id')).toBe('calc-length');
    expect(input?.getAttribute('name')).toBe('length');
    expect(input?.getAttribute('inputmode')).toBe('decimal');
    expect(input?.hasAttribute('autocomplete')).toBe(false);
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

  it('hides itself when asked', async () => {
    const root = await renderComponent(CalculatorField, { field, hidden: true });
    expect(root.querySelector('.calc-field')?.hasAttribute('hidden')).toBe(true);
  });

  it('is visible by default, and has no description without a hint or help', async () => {
    const root = await renderComponent(CalculatorField, { field });
    const wrapper = root.querySelector('.calc-field');
    expect(wrapper?.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('input')?.hasAttribute('aria-describedby')).toBe(false);
    expect(root.querySelector('small')).toBeNull();
    expect(root.querySelector('.calc-help')).toBeNull();
  });

  // spec: calculator-page › [CP51] the unit hint is visible text the input is described by
  it('renders the unit hint after the input and describes the input by it', async () => {
    const root = await renderComponent(CalculatorField, { field: { ...field, hint: 'feet' } });
    const hint = root.querySelector('input + small');
    expect(hint?.text).toBe('feet');
    expect(hint?.getAttribute('id')).toBe('calc-length-hint');
    expect(hint?.hasAttribute('hidden')).toBe(false);
    expect(root.querySelector('input')?.getAttribute('aria-describedby')).toBe('calc-length-hint');
  });

  // spec: calculator-page › Form controls: the waste help is tied to its input (the slot errors use)
  it('renders the help text after the input and describes the input by it', async () => {
    const root = await renderComponent(CalculatorField, { field: { ...field, help: 'Help' } });
    const help = root.querySelector('input + .calc-help');
    expect(help?.text).toBe('Help');
    expect(help?.getAttribute('id')).toBe('calc-length-help');
    expect(root.querySelector('input')?.getAttribute('aria-describedby')).toBe('calc-length-help');
  });

  it('describes the input by the hint, then the help', async () => {
    const root = await renderComponent(CalculatorField, {
      field: { ...field, hint: 'feet', help: 'Help' },
    });
    expect(root.querySelector('input')?.getAttribute('aria-describedby')).toBe(
      'calc-length-hint calc-length-help',
    );
  });
});
