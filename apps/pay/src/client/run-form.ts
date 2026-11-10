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
import {
  clockFieldText,
  decimalHoursText,
  hoursMinutesText,
  hoursText,
  moneyText,
  rateText,
} from '../format.ts';
import { refreshShare } from './share.ts';
import { watchUsage } from '@maestro-calc/site-kit/track';

/** How an hours output is written, by the `data-format` of its node; plain `hoursText` otherwise. */
const HOURS_FORMATS: Readonly<Record<string, (hours: Rational) => string>> = {
  decimal: decimalHoursText,
  'hours-minutes': hoursMinutesText,
  rate: rateText,
};

/** A money value read back from the URL state (its other kinds are plain values). */
const moneyOf = (value: unknown): Money | null =>
  typeof value === 'object' && value !== null && 'currency' in value ? (value as Money) : null;

/**
 * Runs a calculator whose outputs are money or hours on every edit of `form`: writes each output
 * into its `[data-out]` (an hours output in the `data-format` of the node), marks the fields it
 * cannot read, shows the `[data-when]` fields of the chosen `source`, shows each `[data-warning]`
 * only while the run returns its code, and keeps the state in the URL (the fields as rendered are
 * the clean URL).
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
  // the fields as the page rendered them are the clean URL: the calculator's defaults on its own
  // page, the shift of a shift page (whose tool opens on that shift, not on the defaults)
  const start = encoded(rawOf()) ?? encoded({});

  if (location.search !== '') {
    const { state } = decode(calculator, location.search.slice(1));
    const values: Readonly<Record<string, unknown>> = state;
    for (const { key, kind } of calculator.inputs) {
      const field = fieldOf(key);
      const value = values[key];
      if (field === null) continue;
      const money = moneyOf(value);
      if (kind === 'clock') field.value = clockFieldText(value as number | null);
      else if (money !== null) {
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
      for (const node of document.querySelectorAll<HTMLElement>(`[data-out="${key}"]`)) {
        const text =
          typeof value === 'object' && 'currency' in value
            ? moneyText(value)
            : value instanceof Rational
              ? (HOURS_FORMATS[node.dataset['format'] ?? ''] ?? hoursText)(value)
              : null;
        if (text !== null) node.textContent = text;
      }
    }
    const codes = new Set(ran.value.warnings.map(({ code }) => code));
    for (const node of document.querySelectorAll<HTMLElement>('[data-warning]')) {
      node.hidden = !codes.has(node.dataset['warning'] ?? '');
    }
    const query = encoded(raw);
    if (query !== null) {
      history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
    }
    refreshShare();
  };

  render();
  form.addEventListener('input', render);
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, calculator.id, form, document, { share: 'a[data-share]' });
};
