/**
 * The typed per-calculator record the generic suites run over (site-quality › [SQ29], [SQ30]).
 * A calculator adds one `E2eSpec` and one row of `E2E`; no suite names a calculator. The groups
 * a page may not have (`choices`, `steppers`, `shopping`, `prices`, `variant`, ...) are optional
 * and their tests are skipped when a record leaves them out. The record reaches `apps/web` only
 * by relative path: the browser job has no root install.
 */
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
  /** The short answer after `typed` is entered. */
  readonly typedAnswer?: string;
  /** The short answer of the default state in the metric system. */
  readonly metricAnswer?: string;
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
  /** The unit hints and the descriptions of the inputs. `site` is the key of the hint text. */
  readonly hints?: readonly {
    readonly key: string;
    readonly site?: string;
    readonly describedBy: string;
  }[];
}
