/*
 * The comparison behind the released-key contract test. It lives beside the codec, not in
 * `__testing__`, so that the `url` mutation shard mutates it (the shards skip `__testing__`): a
 * harness that cannot fail would guard nothing. No barrel exports it.
 */
import type { AnyCalculator, InputDescriptor } from '../calculator/descriptors.ts';
import { urlTextOf, type UrlCodable } from './codec.ts';

/**
 * One input of a released calculator as the public URL contract records it (url-state-codec ›
 * Key stability rules, rule 8). `default` is the canonical URL text of the default (inches, dollars,
 * an integer, an option id, `1` or `0`); `options` is present for a `select` only. `retired` marks
 * a field that was dropped (rules 2 and 3): its tuple stays in the snapshot for good, no input may
 * carry its `urlKey` again, and the calculator must list the key in `retiredUrlKeys`.
 */
export interface ReleasedField {
  readonly calculatorId: string;
  readonly key: string;
  readonly urlKey: string;
  readonly kind: InputDescriptor['kind'];
  readonly default: string;
  readonly options?: readonly string[];
  readonly retired?: true;
}

/** What the harness reads of a calculator: the codec's view plus the keys it has retired. */
export type ReleasedCalculator = UrlCodable & Pick<AnyCalculator, 'retiredUrlKeys'>;

/** What a default is reported as when it is not a value of the kind of its input. */
const NOT_A_VALUE = '(not a value)';

/** What is wrong with one released tuple, compared with the input now at its position. */
const compareField = (tuple: ReleasedField, input: InputDescriptor | undefined): string[] => {
  const name = `${tuple.calculatorId}.${tuple.key}`;
  if (input === undefined) return [`${name}: field removed`];
  const changed = (what: string, was: string, now: string): string[] =>
    was === now ? [] : [`${name}: ${what} changed from "${was}" to "${now}"`];
  return [
    ...changed('key', tuple.key, input.key),
    ...changed('url key', tuple.urlKey, input.urlKey),
    ...changed('kind', tuple.kind, input.kind),
    ...changed('default', tuple.default, urlTextOf(input, input.default) ?? NOT_A_VALUE),
    ...compareOptions(name, tuple, input),
  ];
};

/** Options are recorded for a select only; adding an option is allowed, removing one is not. */
const compareOptions = (name: string, tuple: ReleasedField, input: InputDescriptor): string[] => {
  if (tuple.kind !== 'select') {
    return tuple.options === undefined ? [] : [`${name}: only a select tuple has options`];
  }
  if (tuple.options === undefined) return [`${name}: a select tuple needs options`];
  const removed = (option: string): boolean =>
    input.kind !== 'select' || !input.options.includes(option);
  return tuple.options.filter(removed).map((option) => `${name}: option "${option}" removed`);
};

/** What is wrong with one retired tuple: its key must be recorded, and no input may reuse it. */
const compareRetired = (tuple: ReleasedField, calculator: ReleasedCalculator): string[] => {
  const name = `${tuple.calculatorId}.${tuple.key}`;
  const key = `"${tuple.urlKey}"`;
  const reused = calculator.inputs.find((input) => input.urlKey === tuple.urlKey);
  return [
    ...(calculator.retiredUrlKeys.includes(tuple.urlKey)
      ? []
      : [`${name}: retired url key ${key} is missing from retiredUrlKeys`]),
    ...(reused === undefined
      ? []
      : [`${name}: retired url key ${key} is used again by the input "${reused.key}"`]),
  ];
};

/**
 * The violations of the key-stability contract, empty when the calculators honour the snapshot:
 * the live tuples (all but the retired ones) must match the inputs at their position, so a new
 * field can only be appended; a retired tuple must have its key in `retiredUrlKeys` and no input
 * on it; a released calculator must still exist. Calculators with no tuple in the snapshot are not
 * checked yet (the completeness test of PR 12 covers them).
 */
export const compareReleased = (
  snapshot: readonly ReleasedField[],
  calculators: readonly ReleasedCalculator[],
): string[] =>
  [...new Set(snapshot.map(({ calculatorId }) => calculatorId))].flatMap((id) => {
    const calculator = calculators.find((candidate) => candidate.id === id);
    if (calculator === undefined) return [`${id}: released calculator is missing`];
    const tuples = snapshot.filter(({ calculatorId }) => calculatorId === id);
    return [
      ...tuples
        .filter(({ retired }) => retired !== true)
        .flatMap((tuple, index) => compareField(tuple, calculator.inputs[index])),
      ...tuples
        .filter(({ retired }) => retired === true)
        .flatMap((tuple) => compareRetired(tuple, calculator)),
    ];
  });
