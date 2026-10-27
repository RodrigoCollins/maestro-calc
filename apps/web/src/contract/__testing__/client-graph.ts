import { fromRoot } from '../root.ts';

/**
 * The module ids (absolute paths) of the source graph that the entry of calculator `ownId` must
 * not reach: the registry, the data root, another calculator's core directory and another
 * calculator's web folder (the slots and the generic files stay allowed).
 */
const forbidden = (ownId: string): readonly [RegExp, string][] => [
  [/\/apps\/web\/src\/lib\/calculators\.ts$/, 'the registry of every calculator'],
  [
    new RegExp(`/packages/core/src/calculators/(?!${ownId}/)[^/]+/`),
    'another calculator directory of core',
  ],
  [
    new RegExp(`/apps/web/src/calculator/(?!${ownId}/|slots/)[^/]+/`),
    "another calculator's web folder",
  ],
  [/\/packages\/data\/src\/index\.ts$/, 'the root entry of @maestro-calc/data'],
  [/\/packages\/data\/src\/materials\//, 'the material records of @maestro-calc/data'],
];

/** The path of a module from the repository root, for messages. */
export const shortPath = (id: string): string => id.replace(`${fromRoot('.')}/`, '');

/** The modules of a graph the entry of `ownId` must not reach, each as `<path>: <why>` (calculator-page › [CP48]). */
export const graphViolations = (modules: readonly string[], ownId: string): string[] => {
  const rules = forbidden(ownId);
  return modules.flatMap((id) =>
    rules.filter(([pattern]) => pattern.test(id)).map(([, why]) => `${shortPath(id)}: ${why}`),
  );
};

/** The absolute path of the client entry of a calculator page id. */
export const entryPathOf = (id: string): string => fromRoot(`apps/web/src/client/entries/${id}.ts`);

/** The text of a virtual module that loads the entry of a page id. */
export const entrySourceOf = (id: string): string => `import '${entryPathOf(id)}';`;

/** Whether the graph holds the module whose path ends with `suffix`. */
export const reaches = (modules: readonly string[], suffix: string): boolean =>
  modules.some((id) => id.endsWith(suffix));
