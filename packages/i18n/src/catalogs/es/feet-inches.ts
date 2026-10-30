import type { CatalogOf } from '../../translate.ts';
import type { enFeetInches } from '../en/feet-inches.ts';

/** Copy of the `feet-inches` calculator, Spanish: the same keys as English. */
export const esFeetInches = {
  'calc.feet-inches.title': 'Calculadora de Pies y Pulgadas',
  'calc.feet-inches.inputs.first': 'Primera medida',
  'calc.feet-inches.inputs.operation': 'Operación',
  'calc.feet-inches.inputs.second': 'Segunda medida',
  'calc.feet-inches.inputs.factor': 'Número',
  'calc.feet-inches.options.operation.add': 'Sumar +',
  'calc.feet-inches.options.operation.subtract': 'Restar −',
  'calc.feet-inches.options.operation.multiply': 'Multiplicar ×',
  'calc.feet-inches.options.operation.divide': 'Dividir ÷',
  'calc.feet-inches.outputs.result': 'Resultado (pies y pulgadas)',
  'calc.feet-inches.outputs.resultIn': 'Resultado (pulgadas)',
  'calc.feet-inches.outputs.resultM': 'Resultado (metros)',
  'calc.feet-inches.warnings.secondLonger':
    'La segunda medida es más larga que la primera: el resultado es la diferencia.',
} as const satisfies CatalogOf<typeof enFeetInches>;
