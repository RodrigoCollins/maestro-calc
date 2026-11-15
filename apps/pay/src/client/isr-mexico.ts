import { parseCents } from '@maestro-calc/pay-core/mexico';
import { isrOf } from '@maestro-calc/pay-core/mexico-salary';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { isrTextOf } from '../mexico/salary-words.ts';
import { fieldValue, writeMexicoResult } from './mexico-result.ts';
import { refreshShare } from './share.ts';

/**
 * The ISR calculator: on every edit, reads the salary, its pay period and the minimum wage zone,
 * and writes the ISR withheld and its rows into their `[data-mx]` nodes. A salary it cannot read
 * shows the notice and the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const render = (): void => {
    const grossCents = parseCents(fieldValue(form, 'wage'));
    const period = fieldValue(form, 'period');
    writeMexicoResult(
      grossCents === null
        ? null
        : isrTextOf(
            isrOf({
              grossCents,
              period: period === 'week' || period === 'fortnight' ? period : 'month',
              zone: fieldValue(form, 'zone') === 'border' ? 'border' : 'general',
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
  watchUsage(window, 'isr-mexico', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-isr-mx]'));
