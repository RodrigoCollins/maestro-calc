import type { CatalogOf } from '../../translate.ts';
import type { enRoofing } from '../en/roofing.ts';

/** Copy of the `roofing` calculator, Spanish: the same keys as English. */
export const esRoofing = {
  'calc.roofing.title': 'Calculadora de Tejas para Techo',
  'calc.roofing.inputs.length': 'Largo (con aleros)',
  'calc.roofing.inputs.width': 'Ancho (con aleros)',
  'calc.roofing.inputs.pitch': 'Pendiente (subida en 12)',
  'calc.roofing.inputs.waste': 'Extra (%)',
  'calc.roofing.inputs.bundlePrice': 'Precio por paquete ($)',
  'calc.roofing.inputs.rollPrice': 'Precio por rollo de fieltro ($)',
  'calc.roofing.outputs.squares': 'Área del techo (cuadrados)',
  'calc.roofing.outputs.areaFt2': 'Área del techo (pies cuadrados)',
  'calc.roofing.outputs.areaM2': 'Área del techo (metros cuadrados)',
  'calc.roofing.outputs.shinglesCost': 'Costo de las tejas',
  'calc.roofing.outputs.underlaymentCost': 'Costo del fieltro',
  'calc.roofing.warnings.belowMinimum':
    'Por debajo de la pendiente mínima del IRC para tejas asfálticas ({minimum} en 12).',
  'calc.roofing.warnings.doubleUnderlayment':
    'El IRC pide dos capas de fieltro por debajo de 4 en 12; los rollos cuentan las dos.',
  'calc.roofing.page.example':
    'Ejemplo: una planta de 40 ft por 30 ft con pendiente de 6 en 12 tiene 13.42 cuadrados de techo: 45 paquetes de tejas y 2 rollos de fieltro.',
  'calc.roofing.page.squares': '{value} cuadrados',
  'calc.roofing.page.areaM2': '{value} m²',
  'calc.roofing.page.shoppingShingles': 'Tejas asfálticas, paquetes (3 por cuadrado)',
  'calc.roofing.page.shoppingUnderlayment': 'Fieltro sintético, rollos de 10 cuadrados',
  'calc.roofing.page.priceHint': 'Agrega tu precio para ver el costo',
  'calc.roofing.page.answer.meets':
    'Una planta de {length} por {width} con pendiente de {pitch} en 12 tiene {area} de techo. Paquetes de tejas: {bundles}. Rollos de fieltro: {rolls}.',
  'calc.roofing.page.answer.double':
    'Una planta de {length} por {width} con pendiente de {pitch} en 12 tiene {area} de techo. Paquetes de tejas: {bundles}. Rollos de fieltro en dos capas, como pide el IRC debajo de 4 en 12: {rolls}.',
  'calc.roofing.page.answer.below':
    'Una planta de {length} por {width} con pendiente de {pitch} en 12 tiene {area} de techo. Está por debajo del mínimo del IRC de {minimum} en 12 para tejas asfálticas: elige otra cubierta.',
  'calc.roofing.page.drawing.note': 'pendiente de {pitch} en 12',
} as const satisfies CatalogOf<typeof enRoofing>;
