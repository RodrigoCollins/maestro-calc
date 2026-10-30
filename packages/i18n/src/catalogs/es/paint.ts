import type { CatalogOf } from '../../translate.ts';
import type { enPaint } from '../en/paint.ts';

/** Copy of the `paint` calculator, Spanish: the same keys as English. */
export const esPaint = {
  'calc.paint.title': 'Calculadora de Pintura',
  'calc.paint.inputs.length': 'Largo del cuarto',
  'calc.paint.inputs.width': 'Ancho del cuarto',
  'calc.paint.inputs.height': 'Altura de las paredes',
  'calc.paint.inputs.doors': 'Puertas',
  'calc.paint.inputs.windows': 'Ventanas',
  'calc.paint.inputs.coats': 'Manos',
  'calc.paint.inputs.gallonPrice': 'Precio por galón ($)',
  'calc.paint.outputs.gallons': 'Pintura necesaria (galones)',
  'calc.paint.outputs.liters': 'Pintura necesaria (litros)',
  'calc.paint.outputs.paintArea': 'Área a pintar (pies cuadrados)',
  'calc.paint.outputs.wallArea': 'Área de paredes sin descontar aberturas (pies cuadrados)',
  'calc.paint.outputs.cost': 'Costo de la pintura',
  'calc.paint.page.example':
    'Ejemplo: un cuarto de 12 ft por 12 ft con paredes de 8 ft, una puerta y dos ventanas lleva 1.91 galones de pintura para dos manos.',
  'calc.paint.page.gallons': '{value} galones',
  'calc.paint.page.liters': '{value} litros',
  'calc.paint.page.shoppingLine': 'Pintura, latas de un galón',
  'calc.paint.page.priceHint': 'Agrega tu precio para ver el costo',
  'calc.paint.page.answer':
    'Un cuarto de {length} por {width} con paredes de {height} lleva {paint} de pintura. Manos: {coats}. Latas de un galón a comprar: {cans}.',
  'calc.paint.page.drawing.note': 'paredes de {height}',
} as const satisfies CatalogOf<typeof enPaint>;
