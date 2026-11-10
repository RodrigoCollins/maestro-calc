import { daysBetween, parseIsoDate } from '@maestro-calc/pay-core/calendar';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { betweenOf } from '../dates/words.ts';
import { refreshShare } from './share.ts';

/**
 * The days-between calculator: on every edit, reads the two dates and the inclusive box, and
 * writes the days, the weeks and the weekdays into their `[data-days]` nodes. A missing date is
 * marked and the figures wait for a fix; swapped dates are counted and said so.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const field = (name: string): HTMLInputElement | null =>
    form.elements.namedItem(name) as HTMLInputElement | null;
  const invalid = document.querySelector<HTMLElement>('[data-days-invalid]');
  const reversed = document.querySelector<HTMLElement>('[data-days-reversed]');
  const render = (): void => {
    const start = parseIsoDate(field('start')?.value ?? '');
    const end = parseIsoDate(field('end')?.value ?? '');
    if (invalid !== null) invalid.hidden = start !== null && end !== null;
    if (start === null || end === null) return;
    const result = betweenOf(daysBetween(start, end, field('inclusive')?.checked === true));
    if (reversed !== null) reversed.hidden = !result.reversed;
    const texts: Readonly<Record<string, string>> = { figure: result.figure, ...result.values };
    for (const node of document.querySelectorAll<HTMLElement>('[data-days]')) {
      const text = texts[node.dataset['days'] ?? ''];
      if (text !== undefined) node.textContent = text;
    }
    refreshShare();
  };
  render();
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, 'days-between', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-days-between]'));
