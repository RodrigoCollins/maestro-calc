import { fromRoot } from '../root.ts';

/** The module ids (absolute paths) of the source graph that the calculator page entry must not reach. */
const FORBIDDEN: readonly [RegExp, string][] = [
  [/\/apps\/web\/src\/lib\/calculators\.ts$/, 'the registry of every calculator'],
  [
    /\/packages\/core\/src\/calculators\/(?!concrete\/)[^/]+\//,
    'another calculator directory of core',
  ],
  [/\/packages\/data\/src\/index\.ts$/, 'the root entry of @maestro-calc/data'],
  [/\/packages\/data\/src\/materials\//, 'the material records of @maestro-calc/data'],
];

/** The path of a module from the repository root, for messages. */
export const shortPath = (id: string): string => id.replace(`${fromRoot('.')}/`, '');

/** The modules of a graph the concrete entry must not reach, each as `<path>: <why>` (calculator-page › [CP48]). */
export const graphViolations = (modules: readonly string[]): string[] =>
  modules.flatMap((id) =>
    FORBIDDEN.filter(([pattern]) => pattern.test(id)).map(([, why]) => `${shortPath(id)}: ${why}`),
  );

/** Whether the graph holds the module whose path ends with `suffix`. */
export const reaches = (modules: readonly string[], suffix: string): boolean =>
  modules.some((id) => id.endsWith(suffix));
