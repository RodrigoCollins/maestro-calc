import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { runForm } from './run-form.ts';

runForm(document.querySelector<HTMLFormElement>('form[data-tipped-wage]'), tippedWage);
