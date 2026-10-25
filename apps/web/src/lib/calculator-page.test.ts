import { ALL_ERROR_CODES } from '@maestro-calc/core';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { describe, expect, it } from 'vitest';
import { concreteView } from './calculator-page.ts';

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
    expect(view.result.rows.map(({ key, value }) => [key, value])).toEqual([
      ['volumeFt3', '44.00'],
      ['volumeM3', '1.25'],
      ['netVolume', '40.00'],
    ]);
    expect(view.result.shopping).toEqual({
      unit: 'bag-80',
      label: 'Concrete mix, 80 lb bags',
      qty: '74',
      bagYield: 'About 0.60 cubic feet per bag',
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
    expect(view.result.shopping.label).toBe('Mezcla de concreto, bolsas de 80 lb');
    expect(view.result.shopping.bagYield).toBe('Unos 0.60 pies cúbicos por bolsa');
    expect(view.result.costs[0]?.hint).toBe('Agrega tu precio para ver el costo');
    expect(view.result.rows.map(({ value }) => value)).toEqual(['44.00', '1.25', '40.00']);
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
    expect(form.groups.map(({ id, visible }) => [id, visible])).toEqual([
      ['slab', true],
      ['footing', false],
      ['column', false],
      ['steps', false],
    ]);
    expect(form.waste).toMatchObject({ key: 'waste', value: '10', mode: 'decimal' });
    expect(form.prices.map(({ key, value, placeholder }) => [key, value, placeholder])).toEqual([
      ['bagPrice', '', '0.00'],
      ['readyMixPrice', '', '0.00'],
    ]);
  });
});
