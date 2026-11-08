import {
  decode,
  encode,
  type Calculator,
  type InputDescriptor,
  type Money,
  type OutputDescriptor,
} from '@maestro-calc/core';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { fieldTextOf } from '../fields.ts';
import { moneyText } from '../format.ts';
import { detailsOf, type DetailTexts } from '../receipt/details.ts';
import { quoteMessage, sharedUrlOf, whatsappHref } from '../receipt/message.ts';
import { valuesOf } from '../receipt/values.ts';

const isMoney = (value: unknown): value is Money =>
  typeof value === 'object' && value !== null && 'currency' in value;

/** The words of the receipt details, read from the data attributes the page wrote on it. */
const textsOf = (receipt: HTMLElement): DetailTexts => {
  const word = (name: string): string => receipt.dataset[`t${name}`] ?? '';
  return {
    hour: word('Hour'),
    hourCrew: word('HourCrew'),
    area: word('Area'),
    one: word('One'),
    many: word('Many'),
    overhead: word('Overhead'),
    profit: word('Profit'),
  };
};

/**
 * Runs a quote calculator on every edit of its form: writes each money output into its
 * `[data-out]`, the details and percent labels of the receipt, hides the lines that are zero,
 * shows the `[data-when]` fields of the chosen labor basis, keeps the itemized WhatsApp text in
 * `a[data-share]`, marks the fields it cannot read and keeps the numbers in the URL (the defaults
 * are the clean URL). The print button calls the browser's print, whose stylesheet prints the
 * receipt alone.
 */
export const runQuote = <const I extends readonly InputDescriptor[]>(
  calculator: Calculator<string, I, readonly OutputDescriptor[], readonly string[]>,
): void => {
  const form = document.querySelector<HTMLFormElement>(`form[data-calculator="${calculator.id}"]`);
  const receipt = document.querySelector<HTMLElement>('[data-receipt]');
  if (form === null || receipt === null) return;
  const fieldOf = (name: string): HTMLInputElement | HTMLSelectElement | null =>
    form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  const rawOf = (): Record<string, string | undefined> =>
    Object.fromEntries(calculator.inputs.map(({ key }) => [key, fieldOf(key)?.value]));
  const encoded = (raw: Readonly<Record<string, unknown>>): string | null => {
    const validated = calculator.validate(raw);
    return validated.ok ? encode(calculator, validated.value) : null;
  };
  const start = encoded({});
  const texts = textsOf(receipt);

  if (location.search !== '') {
    const values: Readonly<Record<string, unknown>> = decode(
      calculator,
      location.search.slice(1),
    ).state;
    for (const input of calculator.inputs) {
      const field = fieldOf(input.key);
      if (field !== null && input.key in values)
        field.value = fieldTextOf(input, values[input.key]);
    }
  }

  const textOf = (selector: string): string =>
    receipt.querySelector(selector)?.textContent.trim() ?? '';

  const refreshShare = (): void => {
    const canonical = document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? null;
    const url = sharedUrlOf(canonical, location.href);
    const lines = Array.from(receipt.querySelectorAll<HTMLElement>('li[data-line]'))
      .filter((line) => !line.hidden)
      .map((line) => ({
        label: line.querySelector('.name')?.textContent.trim() ?? '',
        detail: line.querySelector('[data-detail]')?.textContent.trim() ?? '',
        amount: line.querySelector('[data-out]')?.textContent.trim() ?? '',
      }));
    const message = quoteMessage(
      receipt.dataset['title'] ?? '',
      lines,
      { label: textOf('[data-total-label]'), detail: '', amount: textOf('[data-out=total]') },
      url,
    );
    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[data-share]')) {
      link.href = whatsappHref(message);
    }
  };

  const render = (): void => {
    const raw = rawOf();
    for (const node of form.querySelectorAll<HTMLElement>('[data-when]')) {
      node.hidden = node.dataset['when'] !== raw['laborBy'];
    }
    const ran = calculator.run(raw);
    for (const { key } of calculator.inputs) fieldOf(key)?.removeAttribute('aria-invalid');
    if (!ran.ok) {
      for (const { field } of ran.errors) fieldOf(field)?.setAttribute('aria-invalid', 'true');
      return;
    }
    const outputs: Record<string, unknown> = Object.fromEntries(
      ran.value.outputs.map(({ key, value }) => [key, value]),
    );
    for (const [key, value] of Object.entries(outputs)) {
      if (!isMoney(value)) continue;
      for (const node of document.querySelectorAll<HTMLElement>(`[data-out="${key}"]`)) {
        node.textContent = moneyText(value);
      }
    }
    const state = calculator.validate(raw);
    if (state.ok) {
      const details = detailsOf(texts, valuesOf(state.value, outputs));
      const written: Readonly<Record<string, string>> = { ...details };
      for (const [key, text] of Object.entries(written)) {
        for (const node of receipt.querySelectorAll<HTMLElement>(
          `[data-detail="${key}"], [data-name="${key}"]`,
        )) {
          node.textContent = text;
        }
      }
    }
    for (const line of receipt.querySelectorAll<HTMLElement>('li[data-line][data-hide-zero]')) {
      const value = outputs[line.dataset['line'] ?? ''];
      line.hidden = isMoney(value) && value.amount.isZero();
    }
    const query = encoded(raw);
    if (query !== null) {
      history.replaceState(null, '', query === start ? location.pathname : `?${query}`);
    }
    refreshShare();
  };

  render();
  form.addEventListener('input', render);
  for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-print]')) {
    button.addEventListener('click', () => {
      window.print();
    });
  }
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, calculator.id, form, document, {
    share: 'a[data-share]',
    print: 'button[data-print]',
  });
};
