import { ALL_ERROR_CODES, type InputDescriptor } from '@maestro-calc/core';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import type { Locale } from '@maestro-calc/i18n';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import type {
  AreaField,
  Choice,
  ChoiceItemView,
  ConcreteFormView,
  ConcretePageView,
  ConcreteResultView,
  Field,
  FieldItemView,
  FormView,
  Split,
} from '../components/calculator/model.ts';
import { answerValues, figuresOf } from '../calculator/concrete/present.ts';
import { required, mustBeOk } from '../calculator/controller.ts';
import { formOf } from '../calculator/form-layout.ts';
import {
  fail,
  isTextInput,
  type AnyPageModule,
  type TextInput,
} from '../calculator/page-module.ts';
import { fieldText, fillMessage, percentText } from '../calculator/present.ts';
import { textsOf } from '../calculator/texts.ts';
import { DIMENSION_ORDER, SHAPE_FIELDS, SHAPES } from '../calculator/concrete/shapes.ts';
import { pathOf } from '../routing/routes.ts';
import { concrete } from './concrete.ts';

type Messages = Readonly<Record<string, string>>;

const CATALOGS: Record<Locale, Messages> = {
  en: { ...enCommon, ...enConcrete, ...enSite },
  es: { ...esCommon, ...esConcrete, ...esSite },
};

/** The catalog key of the hint of the unit a plain number is read in (US system). */
const HINTS: Readonly<Record<string, string>> = {
  ft: 'site.calculator.hintFt',
  in: 'site.calculator.hintIn',
};

const hintKeyOf = (unit: string): string => {
  const key = HINTS[unit];
  if (key === undefined) throw new Error(`no unit hint for ${unit}`);
  return key;
};

/** The page is built from the default state of the engine, with no query and the US unit system. */
const SYSTEM = 'imperial';

/** An input of the calculator by key; the completeness tests keep the keys and the engine equal. */
const inputOf = (key: string): InputDescriptor => {
  const found = concrete.inputs.find((input) => input.key === key);
  if (found === undefined) throw new Error(`concrete has no input ${key}`);
  return found;
};

const optionsOf = (key: string): readonly string[] => {
  const input = inputOf(key);
  if (input.kind !== 'select') throw new Error(`${key} is not a select`);
  return input.options;
};

const defaultOf = (key: string): string => {
  const input = inputOf(key);
  if (input.kind !== 'select') throw new Error(`${key} is not a select`);
  return input.default;
};

/** The default text of a field, as the script restores it: the unit the field is read in. */
const defaultText = (input: InputDescriptor): string => {
  switch (input.kind) {
    case 'length':
      return fieldText(input.default, input, SYSTEM);
    case 'count':
      return String(input.default);
    case 'percent':
      return percentText(input.default);
    default:
      return '';
  }
};

/** A page message by key, or the `PAGE_KEY` error that names the key the catalog lacks. */
const messageOf = (catalog: Messages, id: string, key: string): string =>
  catalog[key] ?? fail('PAGE_KEY', id, key);

/** The catalog key of the hint of a length unit (`ft` is `site.calculator.hintFt`). */
const unitHintKeyOf = (unit: string): string =>
  `site.calculator.hint${unit.charAt(0).toUpperCase()}${unit.slice(1)}`;

/**
 * The form of a module, resolved from its definition and the catalog: the unit toggle, then the
 * items of `formOf` in definition order (each select a choice group with the block it drives, each
 * text input a field with its stepper when the module has one), then the copy button. The labels
 * are `calc.<id>.inputs.*` and `calc.<id>.options.*`; the page copy is `calc.<id>.page.*`; a missing
 * key throws `PAGE_KEY` naming it.
 */
export const formViewOf = (module: AnyPageModule, catalog: Messages): FormView => {
  const { calculator } = module;
  const { id } = calculator;
  const text = (key: string): string => messageOf(catalog, id, key);
  const defaults = mustBeOk(calculator.validate({}), `the default state of ${id}`);
  const texts = textsOf(calculator, defaults, SYSTEM);
  const selects = new Map(
    calculator.inputs.flatMap((input) =>
      input.kind === 'select' ? [[input.key, input] as const] : [],
    ),
  );
  const inputs = new Map(
    calculator.inputs.flatMap((input) => (isTextInput(input) ? [[input.key, input] as const] : [])),
  );
  const groups = new Map(
    (module.choices?.groups ?? []).map((group) => [group.select, group] as const),
  );

  const fieldOf = (key: string): Field => {
    const input: TextInput = required(inputs.get(key), key);
    const help = catalog[`calc.${id}.page.${key}Help`];
    return {
      key,
      label: text(`calc.${id}.inputs.${key}`),
      value: required(texts[key], key),
      mode: input.kind === 'count' ? 'numeric' : 'decimal',
      ...(input.kind === 'money' ? { placeholder: '0.00' } : {}),
      ...(input.kind === 'length' ? { hint: text(unitHintKeyOf(input.defaultUnit)) } : {}),
      ...(help === undefined ? {} : { help }),
    };
  };

  const choiceOf = (
    key: string,
    area: { readonly fields: readonly string[]; readonly rows: number } | undefined,
  ): ChoiceItemView => {
    const select = required(selects.get(key), key);
    const shown = groups.get(key)?.shown(select.default) ?? [];
    const areaField = (field: string): AreaField => ({
      ...fieldOf(field),
      visible: shown.includes(field),
    });
    return {
      kind: 'choice',
      key,
      label: text(`calc.${id}.inputs.${key}`),
      choices: select.options.map((option) => ({
        id: option,
        label: text(`calc.${id}.options.${key}.${option}`),
        pressed: option === select.default,
      })),
      ...(area === undefined
        ? {}
        : { area: { rows: area.rows, fields: area.fields.map(areaField) } }),
    };
  };

  const fieldItemOf = (key: string, stepper: boolean): FieldItemView => ({
    kind: 'field',
    field: fieldOf(key),
    ...(stepper
      ? {
          stepper: {
            key,
            less: text(`calc.${id}.page.${key}Less`),
            more: text(`calc.${id}.page.${key}More`),
          },
        }
      : {}),
  });

  return {
    unitsLabel: text('site.calculator.unitsLabel'),
    units: [
      { id: 'imperial', label: text('site.calculator.unitsUs'), pressed: true },
      { id: 'metric', label: text('site.calculator.unitsMetric'), pressed: false },
    ],
    items: formOf(module).map((item) =>
      item.kind === 'choice'
        ? choiceOf(item.select, item.area)
        : fieldItemOf(item.key, item.stepper),
    ),
    copyLabel: text('site.calculator.copyLink'),
  };
};

/** Everything the concrete calculator page shows, resolved for `locale` from the engine and the catalogs. */
export const concreteView = (locale: Locale): ConcretePageView => {
  const messages = CATALOGS[locale];
  const text = (key: string): string => {
    const message = messages[key];
    if (message === undefined) throw new Error(`missing message ${key} for ${locale}`);
    return message;
  };
  const label = (key: string) => text(`calc.concrete.inputs.${key}`);
  const choices = (key: string): Choice[] =>
    optionsOf(key).map((id) => ({
      id,
      label: text(`calc.concrete.options.${key}.${id}`),
      pressed: id === defaultOf(key),
    }));
  const field = (key: string): Field => {
    const input = inputOf(key);
    const isCount = input.kind === 'count';
    return {
      key,
      label: label(key),
      value: defaultText(input),
      mode: isCount ? 'numeric' : 'decimal',
      ...(input.kind === 'money' ? { placeholder: '0.00' } : {}),
      ...(input.kind === 'length' ? { hint: text(hintKeyOf(input.defaultUnit)) } : {}),
    };
  };

  const raw = concrete.run({});
  const checked = concrete.validate({});
  if (!raw.ok || !checked.ok) throw new Error('the default state of concrete must run');
  const figures = figuresOf(checked.value, raw.value, CONCRETE_MIX_YIELDS, SYSTEM);
  const templates = {
    volumeYd3: text('calc.concrete.page.volumeYd3'),
    volumeM3: text('calc.concrete.page.volumeM3'),
  };
  const sentence = fillMessage(
    text(`calc.concrete.page.answer.${checked.value.shape}`),
    answerValues(
      {
        system: SYSTEM,
        choices: { shape: checked.value.shape, bag: checked.value.bag },
        valid: checked.value,
        result: raw.value,
      },
      fillMessage(templates.volumeYd3, { value: figures.volumeYd3 }),
    ),
  );
  const [before = '', after = ''] = templates.volumeYd3.split('{value}');
  const around = (template: string, name: string, value: string): Split => {
    const [head = '', tail = ''] = template.split(`{${name}}`);
    return { before: head, value, after: tail };
  };

  const defaultShape = defaultOf('shape');
  const form: ConcreteFormView = {
    unitsLabel: text('site.calculator.unitsLabel'),
    units: [
      { id: 'imperial', label: text('site.calculator.unitsUs'), pressed: true },
      { id: 'metric', label: text('site.calculator.unitsMetric'), pressed: false },
    ],
    shapeLabel: label('shape'),
    shapes: choices('shape'),
    fields: DIMENSION_ORDER.map((key) => {
      const shapes = SHAPES.filter((shape) => SHAPE_FIELDS[shape].some((used) => used === key));
      return { ...field(key), visible: shapes.some((shape) => shape === defaultShape) };
    }),
    waste: {
      ...field('waste'),
      help: text('calc.concrete.page.wasteHelp'),
      less: text('calc.concrete.page.wasteLess'),
      more: text('calc.concrete.page.wasteMore'),
    },
    bagLabel: label('bag'),
    bags: choices('bag'),
    prices: ['bagPrice', 'readyMixPrice'].map(field),
    copyLabel: text('site.calculator.copyLink'),
  };

  const output = (key: string) => text(`calc.concrete.outputs.${key}`);
  const result: ConcreteResultView = {
    heading: text('site.calculator.resultHeading'),
    primary: { key: 'volumeYd3', before, value: figures.volumeYd3, after },
    rows: [
      { key: 'volumeYd3', label: output('volumeYd3'), value: figures.volumeYd3, hidden: true },
      { key: 'volumeFt3', label: output('volumeFt3'), value: figures.volumeFt3 },
      { key: 'volumeM3', label: output('volumeM3'), value: figures.volumeM3 },
      { key: 'netVolume', label: output('netVolume'), value: figures.netVolume },
    ],
    shopping: {
      unit: `bag-${figures.bagLb}`,
      qty: figures.bags,
      label: around(text('calc.concrete.page.shoppingLine'), 'bagLb', figures.bagLb),
      bagYield: around(text('calc.concrete.page.bagYield'), 'yield', figures.bagYield),
    },
    costs: [
      {
        key: 'bagCost',
        label: output('bagCost'),
        value: figures.bagCost,
        visible: figures.bagCostVisible,
        hint: text('calc.concrete.page.priceHint'),
      },
      {
        key: 'readyMixCost',
        label: output('readyMixCost'),
        value: figures.readyMixCost,
        visible: figures.readyMixCostVisible,
        hint: text('calc.concrete.page.priceHint'),
      },
    ],
    readyMixNote: text('calc.concrete.page.readyMixNote'),
    estimateNote: text('site.calculator.estimateNote'),
    termsLabel: text('site.footer.terms'),
    termsHref: pathOf('terms', locale),
  };

  return {
    id: concrete.id,
    title: text('calc.concrete.title'),
    breadcrumb: {
      label: text('site.calculator.breadcrumb'),
      homeLabel: text('site.calculator.breadcrumbHome'),
      homeHref: pathOf('home', locale),
      current: text('calc.concrete.title'),
    },
    answer: sentence,
    notRunning: `${text('site.calculator.noscript')} ${text('calc.concrete.page.example')}`,
    form,
    result,
    templates: {
      errors: Object.fromEntries(ALL_ERROR_CODES.map((code) => [code, text(`errors.${code}`)])),
      answers: Object.fromEntries(
        SHAPES.map((id) => [id, text(`calc.concrete.page.answer.${id}`)]),
      ),
      copy: {
        copied: text('site.calculator.linkCopied'),
        failed: text('site.calculator.copyFailed'),
      },
      volumes: { yd3: templates.volumeYd3, m3: templates.volumeM3 },
      hints: {
        ft: text('site.calculator.hintFt'),
        in: text('site.calculator.hintIn'),
        m: text('site.calculator.hintM'),
        cm: text('site.calculator.hintCm'),
      },
    },
  };
};
