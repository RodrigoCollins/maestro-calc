import type { AnyCalculator } from './descriptors.ts';

/** The parts of a calculator that its message keys derive from. */
export type MessageKeySource = Pick<AnyCalculator, 'id' | 'inputs' | 'outputs' | 'warnings'>;

// One key per option of a select input; every other kind has no `options` and yields `never`.
type OptionKeys<Id extends string, D> = D extends {
  readonly key: infer Key extends string;
  readonly options: readonly (infer Option extends string)[];
}
  ? `calc.${Id}.options.${Key}.${Option}`
  : never;

/**
 * The i18n keys a calculator needs, derived from its definition (i18n-catalog › Key naming
 * convention): a title, one label per input, one per option of each select input, one per output
 * and one per warning code. The catalogs live in `@maestro-calc/i18n`; core only names the keys.
 */
export type MessageKeysOf<C extends MessageKeySource> =
  | `calc.${C['id']}.title`
  | `calc.${C['id']}.inputs.${C['inputs'][number]['key']}`
  | OptionKeys<C['id'], C['inputs'][number]>
  | `calc.${C['id']}.outputs.${C['outputs'][number]['key']}`
  | `calc.${C['id']}.warnings.${C['warnings'][number]}`;

/**
 * The runtime twin of `MessageKeysOf`, in the order title, inputs, options, outputs, warnings.
 * It returns `readonly string[]` because a key built at runtime cannot be narrowed to the literal
 * union without an assertion; the type-level and runtime sets are pinned equal by tests.
 */
export const messageKeysOf = ({
  id,
  inputs,
  outputs,
  warnings,
}: MessageKeySource): readonly string[] => {
  const prefix = `calc.${id}`;
  return [
    `${prefix}.title`,
    ...inputs.map(({ key }) => `${prefix}.inputs.${key}`),
    ...inputs.flatMap((input) =>
      input.kind === 'select'
        ? input.options.map((option) => `${prefix}.options.${input.key}.${option}`)
        : [],
    ),
    ...outputs.map(({ key }) => `${prefix}.outputs.${key}`),
    ...warnings.map((code) => `${prefix}.warnings.${code}`),
  ];
};
