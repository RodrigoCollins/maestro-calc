import {
  decode,
  encode,
  Rational,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { LITERS_PER_GALLON } from '@maestro-calc/pool-core/units';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { amountText, outputText } from '../format.ts';
import { showUnits, storedUnits, storeUnits, unitsOf } from './units.ts';

/**
 * Runs a dose calculator on every edit of its form: writes each output into its `[data-out]`, the
 * bag count into `[data-shop]`, shows the `[data-forms]` results of the chosen product and the
 * `[data-warning]` notes the run raises, marks the fields it cannot read and keeps the numbers in
 * the URL (the defaults are the clean URL). A calculator with a `units` choice writes its texts in
 * those units, turns the typed volume into the other unit when the choice changes, and opens a
 * clean URL on the visitor's last choice.
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
  const unitsField = fieldOf('units');
  const volumeField = fieldOf('gallons');

  /** The typed volume in the other unit, whole: 20,000 gallons are 75,708 litres. */
  const convertVolume = (units: string): void => {
    if (volumeField === null) return;
    const typed = Rational.fromString(volumeField.value.replaceAll(',', '').trim());
    if (!typed.ok) return;
    const converted =
      units === 'metric' ? typed.value.mul(LITERS_PER_GALLON) : typed.value.div(LITERS_PER_GALLON);
    volumeField.value = amountText(converted).replaceAll(',', '');
  };

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
      else if (typeof value === 'number') field.value = String(value);
    }
  } else if (unitsField !== null && storedUnits() === 'metric') {
    unitsField.value = 'metric';
    convertVolume('metric');
  }

  unitsField?.addEventListener('input', () => {
    convertVolume(unitsField.value);
    storeUnits(unitsField.value);
  });

  const render = (): void => {
    const raw = rawOf();
    const units = unitsOf(raw['units']);
    showUnits(units);
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
      for (const node of document.querySelectorAll<HTMLElement>(`[data-out="${key}"]`))
        node.textContent = outputText(key, value, units, node.dataset['as']);
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
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, calculator.id, form, document);
};
