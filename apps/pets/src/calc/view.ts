import { Rational, type Calculator, type InputDescriptor, type OutputDescriptor } from '@maestro-calc/core';

/**
 * What a calculator page changes when its result changes, in the words and markup of the page:
 * text for each `[data-text]` element, markup for each `[data-html]` one, whether each `[data-show]`
 * element is visible, the CSS custom properties of the result, and its `data-*` flags. The page
 * renders the patch of its starting values on the server and the script applies the next one, so
 * the markup a visitor sees first and the markup after an edit come from one function.
 */
export interface Patch {
  readonly text: Readonly<Record<string, string>>;
  readonly html: Readonly<Record<string, string>>;
  readonly show: Readonly<Record<string, boolean>>;
  readonly vars: Readonly<Record<string, string>>;
  readonly flags: Readonly<Record<string, string>>;
}

/** The numeric outputs of a run, by key. */
export type Figures = ReadonlyMap<string, Rational>;

/** The raw field values a page reads from its form. */
export type Raw = Readonly<Record<string, string | undefined>>;

/** Any calculator of the site. */
export type AnyCalculator = Calculator<
  string,
  readonly InputDescriptor[],
  readonly OutputDescriptor[],
  readonly string[]
>;

/** A calculator page's view: the figures of a run and its raw fields to the patch of the page. */
export type View = (figures: Figures, raw: Raw, warnings: ReadonlySet<string>) => Patch;

/** The patch of a calculator run on `raw`, or `undefined` when a field cannot be read. */
export const patchOf = (calculator: AnyCalculator, view: View, raw: Raw): Patch | undefined => {
  const ran = calculator.run(raw);
  if (!ran.ok) return undefined;
  const figures = new Map(
    ran.value.outputs.flatMap(({ key, value }) => (value instanceof Rational ? [[key, value]] : [])),
  );
  return view(figures, raw, new Set(ran.value.warnings.map(({ code }) => code)));
};

/** The figure of an output; the engine always gives every output it declares. */
export const figureOf = (figures: Figures, key: string): Rational => {
  const value = figures.get(key);
  if (value === undefined) throw new Error(`no output ${key}`);
  return value;
};
