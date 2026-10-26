import { concrete } from '../../lib/concrete.ts';
import { definePage, type PageModule } from '../page-module.ts';
import { choiceSlot } from '../slots/choices.ts';
import { SHAPE_FIELDS } from './shapes.ts';

/** The concrete page: module #1 of the generic web layer. Language-free, so the client may import it. */
export const concretePage: PageModule<typeof concrete> = definePage({
  calculator: concrete,
  primary: { imperial: 'volumeYd3', metric: 'volumeM3' },
  choices: choiceSlot(concrete, [{ select: 'shape', shows: SHAPE_FIELDS }]),
});
