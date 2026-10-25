import { describe, expect, it } from 'vitest';
import { enConcrete } from './catalogs/en/concrete.ts';
import { esConcrete } from './catalogs/es/concrete.ts';
import { placeholdersOf } from './translate.ts';

/** key, en, es: the derived rows of the ICW12 table that this slice ships. */
const ROWS = [
  ['calc.concrete.title', 'Concrete Calculator', 'Calculadora de Concreto'],
  ['calc.concrete.inputs.shape', 'Shape', 'Forma'],
  ['calc.concrete.inputs.length', 'Length', 'Largo'],
  ['calc.concrete.inputs.width', 'Width', 'Ancho'],
  ['calc.concrete.inputs.thickness', 'Thickness', 'Espesor'],
  ['calc.concrete.inputs.footingWidth', 'Footing width', 'Ancho de la zapata'],
  ['calc.concrete.inputs.footingDepth', 'Footing depth', 'Profundidad de la zapata'],
  ['calc.concrete.inputs.diameter', 'Diameter', 'Diámetro'],
  ['calc.concrete.inputs.height', 'Height', 'Altura'],
  ['calc.concrete.inputs.stepWidth', 'Step width', 'Ancho de los escalones'],
  ['calc.concrete.inputs.rise', 'Rise (height of each step)', 'Altura de cada escalón (rise)'],
  ['calc.concrete.inputs.run', 'Run (depth of each step)', 'Profundidad de cada escalón (run)'],
  ['calc.concrete.inputs.stepCount', 'Number of steps', 'Cantidad de escalones'],
  ['calc.concrete.inputs.count', 'Number of pieces', 'Cantidad de piezas'],
  ['calc.concrete.inputs.waste', 'Extra for waste (%)', 'Extra por desperdicio (%)'],
  ['calc.concrete.inputs.bag', 'Bag size', 'Tamaño de la bolsa'],
  ['calc.concrete.inputs.bagPrice', 'Price per bag ($)', 'Precio por bolsa ($)'],
  [
    'calc.concrete.inputs.readyMixPrice',
    'Ready-mix price per cubic yard ($)',
    'Precio del premezclado por yarda cúbica ($)',
  ],
  ['calc.concrete.options.shape.slab', 'Slab', 'Losa'],
  ['calc.concrete.options.shape.footing', 'Footing', 'Zapata'],
  ['calc.concrete.options.shape.column', 'Column', 'Columna'],
  ['calc.concrete.options.shape.steps', 'Steps', 'Escalones'],
  ['calc.concrete.options.bag.40', '40 lb', '40 lb'],
  ['calc.concrete.options.bag.60', '60 lb', '60 lb'],
  ['calc.concrete.options.bag.80', '80 lb', '80 lb'],
  [
    'calc.concrete.outputs.volumeYd3',
    'Concrete needed (cubic yards)',
    'Concreto necesario (yardas cúbicas)',
  ],
  [
    'calc.concrete.outputs.volumeFt3',
    'Concrete needed (cubic feet)',
    'Concreto necesario (pies cúbicos)',
  ],
  [
    'calc.concrete.outputs.volumeM3',
    'Concrete needed (cubic meters)',
    'Concreto necesario (metros cúbicos)',
  ],
  [
    'calc.concrete.outputs.netVolume',
    'Volume before extra (cubic feet)',
    'Volumen sin extra (pies cúbicos)',
  ],
  ['calc.concrete.outputs.bagCost', 'Cost of the bags', 'Costo de las bolsas'],
  ['calc.concrete.outputs.readyMixCost', 'Cost of ready-mix', 'Costo del premezclado'],
  ['material.concrete-mix.name', 'Concrete mix', 'Mezcla de concreto'],
  ['material.concrete-mix.units.bag-40', '40 lb bag', 'Bolsa de 40 lb'],
  ['material.concrete-mix.units.bag-60', '60 lb bag', 'Bolsa de 60 lb'],
  ['material.concrete-mix.units.bag-80', '80 lb bag', 'Bolsa de 80 lb'],
] as const;

describe('concrete labels (i18n-catalog › [ICW12] Exact labels of concrete)', () => {
  it.each(ROWS)('resolves %s exactly in English and Spanish', (key, en, es) => {
    expect(Object.hasOwn(enConcrete, key), key).toBe(true);
    expect(Object.hasOwn(esConcrete, key), key).toBe(true);
    expect(enConcrete[key]).toBe(en);
    expect(esConcrete[key]).toBe(es);
  });

  it('holds exactly these keys in both locales, with no placeholder', () => {
    const keys = ROWS.map(([key]) => key);
    expect(Object.keys(enConcrete)).toEqual(keys);
    expect(Object.keys(esConcrete)).toEqual(keys);
    for (const message of [...Object.values(enConcrete), ...Object.values(esConcrete)]) {
      expect(placeholdersOf(message)).toEqual([]);
    }
  });
});
