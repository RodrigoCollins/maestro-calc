import { overtime } from '@maestro-calc/pay-core/overtime';
import { runForm } from './run-form.ts';

runForm(document.querySelector<HTMLFormElement>('form[data-overtime]'), overtime);
