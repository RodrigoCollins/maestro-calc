import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { describe, expect, it, vi } from 'vitest';
import { concreteView } from '../../lib/page-view.ts';
import { err, Rational } from '@maestro-calc/core';
import { concrete } from '../../lib/concrete.ts';
import {
  controllerOf,
  copyAddress,
  copyOutcome,
  mustBeOk,
  required,
  type Environment,
  type Messages,
  type Output as ControllerOutput,
  type UiEvent as ControllerEvent,
} from '../controller.ts';
import { concretePage } from './page.ts';

type Output = ControllerOutput<typeof concrete>;
type UiEvent = ControllerEvent<typeof concrete>;

const controller = controllerOf(concretePage);
const start = (env: Environment, search: string): Output => controller.start(env, search);
const applyEvent = (env: Environment, state: Output['state'], event: UiEvent): Output =>
  controller.applyEvent(env, state, event);

// The engine is called through a spy that still computes, so the raw record can be read (CWC6).
vi.mock('../../lib/concrete.ts', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../lib/concrete.ts')>();
  return { concrete: { ...original.concrete, validate: vi.fn(original.concrete.validate) } };
});

/** The messages the page carries as templates, by name, for a locale (the script reads them from the DOM). */
const messagesOf = (locale: 'en' | 'es'): Messages => {
  const { templates } = concreteView(locale);
  const concrete = locale === 'en' ? enConcrete : esConcrete;
  return {
    ...Object.fromEntries(Object.entries(templates.errors).map(([k, v]) => [`errors.${k}`, v])),
    ...Object.fromEntries(Object.entries(templates.answers).map(([k, v]) => [`answer.${k}`, v])),
    'copy.copied': templates.copy.copied,
    'copy.failed': templates.copy.failed,
    ...Object.fromEntries(Object.entries(templates.hints).map(([k, v]) => [`hint.${k}`, v])),
    'volume.yd3': concrete['calc.concrete.page.volumeYd3'],
    'volume.m3': concrete['calc.concrete.page.volumeM3'],
  };
};

const EN: Environment = {
  messages: messagesOf('en'),
  origin: 'https://maestrocalc.com',
  path: '/concrete-calculator',
  switchPath: '/es/calculadora-de-concreto',
  helps: new Set(['waste']),
};
const ES: Environment = {
  messages: messagesOf('es'),
  origin: 'https://maestrocalc.com',
  path: '/es/calculadora-de-concreto',
  switchPath: '/concrete-calculator',
  helps: new Set(['waste']),
};

/** Applies the events in order from the page loaded with `search`; every step's output, last last. */
const run = (search: string, events: readonly UiEvent[], env: Environment = EN): Output[] => {
  const outputs: Output[] = [start(env, search)];
  for (const event of events) {
    const last = outputs.at(-1);
    if (last === undefined) throw new Error('no output');
    outputs.push(applyEvent(env, last.state, event));
  }
  return outputs;
};

const last = (search: string, events: readonly UiEvent[] = [], env: Environment = EN): Output => {
  const found = run(search, events, env).at(-1);
  if (found === undefined) throw new Error('no output');
  return found;
};

const THREE = ['length', 'width', 'thickness'] as const;
const type = (key: Extract<UiEvent, { type: 'text' }>['key'], text: string): UiEvent => ({
  type: 'text',
  key,
  text,
});
const shape = (id: string): UiEvent => ({ type: 'choice', select: 'shape', option: id });
const bag = (id: string): UiEvent => ({ type: 'choice', select: 'bag', option: id });
const units = (system: 'imperial' | 'metric'): UiEvent => ({ type: 'units', system });
const waste = (direction: 'less' | 'more'): UiEvent => ({ type: 'step', key: 'waste', direction });

/** The figures of the panel as the page shows them: yd3, ft3, m3, net, bags. */
const figures = ({ view }: Output) => [
  view.panel.figures.volumeYd3,
  view.panel.figures.volumeFt3,
  view.panel.figures.volumeM3,
  view.panel.figures.netVolume,
  view.panel.shopping[0]?.qty,
];

describe('controller: load (calculator-page › URL state, [CP25], [CP29])', () => {
  // spec: calculator-page › the default page equals the build-time render
  it('starts from the defaults with no notice and no write', () => {
    const out = last('');
    expect(out.view.choices.shape).toBe('slab');
    expect(out.view.answer).toBe(
      'Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.',
    );
    expect(figures(out)).toEqual(['1.63', '44.00', '1.25', '40.00', '74']);
    expect(out.view.notice).toBe('');
    expect(out.write).toBeUndefined();
    expect(out.view.fields.length.text).toBe('12 ft');
    expect(out.view.fields.thickness.text).toBe('4 in');
    expect(out.view.fields.waste.text).toBe('10');
    expect(out.view.fields.bagPrice.text).toBe('');
  });

  // spec: calculator-page › [CP25] restore from a shared link
  it('restores a footing from its link', () => {
    const out = last('?v=1&sh=footing&l=216&n=3');
    expect(out.view.choices.shape).toBe('footing');
    expect(out.view.fields.length.text).toBe('18 ft');
    expect(out.view.fields.count.text).toBe('3');
    expect(figures(out)).toEqual(['1.96', '52.80', '1.50', '48.00', '88']);
    expect(out.view.visible).toEqual(['length', 'footingWidth', 'footingDepth', 'count']);
    expect(out.write).toBeUndefined();
  });

  // spec: calculator-page › [CP29] bad and noisy links
  it('replaces bad values by the defaults and says so', () => {
    const out = last('?v=1&sh=Slab&bg=50&ws=51');
    expect(figures(out)).toEqual(['1.63', '44.00', '1.25', '40.00', '74']);
    expect(out.view.notice).toBe(enCommon['errors.INVALID_VALUE']);
    expect(out.write).toBeUndefined();
  });

  it('reads an unsupported version as the defaults with its own notice', () => {
    const out = last('?v=2&l=240');
    expect(figures(out)).toEqual(['1.63', '44.00', '1.25', '40.00', '74']);
    expect(out.view.notice).toBe(enCommon['errors.UNSUPPORTED_VERSION']);
  });

  it('keeps an analytics parameter out of the way: no notice, and a bare visit writes nothing', () => {
    const noisy = last('?utm_source=x&l=240');
    expect(noisy.view.fields.length.text).toBe('20 ft');
    expect(noisy.view.notice).toBe('');
    expect(noisy.write).toBeUndefined();
    const bare = run('?utm_source=x', [type('length', '20')]);
    expect(bare[0]?.write).toBeUndefined();
    expect(bare[1]?.write).toBe('?v=1&l=240');
  });

  it('answers in Spanish from the Spanish templates', () => {
    const out = last('?v=1&l=240', [], ES);
    expect(out.view.answer).toBe(
      'Losa (20 ft × 10 ft, 4 in de espesor): 2.72 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 123.',
    );
    expect(out.view.fields.length.hint).toBe('pies');
    expect(last('?v=2', [], ES).view.notice).toBe(esCommon['errors.UNSUPPORTED_VERSION']);
  });
});

describe('controller: edits (calculator-page › Live recalculation, [CP19]–[CP22])', () => {
  // spec: calculator-page › [CP19] typing updates the result
  it('recalculates on typing and keeps what was typed', () => {
    const out = last('', [type('length', '20')]);
    expect(out.view.answer).toBe(
      'Slab (20 ft × 10 ft, 4 in thick): 2.72 cubic yards with 10% extra. Bags of 80 lb: 123.',
    );
    expect(figures(out)).toEqual(['2.72', '73.33', '2.08', '66.67', '123']);
    expect(out.view.fields.length.text).toBe('20');
  });

  // spec: calculator-page › [CP20] shape switching
  it.each([
    ['footing', ['0.43', '11.73', '0.33', '10.67', '20'], 'Footing ('],
    ['column', ['0.26', '6.91', '0.20', '6.28', '12'], 'Column ('],
    ['steps', ['0.52', '14.12', '0.40', '12.83', '24'], 'Steps ('],
  ] as const)('shows the %s defaults', (id, expected, start_) => {
    const out = last('', [shape(id)]);
    expect(figures(out)).toEqual(expected);
    expect(out.view.answer?.startsWith(start_)).toBe(true);
    expect(out.view.choices.shape).toBe(id);
  });

  // spec: calculator-page › [CP21] bag size
  it('changes the bags and the yield line, not the volumes', () => {
    const sixty = last('', [bag('60')]);
    const forty = last('', [bag('60'), bag('40')]);
    expect(figures(sixty)).toEqual(['1.63', '44.00', '1.25', '40.00', '98']);
    expect(sixty.view.panel.shopping[0]?.fills['yield']).toBe('0.45');
    expect(sixty.view.panel.shopping[0]?.fills['bagLb']).toBe('60');
    expect(sixty.view.answer?.endsWith('Bags of 60 lb: 98.')).toBe(true);
    expect(figures(forty)).toEqual(['1.63', '44.00', '1.25', '40.00', '147']);
    expect(forty.view.panel.shopping[0]?.fills['yield']).toBe('0.30');
    expect(forty.view.answer?.endsWith('Bags of 40 lb: 147.')).toBe(true);
  });

  // spec: calculator-page › [CP22] waste field and steppers
  it('takes the waste from the field and from the steppers', () => {
    const zero = last('', [type('waste', '0')]);
    expect(figures(zero)).toEqual(['1.48', '40.00', '1.13', '40.00', '67']);
    const more = last('', [waste('more')]);
    expect(more.view.fields.waste.text).toBe('15');
    expect(figures(more)).toEqual(['1.70', '46.00', '1.30', '40.00', '77']);
    expect(more.write).toBe('?v=1&ws=15');
  });

  it('leaves everything as it was at the ends of the waste range', () => {
    const atZero = last('', [type('waste', '0'), waste('less')]);
    const before = last('', [type('waste', '0')]);
    expect(atZero.view).toEqual(before.view);
    expect(atZero.write).toBeUndefined();
    const fifty = last('', [type('waste', '50')]);
    const atFifty = last('', [type('waste', '50'), waste('more')]);
    expect(atFifty.view).toEqual(fifty.view);
    expect(atFifty.write).toBeUndefined();
    expect(last('', [waste('less')]).view.fields.waste.text).toBe('5');
  });

  it('steps from the last valid waste when the field is invalid', () => {
    const out = last('', [type('waste', 'abc'), waste('more')]);
    expect(out.view.fields.waste.text).toBe('15');
    expect(out.view.fields.waste.invalid).toBe(false);
  });

  // spec: calculator-page › [CP22]: the step starts from the typed waste even while another field is invalid
  it('steps from a valid typed waste while another field is invalid', () => {
    const out = last('', [type('width', 'abc'), type('waste', '20'), waste('more')]);
    expect(out.view.fields.waste.text).toBe('25');
    expect(out.view.fields.waste.invalid).toBe(false);
    expect(out.view.fields.width.invalid).toBe(true);
    expect(out.write).toBeUndefined();
    const less = last('', [type('width', 'abc'), type('waste', '20'), waste('less')]);
    expect(less.view.fields.waste.text).toBe('15');
  });

  // spec: calculator-page › [CP16], [CP18] costs
  it('shows the bag cost with a bag price and the ready-mix cost with its price', () => {
    const priced = last('', [type('bagPrice', '6.50')]);
    expect(priced.view.panel.figures.bagCost).toBe('$481.00');
    expect(priced.view.panel.costs.bagCost).toBe(true);
    expect(priced.view.panel.costs.readyMixCost).toBe(false);
    const both = last('', [type('bagPrice', '6.50'), type('readyMixPrice', '150')]);
    expect(both.view.panel.figures.readyMixCost).toBe('$244.44');
    expect(both.view.panel.costs.readyMixCost).toBe(true);
  });

  it('does not round the ready-mix volume to a truck increment', () => {
    const out = last('', [type('length', '20'), type('readyMixPrice', '150')]);
    expect(out.view.panel.figures.volumeYd3).toBe('2.72');
    expect(out.view.panel.figures.readyMixCost).toBe('$407.41');
  });

  // spec: calculator-page › DR-11: an empty price is an explicit undefined that overrides the last valid state
  it('reads a cleared price as zero, hides its cost and drops it from the query', () => {
    const typed = last('', [type('bagPrice', '6.50')]);
    const cleared = last('', [type('bagPrice', '6.50'), type('bagPrice', '')]);
    expect(typed.write).toBe('?v=1&bp=13/2');
    expect(cleared.view.panel.costs.bagCost).toBe(false);
    expect(cleared.view.panel.figures.bagCost).toBe('$0.00');
    expect(cleared.write).toBe('?v=1');
    expect(cleared.view.fields.bagPrice.invalid).toBe(false);
  });

  it('restores a price from its link as the text a person types', () => {
    const out = last('?v=1&bp=13/2&rp=150');
    expect(out.view.fields.bagPrice.text).toBe('6.50');
    expect(out.view.fields.readyMixPrice.text).toBe('150.00');
    expect(out.view.panel.figures.bagCost).toBe('$481.00');
  });
});

describe('controller: URL writes (calculator-page › [CP26]–[CP28])', () => {
  // spec: calculator-page › [CP26] writing the query
  it('writes the query after each valid change, and only then', () => {
    const outs = run('', [type('length', '20'), bag('60'), type('bagPrice', '6.50')]);
    expect(outs.map(({ write }) => write)).toEqual([
      undefined,
      '?v=1&l=240',
      '?v=1&l=240&bg=60',
      '?v=1&l=240&bg=60&bp=13/2',
    ]);
  });

  // spec: calculator-page › [CP27] back to defaults
  it('returns the query to v=1 when the value is the default again', () => {
    expect(last('?v=1&l=240', [type('length', '12')]).write).toBe('?v=1');
  });

  // spec: calculator-page › [CP28] reload keeps the state
  it('decodes what it wrote back to the same figures and answer', () => {
    const typed = last('', [shape('footing'), type('length', '18'), type('count', '3'), bag('60')]);
    expect(typed.write).toBe('?v=1&sh=footing&l=216&n=3&bg=60');
    const reloaded = last(typed.write ?? '');
    expect(reloaded.view.answer).toBe(typed.view.answer);
    expect(reloaded.view.panel).toEqual(typed.view.panel);
    expect(reloaded.view.fields.length.text).toBe('18 ft');
    expect(reloaded.write).toBeUndefined();
  });
});

describe('controller: errors (calculator-page › Errors without a button, [CP30]–[CP32], [CP46])', () => {
  // spec: calculator-page › [CP30] malformed length
  it('marks the field, dashes the answer and the figures, and does not write', () => {
    const bad = last('?v=1&l=240', [type('length', 'abc')]);
    const fixed = last('?v=1&l=240', [type('length', 'abc'), type('length', '20')]);
    const field = bad.view.fields.length;
    expect(field).toMatchObject({
      invalid: true,
      message: 'This value is not valid.',
      describedBy: 'calc-length-error',
      messageId: 'calc-length-error',
    });
    expect(bad.view.answer).toBe('—');
    expect(figures(bad)).toEqual(['—', '—', '—', '—', '—']);
    expect(bad.view.panel.shopping[0]?.fills['yield']).toBe('—');
    expect(bad.write).toBeUndefined();
    expect(fixed.view.fields.length.invalid).toBe(false);
    expect(fixed.view.fields.length.describedBy).toBe('calc-length-hint');
    expect(figures(fixed)).toEqual(['2.72', '73.33', '2.08', '66.67', '123']);
    expect(fixed.view.panel.shopping[0]?.qty).toBe('123');
  });

  // spec: calculator-page › [CP31] bounds with formatted limits
  it.each([
    [[type('length', '1001 ft')], 'length', 'The value must be at most 1,000 ft.'],
    [[type('waste', '51')], 'waste', 'The value must be at most 50%.'],
    [[shape('footing'), type('count', '1001')], 'count', 'The value must be at most 1,000.'],
    [[shape('footing'), type('count', '0')], 'count', 'The value must be at least 1.'],
  ] as const)('words the bound of %# in the unit of its field', (events, key, message) => {
    expect(last('', events).view.fields[key].message).toBe(message);
  });

  // spec: calculator-page › [CP32] comma and unit errors
  it('names the decimal comma and the unknown unit and computes no figure', () => {
    const comma = last('', [type('thickness', '1,5')]);
    expect(comma.view.fields.thickness.message).toBe(enCommon['errors.DECIMAL_COMMA']);
    expect(figures(comma)).toEqual(['—', '—', '—', '—', '—']);
    const unit = last('', [type('thickness', '5 furlongs')]);
    expect(unit.view.fields.thickness.message).toBe(enCommon['errors.UNKNOWN_UNIT']);
  });

  it('shows every invalid field at once', () => {
    const out = last('', [type('length', 'abc'), type('width', '5 furlongs')]);
    expect([out.view.fields.length.invalid, out.view.fields.width.invalid]).toEqual([true, true]);
  });

  it('never lets a hidden field block the visible shape', () => {
    const column = last('', [type('length', 'abc'), shape('column')]);
    expect(column.view.answer?.startsWith('Column (')).toBe(true);
    expect(column.view.fields.length.invalid).toBe(false);
    expect(column.write).toBe('?v=1&sh=column');
    const returned = last('', [type('length', 'abc'), shape('column'), shape('slab')]);
    expect(returned.view.fields.length.invalid).toBe(true);
    expect(returned.view.answer).toBe('—');
  });

  it('ignores a shape or bag id the page does not offer', () => {
    const base = last('');
    expect(last('', [shape('dome')]).view).toEqual(base.view);
    expect(last('', [bag('50')]).view).toEqual(base.view);
  });
});

describe('controller: units (calculator-page › Unit system toggle, [CP33]–[CP35], [CP50])', () => {
  // spec: calculator-page › [CP33] toggle keeps the state
  it('rewrites the field texts and the figures in metric and back without changing the state', () => {
    const metric = last('', [units('metric')]);
    const us = last('', [units('metric'), units('imperial')]);
    expect(THREE.map((key) => metric.view.fields[key].text)).toEqual([
      '3.6576 m',
      '3.048 m',
      '10.16 cm',
    ]);
    expect(metric.write).toBe('?v=1&u=m');
    expect(metric.view.panel.primary).toEqual({
      key: 'volumeM3',
      before: '',
      value: '1.25',
      after: ' cubic meters',
    });
    expect(metric.view.panel.figures.volumeYd3).toBe('1.63');
    expect(metric.view.panel.figures.volumeFt3).toBe('44.00');
    expect(metric.view.panel.shopping[0]?.qty).toBe('74');
    expect(metric.view.answer).toBe(
      'Slab (3.66 m × 3.05 m, 10.16 cm thick): 1.25 cubic meters with 10% extra. Bags of 80 lb: 74.',
    );
    expect(metric.view.fields.length.hint).toBe('meters');
    expect(metric.view.fields.thickness.hint).toBe('centimeters');
    expect(THREE.map((key) => us.view.fields[key].text)).toEqual(['12 ft', '10 ft', '4 in']);
    expect(us.write).toBe('?v=1');
    expect(us.view.panel.primary.key).toBe('volumeYd3');
    expect(us.view.fields.length.hint).toBe('feet');
  });

  // spec: calculator-page › [CP34] metric entry
  it('reads bare numbers as meters and centimeters', () => {
    const out = last('', [
      units('metric'),
      type('length', '4'),
      type('width', '3'),
      type('thickness', '10'),
    ]);
    expect(out.view.panel.primary.value).toBe('1.32');
    expect(out.view.panel.figures.volumeYd3).toBe('1.73');
    expect(out.view.panel.figures.volumeFt3).toBe('46.62');
    expect(out.view.panel.figures.netVolume).toBe('42.38');
    expect(out.view.panel.shopping[0]?.qty).toBe('78');
    expect(out.write).toBe('?v=1&u=m&l=20000/127&w=15000/127&t=500/127');
  });

  // spec: calculator-page › [CP35] explicit units win
  it('lets an explicit unit win over the metric default', () => {
    expect(last('', [units('metric'), type('length', '20 ft')]).write).toBe('?v=1&u=m&l=240');
  });

  // spec: calculator-page › [CP50] metric entry back to US is exact
  it('goes back to US with the exact inches, the same figures and the same query', () => {
    const metric = last('', [units('metric'), type('length', '4')]);
    const us = last('', [units('metric'), type('length', '4'), units('imperial')]);
    expect(us.view.fields.length.text).toBe('20000/127 in');
    expect(us.view.panel.figures.volumeYd3).toBe(metric.view.panel.figures.volumeYd3);
    expect(us.write).toBe('?v=1&l=20000/127');
    const again = last('', [
      units('metric'),
      type('length', '4'),
      units('imperial'),
      units('metric'),
    ]);
    expect(again.view.fields.length.text).toBe('4 m');
  });

  it('keeps a typed text that is invalid when the units change, and converts the valid ones', () => {
    const out = last('', [type('width', 'abc'), units('metric')]);
    expect(out.view.fields.width.text).toBe('abc');
    expect(out.view.fields.width.invalid).toBe(true);
    expect(out.view.fields.length.text).toBe('3.6576 m');
    expect(out.write).toBeUndefined();
  });

  // spec: calculator-page › [CP53] switching units never changes what was typed
  it('keeps a bare number that is out of range in the unit it was typed in', () => {
    const metric = last('', [type('thickness', '150'), units('metric')]);
    expect(metric.view.fields.thickness.text).toBe('150 in');
    expect(metric.view.fields.thickness.invalid).toBe(true);
    expect(metric.write).toBeUndefined();
    expect(metric.state.search).toBe('');
    expect(metric.view.answer).toBe('—');
    const back = last('', [type('thickness', '150'), units('metric'), units('imperial')]);
    expect(back.view.fields.thickness.text).toBe('150 in');
    expect(back.view.fields.thickness.invalid).toBe(true);
    expect(back.write).toBeUndefined();
  });

  it('keeps a metric bare number that is out of range in centimeters back in US', () => {
    const us = last('?v=1&u=m', [type('thickness', '400'), units('imperial')]);
    expect(us.view.fields.thickness.text).toBe('400 cm');
    expect(us.view.fields.thickness.invalid).toBe(true);
    expect(us.write).toBeUndefined();
    const meters = last('?v=1&u=m', [type('length', '5000'), units('imperial')]);
    expect(meters.view.fields.length.text).toBe('5000 m');
    expect(meters.view.fields.length.invalid).toBe(true);
  });

  it('leaves a text with its own unit and an unreadable text as typed', () => {
    const text = (value: string) =>
      last('', [type('thickness', value), units('metric')]).view.fields.thickness.text;
    expect(text('150 in')).toBe('150 in');
    expect(text('5 yd')).toBe('5 yd');
    expect(text('5 furlongs')).toBe('5 furlongs');
    expect(text('1,5')).toBe('1,5');
    expect(text('150')).toBe('150 in');
  });

  it('keeps an invalid text of a field that is not a length as typed', () => {
    const out = last('', [
      shape('footing'),
      type('waste', '51'),
      type('count', 'abc'),
      units('metric'),
    ]);
    expect(out.view.fields.waste.text).toBe('51');
    expect(out.view.fields.waste.invalid).toBe(true);
    expect(out.view.fields.count.text).toBe('abc');
    expect(out.view.fields.count.invalid).toBe(true);
    expect(out.write).toBeUndefined();
  });

  it('restores a metric link in metric', () => {
    const out = last('?v=1&u=m&l=240');
    expect(out.view.fields.length.text).toBe('6.096 m');
    expect(out.view.panel.primary.key).toBe('volumeM3');
  });
});

describe('controller: link notice (calculator-page › [CP52])', () => {
  const BAD = '?v=1&sh=Slab&bg=50&ws=51';

  it('goes with the first valid edit, which rewrites the address', () => {
    const start = last(BAD);
    expect(start.view.notice).toBe(EN.messages['errors.INVALID_VALUE']);
    const edited = last(BAD, [type('length', '20')]);
    expect(edited.write).toBe('?v=1&l=240');
    expect(edited.view.notice).toBe('');
    expect(edited.state.notice).toBe('');
  });

  it('stays while an edit is invalid and writes nothing', () => {
    const edited = last(BAD, [type('length', 'abc')]);
    expect(edited.write).toBeUndefined();
    expect(edited.view.notice).toBe(EN.messages['errors.INVALID_VALUE']);
  });
});

describe('controller: language switch and copy (calculator-page › [CP36]–[CP39], site-routing-i18n › [SR20], [SR21])', () => {
  // spec: calculator-page › [CP36], [CP37]; site-routing-i18n › [SR20]
  it('points the switch at the counterpart path with the current query', () => {
    expect(last('?v=1&l=240').view.switchHref).toBe('/es/calculadora-de-concreto?v=1&l=240');
    expect(last('').view.switchHref).toBe('/es/calculadora-de-concreto');
    expect(last('', [], ES).view.switchHref).toBe('/concrete-calculator');
  });

  // spec: site-routing-i18n › [SR21] the follow-up after a bag edit
  it('follows a write, and stays put while a field is invalid', () => {
    const edited = last('', [bag('60')]);
    const invalid = last('', [bag('60'), type('length', 'abc')]);
    expect(edited.view.switchHref).toBe('/es/calculadora-de-concreto?v=1&bg=60');
    expect(invalid.view.switchHref).toBe('/es/calculadora-de-concreto?v=1&bg=60');
  });

  // spec: calculator-page › [CP38] copy succeeds
  it('copies the absolute address with the query and says so', () => {
    const out = last('', [waste('more')]);
    const address = copyAddress(EN, out.state);
    expect(address).toBe('https://maestrocalc.com/concrete-calculator?v=1&ws=15');
    expect(copyOutcome(EN, true, address)).toEqual({ message: 'Link copied' });
  });

  // spec: calculator-page › [CP39] copy fails
  it('offers the address in a read-only field when the copy is rejected', () => {
    const address = copyAddress(EN, last('', [waste('more')]).state);
    expect(copyOutcome(EN, false, address)).toEqual({
      message: 'Could not copy. Select the link and copy it.',
      address,
    });
  });

  it('copies the plain page address on a bare visit', () => {
    expect(copyAddress(ES, last('', [], ES).state)).toBe(
      'https://maestrocalc.com/es/calculadora-de-concreto',
    );
  });
});

describe('controller: invariants and edges', () => {
  it('says what is missing when an invariant breaks', () => {
    expect(() => {
      required(undefined, 'input x');
    }).toThrow('missing input x');
    expect(required(0, 'zero')).toBe(0);
    expect(() => {
      mustBeOk(err({ field: 'x' }), 'a run');
    }).toThrow('a run failed');
  });

  it('reads a message the page lacks as empty text instead of failing', () => {
    const out = last('?v=2', [], { ...EN, messages: {} });
    expect(out.view.notice).toBe('');
    expect(out.view.answer).toBe('');
    expect(out.view.panel.primary).toMatchObject({ before: '', after: '' });
    expect(out.view.fields.length.hint).toBe('');
  });

  it('keeps the state when the unit system pressed is the one already chosen', () => {
    const first = last('?v=1&u=m');
    const again = last('?v=1&u=m', [units('metric')]);
    expect(again.view).toEqual(first.view);
    expect(again.write).toBeUndefined();
  });

  it('steps the waste within the range the engine allows, five points at a time', () => {
    const input = concrete.inputs.find(({ key }) => key === 'waste');
    expect(input?.kind === 'percent' && [input.min, input.max]).toEqual([
      Rational.of(0),
      Rational.of(50),
    ]);
    expect(last('', [type('waste', '48'), waste('more')]).view.fields.waste.text).toBe('50');
    expect(last('', [type('waste', '3'), waste('less')]).view.fields.waste.text).toBe('0');
  });
});

describe('controller: raw record and helps (calculator-web-core › [CWC6], [CWC18]; K7)', () => {
  const rawOfLastCall = () => {
    const [raw] = vi.mocked(concrete.validate).mock.calls.at(-1) ?? [];
    if (raw === undefined) throw new Error('the engine was not called');
    return raw;
  };

  // spec: calculator-web-core › [CWC6] an empty price is an explicit undefined key
  it('hands the engine an own undefined key for an empty price, over the last valid state', () => {
    vi.mocked(concrete.validate).mockClear();
    last('', [type('bagPrice', '6.50'), type('bagPrice', ''), type('length', '20')]);
    const raw = rawOfLastCall();
    expect(Object.hasOwn(raw, 'bagPrice')).toBe(true);
    expect(raw['bagPrice']).toBeUndefined();
    expect(raw['readyMixPrice']).toBeUndefined();
    expect([raw['length'], raw['width'], raw['waste']]).toEqual(['20', '10 ft', '10']);
    expect([raw['shape'], raw['bag']]).toEqual(['slab', '80']);
  });

  // spec: calculator-web-core › Generic controller behaviour: a hidden field keeps its value
  it('reads a hidden field from the last valid state, not from its text', () => {
    last('', [type('footingWidth', 'abc'), type('length', '20')]);
    const hidden = rawOfLastCall()['footingWidth'];
    expect(hidden).toEqual(mustBeOk(concrete.validate({}), 'defaults').footingWidth);
  });

  // spec: calculator-web-core › [CWC18] a field with help is described by it while valid
  it('describes a field by its help while it has no error, and a field without help by nothing', () => {
    const out = last('');
    expect(out.view.fields.waste.describedBy).toBe('calc-waste-help');
    expect(out.view.fields.count.describedBy).toBe('');
    expect(out.view.fields.length.describedBy).toBe('calc-length-hint');
    const none = last('', [], { ...EN, helps: new Set() });
    expect(none.view.fields.waste.describedBy).toBe('');
    const invalid = last('', [type('waste', '51')]);
    expect(invalid.view.fields.waste.describedBy).toBe('calc-waste-error');
  });

  // spec: calculator-page › [CP11] the fields a shape does not show are hidden, the others are not
  it('marks the driven fields the shape does not show as hidden', () => {
    const slab = last('').view.fields;
    expect([slab.length.hidden, slab.footingWidth.hidden, slab.stepCount.hidden]).toEqual([
      false,
      true,
      true,
    ]);
    expect([slab.waste.hidden, slab.bagPrice.hidden]).toEqual([false, false]);
    const steps = last('', [shape('steps')]).view.fields;
    expect([steps.length.hidden, steps.rise.hidden, steps.stepCount.hidden]).toEqual([
      true,
      false,
      false,
    ]);
  });
});
