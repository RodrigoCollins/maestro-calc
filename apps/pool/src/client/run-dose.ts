import {
  decode,
  encode,
  Rational,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { amountText, outputText } from '../format.ts';

/**
 * Runs a dose calculator on every edit of its form: writes each output into its `[data-out]`, the
 * bag count into `[data-shop]`, shows the `[data-forms]` results of the chosen product and the
 * `[data-warning]` notes the run raises, marks the fields it cannot read and keeps the numbers in
 * the URL (the defaults are the clean URL).
 */
export const runDose = <const I extends readonly InputDescriptor[]>(
  calculator: Calculator<string, I, readonly OutputDescriptor[], readonly string[]>,
): void => {
  const form = document.querySelector<HTMLFormElement>(`form[data-calculator="${calculator.id}"]`);
  if (form === null) return;
  const fieldOf = (name: string): HTMLInputElement | HTMLSelectElement | null =>
    form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  const rawOf = (): Record<string, string | undefined> =>
    Object.fromEntries(calculator.inputs.map(({ key }) => [key, fieldOf(key)?.value]));
  const encoded = (raw: Readonly<Record<string, unknown>>): string | null => {
    const validated = calculator.validate(raw);
    return validated.ok ? encode(calculator, validated.value) : null;
  };
  const start = encoded({});

  if (location.search !== '') {
    const values: Readonly<Record<string, unknown>> = decode(
      calculator,
      location.search.slice(1),
    ).state;
    for (const { key } of calculator.inputs) {
      const field = fieldOf(key);
      const value = values[key];
      if (field === null) continue;
      if (value instanceof Rational)
        field.value = amountText(value, 2)
          .replace(/\.?0+$/, '')
          .replaceAll(',', '');
      else if (typeof value === 'string') field.value = value;
    }
  }

  const render = (): void => {
    const raw = rawOf();
    for (const node of document.querySelectorAll<HTMLElement>('[data-forms]')) {
      node.hidden = !(node.dataset['forms'] ?? '').split(' ').includes(raw['product'] ?? '');
    }
    const ran = calculator.run(raw);
    for (const { key } of calculator.inputs) fieldOf(key)?.removeAttribute('aria-invalid');
    if (!ran.ok) {
      for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
      return;
    }
    for (const { key, value } of ran.value.outputs) {
      for (const node of document.querySelectorAll(`[data-out="${key}"]`))
        node.textContent = outputText(key, value);
    }
    for (const node of document.querySelectorAll('[data-shop]')) {
      node.textContent = String(ran.value.shopping[0]?.qty ?? 0n);
    }
    const codes = new Set(ran.value.warnings.map(({ code }) => code));
    for (const node of document.querySelectorAll<HTMLElement>('[data-warning]')) {
      node.hidden = !codes.has(node.dataset['warning'] ?? '');
    }
    const query = encoded(raw);
    if (query !== null)
      history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
  };

  render();
  form.addEventListener('input', render);
};
