import { LOCALES, pathOf } from '../routing/routes.ts';
import { fileOf } from './files.ts';
import { problem } from './types.ts';
import type { CheckContext, Problem } from './types.ts';

/*
 * The guides (guides): a guide page ends in a box linking its calculator page, and that calculator
 * page links back to the guide, each in its own language. A guide with no calculator of its own ends
 * in the home, which links back to nothing. A missing page is the file set's problem.
 */

const RULE = 'guide-link';

const hrefsOf = (context: CheckContext, file: string, selector: string): string[] | undefined =>
  context.pages
    .find((page) => page.file === file)
    ?.root.querySelectorAll(selector)
    .map((link) => link.getAttribute('href') ?? '');

export const guideProblems = (context: CheckContext): Problem[] => {
  const { site } = context;
  return LOCALES.flatMap((locale) =>
    Object.entries(site.guides).flatMap(([guide, target]) => {
      const guidePath = pathOf(guide, locale, site.routes);
      const targetPath = pathOf(target, locale, site.routes);
      const guideFile = fileOf(guidePath);
      const targetFile = fileOf(targetPath);
      const forward = hrefsOf(context, guideFile, 'aside.guide-cta a');
      const back = site.calculatorPages.includes(target)
        ? hrefsOf(context, targetFile, 'aside.guide-links a')
        : undefined;
      return [
        ...(forward === undefined || forward.includes(targetPath)
          ? []
          : [problem(guideFile, RULE, `the guide must end in a box linking ${targetPath}`)]),
        ...(back === undefined || back.includes(guidePath)
          ? []
          : [problem(targetFile, RULE, `the calculator page must link its guide ${guidePath}`)]),
      ];
    }),
  );
};
