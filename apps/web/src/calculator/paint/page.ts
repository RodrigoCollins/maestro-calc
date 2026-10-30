import { paint } from '../../lib/paint.ts';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { costSlot } from '../slots/costs.ts';
import { shoppingSlot } from '../slots/shopping.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerValues } from './present.ts';

/** The paint page: the gallons, the cans, the cost and the plan. Language-free, so the client may import it. */
export const paintPage: PageModule<typeof paint> = definePage({
  calculator: paint,
  primary: { imperial: 'gallons', metric: 'liters' },
  shopping: shoppingSlot(paint, [
    { material: 'paint', label: 'shoppingLine', parts: () => ({ unit: 'gallon', fills: {} }) },
  ]),
  costs: costSlot(paint, [{ output: 'cost', price: 'gallonPrice' }], { hint: 'priceHint' }),
  answer: answerSlot(paint, { values: answerValues }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
