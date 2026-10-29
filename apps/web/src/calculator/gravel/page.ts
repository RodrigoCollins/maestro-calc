import { gravel } from '../../lib/gravel.ts';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { costSlot } from '../slots/costs.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerValues } from './present.ts';

/** The gravel page: the weight to order, its cost and the plan. Language-free, so the client may import it. */
export const gravelPage: PageModule<typeof gravel> = definePage({
  calculator: gravel,
  primary: { imperial: 'tons', metric: 'tonnes' },
  costs: costSlot(gravel, [{ output: 'cost', price: 'tonPrice' }], { hint: 'priceHint' }),
  answer: answerSlot(gravel, { by: 'placement', values: answerValues }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
