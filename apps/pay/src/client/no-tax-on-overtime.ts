import { noTaxOnOvertime } from '@maestro-calc/pay-core/no-tax-on-overtime';
import { runForm } from './run-form.ts';

runForm(document.querySelector<HTMLFormElement>('form[data-deduction]'), noTaxOnOvertime);
