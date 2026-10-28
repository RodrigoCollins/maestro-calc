/** A stylesheet without its comments, so a commented-out rule or `@media` counts for nothing. */
const withoutComments = (css: string): string => css.replaceAll(/\/\*[\s\S]*?\*\//g, '');

/** How many `@media` at-rules a stylesheet holds, comments aside. */
export const mediaCountOf = (css: string): number =>
  withoutComments(css).match(/@media\b/g)?.length ?? 0;

/**
 * The `@media` blocks of a stylesheet as `[condition, inner text]` (one level of nested rules).
 * Throws when it parses fewer blocks than the stylesheet holds (a nested at-rule such as
 * `@supports` inside `@media`, or a deeper nesting), so a block the parser cannot read is never
 * silently dropped.
 */
export const mediaBlocksOf = (css: string): [string, string][] => {
  const blocks = Array.from(
    withoutComments(css).matchAll(/@media([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g),
    ([, condition = '', inner = '']): [string, string] => [condition.trim(), inner],
  );
  const count = mediaCountOf(css);
  if (blocks.length !== count) {
    throw new Error(`parsed ${String(blocks.length)} of the ${String(count)} @media blocks`);
  }
  return blocks;
};

/** Every length of a media condition as `[number, unit]`, whatever the syntax (`min-width: 30rem`, `width>=30rem`). */
export const lengthsOf = (condition: string): [number, string][] =>
  Array.from(condition.matchAll(/(\d*\.?\d+)([a-z]+)/g), ([, value = '', unit = '']) => [
    Number(value),
    unit,
  ]);

/** The flat rules of a block's inner text as `[selectors, declarations]`. */
const rulesIn = (inner: string): [string[], string][] =>
  Array.from(inner.matchAll(/([^{}]+)\{([^{}]*)\}/g), ([, selectors = '', body = '']) => [
    selectors.split(',').map((selector) => selector.trim()),
    body,
  ]);

/**
 * The `@media` breakpoints, in rem and ascending, at which a page's CSS changes a custom property.
 * A property set on `.calculator` takes the breakpoints of those rules (a page's head style);
 * otherwise it takes those of the `:root` rules (`calculator.css`). Empty when no block sets it.
 */
export const edgesOf = (css: string, property: string): number[] => {
  const blocks = mediaBlocksOf(css);
  const setBy = (selector: string): number[] =>
    blocks.flatMap(([condition, inner]) =>
      rulesIn(inner).some(
        ([selectors, body]) =>
          selectors.includes(selector) &&
          body.split(';').some((declaration) => declaration.split(':')[0]?.trim() === property),
      )
        ? lengthsOf(condition).map(([value]) => value)
        : [],
    );
  const own = setBy('.calculator');
  return [...new Set(own.length > 0 ? own : setBy(':root'))].toSorted((a, b) => a - b);
};
