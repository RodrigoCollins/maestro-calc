import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { runForm } from './run-form.ts';

runForm(document.querySelector<HTMLFormElement>('form[data-hours]'), hoursBetween);
