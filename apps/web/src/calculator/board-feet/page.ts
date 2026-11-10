import { boardFeet } from '@maestro-calc/core/calculators/board-feet';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { costSlot } from '../slots/costs.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerCase, answerValues } from './present.ts';

/** The board feet page: the board feet, the cost, the answer and the face of one board. Language-free. */
export const boardFeetPage: PageModule<typeof boardFeet> = definePage({
  calculator: boardFeet,
  costs: costSlot(boardFeet, [{ output: 'cost', price: 'price' }], { hint: 'priceHint' }),
  answer: answerSlot(boardFeet, { cases: ['one', 'many'], pick: answerCase, values: answerValues }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
