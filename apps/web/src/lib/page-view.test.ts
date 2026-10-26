import { ALL_ERROR_CODES } from '@maestro-calc/core';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  choiceCalculator,
  fieldsOf,
  formCalculator,
  lengthCalculator,
  pageModuleErrorOf,
} from '../__testing__/page-fixtures.ts';
import { concretePage } from '../calculator/concrete/page.ts';
import { definePage } from '../calculator/page-module.ts';
import { rectangleAreaPage } from '../calculator/rectangle-area/page.ts';
import { choiceSlot } from '../calculator/slots/choices.ts';
import type { concrete } from './concrete.ts';
import { concreteView, formViewOf } from './page-view.ts';

describe('concreteView (calculator-page › [CP1], [CP2], [CP3], [CP4], [CP15], [CP17], [CP43])', () => {
  // spec: calculator-page › [CP1] the default render, English
  it('describes the default English page from the engine and the catalogs', () => {
    const view = concreteView('en');
    expect(view.title).toBe('Concrete Calculator');
    expect(view.answer).toBe(
      'Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.',
    );
    expect(view.result.primary).toEqual({
      key: 'volumeYd3',
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
    expect(view.result.shopping).toEqual({
      unit: 'bag-80',
      qty: '74',
      label: { before: 'Concrete mix, ', value: '80', after: ' lb bags' },
      bagYield: { before: 'About ', value: '0.60', after: ' cubic feet per bag' },
    });
    expect(view.result.costs.map(({ key, visible }) => [key, visible])).toEqual([
      ['bagCost', false],
      ['readyMixCost', false],
    ]);
    expect(view.result.costs[0]?.hint).toBe('Add your price to see the cost');
  });

  // spec: calculator-page › [CP2] the default render, Spanish
  it('describes the default Spanish page with the same figures', () => {
    const view = concreteView('es');
    expect(view.title).toBe('Calculadora de Concreto');
    expect(view.answer).toBe(
      'Losa (12 ft × 10 ft, 4 in de espesor): 1.63 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 74.',
    );
    expect(view.result.primary.after).toBe(' yardas cúbicas');
    expect(view.result.shopping.label).toEqual({
      before: 'Mezcla de concreto, bolsas de ',
      value: '80',
      after: ' lb',
    });
    expect(view.result.shopping.bagYield).toEqual({
      before: 'Unos ',
      value: '0.60',
      after: ' pies cúbicos por bolsa',
    });
    expect(view.result.costs[0]?.hint).toBe('Agrega tu precio para ver el costo');
    expect(view.result.rows.map(({ value }) => value)).toEqual(['1.63', '44.00', '1.25', '40.00']);
  });

  // spec: calculator-page › [CP40] static: the "not running" note, then the example sentence
  it('joins the generic note and the calculator example', () => {
    expect(concreteView('en').notRunning).toBe(
      'This page needs JavaScript to recalculate. If it is off or did not load, the result below is the example. Example: a 12 ft by 10 ft slab, 4 in thick.',
    );
    expect(concreteView('es').notRunning).toBe(
      'Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo. Ejemplo: una losa de 12 ft por 10 ft, de 4 in de espesor.',
    );
  });

  // spec: calculator-page › [CP17] and [CP5] the paths come from the route table
  it('points the breadcrumb home and the terms link at the locale paths', () => {
    expect(concreteView('en').breadcrumb).toEqual({
      label: 'Breadcrumb',
      homeLabel: 'Home',
      homeHref: '/',
      current: 'Concrete Calculator',
    });
    expect(concreteView('es').breadcrumb.homeHref).toBe('/es');
    expect(concreteView('en').result.termsHref).toBe('/terms');
    expect(concreteView('es').result.termsHref).toBe('/es/terminos');
    expect(concreteView('es').result.termsLabel).toBe('Términos');
  });

  // spec: calculator-page › [CP43] raw messages for the templates, placeholders kept
  it('carries the twelve error messages, the four sentences and the copy states raw', () => {
    const { templates } = concreteView('en');
    expect(Object.keys(templates.errors)).toEqual([...ALL_ERROR_CODES]);
    expect(templates.errors['BELOW_MIN']).toBe(enCommon['errors.BELOW_MIN']);
    expect(templates.errors['BELOW_MIN']).toContain('{min}');
    expect(templates.errors['ABOVE_MAX']).toContain('{max}');
    expect(Object.keys(templates.answers)).toEqual(['slab', 'footing', 'column', 'steps']);
    expect(templates.answers['slab']).toContain('{bags}');
    expect(templates.copy).toEqual({
      copied: 'Link copied',
      failed: 'Could not copy. Select the link and copy it.',
    });
    expect(concreteView('es').templates.errors['MALFORMED']).toBe(esCommon['errors.MALFORMED']);
  });

  // spec: calculator-page › [CP51] the unit hint of the US system on every length field
  it('gives each length field the hint of the unit it is read in, and the others none', () => {
    const hints = Object.fromEntries(
      concreteView('en').form.fields.map(({ key, hint }) => [key, hint]),
    );
    expect(hints).toEqual({
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
    });
    expect(concreteView('es').form.fields.find(({ key }) => key === 'rise')?.hint).toBe('pulgadas');
    const { form } = concreteView('en');
    expect([form.waste.hint, ...form.prices.map(({ hint }) => hint)]).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });

  // spec: calculator-page › [CP51] the four hints travel as inert messages for the unit toggle
  it('carries the four unit hints in both locales for the script', () => {
    expect(concreteView('en').templates.hints).toEqual({
      ft: 'feet',
      in: 'inches',
      m: 'meters',
      cm: 'centimeters',
    });
    expect(concreteView('en').templates.volumes).toEqual({
      yd3: '{value} cubic yards',
      m3: '{value} cubic meters',
    });
    expect(concreteView('es').templates.hints).toEqual({
      ft: 'pies',
      in: 'pulgadas',
      m: 'metros',
      cm: 'centímetros',
    });
  });

  it('presses the defaults: US units, slab, 80 lb bags, and describes the groups', () => {
    const { form } = concreteView('en');
    expect(form.units.filter(({ pressed }) => pressed).map(({ id }) => id)).toEqual(['imperial']);
    expect(form.shapes.map(({ id, pressed }) => [id, pressed])).toEqual([
      ['slab', true],
      ['footing', false],
      ['column', false],
      ['steps', false],
    ]);
    expect(form.bags.map(({ id, pressed }) => [id, pressed])).toEqual([
      ['40', false],
      ['60', false],
      ['80', true],
    ]);
    expect(form.fields.map(({ key, visible }) => [key, visible])).toEqual([
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
    expect(form.waste).toMatchObject({ key: 'waste', value: '10', mode: 'decimal' });
    expect(form.prices.map(({ key, value, placeholder }) => [key, value, placeholder])).toEqual([
      ['bagPrice', '', '0.00'],
      ['readyMixPrice', '', '0.00'],
    ]);
  });
});

/** A catalog that answers every key with the key itself, except the keys `lacking` accepts. */
const catalogOf = (lacking: (key: string) => boolean = () => false) =>
  new Proxy<Record<string, string>>(
    {},
    { get: (_target, key) => (typeof key === 'string' && !lacking(key) ? key : undefined) },
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
/**
 * The builder reads the concrete definition once; these cases swap it for a broken copy (the real
 * one with one fact changed) to reach the guards that name a drifted definition or catalog.
 */
describe('concreteView guards (calculator-web-core › Page-view builder)', () => {
  const viewOf = async (change: (real: typeof concrete) => unknown) => {
    vi.resetModules();
    const real = await vi.importActual<{ concrete: typeof concrete }>('./concrete.ts');
    vi.doMock('./concrete.ts', () => ({ concrete: change(real.concrete) }));
    const { concreteView: broken } = await import('./page-view.ts');
    return () => broken('en');
  };
  const without = (key: string) => (real: typeof concrete) => ({
    ...real,
    inputs: real.inputs.filter((input) => input.key !== key),
  });
  const replacing = (key: string, input: object) => (real: typeof concrete) => ({
    ...real,
    inputs: real.inputs.map((found) => (found.key === key ? input : found)),
  });

  afterEach(() => {
    vi.doUnmock('./concrete.ts');
    vi.doUnmock('@maestro-calc/i18n/catalogs/en/concrete');
    vi.resetModules();
  });

  it('names the input a definition lacks', async () => {
    expect(await viewOf(without('bagPrice'))).toThrow('concrete has no input bagPrice');
  });

  it('names a select that is not one, whichever of its two reads meets it first', async () => {
    const count = (key: string) => ({ kind: 'count', key, urlKey: 'zz', default: 1 });
    expect(await viewOf(replacing('shape', count('shape')))).toThrow('shape is not a select');
    expect(await viewOf(replacing('bag', count('bag')))).toThrow('bag is not a select');
  });

  it('names a length unit that has no hint message', async () => {
    expect(
      await viewOf((real) => ({
        ...real,
        inputs: real.inputs.map((input) =>
          input.key === 'length' ? { ...input, defaultUnit: 'yd' } : input,
        ),
      })),
    ).toThrow('no unit hint for yd');
  });

  it('refuses a definition whose default state does not run or validate', async () => {
    const failure = { ok: false, error: { code: 'MALFORMED' } };
    expect(await viewOf((real) => ({ ...real, run: () => failure }))).toThrow(
      'the default state of concrete must run',
    );
    expect(await viewOf((real) => ({ ...real, validate: () => failure }))).toThrow(
      'the default state of concrete must run',
    );
  });

  it('names a message the catalog lacks', async () => {
    vi.resetModules();
    vi.doMock('@maestro-calc/i18n/catalogs/en/concrete', () => ({ enConcrete: {} }));
    const { concreteView: broken } = await import('./page-view.ts');
    expect(() => broken('en')).toThrow('missing message calc.concrete.page.volumeYd3 for en');
  });
});
