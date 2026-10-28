import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { definePage, type PageModule } from '../page-module.ts';
import { answerSlot } from '../slots/answer.ts';
import { FRAME, planOf } from './plan.ts';
import { answerValues } from './present.ts';

/**
 * The rectangle-area page: the second module of the generic web layer. Language-free, so the client
 * may import it. It declares the area sentence as its primary figure, one answer and the plan of
 * the rectangle (the drawing slot).
 */
export const rectangleAreaPage: PageModule<typeof rectangleArea> = definePage({
  calculator: rectangleArea,
  primary: { imperial: 'areaFt2', metric: 'areaM2' },
  answer: answerSlot(rectangleArea, { values: answerValues }),
  drawing: { frame: FRAME, messages: ['drawing'], plan: planOf },
});
