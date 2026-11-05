import { ptoAccrual } from '@maestro-calc/pay-core/pto-accrual';
import { runForm } from './run-form.ts';

runForm(document.querySelector<HTMLFormElement>('form[data-pto-accrual]'), ptoAccrual);
