import type { CatalogOf } from '../../translate.ts';
import type { enDrywall } from '../en/drywall.ts';

/** Copy of the `drywall` calculator, Spanish: the same keys as English. */
export const esDrywall = {
  'calc.drywall.title': 'Calculadora de Drywall',
  'calc.drywall.inputs.length': 'Largo del cuarto',
  'calc.drywall.inputs.width': 'Ancho del cuarto',
  'calc.drywall.inputs.height': 'Altura de las paredes',
  'calc.drywall.inputs.doors': 'Puertas',
  'calc.drywall.inputs.windows': 'Ventanas',
  'calc.drywall.inputs.surfaces': 'Cubrir',
  'calc.drywall.inputs.sheet': 'Tamaño de la placa',
  'calc.drywall.inputs.waste': 'Extra (%)',
  'calc.drywall.inputs.sheetPrice': 'Precio por placa ($)',
  'calc.drywall.options.surfaces.walls-ceiling': 'Paredes y techo',
  'calc.drywall.options.surfaces.walls': 'Solo paredes',
  'calc.drywall.options.sheet.4x8': '4 × 8 ft',
  'calc.drywall.options.sheet.4x12': '4 × 12 ft',
  'calc.drywall.outputs.areaFt2': 'Área a cubrir (pies cuadrados)',
  'calc.drywall.outputs.areaM2': 'Área a cubrir (metros cuadrados)',
  'calc.drywall.outputs.compound': 'Compuesto para juntas (galones)',
  'calc.drywall.outputs.tape': 'Cinta para juntas (pies)',
  'calc.drywall.outputs.cost': 'Costo del drywall',
  'calc.drywall.page.areaFt2': '{value} pies cuadrados',
  'calc.drywall.page.areaM2': '{value} metros cuadrados',
  'calc.drywall.page.shoppingSheets': 'Drywall, placas de {size}',
  'calc.drywall.page.shoppingCompound': 'Compuesto para juntas, baldes de 4.5 gal',
  'calc.drywall.page.shoppingTape': 'Cinta de papel para juntas, rollos de 500 ft',
  'calc.drywall.page.priceHint': 'Agrega tu precio para ver el costo',
  'calc.drywall.page.answer.walls-ceiling':
    'Un cuarto de {length} por {width} con paredes de {height} tiene {area} de paredes y techo para cubrir. Placas de {sheet}: {sheets}.',
  'calc.drywall.page.answer.walls':
    'Un cuarto de {length} por {width} con paredes de {height} tiene {area} de paredes para cubrir. Placas de {sheet}: {sheets}.',
  'calc.drywall.page.drawing.note': 'paredes de {height}',
} as const satisfies CatalogOf<typeof enDrywall>;
