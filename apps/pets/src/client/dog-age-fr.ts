import { dogAge } from '@maestro-calc/pets-core/dog-age';
import { dogAgeViewFr } from '../fr/age-chien-view.ts';
import { runForm } from './run-form.ts';

runForm(dogAge, dogAgeViewFr, { decimalComma: true });
