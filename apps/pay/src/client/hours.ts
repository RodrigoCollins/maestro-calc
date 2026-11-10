import {
  differenceOf,
  hoursBetween,
  readAmount,
  sumOf,
  type Duration,
} from '@maestro-calc/pay-core/hours';
import { shiftPay } from '@maestro-calc/pay-core/shift-pay';
import { watchUsage } from '@maestro-calc/site-kit/track';
import { durationDecimalText, durationText } from '../format.ts';
import { runForm } from './run-form.ts';

runForm(document.querySelector<HTMLFormElement>('form[data-hours]'), hoursBetween);
// the tool of a shift page: the same shift with its pay for the day and the week
runForm(document.querySelector<HTMLFormElement>('form[data-shift-pay]'), shiftPay);

/** The most a field of the sum form holds: 9,999 hours, or 9,999 minutes. */
const MAX = 9999;

/**
 * The sum form: two lengths of time, their sum and their difference on every edit. It keeps no
 * URL state (the URL is the shift of the form above); a field it cannot read is marked and the
 * figures wait for a fix.
 */
const runSum = (form: HTMLFormElement | null): void => {
  if (form === null) return;
  const section = form.closest('section');
  const outOf = (key: string): HTMLElement | null =>
    section?.querySelector<HTMLElement>(`[data-sum="${key}"]`) ?? null;
  const durationOf = (name: 'a' | 'b'): Duration | null => {
    const fields = (['Hours', 'Minutes'] as const).map(
      (part) => form.elements.namedItem(`${name}${part}`) as HTMLInputElement | null,
    );
    const [hours, minutes] = fields.map((field) => {
      const value = readAmount(field?.value.trim() ?? '', MAX);
      if (value === null) field?.setAttribute('aria-invalid', 'true');
      else field?.removeAttribute('aria-invalid');
      return value;
    });
    return hours === null || minutes === null || hours === undefined || minutes === undefined
      ? null
      : { hours, minutes };
  };
  const render = (): void => {
    const a = durationOf('a');
    const b = durationOf('b');
    if (a === null || b === null) return;
    const total = sumOf([a, b]);
    const sum = outOf('sum');
    const decimal = outOf('decimal');
    const difference = outOf('difference');
    if (sum !== null) sum.textContent = durationText(total);
    if (decimal !== null) decimal.textContent = durationDecimalText(total);
    if (difference !== null) difference.textContent = durationText(differenceOf(a, b));
  };
  form.addEventListener('input', render);
  watchUsage(window, 'hours-sum', form, document);
  render();
};

runSum(document.querySelector<HTMLFormElement>('form[data-hours-sum]'));
