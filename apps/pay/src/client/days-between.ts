import { civilDateOf, daysBetween, isoOf, parseIsoDate } from '@maestro-calc/pay-core/calendar';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { betweenOf, shiftTextOf } from '../dates/words.ts';
import { refreshShare } from './share.ts';

/**
 * The date calculator, two forms on one page. The days between two dates: on every edit, reads
 * the two dates and the inclusive box and writes the days, the weeks and the weekdays into their
 * `[data-days]` nodes; a missing date is marked and the figures wait for a fix, swapped dates are
 * counted and said so. A date plus or minus some days: writes the date reached and the days on
 * the way into the `[data-shift]` nodes. Each «Hoy» button, hidden until this script runs, puts
 * the visitor's local date (never UTC, so the day turns at their own midnight) in its field.
 */

type Field = HTMLInputElement | HTMLSelectElement;

const fieldOf =
  (form: HTMLFormElement) =>
  (name: string): Field | null =>
    form.elements.namedItem(name) as Field | null;

const write = (attribute: string, texts: Readonly<Record<string, string>>): void => {
  for (const node of document.querySelectorAll<HTMLElement>(`[data-${attribute}]`)) {
    const text = texts[node.dataset[attribute] ?? ''];
    if (text !== undefined) node.textContent = text;
  }
};

/** Shows the «Hoy» buttons of `form`: a click fills its field with today and recounts. */
const todayButtons = (form: HTMLFormElement): void => {
  const field = fieldOf(form);
  for (const button of form.querySelectorAll<HTMLButtonElement>('button[data-today]')) {
    const input = field(button.dataset['today'] ?? '');
    if (input === null) continue;
    button.hidden = false;
    button.addEventListener('click', () => {
      input.value = isoOf(civilDateOf(new Date()));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
};

/** Runs `render` now and on every edit of `form`, which never submits. */
const live = (form: HTMLFormElement, render: () => void): void => {
  todayButtons(form);
  render();
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
};

const between = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const field = fieldOf(form);
  const invalid = document.querySelector<HTMLElement>('[data-days-invalid]');
  const reversed = document.querySelector<HTMLElement>('[data-days-reversed]');
  live(form, () => {
    const start = parseIsoDate(field('start')?.value ?? '');
    const end = parseIsoDate(field('end')?.value ?? '');
    if (invalid !== null) invalid.hidden = start !== null && end !== null;
    if (start === null || end === null) return;
    const inclusive = (field('inclusive') as HTMLInputElement | null)?.checked === true;
    const result = betweenOf(daysBetween(start, end, inclusive));
    if (reversed !== null) reversed.hidden = !result.reversed;
    write('days', { figure: result.figure, ...result.values });
    refreshShare();
  });
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, 'days-between', form, document, { share: 'a[data-share]' });
};

const shift = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const field = fieldOf(form);
  const invalid = document.querySelector<HTMLElement>('[data-shift-invalid]');
  live(form, () => {
    const result = shiftTextOf({
      from: field('from')?.value ?? '',
      amount: field('amount')?.value ?? '',
      back: field('direction')?.value === 'subtract',
      business: (field('business') as HTMLInputElement | null)?.checked === true,
    });
    if (invalid !== null) invalid.hidden = result !== null;
    if (result === null) return;
    write('shift', { figure: result.figure, ...result.values });
  });
  watchUsage(window, 'date-shift', form, document);
};

between(document.querySelector<HTMLFormElement>('form[data-days-between]'));
shift(document.querySelector<HTMLFormElement>('form[data-date-shift]'));
