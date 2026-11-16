import {
  parseCents,
  parseWhole,
  PTU_MAX_CENTS,
  ptuOf,
  type PtuCompany,
} from '@maestro-calc/pay-core/mexico';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { ptuTextOf } from '../mexico/ptu-words.ts';
import { fieldValue, writeMexicoResult } from './mexico-result.ts';
import { refreshShare } from './share.ts';

/** The most days all the workers of a company can add up to in a year. */
const MAX_TOTAL_DAYS = 100_000_000;

/** A PTU of a past year: empty is none ($0), anything else must read as pesos. */
const pastOf = (text: string): number | null => (text.trim() === '' ? 0 : parseCents(text));

/** The company figures, `undefined` when one cannot be read. */
const companyOf = (form: HTMLFormElement): PtuCompany | undefined => {
  const amountCents = parseCents(fieldValue(form, 'company'), PTU_MAX_CENTS);
  const totalDays = parseWhole(fieldValue(form, 'totalDays'), 1, MAX_TOTAL_DAYS);
  const totalSalaryCents = parseCents(fieldValue(form, 'totalSalary'), PTU_MAX_CENTS);
  if (amountCents === null || totalDays === null || totalSalaryCents === null) return undefined;
  return {
    base: fieldValue(form, 'base') === 'amount' ? 'amount' : 'profit',
    amountCents,
    totalDays,
    totalSalaryCents,
  };
};

/**
 * The PTU calculator: on every edit, reads the mode, the salary, its period, the days, the company
 * figures (in the exact mode) and the PTU of the last three years, and writes the PTU and each line
 * into their `[data-mx]` nodes, with the notes for a capped share, an estimate with the cap alone
 * and fewer than 60 days. A field it cannot read, or a company smaller than the worker, shows the
 * notice and the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const notes = {
    capped: document.querySelector<HTMLElement>('[data-mx-capped]'),
    estimate: document.querySelector<HTMLElement>('[data-mx-estimate]'),
    eventual: document.querySelector<HTMLElement>('[data-mx-eventual]'),
  };
  const read = (): ReturnType<typeof ptuTextOf> | null => {
    const wageCents = parseCents(fieldValue(form, 'wage'));
    const days = parseWhole(fieldValue(form, 'days'), 0, 366);
    const past = ['past1', 'past2', 'past3'].map((name) => pastOf(fieldValue(form, name)));
    const [first = null, second = null, third = null] = past;
    const company = fieldValue(form, 'mode') === 'cap' ? null : companyOf(form);
    if (wageCents === null || days === null || first === null || second === null) return null;
    if (third === null || company === undefined) return null;
    try {
      return ptuTextOf(
        ptuOf({
          wageCents,
          period: fieldValue(form, 'period') === 'day' ? 'day' : 'month',
          days,
          company,
          pastCents: [first, second, third],
        }),
      );
    } catch {
      // a worker with more days or salary than the whole company
      return null;
    }
  };
  const render = (): void => {
    const text = read();
    writeMexicoResult(text);
    if (text !== null) {
      if (notes.capped !== null) notes.capped.hidden = !text.capped;
      if (notes.estimate !== null) notes.estimate.hidden = !text.estimate;
      if (notes.eventual !== null) notes.eventual.hidden = !text.eventual;
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
  watchUsage(window, 'ptu', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-ptu]'));
