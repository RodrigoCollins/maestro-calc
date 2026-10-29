import type { CatalogOf } from '../../translate.ts';
import type { enTopsoil } from '../en/topsoil.ts';

/** Copy of the `topsoil` calculator, Spanish: the same keys as English. */
export const esTopsoil = {
  'calc.topsoil.title': 'Calculadora de Tierra para Jardín',
  'calc.topsoil.inputs.length': 'Largo',
  'calc.topsoil.inputs.width': 'Ancho',
  'calc.topsoil.inputs.depth': 'Profundidad',
  'calc.topsoil.inputs.waste': 'Extra por asentamiento (%)',
  'calc.topsoil.inputs.bag': 'Tamaño de la bolsa',
  'calc.topsoil.inputs.bagPrice': 'Precio por bolsa ($)',
  'calc.topsoil.inputs.yardPrice': 'Precio a granel por yarda cúbica ($)',
  'calc.topsoil.options.bag.0-75': '0.75 cu ft',
  'calc.topsoil.options.bag.1': '1 cu ft',
  'calc.topsoil.options.bag.1-5': '1.5 cu ft',
  'calc.topsoil.outputs.volumeYd3': 'Tierra necesaria (yardas cúbicas)',
  'calc.topsoil.outputs.volumeFt3': 'Tierra necesaria (pies cúbicos)',
  'calc.topsoil.outputs.volumeM3': 'Tierra necesaria (metros cúbicos)',
  'calc.topsoil.outputs.netVolume': 'Volumen sin extra (pies cúbicos)',
  'calc.topsoil.outputs.bagCost': 'Costo en bolsas',
  'calc.topsoil.outputs.bulkCost': 'Costo a granel',
  'calc.topsoil.page.volumeYd3': '{value} yardas cúbicas',
  'calc.topsoil.page.volumeM3': '{value} metros cúbicos',
  'calc.topsoil.page.shoppingLine': 'Tierra, bolsas de {size} cu ft',
  'calc.topsoil.page.priceHint': 'Agrega tu precio para ver el costo',
  'calc.topsoil.page.answer':
    'Un área de {length} por {width}, de {depth} de profundidad, lleva {volume} de tierra: {bags} bolsas de {size} cu ft.',
  'calc.topsoil.page.drawing.note': '{depth} de profundidad',
} as const satisfies CatalogOf<typeof enTopsoil>;
