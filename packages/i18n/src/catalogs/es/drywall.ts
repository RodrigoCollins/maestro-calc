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
} as const satisfies CatalogOf<typeof enDrywall>;
