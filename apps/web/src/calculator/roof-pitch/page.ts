import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { answerCase, answerValues } from './present.ts';

/** The roof pitch page: the pitch, the angle, the rafter and the IRC check in the answer. Language-free. */
export const roofPitchPage: PageModule<typeof roofPitch> = definePage({
  calculator: roofPitch,
  primary: { imperial: 'pitch', metric: 'angle' },
  answer: answerSlot(roofPitch, {
    cases: ['meets', 'double', 'below'],
    pick: answerCase,
    values: answerValues,
  }),
});
