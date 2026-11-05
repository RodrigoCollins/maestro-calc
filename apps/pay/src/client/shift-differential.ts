import { shiftDifferential } from '@maestro-calc/pay-core/shift-differential';
import { runForm } from './run-form.ts';

runForm(
  document.querySelector<HTMLFormElement>('form[data-shift-differential]'),
  shiftDifferential,
);
