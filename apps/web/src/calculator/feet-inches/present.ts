import { Rational } from '@maestro-calc/core';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { required } from '../controller.ts';
import type { Ready } from '../page-module.ts';
import { decimalText, dimensionText, groupedInteger, outputText } from '../present.ts';

type Moment = Ready<typeof feetInches>;

/** The value of an intermediate number of the result: the whole pieces or the exact quotient of a fit. */
export const numberOf = ({ result }: Moment, key: 'pieces' | 'ratio'): Rational =>
  required(
    result.outputs.find(
      (each): each is Extract<typeof each, { key: typeof key }> => each.key === key,
    ),
    key,
  ).value;

const HUNDRED = Rational.of(100);

/**
 * The quotient of a fit to two places, cut (never rounded up, so its whole part is always the
 * pieces: 1.998 reads 1.99, not 2.00) and without trailing zeros: `15`, `1.2`, `34.28`.
 */
export const ratioText = (ratio: Rational): string =>
  decimalText(Rational.of(ratio.mul(HUNDRED).floor(), 100), 2, true).replace(/\.?0+$/, '');

/**
 * The case of the answer: `longer` when a subtraction's second length is the longer, `zeroPiece`
 * for a fit of a zero length (the two warnings), `fitOne` for a fit of one whole piece, else the
 * operation.
 */
export const answerCase = (moment: Moment): string => {
  const [warning] = moment.result.warnings;
  if (warning !== undefined) return warning.code === 'secondLonger' ? 'longer' : 'zeroPiece';
  const { operation } = moment.valid;
  return operation === 'fit' && numberOf(moment, 'pieces').equals(Rational.of(1))
    ? 'fitOne'
    : operation;
};

/**
 * The length left over from a fit as the large figure of the other operations writes it: feet and
 * inches to 1/16 in, or meters to three places. The large figure of a fit is the pieces.
 */
const leftoverText = ({ result, system }: Moment): string => {
  const key = system === 'metric' ? 'resultM' : 'result';
  const output = required(
    feetInches.outputs.find((each) => each.key === key),
    key,
  );
  const value = required(
    result.outputs.find((each) => each.key === key),
    key,
  ).value;
  const figure = outputText(output, value);
  return system === 'metric' ? `${figure} m` : figure;
};

/**
 * The placeholder values of the answer: both lengths as text, the number, the pieces and quotient
 * of a fit, and the result: the length the slot hands over, or the length left over from a fit.
 */
export const answerValues = (moment: Moment, primary: string): Record<string, string> => {
  const { valid, system } = moment;
  return {
    first: dimensionText(valid.first, system),
    second: dimensionText(valid.second, system),
    factor: String(valid.factor),
    pieces: groupedInteger(numberOf(moment, 'pieces').floor()),
    ratio: ratioText(numberOf(moment, 'ratio')),
    result: valid.operation === 'fit' ? leftoverText(moment) : primary,
  };
};
