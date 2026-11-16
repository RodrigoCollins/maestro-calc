import { dogFood } from '@maestro-calc/pets-core/dog-food';
import { dogViewEs } from '../es/comida-perro-view.ts';
import { runForm } from './run-form.ts';

runForm(dogFood, dogViewEs, { decimalComma: true });
