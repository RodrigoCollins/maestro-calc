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

/** An input a choice drives: held once in the page, visible while the pressed option shows it (the choice slot, `calculator/slots/choices.ts`). */
export interface AreaField extends Field {
  readonly visible: boolean;
}

/** A single-choice group built from a select input, and the block of fields it drives, if any. */
export interface ChoiceItemView {
  readonly kind: 'choice';
  /** The select key: the value of `data-choice`, of `data-reserved` and of the legend id. */
  readonly key: string;
  readonly label: string;
  readonly choices: readonly Choice[];
  /** The driven fields in definition order and the rows the block reserves (`--calc-rows`). */
  readonly area?: { readonly rows: number; readonly fields: readonly AreaField[] };
}

/** A text input, with the two buttons of its stepper when the module has one for it. */
export interface FieldItemView {
  readonly kind: 'field';
  readonly field: Field;
  readonly stepper?: { readonly key: string; readonly less: string; readonly more: string };
}

export interface FormView {
  readonly unitsLabel: string;
  readonly units: readonly Choice[];
  /** The items in the one order of the form (the definition's), between the units and the copy button. */
  readonly items: readonly (ChoiceItemView | FieldItemView)[];
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
  readonly form: FormView;
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
