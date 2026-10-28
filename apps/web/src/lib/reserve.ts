/**
 * The line counts one page reserves for a block, as the base count and then one step per
 * breakpoint: `[base, [rem, lines], ...]`. Breakpoints are `rem` (they follow text zoom) and
 * increase strictly.
 */
export type LineSteps = readonly [
  base: number,
  ...steps: readonly (readonly [rem: number, lines: number])[],
];

/** What a page reserves on top of the shared stylesheet: the lines of its answer and of its notice. */
export interface Reserve {
  readonly answer?: LineSteps;
  readonly notice?: LineSteps;
}

const PROPERTIES = [
  ['answer', '--answer-lines'],
  ['notice', '--notice-lines'],
] as const;

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
 * distinct breakpoint, ascending, that sets the properties stepping there. Empty for an empty
 * reserve. Throws on a count that is not a positive integer and on a breakpoint that is not an
 * increasing `rem` value, so a `px` breakpoint never reaches a page.
 */
export const reserveCss = (reserve: Reserve): string => {
  const present = PROPERTIES.flatMap(([name, property]) => {
    const steps = reserve[name];
    return steps === undefined
      ? []
      : [{ property, base: steps[0], steps: stepsOf(property, steps) }];
  });
  if (present.length === 0) return '';
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
  return `.calculator{${base}}${blocks.join('')}`;
};
