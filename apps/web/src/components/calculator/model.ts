/*
 * What the calculator parts are given. The shapes below the generic ones (`Choice`, `Field`, the
 * breadcrumb, the sources) are the concrete calculator's own (`Concrete*`: waste, bag size, prices,
 * one shopping line); a second calculator either brings its own or extracts a generic core from
 * them. The route-free container and the parts below it read no catalog, route table or content
 * collection: the caller resolves every text and passes it in.
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
  /** The unit a plain number is read in, written for the active unit system (length fields only). */
  readonly hint?: string;
  /** A sentence that describes the input (the waste help). */
  readonly help?: string;
}

/** A dimension input: held once in the page, visible while the pressed shape uses it (`concrete-layout.ts`). */
export interface ShapeField extends Field {
  readonly visible: boolean;
}

export interface ConcreteFormView {
  readonly unitsLabel: string;
  readonly units: readonly Choice[];
  readonly shapeLabel: string;
  readonly shapes: readonly Choice[];
  /** Every dimension input once, in the one order of the form (`DIMENSION_ORDER`). */
  readonly fields: readonly ShapeField[];
  readonly waste: Field & { readonly help: string; readonly less: string; readonly more: string };
  readonly bagLabel: string;
  readonly bags: readonly Choice[];
  readonly prices: readonly Field[];
  readonly copyLabel: string;
}

/** Text around a value the script rewrites: `{before}<value>{after}`, for example `About 0.60 cubic feet per bag`. */
export interface Split {
  readonly before: string;
  readonly value: string;
  readonly after: string;
}

/** A labelled figure of the panel, addressed by its output key. */
export interface Row {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  /** Hidden while the large figure shows the same volume (the script swaps it with the unit system). */
  readonly hidden?: boolean;
}

/** A cost row: visible only when its price is above zero, else the hint shows. */
export interface CostRow extends Row {
  readonly visible: boolean;
  readonly hint: string;
}

export interface ShoppingView {
  /** The purchase unit id shown, `bag-80`: the value of `data-shopping`. */
  readonly unit: string;
  readonly qty: string;
  /** `Concrete mix, <80> lb bags`: the value is the bag size. */
  readonly label: Split;
  /** `About <0.60> cubic feet per bag`. */
  readonly bagYield: Split;
}

export interface ConcreteResultView {
  readonly heading: string;
  /** The large figure: `{before}<value>{after}`, for example `1.63 cubic yards`. */
  readonly primary: Split & { readonly key: string };
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
export interface ConcreteTemplatesView {
  /** The user-facing error messages by code, with their `{min}` / `{max}` placeholders. */
  readonly errors: Readonly<Record<string, string>>;
  /** The short-answer sentences by shape. */
  readonly answers: Readonly<Record<string, string>>;
  /** The copy states: `copied` and `failed`. */
  readonly copy: { readonly copied: string; readonly failed: string };
  /** The unit hints by unit id (`ft`, `in`, `m`, `cm`), for the script to write on a unit change. */
  readonly hints: Readonly<Record<'ft' | 'in' | 'm' | 'cm', string>>;
  /** The volume sentences with `{value}`: the large figure and the short answer use them in either system. */
  readonly volumes: Readonly<Record<'yd3' | 'm3', string>>;
}

/** Everything the container renders from the engine and the catalogs. */
export interface ConcretePageView {
  readonly id: string;
  readonly title: string;
  readonly breadcrumb: BreadcrumbView;
  readonly answer: string;
  readonly notRunning: string;
  readonly form: ConcreteFormView;
  readonly result: ConcreteResultView;
  readonly templates: ConcreteTemplatesView;
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
