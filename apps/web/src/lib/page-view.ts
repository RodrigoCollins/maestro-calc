import { ALL_ERROR_CODES, type OutputDescriptor } from '@maestro-calc/core';
import type { Locale } from '@maestro-calc/i18n';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import type {
  AreaField,
  ChoiceItemView,
  ConcretePageView,
  FillSplit,
  Field,
  FieldItemView,
  FormView,
  ResultView,
} from '../components/calculator/model.ts';
import { concretePage } from '../calculator/concrete/page.ts';
import { answerValues } from '../calculator/concrete/present.ts';
import { required, mustBeOk, type Messages } from '../calculator/controller.ts';
import { formOf } from '../calculator/form-layout.ts';
import {
  fail,
  isTextInput,
  type AnyCalculator,
  type AnyPageModule,
  type Ready,
  type TextInput,
} from '../calculator/page-module.ts';
import { fillMessage, outputText } from '../calculator/present.ts';
import { textsOf } from '../calculator/texts.ts';
import { SHAPES } from '../calculator/concrete/shapes.ts';
import { pathOf } from '../routing/routes.ts';
import { concrete } from './concrete.ts';

const CATALOGS: Record<Locale, Messages> = {
  en: { ...enCommon, ...enConcrete, ...enSite },
  es: { ...esCommon, ...esConcrete, ...esSite },
};

/** A page message by key, or the `PAGE_KEY` error that names the key the catalog lacks. */
const messageOf = (catalog: Messages, id: string, key: string): string =>
  catalog[key] ?? fail('PAGE_KEY', id, key);

/** The catalog key of the hint of a length unit (`ft` is `site.calculator.hintFt`). */
const hintKeyOf = (unit: string): string =>
  `site.calculator.hint${unit.charAt(0).toUpperCase()}${unit.slice(1)}`;

/** The page is built from the default state of the engine, with no query and the US unit system. */
const SYSTEM = 'imperial';

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
      ...(input.kind === 'length' ? { hint: text(hintKeyOf(input.defaultUnit)) } : {}),
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

/** The state of a fresh page: no query, the US system, every select at its default, the engine run on it. */
const defaultMomentOf = (module: AnyPageModule): Ready<AnyCalculator> => {
  const { calculator } = module;
  return {
    system: SYSTEM,
    choices: Object.fromEntries(
      calculator.inputs.flatMap((input) =>
        input.kind === 'select' ? [[input.key, input.default]] : [],
      ),
    ),
    valid: mustBeOk(calculator.validate({}), `the default state of ${calculator.id}`),
    result: mustBeOk(calculator.run({}), `the default run of ${calculator.id}`),
  };
};

/** `before<value>after` around the first placeholder the fills name; plain text when none occurs. */
const fillSplitOf = (template: string, fills: Readonly<Record<string, string>>): FillSplit => {
  const name = Object.keys(fills).find((key) => template.includes(`{${key}}`));
  if (name === undefined) return { before: template, value: '', after: '' };
  const [before = '', after = ''] = template.split(`{${name}}`);
  return { name, before, value: required(fills[name], name), after };
};

/**
 * The result panel of a module for the default state: the primary figure, a row for every output
 * that has a display hint, one entry per declared shopping line, and the cost rows. Money outputs
 * show only through the cost slot. Labels are `calc.<id>.outputs.*`; the primary sentence is
 * `calc.<id>.page.<outputKey>` when the catalog has it (else the bare value); line, hint and note
 * texts are the page keys the slots name.
 */
export const resultViewOf = (
  module: AnyPageModule,
  locale: Locale,
  catalog: Messages,
): ResultView => {
  const { calculator, shopping, costs } = module;
  const { id, outputs } = calculator;
  const text = (key: string): string => messageOf(catalog, id, key);
  const page = (suffix: string): string => text(`calc.${id}.page.${suffix}`);
  const moment = defaultMomentOf(module);
  const figureOf = (descriptor: OutputDescriptor): string =>
    outputText(
      descriptor,
      required(
        moment.result.outputs.find(({ key }) => key === descriptor.key),
        descriptor.key,
      ).value,
    );
  const primary = required(
    outputs.find(({ key, role }) =>
      module.primary === undefined ? role === 'primary' : key === module.primary[SYSTEM],
    ),
    'primary output',
  );
  const [before = '', after = ''] = (catalog[`calc.${id}.page.${primary.key}`] ?? '{value}').split(
    '{value}',
  );
  const views = shopping === undefined ? [] : shopping.view(moment);

  return {
    heading: text('site.calculator.resultHeading'),
    primary: { key: primary.key, before, value: figureOf(primary), after },
    rows: outputs
      .filter(({ display }) => display !== undefined)
      .map((descriptor) => ({
        key: descriptor.key,
        label: text(`calc.${id}.outputs.${descriptor.key}`),
        value: figureOf(descriptor),
        ...(descriptor.key === primary.key ? { hidden: true } : {}),
      })),
    shopping:
      shopping === undefined
        ? []
        : shopping.lines.map(({ label, note }, index) => {
            const { unit, qty, fills } = required(views[index], 'shopping line');
            return {
              unit,
              qty,
              label: fillSplitOf(page(label), fills),
              ...(note === undefined ? {} : { note: fillSplitOf(page(note), fills) }),
            };
          }),
    costs:
      costs === undefined
        ? []
        : costs.rows.map(({ output }) => ({
            key: output,
            label: text(`calc.${id}.outputs.${output}`),
            value: figureOf(
              required(
                outputs.find(({ key }) => key === output),
                output,
              ),
            ),
            visible: costs.visible(moment.valid)[output] === true,
            hint: page(costs.hint),
          })),
    ...(costs?.note === undefined ? {} : { costsNote: page(costs.note) }),
    estimateNote: text('site.calculator.estimateNote'),
    termsLabel: text('site.footer.terms'),
    termsHref: pathOf('terms', locale),
  };
};

/** Everything the concrete calculator page shows, resolved for `locale` from the engine and the catalogs. */
export const concreteView = (locale: Locale): ConcretePageView => {
  const messages = CATALOGS[locale];
  const text = (key: string): string => messageOf(messages, concrete.id, key);

  const raw = concrete.run({});
  const checked = concrete.validate({});
  if (!raw.ok || !checked.ok) throw new Error('the default state of concrete must run');
  const result = resultViewOf(concretePage, locale, messages);
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
      fillMessage(templates.volumeYd3, { value: result.primary.value }),
    ),
  );
  const form = formViewOf(concretePage, messages);

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
