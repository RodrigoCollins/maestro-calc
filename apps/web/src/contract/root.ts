import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Absolute path of the repository root, shared by the contract tests. */
export const repoRoot = resolve(import.meta.dirname, '../../../..');

export const fromRoot = (...segments: string[]): string => resolve(repoRoot, ...segments);

/** Loads a root-level module by path (a static import would cross the workspace boundary). */
export const importFromRoot = async <T>(relativePath: string): Promise<T> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a dynamic import is untyped; each caller states the shape it reads
  (await import(pathToFileURL(fromRoot(relativePath)).href)) as T;
