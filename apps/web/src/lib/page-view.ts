import { ALL_ERROR_CODES, type OutputDescriptor, type UnitSystem } from '@maestro-calc/core';
import type { Locale } from '@maestro-calc/i18n';
import type {
  AreaField,
  ChoiceItemView,
  CalculatorPageView,
  FillSplit,
  Field,
  FieldItemView,
  FormView,
  ResultView,
} from '../components/calculator/model.ts';
import { checkModule, required, mustBeOk, type Messages } from '../calculator/controller.ts';
import { formOf } from '../calculator/form-layout.ts';
import {
  fail,
  isTextInput,
  primaryOutputOf,
  sentenceNameOf,
  type AnyCalculator,
  type AnyPageModule,
  type Ready,
  type TextInput,
} from '../calculator/page-module.ts';
import { fillMessage, outputText } from '../calculator/present.ts';
import { textsOf } from '../calculator/texts.ts';
import { pathOf } from '../routing/routes.ts';

/** A page message by key, or the `PAGE_KEY` error that names the key the catalog lacks. */
const messageOf = (catalog: Messages, id: string, key: string): string =>
  catalog[key] ?? fail('PAGE_KEY', id, key);

/** The catalog key of the hint of a length unit (`ft` is `site.calculator.hintFt`). */
const hintKeyOf = (unit: string): string =>
  `site.calculator.hint${unit.charAt(0).toUpperCase()}${unit.slice(1)}`;

/** The catalog key of a piece of page copy of the calculator `id` (`calc.<id>.page.<suffix>`). */
const pageKey = (id: string, suffix: string): string => `calc.${id}.page.${suffix}`;

/** The page is built from the default state of the engine, with no query and the US unit system. */
const SYSTEM = 'imperial';

const UNIT_SYSTEMS = ['imperial', 'metric'] as const;

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

/** The form of a module at `moment`, the default state (see `formViewOf`). */
const formViewAt = (
  module: AnyPageModule,
  catalog: Messages,
  moment: Ready<AnyCalculator>,
): FormView => {
  const { calculator } = module;
  const { id } = calculator;
  const text = (key: string): string => messageOf(catalog, id, key);
  const texts = textsOf(calculator, moment.valid, SYSTEM);
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
    const help = catalog[pageKey(id, `${key}Help`)];
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
            less: text(pageKey(id, `${key}Less`)),
            more: text(pageKey(id, `${key}More`)),
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
    shareLabel: text('site.calculator.shareWhatsApp'),
  };
};

/**
 * The form of a module, resolved from its definition and the catalog: the unit toggle, then the
 * items of `formOf` in definition order (each select a choice group with the block it drives, each
 * text input a field with its stepper when the module has one), then the copy button. The labels
 * are `calc.<id>.inputs.*` and `calc.<id>.options.*`; the page copy is `calc.<id>.page.*`; a missing
 * key throws `PAGE_KEY` naming it.
 */
export const formViewOf = (module: AnyPageModule, catalog: Messages): FormView =>
  formViewAt(module, catalog, defaultMomentOf(module));

/**
 * `before<value>after` around the one placeholder of the page text `suffix` that the fills name;
 * plain text when none occurs. A text that carries a second placeholder (another fill, or the same
 * one again) would render it as literal `{name}` text with no `data-fill` element, so it throws
 * `SHOPPING_LINES` naming the page-key suffix.
 */
const fillSplitOf = (
  id: string,
  suffix: string,
  template: string,
  fills: Readonly<Record<string, string>>,
): FillSplit => {
  const names = Object.keys(fills);
  const name = names.find((key) => template.includes(`{${key}}`));
  if (name === undefined) return { before: template, value: '', after: '' };
  const [before = '', after = '', ...again] = template.split(`{${name}}`);
  const leftover = `${before}${after}`;
  return again.length > 0 || names.some((key) => leftover.includes(`{${key}}`))
    ? fail('SHOPPING_LINES', id, suffix)
    : { name, before, value: required(fills[name], name), after };
};

/** The primary sentence of a unit system: the page key of its output when the catalog has it, else the bare value. */
const sentenceOf = (module: AnyPageModule, catalog: Messages, system: UnitSystem): string =>
  catalog[pageKey(module.id, primaryOutputOf(module, system).key)] ?? '{value}';

/** The result panel of a module at `moment`, the default state (see `resultViewOf`). */
const resultViewAt = (
  module: AnyPageModule,
  locale: Locale,
  catalog: Messages,
  moment: Ready<AnyCalculator>,
): ResultView => {
  const { calculator, shopping, costs, drawing } = module;
  const { id, outputs } = calculator;
  const text = (key: string): string => messageOf(catalog, id, key);
  const page = (suffix: string): string => text(pageKey(id, suffix));
  const figureOf = (descriptor: OutputDescriptor): string =>
    outputText(
      descriptor,
      required(
        moment.result.outputs.find(({ key }) => key === descriptor.key),
        descriptor.key,
      ).value,
    );
  const primary = primaryOutputOf(module, SYSTEM);
  const [before = '', after = ''] = sentenceOf(module, catalog, SYSTEM).split('{value}');
  const prefixed = UNIT_SYSTEMS.some(
    (system) => !sentenceOf(module, catalog, system).startsWith('{value}'),
  );
  const views = shopping === undefined ? [] : shopping.view(moment);

  return {
    heading: text('site.calculator.resultHeading'),
    primary: { key: primary.key, prefixed, before, value: figureOf(primary), after },
    ...(drawing === undefined ? {} : { drawing: drawing.frame }),
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
              label: fillSplitOf(id, label, page(label), fills),
              ...(note === undefined ? {} : { note: fillSplitOf(id, note, page(note), fills) }),
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
): ResultView => resultViewAt(module, locale, catalog, defaultMomentOf(module));

/**
 * The messages the script reads, in the order of the page's one template: the user-facing errors,
 * the answer templates of the slot, the messages of the drawing slot, the copy states, the share
 * text, one hint per length unit (the distinct default
 * units in input order, then the distinct metric ones) and the sentence of each primary figure that
 * has a page key. A name is the id of its `<template>` entry; the primary sentence is named
 * `<measure>.<unit>`, as the controller looks it up.
 */
const messagesOf = (
  module: AnyPageModule,
  catalog: Messages,
): readonly (readonly [string, string])[] => {
  const { calculator, answer, drawing } = module;
  const { id } = calculator;
  const text = (key: string): string => messageOf(catalog, id, key);
  const lengths = calculator.inputs.flatMap((input) => (input.kind === 'length' ? [input] : []));
  const units = new Set([
    ...lengths.map(({ defaultUnit }) => defaultUnit),
    ...lengths.map(({ metricDefaultUnit }) => metricDefaultUnit),
  ]);
  const primaries = new Map(
    UNIT_SYSTEMS.flatMap((system) => {
      const output = primaryOutputOf(module, system);
      const sentence = catalog[pageKey(id, output.key)];
      return sentence === undefined ? [] : [[sentenceNameOf(output), sentence] as const];
    }),
  );
  return [
    ...ALL_ERROR_CODES.map((code) => [`errors.${code}`, text(`errors.${code}`)] as const),
    ...(answer?.templates ?? []).map((name) => [name, text(pageKey(id, name))] as const),
    ...(drawing?.messages ?? []).map((name) => [name, text(pageKey(id, name))] as const),
    ['copy.copied', text('site.calculator.linkCopied')] as const,
    ['copy.failed', text('site.calculator.copyFailed')] as const,
    ['share.text', text('site.calculator.shareText')] as const,
    ...[...units].map((unit) => [`hint.${unit}`, text(hintKeyOf(unit))] as const),
    ...primaries,
  ];
};

/**
 * Everything the page of a module shows, resolved for `locale` from the definition, the slots and
 * the catalog: the title and breadcrumb, the short answer (only with an answer slot), the no-JS
 * note (with the example sentence when the catalog has one), the form, the result panel and the
 * inert messages. The default state is computed once and the module is checked on it as the
 * controller checks it at mount, so a module the browser would refuse fails the build.
 */
export const pageViewOf = (
  module: AnyPageModule,
  locale: Locale,
  catalog: Messages,
): CalculatorPageView => {
  const { calculator, answer } = module;
  const { id } = calculator;
  const text = (key: string): string => messageOf(catalog, id, key);
  const moment = defaultMomentOf(module);
  checkModule(module, moment.result);
  const result = resultViewAt(module, locale, catalog, moment);
  const { before, value, after } = result.primary;
  return {
    id,
    title: text(`calc.${id}.title`),
    breadcrumb: {
      label: text('site.calculator.breadcrumb'),
      homeLabel: text('site.calculator.breadcrumbHome'),
      homeHref: pathOf('home', locale),
      current: text(`calc.${id}.title`),
    },
    ...(answer === undefined
      ? {}
      : {
          answer: fillMessage(
            text(pageKey(id, answer.template(moment))),
            answer.values(moment, `${before}${value}${after}`),
          ),
        }),
    // the note says the result below is the example, so it does not repeat the example sentence
    // (blueprint-ui: its reserve was the gap under the answer)
    notRunning: text('site.calculator.noscript'),
    form: formViewAt(module, catalog, moment),
    result,
    messages: messagesOf(module, catalog),
  };
};
