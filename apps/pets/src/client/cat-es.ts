import { catFood } from '@maestro-calc/pets-core/cat-food';
import { catViewEs } from '../es/comida-gato-view.ts';
import { runForm } from './run-form.ts';

runForm(catFood, catViewEs, { decimalComma: true });
