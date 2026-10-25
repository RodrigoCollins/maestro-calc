/*
 * What the calculator parts are given. The route-free container and the parts below it read no
 * catalog, route table or content collection: the caller resolves every text and passes it in.
 */

/** One button of a single-choice group (shape, unit system, bag size). */
export interface Choice {
  readonly id: string;
  readonly label: string;
  readonly pressed: boolean;
}

/** One text input. */
export interface Field {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly mode: 'decimal' | 'numeric';
  readonly placeholder?: string;
}

/** The fields of one shape; only the pressed shape is visible. */
export interface ShapeGroup {
  readonly id: string;
  readonly visible: boolean;
  readonly fields: readonly Field[];
}

export interface FormView {
  readonly unitsLabel: string;
  readonly units: readonly Choice[];
  readonly shapeLabel: string;
  readonly shapes: readonly Choice[];
  readonly groups: readonly ShapeGroup[];
  readonly waste: Field & { readonly help: string; readonly less: string; readonly more: string };
  readonly bagLabel: string;
  readonly bags: readonly Choice[];
  readonly prices: readonly Field[];
  readonly copyLabel: string;
}

/** A labelled figure of the panel, addressed by its output key. */
export interface Row {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

/** A cost row: visible only when its price is above zero, else the hint shows. */
export interface CostRow extends Row {
  readonly visible: boolean;
  readonly hint: string;
}

export interface ShoppingView {
  /** The purchase unit id shown, `bag-80`: the value of `data-shopping`. */
  readonly unit: string;
  readonly label: string;
  readonly qty: string;
  readonly bagYield: string;
}

export interface ResultView {
  readonly heading: string;
  /** The large figure: `{before}<value>{after}`, for example `1.63 cubic yards`. */
  readonly primary: {
    readonly key: string;
    readonly before: string;
    readonly value: string;
    readonly after: string;
  };
  readonly rows: readonly Row[];
  readonly shopping: ShoppingView;
  readonly costs: readonly CostRow[];
  readonly readyMixNote: string;
  readonly estimateNote: string;
  readonly termsLabel: string;
  readonly termsHref: string;
}

export interface BreadcrumbView {
  readonly label: string;
  readonly homeLabel: string;
  readonly homeHref: string;
  readonly current: string;
}

/** Messages the script uses, written into inert `<template>` elements. */
export interface TemplatesView {
  /** The user-facing error messages by code, with their `{min}` / `{max}` placeholders. */
  readonly errors: Readonly<Record<string, string>>;
  /** The short-answer sentences by shape. */
  readonly answers: Readonly<Record<string, string>>;
  /** The copy states: `copied` and `failed`. */
  readonly copy: { readonly copied: string; readonly failed: string };
}

/** Everything the container renders from the engine and the catalogs. */
export interface CalculatorView {
  readonly id: string;
  readonly title: string;
  readonly breadcrumb: BreadcrumbView;
  readonly answer: string;
  readonly notRunning: string;
  readonly form: FormView;
  readonly result: ResultView;
  readonly templates: TemplatesView;
}

export interface SourceView {
  readonly name: string;
  readonly url: string;
  /** The retrieval date, written for the reader. */
  readonly retrieved: string;
}

/** The part of a content entry the container shows. */
export interface CalculatorContent {
  readonly updatedLabel: string;
  /** The ISO date of `updated`: the value of `<time datetime>`. */
  readonly updated: string;
  readonly updatedText: string;
  readonly sources: readonly SourceView[];
}
