import { describe, expect, it } from 'vitest';
import { enConcrete } from './catalogs/en/concrete.ts';
import { esConcrete } from './catalogs/es/concrete.ts';
import { placeholdersOf } from './translate.ts';

/** key, en, es: the rows of the ICW12 table, the derived keys, the material keys and the page copy. */
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
  [
    'calc.concrete.page.example',
    'Example: a 12 ft by 10 ft slab, 4 in thick.',
    'Ejemplo: una losa de 12 ft por 10 ft, de 4 in de espesor.',
  ],
  ['calc.concrete.page.volumeYd3', '{value} cubic yards', '{value} yardas cúbicas'],
  ['calc.concrete.page.volumeM3', '{value} cubic meters', '{value} metros cúbicos'],
  [
    'calc.concrete.page.shoppingLine',
    'Concrete mix, {bagLb} lb bags',
    'Mezcla de concreto, bolsas de {bagLb} lb',
  ],
  [
    'calc.concrete.page.bagYield',
    'About {yield} cubic feet per bag',
    'Unos {yield} pies cúbicos por bolsa',
  ],
  ['calc.concrete.page.wasteLess', 'Less extra', 'Menos extra'],
  ['calc.concrete.page.wasteMore', 'More extra', 'Más extra'],
  [
    'calc.concrete.page.priceHint',
    'Add your price to see the cost',
    'Agrega tu precio para ver el costo',
  ],
  [
    'calc.concrete.page.wasteHelp',
    'Extra covers spills, uneven ground and over-digging. 10% is a common starting point; change it to match your job.',
    'El extra cubre derrames, terreno disparejo y excavación de más. El 10% es un punto de partida común; cámbialo según tu trabajo.',
  ],
  [
    'calc.concrete.page.readyMixNote',
    'Ready-mix: order the volume above; your supplier sets the minimum and the increments.',
    'Premezclado: pide el volumen de arriba; tu proveedor define el mínimo y los incrementos.',
  ],
  [
    'calc.concrete.page.answer.slab',
    'Slab ({length} × {width}, {thickness} thick): {volume} with {waste}% extra. Bags of {bagLb} lb: {bags}.',
    'Losa ({length} × {width}, {thickness} de espesor): {volume} con {waste}% de extra. Bolsas de {bagLb} lb: {bags}.',
  ],
  [
    'calc.concrete.page.answer.footing',
    'Footing ({length} long, {width} wide, {depth} deep, count {count}): {volume} with {waste}% extra. Bags of {bagLb} lb: {bags}.',
    'Zapata ({length} de largo, {width} de ancho, {depth} de profundidad, cantidad {count}): {volume} con {waste}% de extra. Bolsas de {bagLb} lb: {bags}.',
  ],
  [
    'calc.concrete.page.answer.column',
    'Column ({diameter} diameter, {height} tall, count {count}): {volume} with {waste}% extra. Bags of {bagLb} lb: {bags}.',
    'Columna ({diameter} de diámetro, {height} de alto, cantidad {count}): {volume} con {waste}% de extra. Bolsas de {bagLb} lb: {bags}.',
  ],
  [
    'calc.concrete.page.answer.steps',
    'Steps (count {stepCount}, {stepWidth} wide, {rise} rise, {run} run): {volume} with {waste}% extra. Bags of {bagLb} lb: {bags}.',
    'Escalones (cantidad {stepCount}, {stepWidth} de ancho, {rise} de altura, {run} de profundidad): {volume} con {waste}% de extra. Bolsas de {bagLb} lb: {bags}.',
  ],
] as const;

/** The placeholders of each answer sentence, the same in both locales (ICW13). */
const COMMON = ['volume', 'waste', 'bagLb', 'bags'];
const ANSWER_PLACEHOLDERS = {
  slab: ['length', 'width', 'thickness', ...COMMON],
  footing: ['count', 'length', 'width', 'depth', ...COMMON],
  column: ['count', 'diameter', 'height', ...COMMON],
  steps: ['stepCount', 'stepWidth', 'rise', 'run', ...COMMON],
} as const;

describe('concrete labels (i18n-catalog › [ICW12] Exact labels of concrete)', () => {
  it.each(ROWS)('resolves %s exactly in English and Spanish', (key, en, es) => {
    expect(Object.hasOwn(enConcrete, key), key).toBe(true);
    expect(Object.hasOwn(esConcrete, key), key).toBe(true);
    expect(enConcrete[key]).toBe(en);
    expect(esConcrete[key]).toBe(es);
  });

  // spec: i18n-catalog › [ICW11] the derived keys, the four material keys and the page keys, in order
  it('holds exactly these keys in both locales', () => {
    const keys = ROWS.map(([key]) => key);
    expect(Object.keys(enConcrete)).toEqual(keys);
    expect(Object.keys(esConcrete)).toEqual(keys);
  });

  it('holds a placeholder only in the page copy, the same names in both locales', () => {
    const withPlaceholders = ROWS.filter(([, en]) => placeholdersOf(en).length > 0);
    expect(withPlaceholders.map(([key]) => key)).toEqual([
      'calc.concrete.page.volumeYd3',
      'calc.concrete.page.volumeM3',
      'calc.concrete.page.shoppingLine',
      'calc.concrete.page.bagYield',
      'calc.concrete.page.answer.slab',
      'calc.concrete.page.answer.footing',
      'calc.concrete.page.answer.column',
      'calc.concrete.page.answer.steps',
    ]);
    for (const [key, en, es] of ROWS) {
      expect(placeholdersOf(es), key).toEqual(placeholdersOf(en));
    }
  });

  // spec: i18n-catalog › [ICW13] the placeholders of the four answer sentences
  it.each(Object.entries(ANSWER_PLACEHOLDERS))(
    'gives the %s sentence its placeholders',
    (shape, names) => {
      const key = `calc.concrete.page.answer.${shape}` as keyof typeof enConcrete;
      expect([...placeholdersOf(enConcrete[key])].sort()).toEqual([...names].sort());
      expect([...placeholdersOf(esConcrete[key])].sort()).toEqual([...names].sort());
    },
  );

  // spec: i18n-catalog › [ICW13] every sentence ends with the bags of the chosen size
  it.each(['footing', 'column', 'steps'] as const)(
    'starts and ends the %s sentence as specified',
    (shape) => {
      const key = `calc.concrete.page.answer.${shape}` as const;
      const starts = {
        footing: { en: 'Footing (', es: 'Zapata (' },
        column: { en: 'Column (', es: 'Columna (' },
        steps: { en: 'Steps (', es: 'Escalones (' },
      };
      expect(enConcrete[key].startsWith(starts[shape].en)).toBe(true);
      expect(esConcrete[key].startsWith(starts[shape].es)).toBe(true);
      expect(enConcrete[key].endsWith('Bags of {bagLb} lb: {bags}.')).toBe(true);
      expect(esConcrete[key].endsWith('Bolsas de {bagLb} lb: {bags}.')).toBe(true);
    },
  );
});
