import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import type { Ready } from '../page-module.ts';
import { required } from '../controller.ts';
import { dimensionText, outputText } from '../present.ts';

type Moment = Ready<typeof roofPitch>;

/** The figure of an output of the moment, as its row writes it. */
const figure = ({ result }: Moment, key: 'pitch' | 'angle'): string => {
  const output = required(
    roofPitch.outputs.find((each) => each.key === key),
    key,
  );
  const value = required(
    result.outputs.find((each) => each.key === key),
    key,
  ).value;
  return outputText(output, value);
};

/** The case of the answer: below the IRC minimum, two layers of underlayment, or it meets it. */
export const answerCase = ({ result }: Moment): string => {
  const codes = result.warnings.map(({ code }) => code);
  if (codes.includes('belowMinimum')) return 'below';
  return codes.includes('doubleUnderlayment') ? 'double' : 'meets';
};

/**
 * The placeholder values of the answer: the rise and the run as the language-free text of the
 * answer, the pitch in 12, the angle with its degree sign, and the IRC minimum when it is missed.
 */
export const answerValues = (moment: Moment): Record<string, string> => {
  const { valid, result, system } = moment;
  const below = result.warnings.find(({ code }) => code === 'belowMinimum');
  return {
    rise: dimensionText(valid.rise, system),
    run: dimensionText(valid.run, system),
    pitch: figure(moment, 'pitch'),
    angle: `${figure(moment, 'angle')}°`,
    minimum: below === undefined ? '' : String(below.params['minimum']),
  };
};
