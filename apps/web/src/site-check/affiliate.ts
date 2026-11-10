import { affiliateLinkProblems } from '@maestro-calc/site-kit/affiliate';
import { problem } from './types.ts';
import type { CheckContext, Problem } from './types.ts';

/*
 * Affiliate links (affiliate): every sponsored link of a built page sits in the recommendation
 * block of `@maestro-calc/site-kit/affiliate`, next to its disclosure, and opens in a new tab.
 */

export const affiliateProblems = ({ pages }: CheckContext): Problem[] =>
  pages.flatMap(({ file, html }) =>
    affiliateLinkProblems(file, html).map((message) =>
      problem(file, 'affiliate', message.slice(file.length + 2)),
    ),
  );
