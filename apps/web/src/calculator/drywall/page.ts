import { drywall } from '../../lib/drywall.ts';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { costSlot } from '../slots/costs.ts';
import { shoppingSlot } from '../slots/shopping.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerValues, sheetFills } from './present.ts';

/** The drywall page: the area, the sheets, the finishing, the cost and the plan. Language-free, so the client may import it. */
export const drywallPage: PageModule<typeof drywall> = definePage({
  calculator: drywall,
  primary: { imperial: 'areaFt2', metric: 'areaM2' },
  shopping: shoppingSlot(drywall, [
    {
      material: 'drywall',
      label: 'shoppingSheets',
      parts: (moment) => ({ unit: `sheet-${moment.choices.sheet}`, fills: sheetFills(moment) }),
    },
    {
      material: 'joint-compound',
      label: 'shoppingCompound',
      parts: () => ({ unit: 'pail', fills: {} }),
    },
    { material: 'joint-tape', label: 'shoppingTape', parts: () => ({ unit: 'roll', fills: {} }) },
  ]),
  costs: costSlot(drywall, [{ output: 'cost', price: 'sheetPrice' }], { hint: 'priceHint' }),
  answer: answerSlot(drywall, { by: 'surfaces', values: answerValues }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
