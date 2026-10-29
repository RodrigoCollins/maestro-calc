import { ROUTES } from '../../../apps/web/src/routing/routes.ts';
import { CALCULATOR_PAGES } from '../../../apps/web/src/routing/templates.ts';
import type { CalculatorPageId } from '../../../apps/web/src/routing/templates.ts';
import { CONCRETE } from './concrete-pages.ts';
import { RECTANGLE_AREA } from './rectangle-area-pages.ts';

export type E2eLanguage = 'en' | 'es';

/** The values of the figures of a state, in the order of `E2eSpec.figures`. */
export type Figures = readonly string[];

/** A press on a button of a group: `choice` is a `data-choice` group, `step` a `data-step` group. */
export interface E2ePress {
  readonly hook: 'choice' | 'step';
  readonly key: string;
  readonly value: string;
}

/** What differs between the two languages of a page: the catalogs and the sentences. */
export interface E2eLocale {
  /** The calculator's own catalog: `calc.<id>.*`. */
  readonly catalog: Readonly<Record<string, string>>;
  readonly site: Readonly<Record<string, string>>;
  readonly common: Readonly<Record<string, string>>;
}

export interface E2eState {
  readonly name: string;
  readonly query: string;
  readonly figures: Figures;
}

/** One option of a choice group that drives the form, with what pressing it shows. */
export interface E2eOption {
  readonly value: string;
  /** The names of the visible inputs, in order, once this option is pressed. */
  readonly fields: readonly string[];
  /** The figures right after pressing it, with the field of `typed` back at its default. */
  readonly figures?: Figures;
  /** The start of the short answer once it is pressed. */
  readonly starts?: Readonly<Record<E2eLanguage, string>>;
  /**
   * The query parameter that records it, once the page has written the link. Required for every
   * option but the initial one, whose link is `?v=1`: `paramOf` throws for any other option without it.
   */
  readonly param?: string;
}

/** A choice group whose options change the fields shown (`data-choice`). */
export interface E2eChoice {
  readonly key: string;
  /** The option pressed on load. */
  readonly initial: string;
  readonly options: readonly E2eOption[];
}

/** A stepper that moves a field by one step (`data-step`). */
export interface E2eStepper {
  readonly key: string;
  readonly min: string;
  readonly max: string;
  /** A text that is neither bound, to step up from. */
  readonly base: string;
  /** The text one step above `base`. */
  readonly up: string;
  readonly minFigures: Figures;
  readonly upFigures: Figures;
  /** The query after one step up from the default. */
  readonly upQuery: string;
}

/** A group of buttons on a shopping line that changes the quantity (the bag size). */
export interface E2eLineChoice {
  readonly key: string;
  readonly options: readonly {
    readonly value: string;
    readonly figures: Figures;
    readonly note: Readonly<Record<E2eLanguage, string>>;
    readonly end: Readonly<Record<E2eLanguage, string>>;
  }[];
}

export interface E2ePrice {
  readonly input: string;
  readonly text: string;
  /** The `data-output` key of the cost it fills. */
  readonly output: string;
  readonly value: string;
  /** The row has a hint to type a price until the price is typed. */
  readonly hinted?: boolean;
  /** The cost once `typed` is entered. */
  readonly afterTyped?: string;
}

export interface E2eBound {
  readonly key: string;
  readonly text: string;
  readonly code: 'ABOVE_MAX' | 'BELOW_MIN';
  /** The bound as the message words it. */
  readonly bound: string;
  /** Typed back into the field after the check. */
  readonly restore?: string;
  /** Pressed before the field is typed (it makes the field visible). */
  readonly press?: E2ePress;
}

/** A value typed in a field and the plan it draws. */
/** Label texts in drawing order: one list when they are language-free, else one per language. */
export type E2eTexts = readonly string[] | Readonly<Record<E2eLanguage, readonly string[]>>;

/** The label texts of a list in a language. */
export const textsIn = (texts: E2eTexts, language: E2eLanguage): readonly string[] =>
  'en' in texts ? texts[language] : texts;

export interface E2eDrawn {
  readonly key: string;
  readonly text: string;
  /** The texts of the labels, in drawing order. */
  readonly labels: E2eTexts;
}

/**
 * The live plan of the result panel (blueprint-drawing), declared exactly when the page module
 * declares the drawing slot (site-quality › [SQ42], enforced by
 * `apps/web/src/contract/drawing-record.contract.test.ts`). `drawing.spec.ts` runs over it.
 */
export interface E2eDrawing {
  /** The label texts of the default plan, in drawing order (a note in words differs by language). */
  readonly labels: E2eTexts;
  /** The accessible name of the default plan, per language. */
  readonly name: Readonly<Record<E2eLanguage, string>>;
  /** A typed value: its labels, its name and the width over height of its outline. */
  readonly typed: E2eDrawn & {
    readonly name: Readonly<Record<E2eLanguage, string>>;
    readonly ratio: number;
  };
  /** A valid value whose plan stays while `abc` is typed after it. */
  readonly kept: E2eDrawn;
  /** The label texts of the default plan in the metric system. */
  readonly metric: E2eTexts;
  /**
   * Links whose plan the unit toggle must not move either: the area text of one system fits
   * inside and the other's does not, so the layout keeps the room of the longer.
   */
  readonly toggles: readonly string[];
  /** Links with the longest labels the fields accept, measured at 320 px. */
  readonly longest: readonly string[];
  /** Links whose box is measured with and without the script, besides the bare page. */
  readonly queries: readonly string[];
}

/**
 * The WhatsApp share link of the copy area (calculator-page › [CP78]-[CP85]): a change the page
 * writes to its link, and the query the share link carries after it. `share.spec.ts` runs over it.
 */
export interface E2eShare {
  /** A value typed in a field, or a button pressed. */
  readonly change: { readonly key: string; readonly text: string } | E2ePress;
  /** The query of the link after the change, `?v=1&…`. */
  readonly query: string;
}

/**
 * The typed per-calculator record the generic suites run over (site-quality › [SQ29], [SQ30]).
 * A calculator adds one `E2eSpec` and one row of `E2E`; no suite names a calculator. The groups
 * a page may not have (`answer`, `choices`, `steppers`, `shopping`, `prices`, `variant`, `drawing`, `share`, ...) are
 * optional and their tests are skipped when a record leaves them out. The record reaches
 * `apps/web` only by relative path: the browser job has no root install.
 */
export interface E2eSpec {
  readonly locales: Readonly<Record<E2eLanguage, E2eLocale>>;
  /** The input whose enabled state shows that the script has mounted. */
  readonly ready: string;
  /** The number of inputs of the form. */
  readonly inputs: number;
  /** The inputs with a numeric keyboard (the rest are decimal). */
  readonly numeric: readonly string[];
  /** The `data-output` keys, then `shopping:<i>` for the i-th shopping line. The first is the headline figure. */
  readonly figures: readonly string[];
  /** The figures of the default state, also those of the unmounted page. */
  readonly defaults: Figures;
  /** The large figure (`.calc-primary`) of the default state with its unit, per language: what a reader with no script sees. */
  readonly primary: Readonly<Record<E2eLanguage, string>>;
  /** The inputs and buttons of the form, all disabled while no script runs. */
  readonly controls: number;
  /** A value typed in a field, in the field's default unit, and the state it produces. */
  readonly typed: {
    readonly key: string;
    readonly text: string;
    /** Its query parameter (the link is `?v=1&<param>`). */
    readonly param: string;
    /** What the field shows after a reload. */
    readonly shown: string;
    /** The text that returns the field to its default. */
    readonly back: string;
    readonly figures: Figures;
  };
  readonly states: readonly E2eState[];
  readonly metric: {
    readonly query: string;
    /** The inputs after switching to metric, and back. */
    readonly shown: Readonly<Record<string, string>>;
    readonly back: Readonly<Record<string, string>>;
    readonly primary: string;
    /** The input whose unit hint is checked in metric and the site key of that hint. */
    readonly hint: { readonly key: string; readonly site: string };
    /** Bare numbers typed in metric, and the exact value they give back in the other system. */
    readonly bare: {
      readonly texts: Readonly<Record<string, string>>;
      readonly query: string;
      readonly figures: Figures;
      readonly back: { readonly key: string; readonly shown: string; readonly param: string };
    };
  };
  /** The focus order, from the first control. Each is a selector. */
  readonly tabOrder: readonly string[];
  readonly bounds: readonly E2eBound[];
  /** The links whose answer is the longest and must not shift the layout. */
  readonly layoutQueries: readonly string[];
  /** The short answer (`[data-answer]`), per language: a page without the answer slot leaves it out. */
  readonly answer?: {
    /** The answer of the default state, also that of the unmounted page. */
    readonly default: Readonly<Record<E2eLanguage, string>>;
    /** The answer after `typed` is entered. */
    readonly typed: Readonly<Record<E2eLanguage, string>>;
    /** The answer of the default state in the metric system. */
    readonly metric: Readonly<Record<E2eLanguage, string>>;
  };
  readonly choices?: readonly E2eChoice[];
  readonly steppers?: readonly E2eStepper[];
  /** One entry per shopping line. */
  readonly shopping?: readonly { readonly sizes?: E2eLineChoice }[];
  readonly prices?: readonly E2ePrice[];
  /** Entries whose message names a code but no bound. */
  readonly rejects?: readonly {
    readonly key: string;
    readonly text: string;
    readonly code: string;
  }[];
  /** A link with one bad value in it. */
  readonly invalidLink?: string;
  /** A link with a state in it that is restored on load and kept on reload. */
  readonly restored?: {
    readonly query: string;
    readonly pressed: { readonly key: string; readonly value: string };
    readonly values: Readonly<Record<string, string>>;
    readonly figures: Figures;
  };
  /** A press and a price on top of `typed`, written to the link and read back. */
  readonly variant?: {
    readonly press: E2ePress;
    readonly suffix: string;
    readonly price: {
      readonly input: string;
      readonly text: string;
      readonly suffix: string;
      readonly output: string;
      readonly value: string;
    };
  };
  /** The live plan of the result panel: a page whose module declares no drawing slot leaves it out. */
  readonly drawing?: E2eDrawing;
  /** The share link of the copy area, with a change that moves its link. */
  readonly share?: E2eShare;
  /** The unit hints and the descriptions of the inputs. `site` is the key of the hint text. */
  readonly hints?: readonly {
    readonly key: string;
    readonly site?: string;
    readonly describedBy: string;
  }[];
}

/**
 * One spec per calculator page (site-quality › [SQ29]): a missing row is a type error naming the
 * id, and the generic suites run over every row.
 */
export const E2E = {
  concrete: CONCRETE,
  'rectangle-area': RECTANGLE_AREA,
} as const satisfies Record<CalculatorPageId, E2eSpec>;

/** One page of the record: a calculator in one language. */
export interface E2ePage extends E2eLocale {
  readonly id: CalculatorPageId;
  readonly locale: E2eLanguage;
  readonly path: string;
  /** The path of the same page in the other language. */
  readonly other: string;
  readonly spec: E2eSpec;
}

const LANGUAGES = ['en', 'es'] as const satisfies readonly E2eLanguage[];

/** Every calculator page in both languages, with the paths taken from the route table. */
export const calculatorPages: readonly E2ePage[] = CALCULATOR_PAGES.flatMap((id) =>
  LANGUAGES.map((locale) => ({
    ...E2E[id].locales[locale],
    id,
    locale,
    path: ROUTES[id][locale],
    other: ROUTES[id][locale === 'en' ? 'es' : 'en'],
    spec: E2E[id],
  })),
);

/** The selector of the button of a press. */
export const pressSelector = ({ hook, key, value }: E2ePress): string =>
  `[data-${hook}="${key}"] [value="${value}"]`;

/** The link of the `typed` state. */
export const typedQuery = (spec: E2eSpec): string => `?v=1&${spec.typed.param}`;

/** The query parameter of a non-initial option; a record that leaves it out is named, not skipped. */
export const paramOf = (
  { key, initial }: Pick<E2eChoice, 'key' | 'initial'>,
  { value, param }: Pick<E2eOption, 'value' | 'param'>,
): string => {
  if (param !== undefined) return param;
  throw new Error(
    `the option "${value}" of the choice group "${key}" declares no param (only the initial option "${initial}" may leave it out)`,
  );
};
