import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

// `fs.globSync` is still experimental on Node 22 and prints a warning, so the check lists
// `packages/` itself. It runs from the repository root (an npm script), or from a temporary
// workspace in the script tests.
const packagesDir = join(process.cwd(), 'packages');

const withDist = existsSync(packagesDir)
  ? readdirSync(packagesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(packagesDir, entry.name, 'dist')))
      .map((entry) => `packages/${entry.name}/dist`)
  : [];

if (withDist.length > 0) {
  process.stderr.write(`build output in a source-only package: ${withDist.join(', ')}\n`);
  process.exit(1);
}
