import { decode, encode, Rational } from '@maestro-calc/core';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { patchOf, type AnyCalculator, type View } from '../calc/view.ts';
import { amountText } from '../format.ts';
import { shareMessage, sharedUrlOf, whatsappHref } from '../share/href.ts';
import { applyPatch } from './apply.ts';

/** Puts the current address, with the state in its query, into every WhatsApp share link of the page. */
const refreshShare = (): void => {
  const canonical = document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? null;
  const url = sharedUrlOf(canonical, location.href);
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-share]'))
    link.href = whatsappHref(shareMessage(link.dataset['share'] ?? '', url));
};

/**
 * Runs a calculator page on every edit of its form: patches the result with the page's view,
 * marks the fields it cannot read, keeps the state in the URL (the page's starting values are the
 * clean URL) and keeps the share links current. The state read from the URL on load is applied
 * before the first run.
 */
export const runForm = (calculator: AnyCalculator, view: View): void => {
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
  // the page's own starting values, which may be a preset (a puppy), are the clean URL
  const start = encoded(rawOf());

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
  }

  const render = (): void => {
    const raw = rawOf();
    for (const { key } of calculator.inputs) fieldOf(key)?.removeAttribute('aria-invalid');
    const patch = patchOf(calculator, view, raw);
    if (patch === undefined) {
      const ran = calculator.run(raw);
      if (!ran.ok)
        for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
      return;
    }
    applyPatch(document, patch);
    const query = encoded(raw);
    if (query !== null)
      history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
    refreshShare();
  };

  render();
  form.addEventListener('input', render);
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, calculator.id, form, document, { share: 'a[data-share]' });
};
