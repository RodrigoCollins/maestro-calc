import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { costSlot } from '../slots/costs.ts';
import { shoppingSlot } from '../slots/shopping.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerValues, bagFills } from './present.ts';

/** The topsoil page: the volume, the bags, both costs and the plan. Language-free, so the client may import it. */
export const topsoilPage: PageModule<typeof topsoil> = definePage({
  calculator: topsoil,
  primary: { imperial: 'volumeYd3', metric: 'volumeM3' },
  shopping: shoppingSlot(topsoil, [
    {
      material: 'topsoil',
      label: 'shoppingLine',
      parts: (moment) => ({ unit: `bag-${moment.choices.bag}`, fills: bagFills(moment) }),
    },
  ]),
  costs: costSlot(
    topsoil,
    [
      { output: 'bagCost', price: 'bagPrice' },
      { output: 'bulkCost', price: 'yardPrice' },
    ],
    { hint: 'priceHint' },
  ),
  answer: answerSlot(topsoil, { values: answerValues }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
