import { decimalHours } from '@maestro-calc/pay-core/decimal-hours';
import { runForm } from './run-form.ts';

runForm(document.querySelector<HTMLFormElement>('form[data-decimal-hours]'), decimalHours);
