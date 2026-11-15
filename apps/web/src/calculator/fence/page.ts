import { fence } from '../../lib/fence.ts';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { choiceSlot } from '../slots/choices.ts';
import { costSlot } from '../slots/costs.ts';
import { shoppingSlot } from '../slots/shopping.ts';
import { FRAME, MESSAGES, planOf } from './plan.ts';
import { answerValues, bagFills, boardFills, postFills, railFills } from './present.ts';

/**
 * The fence page: the posts, the holes, the four lines to buy, the costs, the answer and the face
 * of the run. Each style shows the board fields it uses. Language-free, so the client may import it.
 */
export const fencePage: PageModule<typeof fence> = definePage({
  calculator: fence,
  choices: choiceSlot(fence, [
    {
      select: 'style',
      shows: {
        privacy: ['boardWidth', 'boardSpace'],
        picket: ['boardWidth', 'gap'],
        rail: [],
      },
    },
  ]),
  shopping: shoppingSlot(fence, [
    {
      material: 'fence-post',
      label: 'shoppingPosts',
      parts: (moment) => ({ unit: 'post', fills: postFills(moment) }),
    },
    {
      material: 'fence-rail',
      label: 'shoppingRails',
      parts: (moment) => ({ unit: 'rail', fills: railFills(moment) }),
    },
    {
      material: 'fence-board',
      label: 'shoppingBoards',
      parts: (moment) => ({ unit: 'board', fills: boardFills(moment) }),
    },
    {
      material: 'concrete-mix',
      label: 'shoppingBags',
      note: 'bagYield',
      parts: (moment) => ({ unit: 'bag-80', fills: bagFills(moment) }),
    },
  ]),
  costs: costSlot(
    fence,
    [
      { output: 'postCost', price: 'postPrice' },
      { output: 'railCost', price: 'railPrice' },
      { output: 'boardCost', price: 'boardPrice' },
      { output: 'bagCost', price: 'bagPrice' },
    ],
    { hint: 'priceHint' },
  ),
  answer: answerSlot(fence, { by: 'style', values: answerValues }),
  drawing: { frame: FRAME, messages: MESSAGES, plan: planOf },
});
