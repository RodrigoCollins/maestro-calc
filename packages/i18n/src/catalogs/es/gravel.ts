import type { CatalogOf } from '../../translate.ts';
import type { enGravel } from '../en/gravel.ts';

/** Copy of the `gravel` calculator, Spanish: the same keys as English. */
export const esGravel = {
  'calc.gravel.title': 'Calculadora de Grava',
  'calc.gravel.inputs.length': 'Largo',
  'calc.gravel.inputs.width': 'Ancho',
  'calc.gravel.inputs.depth': 'Profundidad',
  'calc.gravel.inputs.placement': 'Cómo se coloca',
  'calc.gravel.inputs.waste': 'Extra (%)',
  'calc.gravel.inputs.tonPrice': 'Precio por tonelada ($)',
  'calc.gravel.options.placement.compacted': 'Compactada (entrada de autos, base)',
  'calc.gravel.options.placement.loose': 'Suelta (jardín, caminos)',
  'calc.gravel.outputs.tons': 'Grava necesaria (toneladas)',
  'calc.gravel.outputs.tonnes': 'Grava necesaria (toneladas métricas)',
  'calc.gravel.outputs.orderYd3': 'Volumen a pedir (yardas cúbicas)',
  'calc.gravel.outputs.orderM3': 'Volumen a pedir (metros cúbicos)',
  'calc.gravel.outputs.placedYd3': 'Volumen colocado (yardas cúbicas)',
  'calc.gravel.outputs.cost': 'Costo de la grava',
  'calc.gravel.page.tons': '{value} toneladas',
  'calc.gravel.page.tonnes': '{value} toneladas métricas',
  'calc.gravel.page.priceHint': 'Agrega tu precio para ver el costo',
  'calc.gravel.page.answer.compacted':
    'Un área de {length} por {width}, de {depth} de profundidad y compactada, lleva {tons} de grava.',
  'calc.gravel.page.answer.loose':
    'Un área de {length} por {width}, de {depth} de profundidad y suelta, lleva {tons} de grava.',
  'calc.gravel.page.drawing.note': '{depth} de profundidad',
} as const satisfies CatalogOf<typeof enGravel>;
