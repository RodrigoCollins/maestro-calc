import { LOCALES, pathOf } from '../routing/routes.ts';
import { fileOf } from './files.ts';
import { problem } from './types.ts';
import type { CheckContext, Problem } from './types.ts';

/*
 * The job pages (growth plan, lever 1): each one is listed by its calculator page and by the trade
 * hub of that calculator, and links its calculator (prefilled or not) and its nearest siblings, the
 * jobs of the same calculator just before and just after it in table order, each in its own
 * language; a job of a group (`jobGroups`, the question pages) has its siblings in that group. A
 * missing page is the file set's problem.
 */

const RULE = 'job-link';

const hrefsOf = (context: CheckContext, file: string, selector: string): string[] | undefined =>
  context.pages
    .find((page) => page.file === file)
    ?.root.querySelectorAll(selector)
    .map((link) => link.getAttribute('href') ?? '');

/** The path of an internal href, without its URL state or fragment. */
const pathOfHref = (href: string): string => href.replace(/[?#].*$/s, '');

export const jobLinkProblems = (context: CheckContext): Problem[] => {
  const { site } = context;
  const jobs = Object.entries(site.jobs);
  const groupOf = (job: string): string | undefined => site.jobGroups?.[job] ?? site.jobs[job];
  return LOCALES.flatMap((locale) =>
    jobs.flatMap(([job, calculator]) => {
      const jobPath = pathOf(job, locale, site.routes);
      const jobFile = fileOf(jobPath);
      const calculatorPath = pathOf(calculator, locale, site.routes);
      const calculatorFile = fileOf(calculatorPath);
      const [hub] =
        Object.entries(site.hubs).find(([, listed]) => listed.includes(calculator)) ?? [];
      const hubFile = hub === undefined ? undefined : fileOf(pathOf(hub, locale, site.routes));
      const siblings = jobs.filter(([id]) => groupOf(id) === groupOf(job)).map(([id]) => id);
      const at = siblings.indexOf(job);
      const nearest = [siblings[at - 1], siblings[at + 1]].flatMap((id) =>
        id === undefined ? [] : [pathOf(id, locale, site.routes)],
      );
      const listed = hrefsOf(context, calculatorFile, 'aside.job-links a');
      const inHub =
        hubFile === undefined ? undefined : hrefsOf(context, hubFile, 'section.hub-directory a');
      const out = hrefsOf(context, jobFile, 'main a')?.map(pathOfHref);
      return [
        ...(listed === undefined || listed.includes(jobPath)
          ? []
          : [problem(calculatorFile, RULE, `the calculator page must list its job ${jobPath}`)]),
        ...(hubFile === undefined || inHub === undefined || inHub.includes(jobPath)
          ? []
          : [problem(hubFile, RULE, `the hub must list its job ${jobPath}`)]),
        ...(out === undefined || out.includes(calculatorPath)
          ? []
          : [problem(jobFile, RULE, `the job page must link its calculator ${calculatorPath}`)]),
        ...(out === undefined
          ? []
          : nearest
              .filter((sibling) => !out.includes(sibling))
              .map((sibling) =>
                problem(jobFile, RULE, `the job page must link its sibling ${sibling}`),
              )),
      ];
    }),
  );
};
