import { ALL_ERROR_CODES } from '@maestro-calc/core';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import {
  choiceCalculator,
  fieldsOf,
  formCalculator,
  hintedCalculator,
  lengthCalculator,
  lengthsCalculator,
  moneyCalculator,
  pageModuleErrorOf,
  shoppingCalculator,
} from '../__testing__/page-fixtures.ts';
import { concretePage } from '../calculator/concrete/page.ts';
import { controllerOf, type Environment, type Messages } from '../calculator/controller.ts';
import {
  definePage,
  primaryOutputOf,
  sentenceNameOf,
  type AnyPageModule,
} from '../calculator/page-module.ts';
import { rectangleAreaPage } from '../calculator/rectangle-area/page.ts';
import { choiceSlot } from '../calculator/slots/choices.ts';
import { costSlot } from '../calculator/slots/costs.ts';
import { shoppingSlot } from '../calculator/slots/shopping.ts';
import { slotFreePage } from '../contract/__testing__/slot-free-page.ts';
import { concrete as concreteCalculator } from './concrete.ts';
import { formViewOf, pageViewOf, resultViewOf } from './page-view.ts';
import { pageView } from './pages.ts';

/** The rectangle-area catalog without its page copy: what a page with no answer and no primary sentence is built from. */
const enSlotFree: Record<string, string> = Object.fromEntries(
  Object.entries({ ...enCommon, ...enRectangleArea, ...enSite }).filter(
    ([key]) => !key.includes('.page.'),
  ),
);

describe('the concrete page view (calculator-page › [CP1], [CP2], [CP3], [CP4], [CP15], [CP17], [CP43])', () => {
  // spec: calculator-page › [CP1] the default render, English
  it('describes the default English page from the engine and the catalogs', () => {
    const view = pageView('concrete', 'en');
    expect(view.title).toBe('Concrete Calculator');
    expect(view.answer).toBe(
      'Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.',
    );
    expect(view.result.primary).toEqual({
      key: 'volumeYd3',
      prefixed: false,
      before: '',
      value: '1.63',
      after: ' cubic yards',
    });
    expect(view.result.rows[0]?.label).toBe('Concrete needed (cubic yards)');
    // the cubic yards row is there for the metric system, hidden while the large figure is cubic yards
    expect(view.result.rows.map(({ key, value, hidden }) => [key, value, hidden])).toEqual([
      ['volumeYd3', '1.63', true],
      ['volumeFt3', '44.00', undefined],
      ['volumeM3', '1.25', undefined],
      ['netVolume', '40.00', undefined],
    ]);
    expect(view.result.shopping).toEqual([
      {
        unit: 'bag-80',
        qty: '74',
        label: { name: 'bagLb', before: 'Concrete mix, ', value: '80', after: ' lb bags' },
        note: { name: 'yield', before: 'About ', value: '0.60', after: ' cubic feet per bag' },
      },
    ]);
    expect(view.result.costs.map(({ key, visible }) => [key, visible])).toEqual([
      ['bagCost', false],
      ['readyMixCost', false],
    ]);
    expect(view.result.costs[0]?.hint).toBe('Add your price to see the cost');
  });

  // spec: calculator-page › [CP2] the default render, Spanish
  it('describes the default Spanish page with the same figures', () => {
    const view = pageView('concrete', 'es');
    expect(view.title).toBe('Calculadora de Concreto');
    expect(view.answer).toBe(
      'Losa (12 ft × 10 ft, 4 in de espesor): 1.63 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 74.',
    );
    expect(view.result.primary.after).toBe(' yardas cúbicas');
    expect(view.result.shopping[0]?.label).toEqual({
      name: 'bagLb',
      before: 'Mezcla de concreto, bolsas de ',
      value: '80',
      after: ' lb',
    });
    expect(view.result.shopping[0]?.note).toEqual({
      name: 'yield',
      before: 'Unos ',
      value: '0.60',
      after: ' pies cúbicos por bolsa',
    });
    expect(view.result.costs[0]?.hint).toBe('Agrega tu precio para ver el costo');
    expect(view.result.rows.map(({ value }) => value)).toEqual(['1.63', '44.00', '1.25', '40.00']);
  });

  // spec: calculator-page › [CP40] static: the "not running" note, then the example sentence
  it('joins the generic note and the calculator example', () => {
    expect(pageView('concrete', 'en').notRunning).toBe(
      'This page needs JavaScript to recalculate. If it is off or did not load, the result below is the example. Example: a 12 ft by 10 ft slab, 4 in thick.',
    );
    expect(pageView('concrete', 'es').notRunning).toBe(
      'Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo. Ejemplo: una losa de 12 ft por 10 ft, de 4 in de espesor.',
    );
  });

  // spec: calculator-page › [CP17] and [CP5] the paths come from the route table
  it('points the breadcrumb home and the terms link at the locale paths', () => {
    expect(pageView('concrete', 'en').breadcrumb).toEqual({
      label: 'Breadcrumb',
      homeLabel: 'Home',
      homeHref: '/',
      current: 'Concrete Calculator',
    });
    expect(pageView('concrete', 'es').breadcrumb.homeHref).toBe('/es');
    expect(pageView('concrete', 'en').result.termsHref).toBe('/terms');
    expect(pageView('concrete', 'es').result.termsHref).toBe('/es/terminos');
    expect(pageView('concrete', 'es').result.termsLabel).toBe('Términos');
  });

  // spec: calculator-page › [CP43] raw messages for the templates, placeholders kept
  it('carries the twelve error messages, the four sentences and the copy states raw', () => {
    const messages = Object.fromEntries(pageView('concrete', 'en').messages);
    const names = Object.keys(messages);
    expect(names.filter((name) => name.startsWith('errors.'))).toEqual(
      ALL_ERROR_CODES.map((code) => `errors.${code}`),
    );
    expect(messages['errors.BELOW_MIN']).toBe(enCommon['errors.BELOW_MIN']);
    expect(messages['errors.BELOW_MIN']).toContain('{min}');
    expect(messages['errors.ABOVE_MAX']).toContain('{max}');
    expect(names.filter((name) => name.startsWith('answer.'))).toEqual([
      'answer.slab',
      'answer.footing',
      'answer.column',
      'answer.steps',
    ]);
    expect(messages['answer.slab']).toContain('{bags}');
    expect([messages['copy.copied'], messages['copy.failed'], messages['share.text']]).toEqual([
      'Link copied',
      'Could not copy. Select the link and copy it.',
      'Check this calculation:',
    ]);
    expect(Object.fromEntries(pageView('concrete', 'es').messages)['errors.MALFORMED']).toBe(
      esCommon['errors.MALFORMED'],
    );
  });

  // spec: calculator-page › [CP51] the unit hint of the US system on every length field
  it('gives each length field the hint of the unit it is read in, and the others none', () => {
    const { form } = pageView('concrete', 'en');
    expect(Object.fromEntries(fieldsOf(form).map(({ key, hint }) => [key, hint]))).toEqual({
      length: 'feet',
      width: 'feet',
      thickness: 'inches',
      footingWidth: 'inches',
      footingDepth: 'inches',
      diameter: 'inches',
      height: 'feet',
      stepWidth: 'feet',
      rise: 'inches',
      run: 'inches',
      stepCount: undefined,
      count: undefined,
      waste: undefined,
      bagPrice: undefined,
      readyMixPrice: undefined,
    });
    expect(fieldsOf(pageView('concrete', 'es').form).find(({ key }) => key === 'rise')?.hint).toBe(
      'pulgadas',
    );
  });

  // spec: calculator-page › [CP51] the four hints travel as inert messages for the unit toggle
  it('carries the four unit hints in both locales for the script', () => {
    const hints = (locale: 'en' | 'es') =>
      Object.fromEntries(
        pageView('concrete', locale).messages.filter(([name]) => name.startsWith('hint.')),
      );
    expect(hints('en')).toEqual({
      'hint.ft': 'feet',
      'hint.in': 'inches',
      'hint.m': 'meters',
      'hint.cm': 'centimeters',
    });
    const volumes = Object.fromEntries(
      pageView('concrete', 'en').messages.filter(([name]) => name.startsWith('volume.')),
    );
    expect(volumes).toEqual({
      'volume.yd3': '{value} cubic yards',
      'volume.m3': '{value} cubic meters',
    });
    expect(hints('es')).toEqual({
      'hint.ft': 'pies',
      'hint.in': 'pulgadas',
      'hint.m': 'metros',
      'hint.cm': 'centímetros',
    });
  });

  it('presses the defaults: US units, slab, 80 lb bags, and describes the groups', () => {
    const { form } = pageView('concrete', 'en');
    expect(form.units.filter(({ pressed }) => pressed).map(({ id }) => id)).toEqual(['imperial']);
    const [shape, , bag] = form.items;
    expect(
      shape?.kind === 'choice' && shape.choices.map(({ id, pressed }) => [id, pressed]),
    ).toEqual([
      ['slab', true],
      ['footing', false],
      ['column', false],
      ['steps', false],
    ]);
    expect(bag?.kind === 'choice' && bag.choices.map(({ id, pressed }) => [id, pressed])).toEqual([
      ['40', false],
      ['60', false],
      ['80', true],
    ]);
    expect(
      shape?.kind === 'choice' && shape.area?.fields.map(({ key, visible }) => [key, visible]),
    ).toEqual([
      ['length', true],
      ['width', true],
      ['thickness', true],
      ['footingWidth', false],
      ['footingDepth', false],
      ['diameter', false],
      ['height', false],
      ['stepWidth', false],
      ['rise', false],
      ['run', false],
      ['stepCount', false],
      ['count', false],
    ]);
  });
});

/** A catalog that answers every key with the key itself, except `overrides` and the keys `lacking` accepts. */
const catalogOf = (
  lacking: (key: string) => boolean = () => false,
  overrides: Readonly<Record<string, string>> = {},
) =>
  new Proxy<Record<string, string>>(
    {},
    {
      get: (_target, key) =>
        typeof key !== 'string' || lacking(key) ? undefined : (overrides[key] ?? key),
    },
  );

describe('formViewOf (calculator-web-core › [CWC5], [CWC24], [CWC28]; calculator-page › [CP11], [CP12], [CP51], [CP58])', () => {
  const enCatalog: Record<string, string> = { ...enCommon, ...enConcrete, ...enSite };

  // spec: calculator-web-core › [CWC5] the units first, the items of formOf, then the copy button
  it('puts the unit toggle first, then the items in the order of the form, then the copy label', () => {
    const form = formViewOf(concretePage, enCatalog);
    expect(form.unitsLabel).toBe('Units');
    expect(form.units.map(({ id, label, pressed }) => [id, label, pressed])).toEqual([
      ['imperial', 'US (ft, in)', true],
      ['metric', 'Metric (m, cm)', false],
    ]);
    expect(form.items.map((item) => (item.kind === 'choice' ? item.key : item.field.key))).toEqual([
      'shape',
      'waste',
      'bag',
      'bagPrice',
      'readyMixPrice',
    ]);
    expect(form.copyLabel).toBe('Copy link');
    expect(form.shareLabel).toBe('Send on WhatsApp');
  });

  // spec: calculator-web-core › [CWC5] the labels come from `calc.<id>.inputs.<key>`
  it('labels every input and every group from the inputs keys of the catalog', () => {
    const form = formViewOf(concretePage, enCatalog);
    const labels = Object.fromEntries(fieldsOf(form).map(({ key, label }) => [key, label]));
    for (const [key, label] of Object.entries(labels)) {
      expect(label, key).toBe(enCatalog[`calc.concrete.inputs.${key}`]);
    }
    expect(labels['length']).toBe('Length');
    expect(form.items.flatMap((item) => (item.kind === 'choice' ? [item.label] : []))).toEqual([
      'Shape',
      'Bag size',
    ]);
  });

  // spec: calculator-web-core › [CWC5] input modes from the input kind, the price placeholder
  it('gives count inputs the numeric mode, the others the decimal mode, and a price its placeholder', () => {
    const fields = fieldsOf(formViewOf(concretePage, enCatalog));
    const modes = Object.fromEntries(fields.map(({ key, mode }) => [key, mode]));
    expect(modes['stepCount']).toBe('numeric');
    expect(modes['count']).toBe('numeric');
    expect(fields.filter(({ mode }) => mode === 'decimal').map(({ key }) => key)).toEqual([
      'length',
      'width',
      'thickness',
      'footingWidth',
      'footingDepth',
      'diameter',
      'height',
      'stepWidth',
      'rise',
      'run',
      'waste',
      'bagPrice',
      'readyMixPrice',
    ]);
    expect(
      fields
        .filter(({ placeholder }) => placeholder !== undefined)
        .map(({ key, placeholder }) => [key, placeholder]),
    ).toEqual([
      ['bagPrice', '0.00'],
      ['readyMixPrice', '0.00'],
    ]);
  });

  // spec: calculator-page › [CP12] the default text of each field, in the unit the field is read in
  it('writes the default text of the fifteen fields', () => {
    const texts = fieldsOf(formViewOf(concretePage, enCatalog)).map(({ value }) => value);
    expect(texts).toEqual([
      '12 ft',
      '10 ft',
      '4 in',
      '16 in',
      '8 in',
      '12 in',
      '8 ft',
      '4 ft',
      '7 in',
      '11 in',
      '3',
      '1',
      '10',
      '',
      '',
    ]);
  });

  // spec: calculator-web-core › [CWC28] and calculator-page › [CP58] the rows come from the choice slot
  it('takes the reserved rows of the area from the choice slot, four for concrete', () => {
    const [shape] = formViewOf(concretePage, enCatalog).items;
    expect(shape?.kind === 'choice' && shape.area?.rows).toBe(4);
    expect(shape?.kind === 'choice' && shape.area?.rows).toBe(
      concretePage.choices?.groups[0]?.rows,
    );
  });

  // spec: calculator-page › [CP58] a taller option grows the reservation with no constant edited
  it('reserves five rows for a fixture whose option shows five fields', () => {
    const page = definePage({
      calculator: formCalculator,
      choices: choiceSlot(formCalculator, [
        { select: 'mode', shows: { small: ['a'], large: ['a', 'b', 'c', 'd', 'e'] } },
      ]),
    });
    const [group] = formViewOf(page, catalogOf()).items;
    expect(group?.kind === 'choice' && group.area?.rows).toBe(5);
    expect(
      group?.kind === 'choice' && group.area?.fields.map(({ key, visible }) => [key, visible]),
    ).toEqual([
      ['a', true],
      ['b', false],
      ['c', false],
      ['d', false],
      ['e', false],
    ]);
  });

  // spec: calculator-web-core › [CWC5] the stepper of the waste item and its two labels
  it('gives the waste item a stepper whose labels are the page keys wasteLess and wasteMore', () => {
    const waste = formViewOf(concretePage, enCatalog).items.find(
      (item) => item.kind === 'field' && item.field.key === 'waste',
    );
    expect(waste?.kind === 'field' && waste.stepper).toEqual({
      key: 'waste',
      less: 'Less extra',
      more: 'More extra',
    });
    expect(waste?.kind === 'field' && waste.field.help).toBe(
      enConcrete['calc.concrete.page.wasteHelp'],
    );
    const price = formViewOf(concretePage, enCatalog).items.at(-1);
    expect(price?.kind === 'field' && price.stepper).toBeUndefined();
  });

  // spec: calculator-web-core › Page-view builder: a missing page key fails the build naming the key
  it('throws PAGE_KEY naming the stepper key the catalog lacks', () => {
    const lacking = { ...enCatalog };
    delete lacking['calc.concrete.page.wasteMore'];
    const error = pageModuleErrorOf(() => formViewOf(concretePage, lacking));
    expect(error.code).toBe('PAGE_KEY');
    expect(error.cause).toEqual({ id: 'concrete', at: 'calc.concrete.page.wasteMore' });
  });

  // spec: calculator-web-core › Page-view builder: a unit without a hint message fails naming the unit
  it('throws PAGE_KEY for a length unit that has no hint message', () => {
    const page = definePage({ calculator: lengthCalculator('yd', 'm') });
    const catalog = catalogOf((key) => key === 'site.calculator.hintYd');
    const error = pageModuleErrorOf(() => formViewOf(page, catalog));
    expect(error.code).toBe('PAGE_KEY');
    expect(error.cause).toEqual({ id: 'length-fixture', at: 'site.calculator.hintYd' });
    expect(
      formViewOf(definePage({ calculator: lengthCalculator('in', 'cm') }), catalogOf()).items,
    ).toHaveLength(1);
  });

  // spec: calculator-web-core › [CWC24] a module with no slots has its fields and no choice item
  it('holds the two length fields of rectangle-area and no choice item', () => {
    const form = formViewOf(rectangleAreaPage, { ...enCommon, ...enRectangleArea, ...enSite });
    expect(form.items.map((item) => item.kind)).toEqual(['field', 'field']);
    expect(
      fieldsOf(form).map(({ key, label, value, mode, hint }) => [key, label, value, mode, hint]),
    ).toEqual([
      ['length', 'Length', '10 ft', 'decimal', 'feet'],
      ['width', 'Width', '10 ft', 'decimal', 'feet'],
    ]);
  });

  it('refuses a form the layout cannot place', () => {
    expect(
      pageModuleErrorOf(() => formViewOf(definePage({ calculator: choiceCalculator }), catalogOf()))
        .code,
    ).toBe('FORM_ORDER');
  });
});
describe('resultViewOf (calculator-web-core › [CWC3], [CWC24], [CWC27]; calculator-page › [CP1], [CP2], [CP15], [CP54], [CP56])', () => {
  const enCatalog: Record<string, string> = { ...enCommon, ...enConcrete, ...enSite };

  // spec: calculator-web-core › [CWC24] the rows are the outputs with a display hint, the primary hidden
  it('lists the outputs that have a display hint in declaration order with the primary hidden', () => {
    const { rows } = resultViewOf(concretePage, 'en', enCatalog);
    expect(rows.map(({ key, value, hidden }) => [key, value, hidden])).toEqual([
      ['volumeYd3', '1.63', true],
      ['volumeFt3', '44.00', undefined],
      ['volumeM3', '1.25', undefined],
      ['netVolume', '40.00', undefined],
    ]);
    expect(rows.map(({ label }) => label)).toEqual([
      'Concrete needed (cubic yards)',
      'Concrete needed (cubic feet)',
      'Concrete needed (cubic meters)',
      'Volume before extra (cubic feet)',
    ]);
  });

  // spec: calculator-web-core › [CWC24] rectangle-area has its three area rows and nothing else
  it('gives rectangle-area its three area rows, the bare primary value and no shopping or cost', () => {
    const result = resultViewOf(slotFreePage, 'en', enSlotFree);
    expect(result.rows.map(({ key, label, value, hidden }) => [key, label, value, hidden])).toEqual(
      [
        ['areaFt2', 'Area (square feet)', '100.00', true],
        ['areaYd2', 'Area (square yards)', '11.11', undefined],
        ['areaM2', 'Area (square meters)', '9.29', undefined],
      ],
    );
    expect(result.primary).toEqual({
      key: 'areaFt2',
      prefixed: false,
      before: '',
      value: '100.00',
      after: '',
    });
    expect(result.shopping).toEqual([]);
    expect(result.costs).toEqual([]);
    expect('costsNote' in result).toBe(false);
  });

  // spec: calculator-web-core › [CWC3] and calculator-page › [CP54] one shopping line, its two fills named
  it('splits the concrete bag line and its note on the fills the slot declares', () => {
    const [line, ...others] = resultViewOf(concretePage, 'en', enCatalog).shopping;
    expect(others).toEqual([]);
    expect(line).toEqual({
      unit: 'bag-80',
      qty: '74',
      label: { name: 'bagLb', before: 'Concrete mix, ', value: '80', after: ' lb bags' },
      note: { name: 'yield', before: 'About ', value: '0.60', after: ' cubic feet per bag' },
    });
  });

  // spec: calculator-web-core › [CWC3] a list of lines in the order the module declared
  it('keeps the declared order of two lines the engine returns the other way round', () => {
    const page = definePage({
      calculator: shoppingCalculator,
      shopping: shoppingSlot(shoppingCalculator, [
        {
          material: 'alpha',
          label: 'alphaLine',
          note: 'alphaNote',
          parts: () => ({ unit: 'box-a', fills: { n: '5' } }),
        },
        { material: 'beta', label: 'betaLine', parts: () => ({ unit: 'bag-b', fills: {} }) },
      ]),
    });
    const catalog = catalogOf(() => false, {
      'calc.shopping-fixture.page.alphaLine': 'Boxes of {n}',
      'calc.shopping-fixture.page.alphaNote': 'Holds {n} pieces each',
      'calc.shopping-fixture.page.betaLine': 'Bags',
    });
    expect(resultViewOf(page, 'en', catalog).shopping).toEqual([
      {
        unit: 'box-a',
        qty: '1,234',
        label: { name: 'n', before: 'Boxes of ', value: '5', after: '' },
        note: { name: 'n', before: 'Holds ', value: '5', after: ' pieces each' },
      },
      { unit: 'bag-b', qty: '7', label: { before: 'Bags', value: '', after: '' } },
    ]);
  });

  const twoFills = definePage({
    calculator: shoppingCalculator,
    shopping: shoppingSlot(shoppingCalculator, [
      {
        material: 'alpha',
        label: 'alphaLine',
        note: 'alphaNote',
        parts: () => ({ unit: 'box-a', fills: { n: '5', m: '12' } }),
      },
      { material: 'beta', label: 'betaLine', parts: () => ({ unit: 'bag-b', fills: {} }) },
    ]),
  });
  const twoFillsCatalog = (texts: Readonly<Record<string, string>>) =>
    catalogOf(() => false, {
      'calc.shopping-fixture.page.alphaLine': 'Boxes of {n}',
      'calc.shopping-fixture.page.alphaNote': 'Holds {n} pieces',
      'calc.shopping-fixture.page.betaLine': 'Bags',
      ...texts,
    });

  // a text is split around one placeholder; the fills may differ between the label and the note
  it('splits a label and a note that each carry one of two fills, with text on both sides', () => {
    const catalog = twoFillsCatalog({
      'calc.shopping-fixture.page.alphaLine': 'Boxes of {n} pieces',
      'calc.shopping-fixture.page.alphaNote': 'About {m} lb each',
    });
    expect(resultViewOf(twoFills, 'en', catalog).shopping[0]).toEqual({
      unit: 'box-a',
      qty: '1,234',
      label: { name: 'n', before: 'Boxes of ', value: '5', after: ' pieces' },
      note: { name: 'm', before: 'About ', value: '12', after: ' lb each' },
    });
  });

  // a second placeholder would render as literal `{name}` text with no `data-fill` element
  it.each([
    [
      'two fills in the label',
      'alphaLine',
      { 'calc.shopping-fixture.page.alphaLine': 'Boxes of {n}, {m} lb' },
    ],
    [
      'the same fill twice in the label',
      'alphaLine',
      { 'calc.shopping-fixture.page.alphaLine': '{n} boxes of {n}' },
    ],
    [
      'two fills in the note',
      'alphaNote',
      { 'calc.shopping-fixture.page.alphaNote': 'Holds {n} of {m}' },
    ],
  ] as const)('refuses a text with %s, naming the page key', (_what, suffix, texts) => {
    const error = pageModuleErrorOf(() => resultViewOf(twoFills, 'en', twoFillsCatalog(texts)));
    expect(error.code).toBe('SHOPPING_LINES');
    expect(error.cause).toEqual({ id: 'shopping-fixture', at: suffix });
  });

  // spec: calculator-page › [CP16] the cost rows with their hint and the note under them
  it('gives the cost rows a hint and the note of the slot, hidden while the price is zero', () => {
    const { costs, costsNote } = resultViewOf(concretePage, 'en', enCatalog);
    expect(
      costs.map(({ key, label, value, visible, hint }) => [key, label, value, visible, hint]),
    ).toEqual([
      ['bagCost', 'Cost of the bags', '$0.00', false, 'Add your price to see the cost'],
      ['readyMixCost', 'Cost of ready-mix', '$0.00', false, 'Add your price to see the cost'],
    ]);
    expect(costsNote).toBe(
      'Ready-mix: order the volume above; your supplier sets the minimum and the increments.',
    );
  });

  it('omits the note when the cost slot has none', () => {
    const page = definePage({
      calculator: concreteCalculator,
      costs: costSlot(concreteCalculator, [{ output: 'bagCost', price: 'bagPrice' }], {
        hint: 'priceHint',
      }),
    });
    const result = resultViewOf(page, 'en', enCatalog);
    expect(result.costs.map(({ key }) => key)).toEqual(['bagCost']);
    expect('costsNote' in result).toBe(false);
  });

  // spec: calculator-page › [CP15], [CP17] the heading, the estimate note and the terms link by locale
  it('carries the heading, the estimate note and the terms link of the locale', () => {
    const en = resultViewOf(concretePage, 'en', enCatalog);
    expect([en.heading, en.termsLabel, en.termsHref]).toEqual(['Result', 'Terms', '/terms']);
    expect(en.estimateNote).toBe(
      'Estimates only. Check quantities with your supplier and the local building code.',
    );
    expect(
      resultViewOf(concretePage, 'es', { ...esCommon, ...esConcrete, ...esSite }).termsHref,
    ).toBe('/es/terminos');
  });

  // spec: calculator-web-core › Page-view builder: the primary sentence key is optional, a missing page key names itself
  it('splits the primary sentence on its value and names a page key the catalog lacks', () => {
    expect(resultViewOf(concretePage, 'en', enCatalog).primary).toEqual({
      key: 'volumeYd3',
      prefixed: false,
      before: '',
      value: '1.63',
      after: ' cubic yards',
    });
    const catalog = catalogOf((key) => key === 'calc.concrete.page.shoppingLine');
    const error = pageModuleErrorOf(() => resultViewOf(concretePage, 'en', catalog));
    expect(error.code).toBe('PAGE_KEY');
    expect(error.cause).toEqual({ id: 'concrete', at: 'calc.concrete.page.shoppingLine' });
  });

  // the page holds the `data-primary-before` span when the sentence of either unit system has a prefix
  it('marks the primary prefixed when the metric sentence has text before the value', () => {
    const ft = { unit: 'ft', format: 'decimal', places: 2 } as const;
    const inch = { unit: 'in', format: 'decimal', places: 2 } as const;
    const module = definePage({
      calculator: hintedCalculator({ span: ft, edge: inch }),
      primary: { imperial: 'span', metric: 'edge' },
    });
    const catalog = catalogOf(() => false, {
      'calc.hinted-fixture.page.span': '{value} feet',
      'calc.hinted-fixture.page.edge': 'Edge {value} inches',
    });
    expect(resultViewOf(module, 'en', catalog).primary).toEqual({
      key: 'span',
      prefixed: true,
      before: '',
      value: '1.00',
      after: ' feet',
    });
    expect(resultViewOf(concretePage, 'en', enCatalog).primary.prefixed).toBe(false);
  });
});

describe('pageViewOf messages (calculator-web-core › [CWC23], [CWC25]; calculator-page › [CP43], [CP40]; design m-2, R7)', () => {
  const enCatalog: Record<string, string> = { ...enCommon, ...enConcrete, ...enSite };
  const enRectangle: Record<string, string> = { ...enCommon, ...enRectangleArea, ...enSite };
  const names = (view: { readonly messages: readonly (readonly [string, string])[] }) =>
    view.messages.map(([name]) => name);

  // spec: calculator-page › [CP43] the exact order of the template of the concrete page
  it('lists the errors, the answers, the copy states, the unit hints and the primary templates in order', () => {
    const view = pageViewOf(concretePage, 'en', enCatalog);
    expect(names(view)).toEqual([
      ...ALL_ERROR_CODES.map((code) => `errors.${code}`),
      'answer.slab',
      'answer.footing',
      'answer.column',
      'answer.steps',
      'copy.copied',
      'copy.failed',
      'share.text',
      'hint.ft',
      'hint.in',
      'hint.m',
      'hint.cm',
      'volume.yd3',
      'volume.m3',
    ]);
    const byName = Object.fromEntries(view.messages);
    expect(byName['errors.BELOW_MIN']).toBe(enCommon['errors.BELOW_MIN']);
    expect(byName['answer.steps']).toBe(enConcrete['calc.concrete.page.answer.steps']);
    expect(byName['copy.failed']).toBe('Could not copy. Select the link and copy it.');
    expect([byName['hint.ft'], byName['hint.in'], byName['hint.m'], byName['hint.cm']]).toEqual([
      'feet',
      'inches',
      'meters',
      'centimeters',
    ]);
    expect([byName['volume.yd3'], byName['volume.m3']]).toEqual([
      '{value} cubic yards',
      '{value} cubic meters',
    ]);
  });

  // design K6: the sentence of a primary with no display hint is named by its measure, as the controller reads it
  it('names the primary sentence by the measure when the output has no display hint', () => {
    const page = definePage({ calculator: moneyCalculator });
    const view = pageViewOf(
      page,
      'en',
      catalogOf(() => false, { 'calc.money-fixture.page.cost': 'Total: {value} dollars' }),
    );
    expect(view.messages.at(-1)).toEqual(['money', 'Total: {value} dollars']);
    expect(view.result.primary).toEqual({
      key: 'cost',
      prefixed: true,
      before: 'Total: ',
      value: '$5.00',
      after: ' dollars',
    });
    expect(view.result.rows).toEqual([]);
  });

  // spec: calculator-web-core › [CWC24] no answer, no primary template for a module with neither
  it('lists only the errors, the copy states and the hints for rectangle-area', () => {
    const view = pageViewOf(slotFreePage, 'en', enSlotFree);
    expect(names(view)).toEqual([
      ...ALL_ERROR_CODES.map((code) => `errors.${code}`),
      'copy.copied',
      'copy.failed',
      'share.text',
      'hint.ft',
      'hint.m',
    ]);
    expect('answer' in view).toBe(false);
  });

  // design m-2: the distinct default units in input order, then the distinct metric units
  it('derives the unit hints from the length inputs, the imperial units first', () => {
    const page = definePage({
      calculator: lengthsCalculator(['in', 'cm'], ['ft', 'cm'], ['in', 'm']),
    });
    expect(
      names(pageViewOf(page, 'en', catalogOf())).filter((name) => name.startsWith('hint.')),
    ).toEqual(['hint.in', 'hint.ft', 'hint.cm', 'hint.m']);
  });

  it.each([
    ['yd', 'mm', 'site.calculator.hintYd'],
    ['ft', 'mm', 'site.calculator.hintMm'],
  ] as const)(
    'throws PAGE_KEY for the unit %s or %s that has no hint message',
    (imperial, metric, key) => {
      const page = definePage({ calculator: lengthsCalculator([imperial, metric]) });
      const catalog = catalogOf((name) => name === key);
      const error = pageModuleErrorOf(() => pageViewOf(page, 'en', catalog));
      expect(error.code).toBe('PAGE_KEY');
      expect(error.cause).toEqual({ id: 'lengths-fixture', at: key });
    },
  );

  // spec: calculator-page › [CP40] the example is joined with one space, no trailing space without it (R7)
  it('joins the no-JS note and the example with one space, and has no trailing space without one', () => {
    const page = definePage({ calculator: lengthCalculator('ft', 'm') });
    const withExample = pageViewOf(
      page,
      'en',
      catalogOf(() => false, {
        'site.calculator.noscript': 'Needs JavaScript.',
        'calc.length-fixture.page.example': 'Example: 10 ft.',
      }),
    );
    expect(withExample.notRunning).toBe('Needs JavaScript. Example: 10 ft.');
    const without = pageViewOf(
      page,
      'en',
      catalogOf((key) => key === 'calc.length-fixture.page.example', {
        'site.calculator.noscript': 'Needs JavaScript.',
      }),
    );
    expect(without.notRunning).toBe('Needs JavaScript.');
    expect(pageViewOf(concretePage, 'en', enCatalog).notRunning).toBe(
      `${enSite['site.calculator.noscript']} ${enConcrete['calc.concrete.page.example']}`,
    );
  });

  // spec: calculator-page › [CP1] the answer sentence is set only for a module with an answer slot
  it('sets the answer sentence of the default state for concrete and none for a module without a slot', () => {
    const view = pageViewOf(concretePage, 'en', enCatalog);
    expect(view.answer).toBe(
      'Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.',
    );
    expect('answer' in pageViewOf(slotFreePage, 'en', enSlotFree)).toBe(false);
  });

  // spec: calc-rectangle-area › [RAP2] the answer of the real rectangle-area page, and its not-running note
  it('sets the rectangle-area answer from the one template and joins the example to the no-JS note', () => {
    const view = pageViewOf(rectangleAreaPage, 'en', enRectangle);
    expect(view.answer).toBe('A 10 ft by 10 ft area is 100.00 square feet.');
    expect(view.notRunning).toBe(
      `${enSite['site.calculator.noscript']} ${enRectangleArea['calc.rectangle-area.page.example']}`,
    );
    expect(names(view)).toContain('answer');
  });

  // spec: i18n-catalog › [ICW20], blueprint-drawing › [BD15] the drawing's name travels as an inert message
  it('carries the drawing name as a message, after the answer, and the frame in the result view', () => {
    const view = pageViewOf(rectangleAreaPage, 'en', enRectangle);
    expect(names(view)).toEqual([
      ...ALL_ERROR_CODES.map((code) => `errors.${code}`),
      'answer',
      'drawing',
      'copy.copied',
      'copy.failed',
      'share.text',
      'hint.ft',
      'hint.m',
      'area.ft2',
      'area.m2',
    ]);
    expect(Object.fromEntries(view.messages)['drawing']).toBe('Plan: {length} by {width}, {area}');
    expect(view.result.drawing).toEqual({ width: 300, height: 200 });
    expect('drawing' in pageViewOf(slotFreePage, 'en', enSlotFree).result).toBe(false);
  });

  // spec: i18n-catalog › [ICW20] a catalog without the drawing name fails the build, naming the key
  it('throws PAGE_KEY naming the drawing key a catalog lacks', () => {
    const lacking = { ...enRectangle };
    delete lacking['calc.rectangle-area.page.drawing'];
    const error = pageModuleErrorOf(() => pageViewOf(rectangleAreaPage, 'es', lacking));
    expect(error.cause).toEqual({ id: 'rectangle-area', at: 'calc.rectangle-area.page.drawing' });
  });

  it('describes the page of a module from its id, title, breadcrumb and parts', () => {
    const view = pageViewOf(rectangleAreaPage, 'en', enRectangle);
    expect([view.id, view.title]).toEqual(['rectangle-area', 'Square Footage Calculator']);
    expect(view.breadcrumb).toEqual({
      label: 'Breadcrumb',
      homeLabel: 'Home',
      homeHref: '/',
      current: 'Square Footage Calculator',
    });
    expect(view.result.primary).toEqual({
      key: 'areaFt2',
      prefixed: false,
      before: '',
      value: '100.00',
      after: ' square feet',
    });
    expect(view.form.items.map((item) => item.kind)).toEqual(['field', 'field']);
  });
});

describe('pageViewOf guards (calculator-web-core › Page-view builder)', () => {
  const enCatalog: Record<string, string> = { ...enCommon, ...enConcrete, ...enSite };

  // the default state of the definition must run and validate, or no page can be built from it
  it('refuses a definition whose default state does not run or validate', () => {
    const failure = { ok: false, errors: [{ field: 'length', code: 'MALFORMED' }] } as const;
    const withRun = definePage({ calculator: { ...concreteCalculator, run: () => failure } });
    expect(() => pageViewOf(withRun, 'en', enCatalog)).toThrow(
      'the default run of concrete failed',
    );
    const withValidate = definePage({
      calculator: { ...concreteCalculator, validate: () => failure },
    });
    expect(() => pageViewOf(withValidate, 'en', enCatalog)).toThrow(
      'the default state of concrete failed',
    );
  });

  // spec: calculator-web-core › Page-view builder: a missing page key fails the build naming the key
  it('names the first message the catalog lacks', () => {
    const lacking = { ...enCatalog };
    delete lacking['calc.concrete.outputs.volumeYd3'];
    const error = pageModuleErrorOf(() => pageViewOf(concretePage, 'en', lacking));
    expect(error.code).toBe('PAGE_KEY');
    expect(error.cause).toEqual({ id: 'concrete', at: 'calc.concrete.outputs.volumeYd3' });
  });

  // the builder replays the creation checks of the controller (K15, OUTPUT_HINT), so a module that
  // would build a static page and die at mount fails `astro build` instead
  it('refuses a module with no shopping slot whose engine returns a line, as the controller does', () => {
    const module = definePage({ calculator: shoppingCalculator });
    const error = pageModuleErrorOf(() => pageViewOf(module, 'en', catalogOf()));
    expect(error.code).toBe('SHOPPING_LINES');
    expect(error.cause).toEqual({ id: 'shopping-fixture', at: undefined });
    expect(() => controllerOf(module)).toThrow(error.message);
  });

  const ft = { unit: 'ft', format: 'decimal', places: 2 } as const;
  it.each([
    ['imperial', { edge: ft }, 'span'],
    ['metric', { span: ft }, 'edge'],
  ] as const)(
    'refuses a %s primary that has no display hint and is not money, naming it as the controller does',
    (_system, hints, key) => {
      const module = definePage({
        calculator: hintedCalculator(hints),
        primary: { imperial: 'span', metric: 'edge' },
      });
      const error = pageModuleErrorOf(() => pageViewOf(module, 'en', catalogOf()));
      expect(error.code).toBe('OUTPUT_HINT');
      expect(error.cause).toEqual({ id: 'hinted-fixture', at: key });
      expect(() => controllerOf(module)).toThrow(error.message);
    },
  );
});

describe('the primary sentence protocol (the builder writes what the controller reads)', () => {
  const ft = { unit: 'ft', format: 'decimal', places: 2 } as const;
  const inch = { unit: 'in', format: 'decimal', places: 2 } as const;
  const env = (messages: Readonly<Record<string, string>>): Environment => ({
    messages,
    origin: 'https://example.test',
    path: '/fixture',
    switchPath: '/otro',
    helps: new Set(),
  });
  const pages: readonly (readonly [string, AnyPageModule, Messages])[] = [
    ['concrete, English', concretePage, { ...enCommon, ...enConcrete, ...enSite }],
    ['concrete, Spanish', concretePage, { ...esCommon, ...esConcrete, ...esSite }],
    [
      'a hinted primary per unit system',
      definePage({
        calculator: hintedCalculator({ span: ft, edge: inch }),
        primary: { imperial: 'span', metric: 'edge' },
      }),
      catalogOf(() => false, {
        'calc.hinted-fixture.page.span': 'Span {value} feet',
        'calc.hinted-fixture.page.edge': 'Edge {value} inches',
      }),
    ],
    [
      'a primary with no hint',
      definePage({ calculator: moneyCalculator }),
      catalogOf(() => false, { 'calc.money-fixture.page.cost': 'Total {value} dollars' }),
    ],
  ];

  // one rule, two readers: the name the builder gives a sentence is the name the controller looks up
  it.each(pages)(
    'gives the controller the sentence the builder wrote for each unit system: %s',
    (_what, module, catalog) => {
      const messages = Object.fromEntries(pageViewOf(module, 'en', catalog).messages);
      const controller = controllerOf(module);
      for (const system of ['imperial', 'metric'] as const) {
        const output = primaryOutputOf(module, system);
        const sentence = catalog[`calc.${module.id}.page.${output.key}`] ?? '{value}';
        expect(messages[sentenceNameOf(output)] ?? '{value}').toBe(sentence);
        const start = controller.start(env(messages), '');
        const { view } = controller.applyEvent(env(messages), start.state, {
          type: 'units',
          system,
        });
        const [before = '', after = ''] = sentence.split('{value}');
        expect([view.panel.primary.before, view.panel.primary.after]).toEqual([before, after]);
      }
    },
  );
});
