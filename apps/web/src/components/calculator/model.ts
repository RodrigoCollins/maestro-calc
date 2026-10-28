/*
 * What the calculator parts are given: the view of one page, built by `lib/page-view.ts` from the
 * module's definition, its slots and the catalog. The form is a list of items (choice groups with
 * the block they drive, fields with their stepper), the result a primary figure, rows, shopping
 * lines and cost rows; nothing here names a calculator. The route-free container and the parts
 * below it read no catalog, route table or content collection: the caller resolves every text and
 * passes it in.
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
  /** The select key: the value of `data-choice` on the group and the stem of the legend id. */
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

/** A text around a value the script rewrites, with the name of that value (`data-fill`) when it has one. */
export interface FillSplit extends Split {
  readonly name?: string;
}

/** One shopping line: the label and the optional note each carry their own fill. */
export interface ShoppingLineView {
  /** The purchase unit id shown, `bag-80`: the value of `data-shopping`. */
  readonly unit: string;
  readonly qty: string;
  /** `Concrete mix, <80> lb bags`: the value is the bag size. */
  readonly label: FillSplit;
  /** `About <0.60> cubic feet per bag`. */
  readonly note?: FillSplit;
}

export interface ResultView {
  readonly heading: string;
  /**
   * The large figure: `{before}<value>{after}`, for example `1.63 cubic yards`. `prefixed` says
   * whether the sentence of either unit system has text before the value: the page then holds the
   * `data-primary-before` span (empty when the US sentence has none) for the script to write.
   */
  readonly primary: Split & { readonly key: string; readonly prefixed: boolean };
  /** The viewBox of the drawing box after the large figure, for a module with the drawing slot. */
  readonly drawing?: { readonly width: number; readonly height: number };
  readonly rows: readonly Row[];
  /** One entry per line the module declares, in declared order; empty for a module with none. */
  readonly shopping: readonly ShoppingLineView[];
  readonly costs: readonly CostRow[];
  /** The note under the cost rows, when the cost slot has one. */
  readonly costsNote?: string;
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

/** Everything the container renders from the engine and the catalogs. */
export interface CalculatorPageView {
  readonly id: string;
  readonly title: string;
  readonly breadcrumb: BreadcrumbView;
  /** The short answer of the default state; present only for a module with an answer slot. */
  readonly answer?: string;
  readonly notRunning: string;
  readonly form: FormView;
  readonly result: ResultView;
  /** The messages the script uses, in order, written into one inert `<template>`: `[name, text]`. */
  readonly messages: readonly (readonly [string, string])[];
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
