import { parseCents, parseWhole } from '@maestro-calc/pay-core/mexico';
import { netPayOf } from '@maestro-calc/pay-core/mexico-salary';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { netTextOf } from '../mexico/salary-words.ts';
import { fieldValue, writeMexicoResult } from './mexico-result.ts';
import { refreshShare } from './share.ts';

/**
 * The take-home pay calculator: on every edit, reads the monthly salary, the years of service and
 * the minimum wage zone, and writes the net pay, the ISR and each IMSS quota into their
 * `[data-mx]` nodes. A field it cannot read shows the notice and the figures wait for a fix.
 */
const run = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const render = (): void => {
    const monthlyCents = parseCents(fieldValue(form, 'wage'));
    const years = parseWhole(fieldValue(form, 'years'), 0, 60);
    writeMexicoResult(
      monthlyCents === null || years === null
        ? null
        : netTextOf(
            netPayOf({
              monthlyCents,
              years,
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
  watchUsage(window, 'sueldo-neto', form, document, { share: 'a[data-share]' });
};

run(document.querySelector<HTMLFormElement>('form[data-sueldo-neto]'));
