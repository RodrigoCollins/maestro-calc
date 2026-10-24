import { resolve } from 'node:path';

export interface WranglerConfig {
  name?: string;
  compatibility_date?: string;
  build?: unknown;
  assets?: { directory?: string; html_handling?: string; not_found_handling?: string };
}

/** The directories each config resolves its relative `assets.directory` against. */
export interface ConfigDirs {
  readonly root: string;
  readonly e2e: string;
}

/**
 * Where the e2e Wrangler config disagrees with the root one: the asset rules, the served directory
 * (compared as resolved paths, never as text), the name and date, and a build command the e2e
 * config must not have.
 */
export const assetsProblems = (
  root: WranglerConfig,
  e2e: WranglerConfig,
  dirs: ConfigDirs,
): string[] => {
  const served = (config: WranglerConfig, base: string): string =>
    resolve(base, config.assets?.directory ?? '');
  return [
    ...(root.assets?.html_handling === e2e.assets?.html_handling ? [] : ['html_handling differs']),
    ...(root.assets?.not_found_handling === e2e.assets?.not_found_handling
      ? []
      : ['not_found_handling differs']),
    ...(served(root, dirs.root) === served(e2e, dirs.e2e)
      ? []
      : [`assets.directory resolves to ${served(e2e, dirs.e2e)}, not ${served(root, dirs.root)}`]),
    ...(e2e.build === undefined ? [] : ['the e2e config must have no build command']),
    ...(root.name === e2e.name ? [] : ['name differs']),
    ...(root.compatibility_date === e2e.compatibility_date ? [] : ['compatibility_date differs']),
  ];
};
