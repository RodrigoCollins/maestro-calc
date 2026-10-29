import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { Rational } from '@maestro-calc/core';
import { concrete } from '../../lib/concrete.ts';
import { definePage, type PageModule } from '../page-module.ts';
import { choiceSlot } from '../slots/choices.ts';
import { answerSlot } from '../slots/answer.ts';
import { costSlot } from '../slots/costs.ts';
import { shoppingSlot } from '../slots/shopping.ts';
import { stepperSlot } from '../slots/steppers.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerValues, bagFills } from './present.ts';
import { SHAPE_FIELDS } from './shapes.ts';

/** The concrete page: module #1 of the generic web layer. Language-free, so the client may import it. */
export const concretePage: PageModule<typeof concrete> = definePage({
  calculator: concrete,
  primary: { imperial: 'volumeYd3', metric: 'volumeM3' },
  choices: choiceSlot(concrete, [{ select: 'shape', shows: SHAPE_FIELDS }]),
  steppers: stepperSlot(concrete, { waste: Rational.of(5) }),
  shopping: shoppingSlot(concrete, [
    {
      material: 'concrete-mix',
      label: 'shoppingLine',
      note: 'bagYield',
      parts: (moment) => ({
        unit: `bag-${moment.choices.bag}`,
        fills: bagFills(moment, CONCRETE_MIX_YIELDS),
      }),
    },
  ]),
  costs: costSlot(
    concrete,
    [
      { output: 'bagCost', price: 'bagPrice' },
      { output: 'readyMixCost', price: 'readyMixPrice' },
    ],
    { hint: 'priceHint', note: 'readyMixNote' },
  ),
  answer: answerSlot(concrete, { by: 'shape', values: answerValues }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
