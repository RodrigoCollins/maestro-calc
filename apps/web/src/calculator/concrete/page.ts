import { Rational } from '@maestro-calc/core';
import { concrete } from '../../lib/concrete.ts';
import { definePage, type PageModule } from '../page-module.ts';
import { choiceSlot } from '../slots/choices.ts';
import { costSlot } from '../slots/costs.ts';
import { stepperSlot } from '../slots/steppers.ts';
import { SHAPE_FIELDS } from './shapes.ts';

/** The concrete page: module #1 of the generic web layer. Language-free, so the client may import it. */
export const concretePage: PageModule<typeof concrete> = definePage({
  calculator: concrete,
  primary: { imperial: 'volumeYd3', metric: 'volumeM3' },
  choices: choiceSlot(concrete, [{ select: 'shape', shows: SHAPE_FIELDS }]),
  steppers: stepperSlot(concrete, { waste: Rational.of(5) }),
  costs: costSlot(
    concrete,
    [
      { output: 'bagCost', price: 'bagPrice' },
      { output: 'readyMixCost', price: 'readyMixPrice' },
    ],
    { hint: 'priceHint', note: 'readyMixNote' },
  ),
});
