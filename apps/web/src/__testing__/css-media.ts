/** The `@media` blocks of a stylesheet as `[condition, inner text]` (one level of nested rules). */
export const mediaBlocksOf = (css: string): [string, string][] =>
  Array.from(
    css.matchAll(/@media([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g),
    ([, condition = '', inner = '']) => [condition.trim(), inner],
  );

/** Every length of a media condition as `[number, unit]`, whatever the syntax (`min-width: 30rem`, `width>=30rem`). */
export const lengthsOf = (condition: string): [number, string][] =>
  Array.from(condition.matchAll(/(\d*\.?\d+)([a-z]+)/g), ([, value = '', unit = '']) => [
    Number(value),
    unit,
  ]);
