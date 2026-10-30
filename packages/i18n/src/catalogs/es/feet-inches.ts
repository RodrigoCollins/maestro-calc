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
  'calc.feet-inches.page.example': 'Ejemplo: 12 ft 6 in más 3 ft 8 1/4 in da 16 ft 2 1/4 in.',
  'calc.feet-inches.page.result': '{value}',
  'calc.feet-inches.page.resultM': '{value} m',
  'calc.feet-inches.page.answer.add': '{first} más {second} da {result}.',
  'calc.feet-inches.page.answer.subtract': '{first} menos {second} da {result}.',
  'calc.feet-inches.page.answer.longer': '{second} es más larga que {first} por {result}.',
  'calc.feet-inches.page.answer.multiply': '{first} por {factor} da {result}.',
  'calc.feet-inches.page.answer.divide':
    '{first} dividido en {factor} partes iguales da {result} cada una.',
} as const satisfies CatalogOf<typeof enFeetInches>;
