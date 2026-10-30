import { roofing } from '../../lib/roofing.ts';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { costSlot } from '../slots/costs.ts';
import { shoppingSlot } from '../slots/shopping.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerCase, answerValues } from './present.ts';

/** The roofing page: the squares, the bundles, the rolls, the costs, the IRC check and the plan. Language-free. */
export const roofingPage: PageModule<typeof roofing> = definePage({
  calculator: roofing,
  primary: { imperial: 'squares', metric: 'areaM2' },
  shopping: shoppingSlot(roofing, [
    {
      material: 'shingles',
      label: 'shoppingShingles',
      parts: () => ({ unit: 'bundle', fills: {} }),
    },
    {
      material: 'underlayment',
      label: 'shoppingUnderlayment',
      parts: () => ({ unit: 'roll', fills: {} }),
    },
  ]),
  costs: costSlot(
    roofing,
    [
      { output: 'shinglesCost', price: 'bundlePrice' },
      { output: 'underlaymentCost', price: 'rollPrice' },
    ],
    { hint: 'priceHint' },
  ),
  answer: answerSlot(roofing, {
    cases: ['meets', 'double', 'below'],
    pick: answerCase,
    values: answerValues,
  }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
