import type {
  Calculator,
  InputDescriptor,
  InputsOf,
  OutputDescriptor,
  Rational,
  RunResult,
  ShoppingLine,
  UnitSystem,
} from '@maestro-calc/core';
import type { Plan } from './slots/drawing.ts';

/*
 * The contract of a page module: the language-free data a calculator page needs beyond its
 * definition, and the optional slots that carry the rest. The code of each slot lives in its own
 * file under `slots/`, so a module that declares no slot imports none of it. Nothing here touches
 * the DOM or a catalog.
 */

/** Core declares the same alias without exporting it; the web layer builds it from exported types. */
export type AnyCalculator = Calculator<
  string,
  readonly InputDescriptor[],
  readonly OutputDescriptor[],
  readonly string[]
>;

type Input<C extends AnyCalculator> = C['inputs'][number];

export type SelectKey<C extends AnyCalculator> = Extract<
  Input<C>,
  { readonly kind: 'select' }
>['key'];
export type TextKey<C extends AnyCalculator> = Extract<
  Input<C>,
  { readonly kind: 'length' | 'count' | 'percent' | 'money' }
>['key'];
export type PercentKey<C extends AnyCalculator> = Extract<
  Input<C>,
  { readonly kind: 'percent' }
>['key'];
export type MoneyKey<C extends AnyCalculator> = Extract<
  Input<C>,
  { readonly kind: 'money' }
>['key'];
export type OutputKey<C extends AnyCalculator> = C['outputs'][number]['key'];
/** The options of the select `S`. */
export type OptionOf<C extends AnyCalculator, S extends SelectKey<C>> = Extract<
  Input<C>,
  { readonly kind: 'select'; readonly key: S }
>['options'][number];
export type StateOf<C extends AnyCalculator> = InputsOf<C['inputs']>;
export type ResultOf<C extends AnyCalculator> = RunResult<C['outputs'], C['warnings'][number]>;

/** What every slot is given. `choices` may be ahead of `valid` while a field is invalid. */
export interface Moment<C extends AnyCalculator> {
  readonly system: UnitSystem;
  readonly choices: Readonly<Record<SelectKey<C>, string>>;
  readonly valid: StateOf<C>;
  readonly result: ResultOf<C> | undefined;
}
export type Ready<C extends AnyCalculator> = Moment<C> & { readonly result: ResultOf<C> };

// Slot members are methods, so a module of one calculator assigns to `AnyPageModule`.
export interface ChoiceGroup<C extends AnyCalculator> {
  readonly select: SelectKey<C>;
  /** The fields any option shows, in definition order. */
  readonly driven: readonly TextKey<C>[];
  /** The rows the area reserves: the largest visibility set. */
  readonly rows: number;
  shown(option: string): readonly TextKey<C>[];
}
export interface ChoiceSlot<C extends AnyCalculator> {
  readonly groups: readonly ChoiceGroup<C>[];
}
export interface StepperSlot<C extends AnyCalculator> {
  readonly keys: readonly PercentKey<C>[];
  next(key: PercentKey<C>, current: Rational, direction: 'less' | 'more'): Rational;
}
export interface ShoppingLineSpec<C extends AnyCalculator> {
  /** The `materialId` of the engine line this one shows. */
  readonly material: string;
  /** The page-key suffix of the label. */
  readonly label: string;
  /** The page-key suffix of the note under the line, if it has one. */
  readonly note?: string;
  /**
   * The fills by name. The label and the note each carry at most one placeholder `{<name>}` (the
   * script rewrites one value per text), so a line fills the label with one name and the note with
   * another, or the same; a text with two placeholders fails the build.
   */
  parts(moment: Moment<C>): {
    readonly unit: string;
    readonly fills: Readonly<Record<string, string>>;
  };
}
export interface ShoppingLineView {
  readonly material: string;
  /** The `data-shopping` value. */
  readonly unit: string;
  /** The grouped whole quantity, or the dash without a result. */
  readonly qty: string;
  readonly fills: Readonly<Record<string, string>>;
}
export interface ShoppingSlot<C extends AnyCalculator> {
  readonly lines: readonly ShoppingLineSpec<C>[];
  /** One entry per declared line, in declared order. */
  view(moment: Moment<C>): readonly ShoppingLineView[];
}
export interface CostSlot<C extends AnyCalculator> {
  readonly rows: readonly { readonly output: OutputKey<C>; readonly price: MoneyKey<C> }[];
  /** The page-key suffixes of the price hint and of the note under the rows. */
  readonly hint: string;
  readonly note?: string;
  /** The visibility of each declared row, keyed by its output. */
  visible(valid: StateOf<C>): Readonly<Partial<Record<OutputKey<C>, boolean>>>;
}
export interface AnswerSlot<C extends AnyCalculator> {
  /** `answer.<option>` per option of `by`, `answer.<case>` per declared case, else `answer`. */
  readonly templates: readonly string[];
  /** The template of a moment: by its select, by the case its result falls in, or the one. */
  template(moment: Ready<C>): string;
  values(moment: Ready<C>, primary: string): Readonly<Record<string, string>>;
}

/** The viewBox of a drawing, the same for every state of a page: the box keeps its size. */
export interface Frame {
  readonly width: number;
  readonly height: number;
}
export interface DrawingSlot<C extends AnyCalculator> {
  readonly frame: Frame;
  /** The page-key suffixes of the messages its labels name (`drawing`), resolved by the controller. */
  readonly messages: readonly string[];
  /** The plan of a ready moment; `null` for a state the page does not draw (the box stays empty). */
  plan(moment: Ready<C>): Plan | null;
}

/** The output of the large figure in each unit system. */
export type Primaries<C extends AnyCalculator> = Readonly<Record<UnitSystem, OutputKey<C>>>;

/**
 * The large figure of the options of one select that change it (the pieces of a fit); an option
 * it does not name keeps the module's figure of the unit system.
 */
export type PrimaryBy<C extends AnyCalculator> = {
  readonly [S in SelectKey<C>]: {
    readonly select: S;
    readonly options: Readonly<Partial<Record<OptionOf<C, S>, Primaries<C>>>>;
  };
}[SelectKey<C>];

export type PrimarySpec<C extends AnyCalculator> = Primaries<C> & { readonly by?: PrimaryBy<C> };

export interface PageModule<C extends AnyCalculator> {
  /** The id of the registry calculator, taken from its definition. */
  readonly id: C['id'];
  readonly calculator: C;
  readonly primary?: PrimarySpec<C>;
  readonly choices?: ChoiceSlot<C>;
  readonly steppers?: StepperSlot<C>;
  readonly shopping?: ShoppingSlot<C>;
  readonly costs?: CostSlot<C>;
  readonly answer?: AnswerSlot<C>;
  readonly drawing?: DrawingSlot<C>;
}
export type PageSpec<C extends AnyCalculator> = Omit<PageModule<C>, 'id'>;
export type AnyPageModule = PageModule<AnyCalculator>;

export type PageModuleCode =
  | 'CHOICE_OPTIONS'
  | 'STEPPER_BOUNDS'
  | 'COST_KINDS'
  | 'SHOPPING_LINES'
  | 'ANSWER_SELECT'
  | 'ANSWER_CASE'
  | 'OUTPUT_HINT'
  | 'FORM_ORDER'
  | 'PAGE_KEY';

/** A programming error in a page module: a code and the identifiers of the culprit, never prose. */
export class PageModuleError extends Error {
  readonly code: PageModuleCode;

  constructor(code: PageModuleCode, options: { readonly cause: object }) {
    super(code, options);
    this.name = 'PageModuleError';
    this.code = code;
  }
}

/** Throws the `PageModuleError` of `code` for the calculator `id`; `at` names the culprit input or output. */
export const fail = (code: PageModuleCode, id: string, at?: string): never => {
  throw new PageModuleError(code, { cause: { id, at } });
};

export type TextInput = Extract<
  InputDescriptor,
  { readonly kind: 'length' | 'count' | 'percent' | 'money' }
>;

/** The inputs a person types into: every kind but the select and the boolean. */
export const isTextInput = (input: InputDescriptor): input is TextInput =>
  input.kind !== 'select' && input.kind !== 'boolean';

export function definePage<C extends AnyCalculator>(spec: PageSpec<C>): PageModule<C>;
export function definePage(spec: PageSpec<AnyCalculator>): AnyPageModule {
  return Object.freeze({ ...spec, id: spec.calculator.id });
}

/**
 * The output the large figure shows for a unit system and the options pressed: the module's choice
 * for the option its select holds, else its choice for the unit system, else the one with the
 * primary role. One rule for the two readers (the builder writes the sentence, the controller reads
 * it), so a module whose primary has no such output fails the same way in both.
 */
export const primaryOutputOf = (
  module: AnyPageModule,
  system: UnitSystem,
  choices: Readonly<Record<string, string>>,
): OutputDescriptor => {
  const { primary } = module;
  const by = primary?.by;
  const chosen = (by === undefined ? undefined : by.options[choices[by.select] ?? '']) ?? primary;
  const output = module.calculator.outputs.find(({ key, role }) =>
    chosen === undefined ? role === 'primary' : key === chosen[system],
  );
  if (output === undefined) throw new TypeError('missing primary output');
  return output;
};

/** Every output the large figure may show, once each: those of the unit systems, then those of the options. */
export const primaryOutputsOf = (module: AnyPageModule): readonly OutputDescriptor[] => {
  const by = module.primary?.by;
  const options =
    by === undefined ? [] : Object.keys(by.options).map((key) => ({ [by.select]: key }));
  const systems = ['imperial', 'metric'] as const;
  return [
    ...new Set(
      [{}, ...options].flatMap((choices) =>
        systems.map((system) => primaryOutputOf(module, system, choices)),
      ),
    ),
  ];
};

/**
 * A `number` output is a count to a page (core gives it no display hint): a whole figure that only a
 * large figure shows, never a row, in a sentence of its own that names its unit (`15 pieces`).
 */
export const isCount = ({ measure }: OutputDescriptor): boolean => measure === 'number';

/**
 * The outputs the panel writes: every output with a display hint, every money output, and every
 * count a large figure may show.
 */
export const figuredOf = (module: AnyPageModule): readonly OutputDescriptor[] => {
  const counts = new Set(primaryOutputsOf(module).filter(isCount));
  return module.calculator.outputs.filter(
    (output) => output.display !== undefined || output.measure === 'money' || counts.has(output),
  );
};

/**
 * The name of the primary sentence in the page messages: the measure, with the display unit when it
 * has one; a count's own, `count.<key>`, and `count.<key>.one` for a `figure` of exactly one (the
 * plural rule of English and Spanish alike).
 */
export const sentenceNameOf = (output: OutputDescriptor, figure?: string): string => {
  const { key, measure, display } = output;
  if (isCount(output)) return `count.${key}${figure === '1' ? '.one' : ''}`;
  return display === undefined ? measure : `${measure}.${display.unit}`;
};

/** The option a select holds in a valid state; a state that holds none breaks an invariant. */
export const optionOf = (valid: StateOf<AnyCalculator>, key: string): string => {
  const option = valid[key];
  if (typeof option !== 'string') throw new TypeError(`${key} holds no option`);
  return option;
};

/**
 * The engine lines in declared order. Throws `SHOPPING_LINES` unless the engine has exactly one
 * line per declared material (any order, no extra, no duplicate) and, when `units` is given, each
 * line's `purchaseUnit` is the declared one. Here and not in `slots/` because the controller runs
 * it for a module with no shopping slot too (declared is empty).
 */
export const shoppingLinesOf = (
  id: string,
  declared: readonly string[],
  engine: readonly ShoppingLine[],
  units?: readonly string[],
): readonly ShoppingLine[] => {
  if (engine.length !== declared.length || new Set(declared).size !== declared.length) {
    return fail('SHOPPING_LINES', id);
  }
  return declared.map((material, index) => {
    const matches = engine.filter((line) => line.materialId === material);
    const [line] = matches;
    return line === undefined ||
      matches.length !== 1 ||
      (units !== undefined && line.purchaseUnit !== units[index])
      ? fail('SHOPPING_LINES', id)
      : line;
  });
};
