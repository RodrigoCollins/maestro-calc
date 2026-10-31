import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { choiceSlot } from '../slots/choices.ts';
import { answerCase, answerValues } from './present.ts';

/** The feet and inches page: the operation drives the second field, the answer reads the sum. Language-free. */
export const feetInchesPage: PageModule<typeof feetInches> = definePage({
  calculator: feetInches,
  primary: { imperial: 'result', metric: 'resultM' },
  choices: choiceSlot(feetInches, [
    {
      select: 'operation',
      shows: { add: ['second'], subtract: ['second'], multiply: ['factor'], divide: ['factor'] },
    },
  ]),
  answer: answerSlot(feetInches, {
    cases: ['add', 'subtract', 'longer', 'multiply', 'divide'],
    pick: answerCase,
    values: answerValues,
  }),
});
