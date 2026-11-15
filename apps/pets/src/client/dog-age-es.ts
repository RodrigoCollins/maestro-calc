import { dogAge } from '@maestro-calc/pets-core/dog-age';
import { dogAgeViewEs } from '../es/edad-perro-view.ts';
import { runForm } from './run-form.ts';

runForm(dogAge, dogAgeViewEs, { decimalComma: true });
