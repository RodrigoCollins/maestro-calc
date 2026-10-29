import { mulch } from '@maestro-calc/core/calculators/mulch';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { costSlot } from '../slots/costs.ts';
import { shoppingSlot } from '../slots/shopping.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerValues, bagFills } from './present.ts';

/** The mulch page: the volume, the bags, both costs and the plan. Language-free, so the client may import it. */
export const mulchPage: PageModule<typeof mulch> = definePage({
  calculator: mulch,
  primary: { imperial: 'volumeYd3', metric: 'volumeM3' },
  shopping: shoppingSlot(mulch, [
    {
      material: 'mulch',
      label: 'shoppingLine',
      parts: (moment) => ({ unit: `bag-${moment.choices.bag}`, fills: bagFills(moment) }),
    },
  ]),
  costs: costSlot(
    mulch,
    [
      { output: 'bagCost', price: 'bagPrice' },
      { output: 'bulkCost', price: 'yardPrice' },
    ],
    { hint: 'priceHint' },
  ),
  answer: answerSlot(mulch, { values: answerValues }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
