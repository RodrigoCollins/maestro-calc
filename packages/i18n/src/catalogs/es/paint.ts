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
} as const satisfies CatalogOf<typeof enPaint>;
