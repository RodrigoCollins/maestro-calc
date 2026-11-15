import { encode } from '@maestro-calc/core';
import { lawnFertilizer } from '@maestro-calc/lawn-core/lawn-fertilizer';
import { hrefOf } from './routes.ts';
import { viewOf } from './view.ts';

/*
 * One feeding at a published nitrogen rate, worked out by the fertilizer calculator on its
 * defaults (5,000 sq ft, a 24-0-6 bag of 15 lb), and the calculator's address with that rate
 * filled in.
 */

const targetText = (pounds: number): string => String(pounds);

/** The fertilizer calculator's address with `pounds` of N per 1,000 sq ft as its target. */
export const fertilizerHrefOf = (pounds: number): string => {
  const validated = lawnFertilizer.validate({ target: targetText(pounds) });
  if (!validated.ok) throw new Error(`a target of ${targetText(pounds)} lb does not validate`);
  const query = encode(lawnFertilizer, validated.value);
  const path = hrefOf('lawn-fertilizer');
  return query === 'v=1' ? path : `${path}?${query}`;
};

/** What one feeding of `pounds` of N per 1,000 sq ft takes on the calculator defaults. */
export const feedingOf = (
  pounds: number,
): { readonly perThousand: string; readonly pounds: string; readonly bags: string } => {
  const view = viewOf('lawn-fertilizer', { target: targetText(pounds) });
  if (view === undefined) throw new Error(`a target of ${targetText(pounds)} lb does not run`);
  const { perThousand = '', pounds: total = '', bags = '' } = view.values;
  return { perThousand, pounds: total, bags };
};
