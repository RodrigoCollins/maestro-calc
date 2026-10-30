import type { CatalogOf } from '../../translate.ts';
import type { enRoofPitch } from '../en/roof-pitch.ts';

/** Copy of the `roof-pitch` calculator, Spanish: the same keys as English. */
export const esRoofPitch = {
  'calc.roof-pitch.title': 'Calculadora de Pendiente de Techo',
  'calc.roof-pitch.inputs.rise': 'Subida',
  'calc.roof-pitch.inputs.run': 'Recorrido',
  'calc.roof-pitch.inputs.rafterRun': 'Recorrido del cabio (la mitad del claro)',
  'calc.roof-pitch.inputs.overhang': 'Alero',
  'calc.roof-pitch.inputs.covering': 'Cubierta del techo',
  'calc.roof-pitch.options.covering.asphalt': 'Asfalto',
  'calc.roof-pitch.options.covering.tile': 'Teja',
  'calc.roof-pitch.options.covering.metal': 'Metal',
  'calc.roof-pitch.options.covering.roll': 'Rollo',
  'calc.roof-pitch.options.covering.slate': 'Pizarra',
  'calc.roof-pitch.options.covering.wood': 'Madera',
  'calc.roof-pitch.outputs.pitch': 'Pendiente (pulgadas de subida por 12 in de recorrido)',
  'calc.roof-pitch.outputs.angle': 'Ángulo (grados)',
  'calc.roof-pitch.outputs.rafter': 'Largo del cabio (pies)',
  'calc.roof-pitch.outputs.rafterM': 'Largo del cabio (metros)',
  'calc.roof-pitch.page.example':
    'Ejemplo: una subida de 6 in sobre un recorrido de 12 in es una pendiente de 6 en 12, 26.57°, y un cabio de 14.53 ft sobre 13 ft de recorrido.',
  'calc.roof-pitch.page.pitch': '{value} en 12',
  'calc.roof-pitch.page.angle': '{value}°',
  'calc.roof-pitch.page.answer.meets':
    'Una subida de {rise} sobre un recorrido de {run} es una pendiente de {pitch} en 12, {angle}. Cumple la pendiente mínima del IRC para la cubierta elegida.',
  'calc.roof-pitch.page.answer.double':
    'Una subida de {rise} sobre un recorrido de {run} es una pendiente de {pitch} en 12, {angle}. El IRC pide dos capas de fieltro para la cubierta elegida.',
  'calc.roof-pitch.page.answer.below':
    'Una subida de {rise} sobre un recorrido de {run} es una pendiente de {pitch} en 12, {angle}. Está por debajo del mínimo del IRC de {minimum} en 12 para la cubierta elegida.',
  'calc.roof-pitch.warnings.belowMinimum':
    'Por debajo de la pendiente mínima del IRC para esta cubierta ({minimum} en 12).',
  'calc.roof-pitch.warnings.doubleUnderlayment':
    'El IRC pide dos capas de fieltro debajo de 4 en 12 para esta cubierta.',
} as const satisfies CatalogOf<typeof enRoofPitch>;
