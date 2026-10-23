import type { CatalogOf } from '../../translate.ts';
import type { enRectangleArea } from '../en/rectangle-area.ts';

/** Labels of the `rectangle-area` calculator, Spanish: the same keys as English. */
export const esRectangleArea = {
  'calc.rectangle-area.title': 'Área de un rectángulo',
  'calc.rectangle-area.inputs.length': 'Largo',
  'calc.rectangle-area.inputs.width': 'Ancho',
  'calc.rectangle-area.outputs.areaFt2': 'Área (pies cuadrados)',
  'calc.rectangle-area.outputs.areaYd2': 'Área (yardas cuadradas)',
  'calc.rectangle-area.outputs.areaM2': 'Área (metros cuadrados)',
} as const satisfies CatalogOf<typeof enRectangleArea>;
