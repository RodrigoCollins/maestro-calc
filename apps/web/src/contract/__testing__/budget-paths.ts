/*
 * The pure parts of the budget fixture page (site-quality › [SQ33], [SQ36], design K5): the routes
 * it is built for, the variable that pads one page, and the entry it reads its sources from. The
 * page itself is Astro, which the unit tests cannot run, so these are plain TypeScript.
 */

/** One `getStaticPaths` entry per id and locale: `/zz-budget/<id>/<locale>`. */
export const budgetPaths = (
  ids: readonly string[],
  locales: readonly string[],
): { readonly params: { readonly id: string; readonly locale: string } }[] =>
  ids.flatMap((id) => locales.map((locale) => ({ params: { id, locale } })));

/** The environment variable that pads the page of `id` in `locale`: `BUDGET_EXTRA_RECTANGLE_AREA_ES`. */
export const extraKey = (id: string, locale: string): string =>
  `BUDGET_EXTRA_${id.toUpperCase().replaceAll('-', '_')}_${locale.toUpperCase()}`;

/** The extra characters of copy for the page of `id` in `locale`; zero when its variable is unset. */
export const extraOf = (
  env: Readonly<Record<string, string | undefined>>,
  id: string,
  locale: string,
): number => Number(env[extraKey(id, locale)] ?? '0');

/** The entry of a page id, or an error that names the locale and the id. */
export const entryOrThrow = <T>(entry: T | undefined, id: string, locale: string): T => {
  if (entry === undefined) throw new Error(`no calculator entry for ${locale}/${id}`);
  return entry;
};
