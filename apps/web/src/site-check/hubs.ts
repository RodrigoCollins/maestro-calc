import { LOCALES, pathOf } from '../routing/routes.ts';
import { fileOf } from './files.ts';
import { problem } from './types.ts';
import type { CheckContext, Problem } from './types.ts';

/*
 * The trade hubs (hubs): a hub page lists each of its calculator pages, and each of those
 * calculator pages links back to the hub, each in its own language. A missing page is the file
 * set's problem.
 */

const RULE = 'hub-link';

const hrefsOf = (context: CheckContext, file: string, selector: string): string[] | undefined =>
  context.pages
    .find((page) => page.file === file)
    ?.root.querySelectorAll(selector)
    .map((link) => link.getAttribute('href') ?? '');

export const hubProblems = (context: CheckContext): Problem[] => {
  const { site } = context;
  return LOCALES.flatMap((locale) =>
    Object.entries(site.hubs).flatMap(([hub, calculators]) => {
      const hubPath = pathOf(hub, locale, site.routes);
      const hubFile = fileOf(hubPath);
      const listed = hrefsOf(context, hubFile, 'section.hub-directory a');
      return calculators.flatMap((calculator) => {
        const calculatorPath = pathOf(calculator, locale, site.routes);
        const calculatorFile = fileOf(calculatorPath);
        const back = hrefsOf(context, calculatorFile, 'p.hub-link a');
        return [
          ...(listed === undefined || listed.includes(calculatorPath)
            ? []
            : [problem(hubFile, RULE, `the hub must list its calculator ${calculatorPath}`)]),
          ...(back === undefined || back.includes(hubPath)
            ? []
            : [problem(calculatorFile, RULE, `the calculator page must link its hub ${hubPath}`)]),
        ];
      });
    }),
  );
};
