import { daysFrom, parseIsoDate } from '@maestro-calc/pay-core/calendar';
import { aguinaldoOf, parseCents, parseWhole } from '@maestro-calc/pay-core/mexico';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { aguinaldoTextOf } from '../mexico/words.ts';
import { fieldValue, writeMexicoResult } from './mexico-result.ts';
import { refreshShare } from './share.ts';

/**
 * The aguinaldo calculator: on every edit, reads the salary, its period, the days of aguinaldo and
 * the two dates, and writes the aguinaldo and its rows into their `[data-mx]` nodes. A field it
 * cannot read shows the notice and the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const render = (): void => {
    const wageCents = parseCents(fieldValue(form, 'wage'));
    const days = parseWhole(fieldValue(form, 'days'), 1, 365);
    const start = parseIsoDate(fieldValue(form, 'start'));
    const end = parseIsoDate(fieldValue(form, 'end'));
    writeMexicoResult(
      wageCents === null ||
        days === null ||
        start === null ||
        end === null ||
        daysFrom(start, end) < 0
        ? null
        : aguinaldoTextOf(
            aguinaldoOf({
              wageCents,
              period: fieldValue(form, 'period') === 'month' ? 'month' : 'day',
              days,
              start,
              end,
            }),
          ),
    );
    refreshShare();
  };
  render();
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, 'aguinaldo', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-aguinaldo]'));
