import type { CatalogOf } from '../../translate.ts';
import type { enMulch } from '../en/mulch.ts';

/** Copy of the `mulch` calculator, Spanish: the same keys as English. */
export const esMulch = {
  'calc.mulch.title': 'Calculadora de Mulch',
  'calc.mulch.inputs.length': 'Largo',
  'calc.mulch.inputs.width': 'Ancho',
  'calc.mulch.inputs.depth': 'Profundidad',
  'calc.mulch.inputs.waste': 'Extra (%)',
  'calc.mulch.inputs.bag': 'Tamaño de la bolsa',
  'calc.mulch.inputs.bagPrice': 'Precio por bolsa ($)',
  'calc.mulch.inputs.yardPrice': 'Precio a granel por yarda cúbica ($)',
  'calc.mulch.options.bag.2': '2 cu ft',
  'calc.mulch.options.bag.3': '3 cu ft',
  'calc.mulch.outputs.volumeYd3': 'Mulch necesario (yardas cúbicas)',
  'calc.mulch.outputs.volumeFt3': 'Mulch necesario (pies cúbicos)',
  'calc.mulch.outputs.volumeM3': 'Mulch necesario (metros cúbicos)',
  'calc.mulch.outputs.netVolume': 'Volumen sin extra (pies cúbicos)',
  'calc.mulch.outputs.bagCost': 'Costo en bolsas',
  'calc.mulch.outputs.bulkCost': 'Costo a granel',
  'calc.mulch.page.volumeYd3': '{value} yardas cúbicas',
  'calc.mulch.page.volumeM3': '{value} metros cúbicos',
  'calc.mulch.page.shoppingLine': 'Mulch, bolsas de {size} cu ft',
  'calc.mulch.page.priceHint': 'Agrega tu precio para ver el costo',
  'calc.mulch.page.answer':
    'Un área de {length} por {width}, de {depth} de profundidad, lleva {volume} de mulch: {bags} bolsas de {size} cu ft.',
  'calc.mulch.page.drawing.note': '{depth} de profundidad',
} as const satisfies CatalogOf<typeof enMulch>;
