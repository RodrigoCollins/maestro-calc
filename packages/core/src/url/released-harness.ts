/*
 * The comparison behind the released-key contract test. It lives beside the codec, not in
 * `__testing__`, so that the `url` mutation shard mutates it (the shards skip `__testing__`): a
 * harness that cannot fail would guard nothing. No barrel exports it.
 */
import type { InputDescriptor } from '../calculator/descriptors.ts';
import { urlTextOf, type UrlCodable } from './codec.ts';

/**
 * One input of a released calculator as the public URL contract records it (url-state-codec ›
 * Key stability rules, rule 8). `default` is the canonical URL text of the default (inches, dollars,
 * an integer, an option id, `1` or `0`); `options` is present for a `select` only.
 */
export interface ReleasedField {
  readonly calculatorId: string;
  readonly key: string;
  readonly urlKey: string;
  readonly kind: InputDescriptor['kind'];
  readonly default: string;
  readonly options?: readonly string[];
}

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
    ...changed('default', tuple.default, urlTextOf(input, input.default) ?? ''),
    ...compareOptions(name, tuple, input),
  ];
};

/** Options are recorded for a select only; adding an option is allowed, removing one is not. */
const compareOptions = (name: string, tuple: ReleasedField, input: InputDescriptor): string[] => {
  if (tuple.kind !== 'select') {
    return tuple.options === undefined ? [] : [`${name}: only a select tuple has options`];
  }
  if (tuple.options === undefined) return [`${name}: a select tuple needs options`];
  const now: readonly string[] = input.kind === 'select' ? input.options : [];
  return tuple.options
    .filter((option) => !now.includes(option))
    .map((option) => `${name}: option "${option}" removed`);
};

/**
 * The violations of the key-stability contract, empty when the calculators honour the snapshot:
 * every tuple must still match the input at its position (so a new field can only be appended), a
 * released calculator must still exist, and nothing but appending is allowed.
 */
export const compareReleased = (
  snapshot: readonly ReleasedField[],
  calculators: readonly UrlCodable[],
): string[] =>
  [...new Set(snapshot.map(({ calculatorId }) => calculatorId))].flatMap((id) => {
    const calculator = calculators.find((candidate) => candidate.id === id);
    if (calculator === undefined) return [`${id}: released calculator is missing`];
    return snapshot
      .filter(({ calculatorId }) => calculatorId === id)
      .flatMap((tuple, index) => compareField(tuple, calculator.inputs[index]));
  });
