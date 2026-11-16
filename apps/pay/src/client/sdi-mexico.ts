import { daysFrom, parseIsoDate } from '@maestro-calc/pay-core/calendar';
import {
  AGUINALDO_MIN_DAYS,
  parseCents,
  parseWhole,
  PRIMA_MIN_PERCENT,
  sdiOf,
} from '@maestro-calc/pay-core/mexico';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { sdiTextOf } from '../mexico/labor-words.ts';
import { fieldValue, writeMexicoResult } from './mexico-result.ts';
import { refreshShare } from './share.ts';

/**
 * The salario diario integrado calculator: on every edit, reads the salary, its period, the two
 * dates, the days of aguinaldo and the prima vacacional, and writes the SDI and its rows into their
 * `[data-mx]` nodes, with the note for a base over 25 UMA. A field it cannot read shows the notice
 * and the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const capped = document.querySelector<HTMLElement>('[data-mx-capped]');
  const render = (): void => {
    const wageCents = parseCents(fieldValue(form, 'wage'));
    const aguinaldoDays = parseWhole(fieldValue(form, 'aguinaldo'), 1, 365);
    const primaPercent = parseWhole(fieldValue(form, 'prima'), 1, 100);
    const start = parseIsoDate(fieldValue(form, 'start'));
    const on = parseIsoDate(fieldValue(form, 'on'));
    const text =
      wageCents === null ||
      aguinaldoDays === null ||
      primaPercent === null ||
      start === null ||
      on === null ||
      daysFrom(start, on) < 0
        ? null
        : sdiTextOf(
            sdiOf({
              wageCents,
              period: fieldValue(form, 'period') === 'month' ? 'month' : 'day',
              aguinaldoDays,
              primaPercent,
              start,
              on,
            }),
            aguinaldoDays < AGUINALDO_MIN_DAYS || primaPercent < PRIMA_MIN_PERCENT,
          );
    writeMexicoResult(text);
    if (text !== null && capped !== null) capped.hidden = !text.capped;
    refreshShare();
  };
  render();
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, 'sdi-mexico', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-sdi]'));
