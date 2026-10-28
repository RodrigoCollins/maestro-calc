import type { Frame } from '../calculator/page-module.ts';

/**
 * The line counts one page reserves for a block, as the base count and then one step per
 * breakpoint: `[base, [rem, lines], ...]`. Breakpoints are `rem` (they follow text zoom) and
 * increase strictly.
 */
export type LineSteps = readonly [
  base: number,
  ...steps: readonly (readonly [rem: number, lines: number])[],
];

/**
 * What a page reserves instead of the shared stylesheet: the lines of its answer and of its notice.
 * A property it sets replaces the whole ladder of `calculator.css` for that property, at every
 * width: the value on `.calculator` is inherited over the `:root` media values, so a page that sets
 * a property restates every step it needs.
 */
export interface Reserve {
  readonly answer?: LineSteps;
  readonly notice?: LineSteps;
}

/** The CSS of a reserve, written by the builders of this module only: the one string a page head renders as a style. */
export type ReserveCss = string & { readonly __brand: 'ReserveCss' };

/**
 * The custom property each block of a reserve sets, in output order. Each row is checked against
 * `keyof Reserve`, and `reserve.test-d.ts` fails when a key of `Reserve` has no row.
 */
export const RESERVE_PROPERTIES = [
  ['answer', '--answer-lines'],
  ['notice', '--notice-lines'],
] as const satisfies readonly (readonly [keyof Reserve, `--${string}`])[];

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

/** The steps of one property as `[property, rem, lines]`, checked; throws on a bad count or breakpoint. */
const stepsOf = (property: string, [base, ...steps]: LineSteps): [number, number][] => {
  if (!isCount(base))
    throw new TypeError(`${property}: the count ${String(base)} is not a positive integer`);
  let previous = 0;
  return steps.map(([rem, lines]) => {
    if (typeof rem !== 'number' || !Number.isFinite(rem) || rem <= previous) {
      throw new TypeError(
        `${property}: the breakpoint ${String(rem)} is not a rem value above ${String(previous)}`,
      );
    }
    if (!isCount(lines))
      throw new TypeError(`${property}: the count ${String(lines)} is not a positive integer`);
    previous = rem;
    return [rem, lines];
  });
};

/**
 * The minified CSS of a reserve: the base counts on `.calculator`, then one `min-width` block per
 * distinct breakpoint, ascending, that sets the properties stepping there. Nothing for an empty
 * reserve, so no empty `<style>` reaches a head.
 *
 * Throws on a count that is not a positive integer and on a breakpoint that is not an increasing
 * `rem` value, so a `px` breakpoint never reaches a page.
 */
export const reserveCss = (reserve: Reserve): ReserveCss | undefined => {
  const present = RESERVE_PROPERTIES.flatMap(([name, property]) => {
    const steps = reserve[name];
    return steps === undefined
      ? []
      : [{ property, base: steps[0], steps: stepsOf(property, steps) }];
  });
  if (present.length === 0) return undefined;
  const base = present.map(({ property, base: count }) => `${property}:${String(count)}`).join(';');
  const rems = [...new Set(present.flatMap(({ steps }) => steps.map(([rem]) => rem)))].toSorted(
    (a, b) => a - b,
  );
  const blocks = rems.map((rem) => {
    const declarations = present.flatMap(({ property, steps }) => {
      const step = steps.find(([at]) => at === rem);
      return step === undefined ? [] : [`${property}:${String(step[1])}`];
    });
    return `@media(min-width:${String(rem)}rem){.calculator{${declarations.join(';')}}}`;
  });
  // The one place a string becomes `ReserveCss`: the brand marks what this builder wrote.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a string brand has no constructor
  return `.calculator{${base}}${blocks.join('')}` as ReserveCss;
};

/**
 * The rule of the drawing box of a page that declares the drawing slot (blueprint-drawing ›
 * [BD22]): a block as wide as the panel up to 24rem, its height from the frame's aspect ratio, so
 * the box has its size before the script draws. The labels inherit the display font at 17 units.
 *
 * From 48rem the panel is two columns ([BD20]): the heading, the large figure, the rows and the
 * notes on the left, the drawing on the right across the first four rows, the last of which takes
 * what the drawing adds, so the left column keeps its own spacing. Only a page that draws carries
 * it, so the shared stylesheet and the pages without a drawing are unchanged.
 */
export const drawingCss = ({ width, height }: Frame): ReserveCss =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a string brand has no constructor
  `[data-drawing]{display:block;width:100%;max-width:24rem;aspect-ratio:${String(width)}/${String(height)};margin-bottom:var(--space-3);font:600 17px var(--font-display)}@media(min-width:48rem){.calc-result{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);grid-template-rows:auto auto auto 1fr;column-gap:var(--space-4);align-items:start}.calc-result>*{grid-column:1}.calc-result>[data-drawing]{grid-column:2;grid-row:1/-1;max-width:none;margin:0}}` as ReserveCss;

/** The rule sets of a page head in order, joined; nothing when there is none. */
export const joinCss = (...parts: readonly (ReserveCss | undefined)[]): ReserveCss | undefined => {
  const present = parts.filter((part) => part !== undefined);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- joined builder outputs stay builder output
  return present.length === 0 ? undefined : (present.join('') as ReserveCss);
};
