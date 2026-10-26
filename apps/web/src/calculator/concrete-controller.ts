import {
  decode,
  encode,
  parseLength,
  Rational,
  toCents,
  type FieldError,
  type InputDescriptor,
  type Money,
  type Result,
  type UnitSystem,
  type UrlIssue,
} from '@maestro-calc/core';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { concrete } from '../lib/concrete.ts';
import {
  answerValues,
  figuresOf,
  type ConcreteResult,
  type ConcreteState,
} from './concrete-present.ts';
import { errorId, helpId, hintId, layoutOf, type TextKey } from './concrete-layout.ts';
import { boundText, fieldText, fillMessage, percentText } from './present.ts';
import { SHAPES, type Shape } from './concrete-shapes.ts';

/*
 * The state machine of the concrete page: pure, with no DOM and no `window`. The script feeds it
 * what the person did (`UiEvent`) and writes what it returns (`Output`): the texts and figures to
 * show, and the query to put in the address bar. Every string comes from `Environment.messages`,
 * the inert templates of the page, so this module carries no words (calculator-page › Client
 * script contract).
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
}

export type UiEvent =
  | { readonly type: 'text'; readonly key: TextKey; readonly text: string }
  | { readonly type: 'shape'; readonly shape: string }
  | { readonly type: 'bag'; readonly bag: string }
  | { readonly type: 'units'; readonly system: UnitSystem }
  | { readonly type: 'waste'; readonly direction: 'less' | 'more' };

export interface FieldView {
  readonly text: string;
  /** The unit a plain number is read in, written for the unit system (length fields only). */
  readonly hint: string | undefined;
  readonly invalid: boolean;
  /** The error message with its bounds in the unit of the field, empty while the field is valid. */
  readonly message: string;
  readonly messageId: string;
  /** The ids that describe the input: the message while invalid, else its hint or help. */
  readonly describedBy: string;
}

type VolumeKey = 'volumeYd3' | 'volumeFt3' | 'volumeM3';

/** The figures of the result panel, every value as text (`—` while a field is invalid). */
export interface Panel {
  readonly primary: {
    readonly key: 'volumeYd3' | 'volumeM3';
    readonly before: string;
    readonly value: string;
    readonly after: string;
  };
  readonly volumes: Readonly<Record<VolumeKey, string>>;
  readonly netVolume: string;
  readonly bags: string;
  readonly bagLb: string;
  readonly bagYield: string;
  readonly bagCost: string;
  readonly readyMixCost: string;
  readonly bagCostVisible: boolean;
  readonly readyMixCostVisible: boolean;
}

export interface View {
  readonly system: UnitSystem;
  readonly shape: Shape;
  readonly bag: string;
  /** The dimension fields the shape shows, in order. */
  readonly visible: readonly string[];
  readonly fields: Readonly<Record<TextKey, FieldView>>;
  readonly answer: string;
  readonly panel: Panel;
  /** The message for a bad or unsupported link, empty when the link was fine. */
  readonly notice: string;
  /** Where the language switch points: the counterpart path and the current query. */
  readonly switchHref: string;
}

/** What the controller remembers between events. */
export interface State {
  readonly system: UnitSystem;
  readonly shape: Shape;
  readonly bag: string;
  /** What each text input holds, hidden ones included. */
  readonly texts: Readonly<Record<TextKey, string>>;
  /** The last state that passed validation, in full: hidden fields are read from it. */
  readonly valid: ConcreteState;
  /** The query of the address bar now (empty or starting with `?`). */
  readonly search: string;
  readonly notice: string;
}

export interface Output {
  readonly state: State;
  readonly view: View;
  /** The query to put in the address with `replaceState`; absent when the address stays as it is. */
  readonly write: string | undefined;
}

const DASH = '—';

/** Where the waste steps stop and how far one press moves it. */
const WASTE_STEP = Rational.of(5);

export const required = <T>(value: T | undefined, what: string): T => {
  if (value === undefined) throw new TypeError(`missing ${what}`);
  return value;
};

export const mustBeOk = <T, E>(result: Result<T, E>, what: string): T => {
  if (!result.ok) throw new TypeError(`${what} failed`);
  return result.value;
};

const DESCRIPTORS: Readonly<Record<string, InputDescriptor>> = Object.fromEntries(
  concrete.inputs.map((input) => [input.key, input]),
);
const descriptorOf = (key: string): InputDescriptor => required(DESCRIPTORS[key], `input ${key}`);

/** The option ids of a select input. */
const optionsOf = (key: string): readonly string[] =>
  concrete.inputs.flatMap((input) =>
    input.kind === 'select' && input.key === key ? input.options : [],
  );

const message = (env: Environment, name: string): string => env.messages[name] ?? '';

/** A price as a person types it: dollars and cents, nothing for zero (the field shows its placeholder). */
const priceText = (money: Money): string => {
  if (money.amount.isZero()) return '';
  const { integer, fraction } = toCents(money);
  return `${String(integer)}.${fraction}`;
};

const [
  ,
  LENGTH,
  WIDTH,
  THICKNESS,
  FOOTING_WIDTH,
  FOOTING_DEPTH,
  DIAMETER,
  HEIGHT,
  STEP_WIDTH,
  RISE,
  RUN,
] = concrete.inputs;

/** The ten length inputs by key; their keys are the literal types of the descriptors. */
const LENGTHS = {
  [LENGTH.key]: LENGTH,
  [WIDTH.key]: WIDTH,
  [THICKNESS.key]: THICKNESS,
  [FOOTING_WIDTH.key]: FOOTING_WIDTH,
  [FOOTING_DEPTH.key]: FOOTING_DEPTH,
  [DIAMETER.key]: DIAMETER,
  [HEIGHT.key]: HEIGHT,
  [STEP_WIDTH.key]: STEP_WIDTH,
  [RISE.key]: RISE,
  [RUN.key]: RUN,
};

type LengthKey = keyof typeof LENGTHS;

/** The text of each text field for a state, as the form shows it. */
const textsOf = (state: ConcreteState, system: UnitSystem): Record<TextKey, string> => {
  const length = (key: LengthKey) => fieldText(state[key], LENGTHS[key], system);
  return {
    length: length('length'),
    width: length('width'),
    thickness: length('thickness'),
    footingWidth: length('footingWidth'),
    footingDepth: length('footingDepth'),
    diameter: length('diameter'),
    height: length('height'),
    stepWidth: length('stepWidth'),
    rise: length('rise'),
    run: length('run'),
    stepCount: String(state.stepCount),
    count: String(state.count),
    waste: percentText(state.waste),
    bagPrice: priceText(state.bagPrice),
    readyMixPrice: priceText(state.readyMixPrice),
  };
};

/** The fields a state reads from the page: the shape's dimensions, the waste and the two prices. */
const readFields = (shape: Shape): readonly TextKey[] => [
  ...layoutOf(shape).fields,
  'waste',
  'bagPrice',
  'readyMixPrice',
];

/**
 * The raw record the engine validates: the last valid state, overridden by the texts of the visible
 * fields. A hidden field is read from the valid state, so it never blocks the visible shape. An
 * empty price is set explicitly to `undefined` on its own key: that overrides the spread, and the
 * engine reads it as the default (DR-11).
 */
const rawOf = (state: State): Record<string, unknown> => {
  const typed = Object.fromEntries(readFields(state.shape).map((key) => [key, state.texts[key]]));
  const price = (key: 'bagPrice' | 'readyMixPrice') =>
    state.texts[key].trim() === '' ? undefined : state.texts[key];
  return {
    ...state.valid,
    ...typed,
    shape: state.shape,
    bag: state.bag,
    bagPrice: price('bagPrice'),
    readyMixPrice: price('readyMixPrice'),
  };
};

interface Evaluation {
  readonly errors: readonly FieldError[];
  /** The state that is valid now: the new one, or the previous one while a field is invalid. */
  readonly valid: ConcreteState;
  readonly result: ConcreteResult | undefined;
}

const evaluate = (state: State): Evaluation => {
  const raw = rawOf(state);
  const options = { unitSystem: state.system };
  const checked = concrete.validate(raw, options);
  if (!checked.ok) return { errors: checked.errors, valid: state.valid, result: undefined };
  return {
    errors: [],
    valid: checked.value,
    result: mustBeOk(concrete.run(raw, options), 'run of a valid state'),
  };
};

const isPrice = (key: TextKey): boolean => key === 'bagPrice' || key === 'readyMixPrice';

/** The state with one text parsed on its own, in the unit system now; `undefined` while that text is invalid. */
const parsedWith = (state: State, key: TextKey, text: string): ConcreteState | undefined => {
  const checked = concrete.validate(
    {
      ...state.valid,
      // the engine reads a percent from text only, so the valid waste goes back as text
      waste: percentText(state.valid.waste),
      [key]: isPrice(key) && text.trim() === '' ? undefined : text,
    },
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

const hintOf = (env: Environment, key: TextKey, system: UnitSystem): string | undefined => {
  const field = descriptorOf(key);
  if (field.kind !== 'length') return undefined;
  const unit = system === 'metric' ? field.metricDefaultUnit : field.defaultUnit;
  return message(env, `hint.${unit}`);
};

const fieldViews = (
  env: Environment,
  state: State,
  errors: readonly FieldError[],
): Record<TextKey, FieldView> => {
  const view = (key: TextKey): FieldView => {
    const error = errors.find((found) => found.field === key);
    const hint = hintOf(env, key, state.system);
    // the unit hint of a length, the help of the waste; the message takes over while invalid
    const resting = hint === undefined ? (key === 'waste' ? helpId(key) : '') : hintId(key);
    return {
      text: state.texts[key],
      hint,
      invalid: error !== undefined,
      message:
        error === undefined
          ? ''
          : fillMessage(message(env, `errors.${error.code}`), boundValues(error, state.system)),
      messageId: errorId(key),
      describedBy: error === undefined ? resting : errorId(key),
    };
  };
  return {
    length: view('length'),
    width: view('width'),
    thickness: view('thickness'),
    footingWidth: view('footingWidth'),
    footingDepth: view('footingDepth'),
    diameter: view('diameter'),
    height: view('height'),
    stepWidth: view('stepWidth'),
    rise: view('rise'),
    run: view('run'),
    stepCount: view('stepCount'),
    count: view('count'),
    waste: view('waste'),
    bagPrice: view('bagPrice'),
    readyMixPrice: view('readyMixPrice'),
  };
};

const dashes = {
  volumeYd3: DASH,
  volumeFt3: DASH,
  volumeM3: DASH,
} as const;

const panelOf = (
  env: Environment,
  state: State,
  valid: ConcreteState,
  result: ConcreteResult | undefined,
): Panel => {
  const metric = state.system === 'metric';
  const [before = '', after = ''] = message(env, metric ? 'volume.m3' : 'volume.yd3').split(
    '{value}',
  );
  const figures =
    result === undefined ? undefined : figuresOf(valid, result, CONCRETE_MIX_YIELDS, state.system);
  const volumes = figures ?? dashes;
  const key = metric ? 'volumeM3' : 'volumeYd3';
  return {
    primary: { key, before, value: volumes[key], after },
    volumes: {
      volumeYd3: volumes.volumeYd3,
      volumeFt3: volumes.volumeFt3,
      volumeM3: volumes.volumeM3,
    },
    netVolume: figures?.netVolume ?? DASH,
    bags: figures?.bags ?? DASH,
    bagLb: state.bag,
    bagYield: figures?.bagYield ?? DASH,
    bagCost: figures?.bagCost ?? DASH,
    readyMixCost: figures?.readyMixCost ?? DASH,
    bagCostVisible: valid.bagPrice.amount.sign() === 1,
    readyMixCostVisible: valid.readyMixPrice.amount.sign() === 1,
  };
};

const answerOf = (
  env: Environment,
  state: State,
  valid: ConcreteState,
  result: ConcreteResult | undefined,
): string =>
  result === undefined
    ? DASH
    : fillMessage(
        message(env, `answer.${valid.shape}`),
        answerValues(valid, result, state.system, {
          volumeYd3: message(env, 'volume.yd3'),
          volumeM3: message(env, 'volume.m3'),
        }),
      );

const viewOf = (env: Environment, state: State, evaluation: Evaluation): View => ({
  system: state.system,
  shape: state.shape,
  bag: state.bag,
  visible: layoutOf(state.shape).fields,
  fields: fieldViews(env, state, evaluation.errors),
  answer: answerOf(env, state, evaluation.valid, evaluation.result),
  panel: panelOf(env, state, evaluation.valid, evaluation.result),
  notice: state.notice,
  switchHref: `${env.switchPath}${state.search}`,
});

/** Evaluates the state and, when it is valid, commits it and asks for the query to be written. */
const commit = (env: Environment, state: State): Output => {
  const evaluation = evaluate(state);
  if (evaluation.errors.length > 0) {
    return { state, view: viewOf(env, state, evaluation), write: undefined };
  }
  const write = `?${encode(concrete, evaluation.valid, { unitSystem: state.system })}`;
  // the rewritten address no longer holds what the link notice was about
  const next = { ...state, valid: evaluation.valid, search: write, notice: '' };
  return { state: next, view: viewOf(env, next, evaluation), write };
};

/** The view of a state that did not change, with no write. */
const unchanged = (env: Environment, state: State): Output => ({
  state,
  view: viewOf(env, state, evaluate(state)),
  write: undefined,
});

const noticeOf = (env: Environment, issues: readonly UrlIssue[]): string => {
  const [first] = issues;
  return first === undefined ? '' : message(env, `errors.${first.code}`);
};

/** The page as the visitor first sees it, from `search` (`location.search`): no write, no rewrite. */
export const start = (env: Environment, search: string): Output => {
  const decoded = decode(concrete, search);
  const state: State = {
    system: decoded.unitSystem,
    shape: decoded.state.shape,
    bag: decoded.state.bag,
    texts: textsOf(decoded.state, decoded.unitSystem),
    valid: decoded.state,
    search,
    notice: noticeOf(env, decoded.issues),
  };
  return unchanged(env, state);
};

/**
 * A text that is not valid, kept through a unit change. A bare number (`150`, out of range) is
 * written with the unit it was typed in (`150 in`): left bare, the other system would read it in
 * its own default unit and turn an invalid entry into a valid one that nobody typed. A text that
 * already has a unit, or that is not a length at all, does not take the unit and is kept as typed.
 */
const keptText = (state: State, key: TextKey): string => {
  const text = state.texts[key];
  const field = descriptorOf(key);
  if (field.kind !== 'length') return text;
  const unit = state.system === 'metric' ? field.metricDefaultUnit : field.defaultUnit;
  const qualified = `${text} ${unit}`;
  return parseLength(qualified).ok ? qualified : text;
};

/** Every text re-written for another unit system, each parsed in the one it was typed in. */
const convertedTexts = (state: State, system: UnitSystem): Record<TextKey, string> => {
  const converted = (key: TextKey): string => {
    const parsed = parsedWith(state, key, state.texts[key]);
    return parsed === undefined ? keptText(state, key) : textsOf(parsed, system)[key];
  };
  return {
    length: converted('length'),
    width: converted('width'),
    thickness: converted('thickness'),
    footingWidth: converted('footingWidth'),
    footingDepth: converted('footingDepth'),
    diameter: converted('diameter'),
    height: converted('height'),
    stepWidth: converted('stepWidth'),
    rise: converted('rise'),
    run: converted('run'),
    stepCount: converted('stepCount'),
    count: converted('count'),
    waste: converted('waste'),
    bagPrice: converted('bagPrice'),
    readyMixPrice: converted('readyMixPrice'),
  };
};

/** The waste range of the engine and the points one press moves it. */
const WASTE_MIN = Rational.ZERO;
const WASTE_MAX = Rational.of(50);

const clampWaste = (waste: Rational): Rational =>
  waste.compare(WASTE_MIN) < 0 ? WASTE_MIN : waste.compare(WASTE_MAX) > 0 ? WASTE_MAX : waste;

/** One press of "Less extra" or "More extra": from the typed waste when it is valid, else the last valid one. */
const stepWaste = (env: Environment, state: State, direction: 'less' | 'more'): Output => {
  const current = parsedWith(state, 'waste', state.texts.waste)?.waste ?? state.valid.waste;
  const next = clampWaste(direction === 'more' ? current.add(WASTE_STEP) : current.sub(WASTE_STEP));
  return next.compare(current) === 0
    ? unchanged(env, state)
    : commit(env, { ...state, texts: { ...state.texts, waste: percentText(next) } });
};

/** What the person did, applied to the state: the new view and, for a valid state, the query to write. */
export const applyEvent = (env: Environment, state: State, event: UiEvent): Output => {
  switch (event.type) {
    case 'text':
      return commit(env, { ...state, texts: { ...state.texts, [event.key]: event.text } });
    case 'shape': {
      const shape = SHAPES.find((id) => id === event.shape);
      return shape === undefined ? unchanged(env, state) : commit(env, { ...state, shape });
    }
    case 'bag':
      return optionsOf('bag').includes(event.bag)
        ? commit(env, { ...state, bag: event.bag })
        : unchanged(env, state);
    case 'units':
      return event.system === state.system
        ? unchanged(env, state)
        : commit(env, {
            ...state,
            system: event.system,
            texts: convertedTexts(state, event.system),
          });
    case 'waste':
      return stepWaste(env, state, event.direction);
  }
};

/** The absolute address "Copy link" puts on the clipboard: this page with the current query. */
export const copyAddress = (env: Environment, state: State): string =>
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
