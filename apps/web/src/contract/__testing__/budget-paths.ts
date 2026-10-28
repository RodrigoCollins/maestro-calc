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

/** Extra characters of copy by calculator id and locale; a missing id or locale is not padded. */
export type Extra = Readonly<Record<string, Readonly<Record<string, number>>>>;

/**
 * Memoizes one build per name: the built-HTML assertions read the same output. A name is made
 * with one padding only; asking for it again with other padding throws instead of returning a
 * build that does not carry it.
 */
export const buildCache = <R>(make: (name: string, extra: Extra) => R) => {
  const built = new Map<string, { readonly extra: Extra; readonly result: R }>();
  return (name: string, extra: Extra = {}): R => {
    const cached = built.get(name);
    if (cached !== undefined) {
      if (JSON.stringify(cached.extra) !== JSON.stringify(extra)) {
        throw new Error(`build '${name}' was already made with other extra copy`);
      }
      return cached.result;
    }
    const result = make(name, extra);
    built.set(name, { extra, result });
    return result;
  };
};

/** The sizes of the pages of one id in one named build, made with `extra` padding. */
type SizeOf = (
  name: string,
  id: string,
  extra?: Extra,
) => Promise<Readonly<Record<string, number>>>;

/**
 * The ids that `extra` does not pad whose size in the seeded build differs from the base build
 * (site-quality › [SQ36]): every id is read from the one seeded build, so it is asked for with
 * the same padding.
 */
export const leakedPadding = async (
  ids: readonly string[],
  extra: Extra,
  sizeOf: SizeOf,
  names: { readonly seeded: string; readonly base: string },
): Promise<string[]> => {
  const leaked: string[] = [];
  for (const id of ids.filter((page) => !Object.hasOwn(extra, page))) {
    const seeded = await sizeOf(names.seeded, id, extra);
    const base = await sizeOf(names.base, id);
    if (JSON.stringify(seeded) !== JSON.stringify(base)) leaked.push(id);
  }
  return leaked;
};
