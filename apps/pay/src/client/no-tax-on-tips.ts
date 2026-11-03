import { noTaxOnTips } from '@maestro-calc/pay-core/no-tax-on-tips';
import { runForm } from './run-form.ts';

runForm(document.querySelector<HTMLFormElement>('form[data-deduction]'), noTaxOnTips);
