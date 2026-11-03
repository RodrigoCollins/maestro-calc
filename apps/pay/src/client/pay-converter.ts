import { decode, encode, Rational, toDecimalParts } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { hoursText, moneyText } from '../format.ts';

// The pay converter script: every edit reruns the converter, writes the figures and keeps the
// state in the URL. The page's own starting point (hourly or salary) is its clean URL.
const form = document.querySelector<HTMLFormElement>('form[data-pay-converter]');

const fieldOf = (name: string): HTMLInputElement | HTMLSelectElement | null =>
  form?.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;

const rawOf = (): Record<string, string | undefined> =>
  Object.fromEntries(payConverter.inputs.map(({ key }) => [key, fieldOf(key)?.value]));

/** The query of the page's starting point, compared against to keep that URL clean. */
const startQuery = (): string | null => {
  const amount = form?.dataset['defaultAmount'];
  const per = form?.dataset['defaultPer'];
  const validated = payConverter.validate({ amount, per });
  return validated.ok ? encode(payConverter, validated.value) : null;
};

/** Fills the fields from a shared link, before the first run. */
const restore = (): void => {
  if (location.search === '') return;
  const { state } = decode(payConverter, location.search.slice(1));
  for (const input of payConverter.inputs) {
    const field = fieldOf(input.key);
    const value = state[input.key];
    if (field === null) continue;
    if (input.kind === 'money') {
      const { integer, fraction } = toDecimalParts((value as typeof input.default).amount, 2);
      field.value = `${String(integer)}.${fraction}`;
    } else if (value instanceof Rational) field.value = hoursText(value);
    else if (typeof value === 'number' || typeof value === 'string') field.value = String(value);
  }
};

const start = startQuery();

const render = (): void => {
  if (form === null) return;
  const raw = rawOf();
  const ran = payConverter.run(raw);
  for (const input of payConverter.inputs) fieldOf(input.key)?.removeAttribute('aria-invalid');
  if (!ran.ok) {
    for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
    return;
  }
  for (const { key, value } of ran.value.outputs) {
    for (const node of document.querySelectorAll(`[data-out="${key}"]`)) {
      node.textContent = moneyText(value);
    }
  }
  const validated = payConverter.validate(raw);
  if (validated.ok) {
    const query = encode(payConverter, validated.value);
    history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
  }
};

restore();
render();
form?.addEventListener('input', render);
