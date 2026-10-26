import {
  decode,
  encode,
  Rational,
  type FieldError,
  type InputDescriptor,
  type Result,
  type UnitSystem,
  type UrlIssue,
} from '@maestro-calc/core';
import { errorId, helpId, hintId } from './ids.ts';
import {
  optionOf,
  shoppingLinesOf,
  type AnyCalculator,
  type AnyPageModule,
  type OutputKey,
  type PageModule,
  type PercentKey,
  type ResultOf,
  type SelectKey,
  type ShoppingLineView,
  type StateOf,
  type TextKey,
} from './page-module.ts';
import { boundText, DASH, fillMessage, outputText, percentText } from './present.ts';
import { baseOf, byTextKey, keptText, rawTextOf, textKeysOf, textOf, textsOf } from './texts.ts';

/*
 * The state machine of a calculator page: pure, with no DOM and no `window`, and the same for every
 * page module. The script feeds it what the person did (`UiEvent`) and writes what it returns
 * (`Output`): the texts and figures to show, and the query to put in the address bar. Every string
 * comes from `Environment.messages`, the inert templates of the page, so this module carries no
 * words (calculator-page › Client script contract).
 */

/** The page's inert messages by name: `errors.<CODE>`, `answer.<shape>`, `volume.yd3`, `hint.ft`... */
export type Messages = Readonly<Record<string, string>>;

export interface Environment {
  readonly messages: Messages;
  /** `https://maestrocalc.com`: the origin copied links start with. */
  readonly origin: string;
  /** This page's path, `/concrete-calculator`. */
  readonly path: string;
  /** The same calculator in the other language, query-free. */
  readonly switchPath: string;
  /** The text fields that have a help element: the mount finds them in the markup (K7). */
  readonly helps: ReadonlySet<string>;
}

export type UiEvent<C extends AnyCalculator> =
  | { readonly type: 'text'; readonly key: TextKey<C>; readonly text: string }
  | { readonly type: 'choice'; readonly select: SelectKey<C>; readonly option: string }
  | { readonly type: 'step'; readonly key: PercentKey<C>; readonly direction: 'less' | 'more' }
  | { readonly type: 'units'; readonly system: UnitSystem };

export interface FieldView {
  readonly text: string;
  /** The unit a plain number is read in, written for the unit system (length fields only). */
  readonly hint: string | undefined;
  readonly invalid: boolean;
  /** True for a field a choice group drives and its pressed option does not show. */
  readonly hidden: boolean;
  /** The error message with its bounds in the unit of the field, empty while the field is valid. */
  readonly message: string;
  readonly messageId: string;
  /** The ids that describe the input: the message while invalid, else its hint or help. */
  readonly describedBy: string;
}

/** The figures of the result panel, every value as text (`—` while a field is invalid). */
export interface PanelView<C extends AnyCalculator> {
  readonly primary: {
    readonly key: OutputKey<C>;
    readonly before: string;
    readonly value: string;
    readonly after: string;
  };
  /** The text of each output that has a display hint, and of each money output; no other key is present. */
  readonly figures: Readonly<Partial<Record<OutputKey<C>, string>>>;
  /** Whether each cost row shows (its price is above zero); empty for a module with no cost slot. */
  readonly costs: Readonly<Partial<Record<OutputKey<C>, boolean>>>;
  readonly shopping: readonly ShoppingLineView[];
}

export interface View<C extends AnyCalculator> {
  readonly system: UnitSystem;
  readonly choices: Readonly<Record<SelectKey<C>, string>>;
  /** The fields the pressed options show, in group order. */
  readonly visible: readonly TextKey<C>[];
  readonly fields: Readonly<Record<TextKey<C>, FieldView>>;
  /** The short answer, `undefined` for a page that has none. */
  readonly answer: string | undefined;
  readonly panel: PanelView<C>;
  /** The message for a bad or unsupported link, empty when the link was fine. */
  readonly notice: string;
  /** Where the language switch points: the counterpart path and the current query. */
  readonly switchHref: string;
}

/** What the controller remembers between events. */
export interface State<C extends AnyCalculator> {
  readonly system: UnitSystem;
  /** The option pressed in each select. */
  readonly choices: Readonly<Record<SelectKey<C>, string>>;
  /** What each text input holds, hidden ones included. */
  readonly texts: Readonly<Record<TextKey<C>, string>>;
  /** The last state that passed validation, in full: hidden fields are read from it. */
  readonly valid: StateOf<C>;
  /** The query of the address bar now (empty or starting with `?`). */
  readonly search: string;
  readonly notice: string;
}

export interface Output<C extends AnyCalculator> {
  readonly state: State<C>;
  readonly view: View<C>;
  /** The query to put in the address with `replaceState`; absent when the address stays as it is. */
  readonly write: string | undefined;
}

export interface Controller<C extends AnyCalculator> {
  /** The page as the visitor first sees it, from `search` (`location.search`): no write, no rewrite. */
  start(env: Environment, search: string): Output<C>;
  /** What the person did, applied to the state: the new view and, for a valid state, the query to write. */
  applyEvent(env: Environment, state: State<C>, event: UiEvent<C>): Output<C>;
}

export const required = <T>(value: T | undefined, what: string): T => {
  if (value === undefined) throw new TypeError(`missing ${what}`);
  return value;
};

export const mustBeOk = <T, E>(result: Result<T, E>, what: string): T => {
  if (!result.ok) throw new TypeError(`${what} failed`);
  return result.value;
};

const message = (env: Environment, name: string): string => env.messages[name] ?? '';

const rationalOf = (value: unknown): Rational | undefined =>
  value instanceof Rational ? value : undefined;

const noticeOf = (env: Environment, issues: readonly UrlIssue[]): string => {
  const [first] = issues;
  return first === undefined ? '' : message(env, `errors.${first.code}`);
};

/**
 * The controller of a page module. Creation runs the defaults once and checks the shopping lines
 * against the declared ones (K15), so a mismatch fails at start, not on the first edit.
 */
export function controllerOf<C extends AnyCalculator>(module: PageModule<C>): Controller<C>;
export function controllerOf(module: AnyPageModule): Controller<AnyCalculator> {
  type Calc = AnyCalculator;
  const { calculator, choices, steppers, shopping, costs, answer } = module;
  const declared = shopping?.lines.map(({ material }) => material) ?? [];
  shoppingLinesOf(
    calculator.id,
    declared,
    mustBeOk(calculator.run({}), 'run of the defaults').shopping,
  );

  const descriptorOf = (key: string): InputDescriptor =>
    required(
      calculator.inputs.find((input) => input.key === key),
      'input',
    );
  const textKeys = textKeysOf(calculator);
  const selects = calculator.inputs.flatMap((input) => (input.kind === 'select' ? [input] : []));
  const groups = choices?.groups ?? [];
  const driven: ReadonlySet<string> = new Set(groups.flatMap((group) => group.driven));
  const figured = calculator.outputs.filter(
    ({ display, measure }) => display !== undefined || measure === 'money',
  );
  const primaryOf = (system: UnitSystem) =>
    required(
      calculator.outputs.find(({ key, role }) =>
        module.primary === undefined ? role === 'primary' : key === module.primary[system],
      ),
      'primary output',
    );

  const textAt = (state: State<Calc>, key: string): string => required(state.texts[key], 'text');
  const shownOf = (state: State<Calc>): readonly string[] =>
    groups.flatMap((group) => group.shown(required(state.choices[group.select], group.select)));
  /** The fields a state reads from the page: those no group drives and those the options show. */
  const readFields = (state: State<Calc>): readonly string[] => {
    const shown = new Set(shownOf(state));
    return textKeys.filter((key) => !driven.has(key) || shown.has(key));
  };

  /**
   * The raw record the engine validates: the last valid state, overridden by the texts of the
   * visible fields. A hidden field is read from the valid state, so it never blocks the visible
   * options. An empty money field is an explicit `undefined` on its own key (DR-11).
   */
  const rawOf = (state: State<Calc>): Record<string, unknown> => ({
    ...baseOf(calculator, state.valid),
    ...Object.fromEntries(
      readFields(state).map((key) => [key, rawTextOf(descriptorOf(key), textAt(state, key))]),
    ),
    ...state.choices,
  });

  const evaluate = (state: State<Calc>) => {
    const raw = rawOf(state);
    const options = { unitSystem: state.system };
    const checked = calculator.validate(raw, options);
    const momentOf = (valid: StateOf<Calc>, result: ResultOf<Calc> | undefined) => ({
      system: state.system,
      choices: state.choices,
      valid,
      result,
    });
    if (!checked.ok) return { errors: checked.errors, moment: momentOf(state.valid, undefined) };
    const result = mustBeOk(calculator.run(raw, options), 'run of a valid state');
    shoppingLinesOf(calculator.id, declared, result.shopping);
    return { errors: [], moment: momentOf(checked.value, result) };
  };
  type Evaluation = ReturnType<typeof evaluate>;
  type Moment = Evaluation['moment'];

  /** The state with one text parsed on its own, in the unit system now; `undefined` while it is invalid. */
  const parsedWith = (state: State<Calc>, key: string, text: string) => {
    const checked = calculator.validate(
      { ...baseOf(calculator, state.valid), [key]: rawTextOf(descriptorOf(key), text) },
      { unitSystem: state.system },
    );
    return checked.ok ? checked.value : undefined;
  };

  const boundValues = (error: FieldError, system: UnitSystem): Record<string, string> => {
    const bounds = error.params;
    if (bounds === undefined) return {};
    const field = descriptorOf(error.field);
    return 'min' in bounds
      ? { min: boundText(field, bounds.min, system) }
      : { max: boundText(field, bounds.max, system) };
  };

  const fieldViews = (env: Environment, state: State<Calc>, errors: readonly FieldError[]) => {
    const shown = new Set(shownOf(state));
    return byTextKey(calculator, (key): FieldView => {
      const error = errors.find((found) => found.field === key);
      const input = descriptorOf(key);
      const hint =
        input.kind === 'length'
          ? message(
              env,
              `hint.${state.system === 'metric' ? input.metricDefaultUnit : input.defaultUnit}`,
            )
          : undefined;
      // the unit hint of a length, else the help it has; the message takes over while invalid
      const resting = hint !== undefined ? hintId(key) : env.helps.has(key) ? helpId(key) : '';
      return {
        text: textAt(state, key),
        hint,
        invalid: error !== undefined,
        hidden: driven.has(key) && !shown.has(key),
        message:
          error === undefined
            ? ''
            : fillMessage(message(env, `errors.${error.code}`), boundValues(error, state.system)),
        messageId: errorId(key),
        describedBy: error === undefined ? resting : errorId(key),
      };
    });
  };

  const panelOf = (env: Environment, moment: Moment) => {
    const { system, valid, result } = moment;
    const output = primaryOf(system);
    const name =
      output.display === undefined ? output.measure : `${output.measure}.${output.display.unit}`;
    const [before = '', after = ''] = message(env, name).split('{value}');
    const figures = Object.fromEntries(
      figured.map((descriptor) => [
        descriptor.key,
        result === undefined
          ? DASH
          : outputText(
              descriptor,
              required(
                result.outputs.find(({ key }) => key === descriptor.key),
                'output',
              ).value,
            ),
      ]),
    );
    return {
      primary: { key: output.key, before, value: required(figures[output.key], 'figure'), after },
      figures,
      costs: costs?.visible(valid) ?? {},
      shopping: shopping?.view(moment) ?? [],
    };
  };

  const answerOf = (env: Environment, { valid, result, ...rest }: Moment, primary: string) => {
    if (answer === undefined) return undefined;
    if (result === undefined) return DASH;
    return fillMessage(
      message(env, answer.template(valid)),
      answer.values({ ...rest, valid, result }, primary),
    );
  };

  const viewOf = (env: Environment, state: State<Calc>, evaluation: Evaluation): View<Calc> => {
    const { moment, errors } = evaluation;
    const panel = panelOf(env, moment);
    const { before, value, after } = panel.primary;
    return {
      system: state.system,
      choices: state.choices,
      visible: shownOf(state),
      fields: fieldViews(env, state, errors),
      answer: answerOf(env, moment, `${before}${value}${after}`),
      panel,
      notice: state.notice,
      switchHref: `${env.switchPath}${state.search}`,
    };
  };

  /** Evaluates the state and, when it is valid, commits it and asks for the query to be written. */
  const commit = (env: Environment, state: State<Calc>): Output<Calc> => {
    const evaluation = evaluate(state);
    if (evaluation.errors.length > 0) {
      return { state, view: viewOf(env, state, evaluation), write: undefined };
    }
    const write = `?${encode(calculator, evaluation.moment.valid, { unitSystem: state.system })}`;
    // the rewritten address no longer holds what the link notice was about
    const next = { ...state, valid: evaluation.moment.valid, search: write, notice: '' };
    return { state: next, view: viewOf(env, next, evaluation), write };
  };

  /** The view of a state that did not change, with no write. */
  const unchanged = (env: Environment, state: State<Calc>): Output<Calc> => ({
    state,
    view: viewOf(env, state, evaluate(state)),
    write: undefined,
  });

  /** Every text re-written for another unit system, each parsed in the one it was typed in. */
  const convertedTexts = (state: State<Calc>, system: UnitSystem) =>
    byTextKey(calculator, (key) => {
      const parsed = parsedWith(state, key, textAt(state, key));
      return parsed === undefined
        ? keptText(descriptorOf(key), textAt(state, key), state.system)
        : textOf(descriptorOf(key), required(parsed[key], 'text'), system);
    });

  /** One press of a stepper: from the typed value when it is valid, else the last valid one. */
  const stepOf = (
    env: Environment,
    state: State<Calc>,
    key: string,
    direction: 'less' | 'more',
  ): Output<Calc> => {
    if (!steppers?.keys.includes(key)) return unchanged(env, state);
    const current = required(
      rationalOf(parsedWith(state, key, textAt(state, key))?.[key]) ?? rationalOf(state.valid[key]),
      'percent',
    );
    const next = steppers.next(key, current, direction);
    return next.compare(current) === 0
      ? unchanged(env, state)
      : commit(env, { ...state, texts: { ...state.texts, [key]: percentText(next) } });
  };

  return {
    start: (env, search) => {
      const decoded = decode(calculator, search);
      return unchanged(env, {
        system: decoded.unitSystem,
        choices: Object.fromEntries(selects.map(({ key }) => [key, optionOf(decoded.state, key)])),
        texts: textsOf(calculator, decoded.state, decoded.unitSystem),
        valid: decoded.state,
        search,
        notice: noticeOf(env, decoded.issues),
      });
    },
    applyEvent: (env, state, event) => {
      switch (event.type) {
        case 'text':
          return commit(env, { ...state, texts: { ...state.texts, [event.key]: event.text } });
        case 'choice':
          return selects.some(
            ({ key, options }) => key === event.select && options.includes(event.option),
          )
            ? commit(env, { ...state, choices: { ...state.choices, [event.select]: event.option } })
            : unchanged(env, state);
        case 'step':
          return stepOf(env, state, event.key, event.direction);
        case 'units':
          return event.system === state.system
            ? unchanged(env, state)
            : commit(env, {
                ...state,
                system: event.system,
                texts: convertedTexts(state, event.system),
              });
      }
    },
  };
}

/** The absolute address "Copy link" puts on the clipboard: this page with the current query. */
export const copyAddress = (env: Environment, state: { readonly search: string }): string =>
  `${env.origin}${env.path}${state.search}`;

/** The status to show after a copy attempt; a failed one also offers the address in a read-only field. */
export const copyOutcome = (
  env: Environment,
  copied: boolean,
  address: string,
): { readonly message: string; readonly address?: string } =>
  copied
    ? { message: message(env, 'copy.copied') }
    : { message: message(env, 'copy.failed'), address };
