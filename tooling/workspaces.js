import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Directory names directly under `<root>/<parent>`, derived from the filesystem so that a new
 * workspace is covered by the lint blocks without editing eslint.config.js.
 * @param {string} root
 * @param {'packages' | 'apps'} parent
 * @returns {string[]}
 */
export const workspaceNames = (root, parent) =>
  readdirSync(join(root, parent), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'node_modules')
    .map((entry) => entry.name)
    .sort();

/** @param {string} root */
export const packageNames = (root) => workspaceNames(root, 'packages');

/** Workspace directories relative to the root, e.g. `packages/core` and `apps/web`.
 * @param {string} root */
export const workspaceDirs = (root) => [
  ...packageNames(root).map((name) => `packages/${name}`),
  ...workspaceNames(root, 'apps').map((name) => `apps/${name}`),
];
