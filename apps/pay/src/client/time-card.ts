import { decode, encode, toDecimalParts } from '@maestro-calc/core';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { clockFieldText, hoursText, moneyText } from '../format.ts';
import { watchUsage } from '@maestro-calc/site-kit/track';
import {
  outputOf,
  receiptMessage,
  sharedUrlOf,
  whatsappHref,
  type Lang,
} from '../time-card/receipt.ts';

// The time card page script: every edit reruns the calculator, writes the figures, keeps the state
// in the URL (so the receipt link reopens the same week) and rewrites the WhatsApp link.
const form = document.querySelector<HTMLFormElement>('form[data-time-card]');
const lang: Lang = document.documentElement.lang === 'es' ? 'es' : 'en';

const fieldOf = (name: string): HTMLInputElement | HTMLSelectElement | null =>
  form?.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;

const setText = (key: string, text: string): void => {
  for (const node of document.querySelectorAll(`[data-out="${key}"]`)) node.textContent = text;
};

/** Fills the fields from a shared link, before the first run. */
const restore = (): void => {
  if (location.search === '') return;
  const { state } = decode(timeCard, location.search.slice(1));
  for (const input of timeCard.inputs) {
    const field = fieldOf(input.key);
    if (field === null) continue;
    const value = state[input.key];
    if (input.kind === 'clock') field.value = clockFieldText(value as number | null);
    else if (input.kind === 'money') {
      const { integer, fraction } = toDecimalParts((value as typeof input.default).amount, 2);
      field.value = `${String(integer)}.${fraction}`;
    } else if (typeof value === 'number' || typeof value === 'string') field.value = String(value);
  }
};

const render = (): void => {
  if (form === null) return;
  const raw = Object.fromEntries(
    timeCard.inputs.map((input) => [input.key, fieldOf(input.key)?.value]),
  );
  const ran = timeCard.run(raw);
  for (const input of timeCard.inputs) fieldOf(input.key)?.removeAttribute('aria-invalid');
  if (!ran.ok) {
    for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
    return;
  }
  const result = ran.value;
  for (const { key, value } of result.outputs) {
    setText(key, 'currency' in value ? moneyText(value) : hoursText(value));
  }
  for (const row of ['overtime', 'double'] as const) {
    const node = document.querySelector<HTMLElement>(`[data-row="${row}"]`);
    if (node !== null) node.hidden = outputOf(result, `${row}Hours`).isZero();
  }
  const warning = document.querySelector<HTMLElement>('[data-warning]');
  if (warning !== null) warning.hidden = result.warnings.length === 0;
  const validated = timeCard.validate(raw);
  if (validated.ok) {
    // the default week is the clean URL; any change is a query that reopens the same card
    const query = encode(timeCard, validated.value);
    history.replaceState(null, '', query === 'v=1' ? location.pathname : `?${query}`);
  }
  const link = document.querySelector<HTMLAnchorElement>('[data-whatsapp]');
  const canonical = document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? null;
  const url = sharedUrlOf(canonical, location.href);
  if (link !== null) link.href = whatsappHref(receiptMessage(result, lang, url));
};

restore();
render();
form?.addEventListener('input', render);
// usage events for analytics: the action and the calculator, never a value (analytics-events)
if (form !== null) {
  watchUsage(window, timeCard.id, form, document, {
    share: 'a[data-whatsapp]',
    print: '[data-print]',
  });
}
document.querySelector('[data-print]')?.addEventListener('click', () => {
  print();
});
