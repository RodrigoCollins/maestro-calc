import { NOT_FOUND_ID } from '../routing/routes.ts';

type Module = Readonly<Record<string, string>>;

/** The page ids without a route that the catalog may still describe. */
const EXTRA_IDS = [NOT_FOUND_ID];

/**
 * Where the route table and the `site` catalogs disagree (i18n-catalog › [ICW4]): a page id
 * without its title or description in a locale, and a `page.<id>.*` key for an id that is neither
 * in the table nor `notFound`. One line per problem, `<locale>: <what> <key>`.
 */
export const routeCatalogProblems = (
  ids: readonly string[],
  catalogs: Readonly<Record<string, Module>>,
): string[] => {
  const known = new Set([...ids, ...EXTRA_IDS]);
  return Object.entries(catalogs).flatMap(([locale, module]) => [
    ...[...known].flatMap((id) =>
      ['title', 'description']
        .map((field) => `page.${id}.${field}`)
        .filter((key) => !Object.hasOwn(module, key))
        .map((key) => `${locale}: missing ${key}`),
    ),
    ...Object.keys(module)
      .filter((key) => {
        const id = /^page\.([^.]+)\./.exec(key)?.[1];
        return id !== undefined && !known.has(id);
      })
      .map((key) => `${locale}: unexpected ${key}`),
  ]);
};
