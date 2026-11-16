import { daysFrom, parseIsoDate } from '@maestro-calc/pay-core/calendar';
import { parseCents, primaAntiguedadOf, type Separation } from '@maestro-calc/pay-core/mexico';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { antiguedadTextOf } from '../mexico/labor-words.ts';
import { fieldValue, writeMexicoResult } from './mexico-result.ts';
import { refreshShare } from './share.ts';

const REASONS: readonly Separation[] = ['voluntary', 'justified', 'dismissal', 'death'];

/**
 * The prima de antigüedad calculator: on every edit, reads the salary, its period, the zone, the
 * two dates and how the job ends, and writes the prima and its rows into their `[data-mx]` nodes,
 * with the notes for a capped salary and a prima not owed. A field it cannot read shows the notice
 * and the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const capped = document.querySelector<HTMLElement>('[data-mx-capped]');
  const notOwed = document.querySelector<HTMLElement>('[data-mx-not-owed]');
  const render = (): void => {
    const wageCents = parseCents(fieldValue(form, 'wage'));
    const start = parseIsoDate(fieldValue(form, 'start'));
    const end = parseIsoDate(fieldValue(form, 'end'));
    const reason = REASONS.find((each) => each === fieldValue(form, 'reason')) ?? 'dismissal';
    const text =
      wageCents === null || start === null || end === null || daysFrom(start, end) < 0
        ? null
        : antiguedadTextOf(
            primaAntiguedadOf({
              wageCents,
              period: fieldValue(form, 'period') === 'month' ? 'month' : 'day',
              zone: fieldValue(form, 'zone') === 'border' ? 'border' : 'general',
              start,
              end,
              reason,
            }),
          );
    writeMexicoResult(text);
    if (text !== null) {
      if (capped !== null) capped.hidden = !text.capped;
      if (notOwed !== null) notOwed.hidden = text.eligible;
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
  watchUsage(window, 'prima-antiguedad', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-antiguedad]'));
