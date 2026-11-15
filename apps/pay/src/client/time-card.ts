import { decode, encode, toDecimalParts } from '@maestro-calc/core';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { clockFieldText, hoursText, moneyText } from '../format.ts';
import { watchUsage, type CalcAction } from '@maestro-calc/site-kit/track';
import {
  outputOf,
  receiptMessage,
  sharedUrlOf,
  weekSummary,
  whatsappHref,
  type Lang,
} from '../time-card/receipt.ts';
import { clearWeek, readWeek, startOf, storeOf, writeWeek } from '../time-card/saved.ts';
import { canShare, sendText } from '../share/send.ts';

// The time card page script: every edit reruns the calculator, writes the figures, keeps the state
// in the URL (so the receipt link reopens the same week) and rewrites the WhatsApp link. The full
// page also keeps the week in this browser (`saved.ts`) and copies or shares it as text.
const form = document.querySelector<HTMLFormElement>('form[data-time-card]');
const lang: Lang = document.documentElement.lang === 'es' ? 'es' : 'en';
// the full page has the saved week's controls; an embed has none, and keeps nothing
const saved = document.querySelector<HTMLElement>('[data-saved]');
const store = saved === null ? null : storeOf(window);
const status = document.querySelector<HTMLElement>('[data-status]');

type Result = Extract<ReturnType<typeof timeCard.run>, { ok: true }>['value'];
let last: Result | null = null;

const fieldOf = (name: string): HTMLInputElement | HTMLSelectElement | null =>
  form?.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;

const setText = (key: string, text: string): void => {
  for (const node of document.querySelectorAll(`[data-out="${key}"]`)) node.textContent = text;
};

/** Says one of the status region's messages (`data-restored`, `data-copied`…), in its language. */
const say = (key: string): void => {
  if (status !== null) status.textContent = status.dataset[key] ?? '';
};

/** The address that reopens the week: the full page's, even from an embed. */
const sharedUrl = (): string =>
  sharedUrlOf(
    document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? null,
    location.href,
  );

/** Fills the fields from a query (a shared link or the saved week), before the first run. */
const fill = (query: string): void => {
  if (query === '') return;
  const { state } = decode(timeCard, query);
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

/** Reruns the week; returns its query, or `null` while a field cannot be read. */
const render = (): string | null => {
  if (form === null) return null;
  const raw = Object.fromEntries(
    timeCard.inputs.map((input) => [input.key, fieldOf(input.key)?.value]),
  );
  const ran = timeCard.run(raw);
  for (const input of timeCard.inputs) fieldOf(input.key)?.removeAttribute('aria-invalid');
  if (!ran.ok) {
    for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
    return null;
  }
  const result = ran.value;
  last = result;
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
  const query = validated.ok ? encode(timeCard, validated.value) : null;
  // the default week is the clean URL; any change is a query that reopens the same card
  if (query !== null)
    history.replaceState(null, '', query === 'v=1' ? location.pathname : `?${query}`);
  const link = document.querySelector<HTMLAnchorElement>('[data-whatsapp]');
  if (link !== null) link.href = whatsappHref(receiptMessage(result, lang, sharedUrl()));
  return query;
};

// a shared link opens on its own week; the clean address, on the week this browser kept
const start = startOf(location.search, readWeek(store));
fill(start.query);
render();
// usage events for analytics: the action and the calculator, never a value (analytics-events)
const track: (action: CalcAction) => void =
  form === null
    ? () => undefined
    : watchUsage(window, timeCard.id, form, document, {
        share: 'a[data-whatsapp]',
        print: '[data-print]',
      });
if (start.restored) {
  say('restored');
  track('restore');
}

// only an edit keeps the week: opening someone's link never replaces the one saved here
form?.addEventListener('input', () => {
  const query = render();
  if (query !== null) writeWeek(store, query);
});

if (saved !== null && store !== null) {
  saved.hidden = false;
  saved.querySelector('[data-clear]')?.addEventListener('click', () => {
    clearWeek(store);
    form?.reset();
    render();
    say('cleared');
  });
}

const send = document.querySelector<HTMLButtonElement>('[data-send]');
if (send !== null && form !== null) {
  if (canShare(navigator)) send.textContent = send.dataset['shareLabel'] ?? send.textContent;
  send.hidden = false;
  send.addEventListener('click', () => {
    if (last === null) return;
    void sendText(navigator, weekSummary(last, lang, sharedUrl())).then(({ copied, shared }) => {
      if (copied) track('copy');
      if (shared) track('share');
      say(copied ? 'copied' : shared ? 'shared' : 'failed');
    });
  });
}

document.querySelector('[data-print]')?.addEventListener('click', () => {
  print();
});
