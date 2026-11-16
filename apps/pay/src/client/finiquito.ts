import { daysFrom, parseIsoDate } from '@maestro-calc/pay-core/calendar';
import { finiquitoOf, parseCents, parseWhole, type Exit } from '@maestro-calc/pay-core/mexico';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { finiquitoTextOf } from '../mexico/finiquito-words.ts';
import { fieldValue, writeMexicoResult } from './mexico-result.ts';
import { refreshShare } from './share.ts';

const EXITS: readonly Exit[] = ['unjustifiedDismissal', 'justifiedDismissal', 'resignation'];

/**
 * The finiquito and liquidación calculator: on every edit, reads the salary, its period, the zone,
 * the two dates, how the job ends, the 20 days a year, the vacation days taken and the unpaid
 * days, and writes the total and each line into their `[data-mx]` nodes, with the notes for a
 * capped salary and a prima de antigüedad not owed. A field it cannot read shows the notice and
 * the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const capped = document.querySelector<HTMLElement>('[data-mx-capped]');
  const notOwed = document.querySelector<HTMLElement>('[data-mx-not-owed]');
  const refused = form.elements.namedItem('refused') as HTMLInputElement | null;
  const render = (): void => {
    const wageCents = parseCents(fieldValue(form, 'wage'));
    const start = parseIsoDate(fieldValue(form, 'start'));
    const end = parseIsoDate(fieldValue(form, 'end'));
    const taken = parseWhole(fieldValue(form, 'taken'), 0, 60);
    const unpaid = parseWhole(fieldValue(form, 'unpaid'), 0, 60);
    const exit = EXITS.find((each) => each === fieldValue(form, 'exit')) ?? 'unjustifiedDismissal';
    const text =
      wageCents === null ||
      start === null ||
      end === null ||
      taken === null ||
      unpaid === null ||
      daysFrom(start, end) < 0
        ? null
        : finiquitoTextOf(
            finiquitoOf({
              wageCents,
              period: fieldValue(form, 'period') === 'day' ? 'day' : 'month',
              zone: fieldValue(form, 'zone') === 'border' ? 'border' : 'general',
              start,
              end,
              exit,
              refusedReinstatement: refused?.checked === true,
              vacationTaken: taken,
              unpaidDays: unpaid,
            }),
          );
    writeMexicoResult(text);
    if (text !== null) {
      if (capped !== null) capped.hidden = !text.capped;
      if (notOwed !== null) notOwed.hidden = text.antiguedadOwed;
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
  watchUsage(window, 'finiquito', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-finiquito]'));
