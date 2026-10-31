import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerCase, answerValues } from './present.ts';

/** The roof pitch page: the pitch, the angle, the rafter, the IRC check in the answer and the slope. Language-free. */
export const roofPitchPage: PageModule<typeof roofPitch> = definePage({
  calculator: roofPitch,
  primary: { imperial: 'pitch', metric: 'angle' },
  answer: answerSlot(roofPitch, {
    cases: ['meets', 'double', 'below'],
    pick: answerCase,
    values: answerValues,
  }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
