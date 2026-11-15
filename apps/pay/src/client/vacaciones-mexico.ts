import { daysFrom, parseIsoDate } from '@maestro-calc/pay-core/calendar';
import { parseCents, parseWhole, vacacionesOf } from '@maestro-calc/pay-core/mexico';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { vacacionesTextOf } from '../mexico/words.ts';
import { fieldValue, writeMexicoResult } from './mexico-result.ts';
import { refreshShare } from './share.ts';

/**
 * The vacation calculator of Mexico: on every edit, reads the start, the day of the count, the
 * salary, its period and the prima, and writes the days, their pay and the prima into their
 * `[data-mx]` nodes. A field it cannot read shows the notice and the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const notEarned = document.querySelector<HTMLElement>('[data-mx-not-earned]');
  const render = (): void => {
    const wageCents = parseCents(fieldValue(form, 'wage'));
    const primaPercent = parseWhole(fieldValue(form, 'prima'), 1, 100);
    const start = parseIsoDate(fieldValue(form, 'start'));
    const on = parseIsoDate(fieldValue(form, 'on'));
    const text =
      wageCents === null ||
      primaPercent === null ||
      start === null ||
      on === null ||
      daysFrom(start, on) < 0
        ? null
        : vacacionesTextOf(
            vacacionesOf({
              wageCents,
              period: fieldValue(form, 'period') === 'month' ? 'month' : 'day',
              primaPercent,
              start,
              on,
            }),
          );
    writeMexicoResult(text);
    if (notEarned !== null && text !== null) notEarned.hidden = text.earned;
    refreshShare();
  };
  render();
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });
  // usage events for analytics: the action and the calculator, never a value (analytics-events)
  watchUsage(window, 'vacaciones-mexico', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-vacaciones-mx]'));
