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
  'calc.roof-pitch.options.covering.asphalt': 'Tejas asfálticas',
  'calc.roof-pitch.options.covering.tile': 'Teja de barro o concreto',
  'calc.roof-pitch.options.covering.metal': 'Tejas metálicas',
  'calc.roof-pitch.options.covering.roll': 'Rollo asfáltico',
  'calc.roof-pitch.options.covering.slate': 'Pizarra',
  'calc.roof-pitch.options.covering.wood': 'Tejas o tablillas de madera',
  'calc.roof-pitch.outputs.pitch': 'Pendiente (pulgadas de subida por 12 in de recorrido)',
  'calc.roof-pitch.outputs.angle': 'Ángulo (grados)',
  'calc.roof-pitch.outputs.rafter': 'Largo del cabio (pies)',
  'calc.roof-pitch.outputs.rafterM': 'Largo del cabio (metros)',
  'calc.roof-pitch.warnings.belowMinimum':
    'Por debajo de la pendiente mínima del IRC para esta cubierta ({minimum} en 12).',
  'calc.roof-pitch.warnings.doubleUnderlayment':
    'El IRC pide dos capas de fieltro debajo de 4 en 12 para esta cubierta.',
} as const satisfies CatalogOf<typeof enRoofPitch>;
