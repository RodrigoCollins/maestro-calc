import { dogAge } from '@maestro-calc/pets-core/dog-age';
import { dogAgeViewDe } from '../de/hundejahre-view.ts';
import { runForm } from './run-form.ts';

runForm(dogAge, dogAgeViewDe, { decimalComma: true });
