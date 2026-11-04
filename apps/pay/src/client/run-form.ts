import {
  decode,
  encode,
  Rational,
  toDecimalParts,
  type Calculator,
  type InputDescriptor,
  type Money,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { hoursText, moneyText } from '../format.ts';

/** A money value read back from the URL state (its other kinds are plain values). */
const moneyOf = (value: unknown): Money | null =>
  typeof value === 'object' && value !== null && 'currency' in value ? (value as Money) : null;

/**
 * Runs a calculator whose outputs are money or hours on every edit of `form`: writes each output
 * into its `[data-out]`, marks the fields it cannot read, shows the `[data-when]` fields of the chosen
 * `source` and keeps the state in the URL (the defaults are the clean URL).
 */
export const runForm = <const I extends readonly InputDescriptor[]>(
  form: HTMLFormElement | null,
  calculator: Calculator<string, I, readonly OutputDescriptor[], readonly string[]>,
): void => {
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
    const { state } = decode(calculator, location.search.slice(1));
    const values: Readonly<Record<string, unknown>> = state;
    for (const { key } of calculator.inputs) {
      const field = fieldOf(key);
      const value = values[key];
      if (field === null) continue;
      const money = moneyOf(value);
      if (money !== null) {
        const { integer, fraction } = toDecimalParts(money.amount, 2);
        field.value = `${String(integer)}.${fraction}`;
      } else if (value instanceof Rational) field.value = hoursText(value);
      else if (typeof value === 'number' || typeof value === 'string') field.value = String(value);
    }
  }

  const render = (): void => {
    const raw = rawOf();
    for (const node of form.querySelectorAll<HTMLElement>('[data-when]')) {
      node.hidden = node.dataset['when'] !== raw['source'];
    }
    const ran = calculator.run(raw);
    for (const { key } of calculator.inputs) fieldOf(key)?.removeAttribute('aria-invalid');
    if (!ran.ok) {
      for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
      return;
    }
    for (const { key, value } of ran.value.outputs) {
      const text =
        typeof value === 'object' && 'currency' in value
          ? moneyText(value)
          : value instanceof Rational
            ? hoursText(value)
            : null;
      if (text === null) continue;
      for (const node of document.querySelectorAll(`[data-out="${key}"]`)) node.textContent = text;
    }
    const query = encoded(raw);
    if (query !== null) {
      history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
    }
  };

  render();
  form.addEventListener('input', render);
};
