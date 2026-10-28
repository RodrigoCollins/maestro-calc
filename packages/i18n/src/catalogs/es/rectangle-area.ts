import type { CatalogOf } from '../../translate.ts';
import type { enRectangleArea } from '../en/rectangle-area.ts';

/** Copy of the `rectangle-area` calculator, Spanish: the same keys as English. */
export const esRectangleArea = {
  'calc.rectangle-area.title': 'Calculadora de pies cuadrados',
  'calc.rectangle-area.inputs.length': 'Largo',
  'calc.rectangle-area.inputs.width': 'Ancho',
  'calc.rectangle-area.outputs.areaFt2': 'Área (pies cuadrados)',
  'calc.rectangle-area.outputs.areaYd2': 'Área (yardas cuadradas)',
  'calc.rectangle-area.outputs.areaM2': 'Área (metros cuadrados)',
  'calc.rectangle-area.page.example':
    'Ejemplo: un área de 12 ft por 10 ft mide 120.00 pies cuadrados.',
  'calc.rectangle-area.page.areaFt2': '{value} pies cuadrados',
  'calc.rectangle-area.page.areaM2': '{value} metros cuadrados',
  'calc.rectangle-area.page.answer': 'Un área de {length} por {width} mide {area}.',
  'calc.rectangle-area.page.drawing': 'Plano: {length} por {width}, {area}',
} as const satisfies CatalogOf<typeof enRectangleArea>;
