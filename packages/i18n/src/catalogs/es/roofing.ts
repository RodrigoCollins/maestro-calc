import type { CatalogOf } from '../../translate.ts';
import type { enRoofing } from '../en/roofing.ts';

/** Copy of the `roofing` calculator, Spanish: the same keys as English. */
export const esRoofing = {
  'calc.roofing.title': 'Calculadora de Tejas para Techo',
  'calc.roofing.inputs.length': 'Largo de la planta (con aleros)',
  'calc.roofing.inputs.width': 'Ancho de la planta (con aleros)',
  'calc.roofing.inputs.pitch': 'Pendiente (subida en 12)',
  'calc.roofing.inputs.waste': 'Extra (%)',
  'calc.roofing.inputs.bundlePrice': 'Precio por paquete ($)',
  'calc.roofing.inputs.rollPrice': 'Precio por rollo de fieltro ($)',
  'calc.roofing.outputs.squares': 'Área del techo (cuadrados)',
  'calc.roofing.outputs.areaFt2': 'Área del techo (pies cuadrados)',
  'calc.roofing.outputs.areaM2': 'Área del techo (metros cuadrados)',
  'calc.roofing.outputs.cost': 'Costo de tejas y fieltro',
  'calc.roofing.warnings.belowMinimum':
    'Por debajo de la pendiente mínima del IRC para tejas asfálticas ({minimum} en 12).',
  'calc.roofing.warnings.doubleUnderlayment':
    'El IRC pide dos capas de fieltro por debajo de 4 en 12; los rollos cuentan las dos.',
} as const satisfies CatalogOf<typeof enRoofing>;
