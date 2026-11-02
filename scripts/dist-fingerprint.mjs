import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import process from 'node:process';

// Prints `<sha256>  <path>` for every file under the given directory, sorted by path, so the
// `dist-identical` CI job can diff the builds of two commits (quality-gates, second-site-foundation).
const dir = process.argv[2] ?? '';

if (!existsSync(dir)) {
  process.stderr.write(`no directory to fingerprint: ${dir}\n`);
  process.exit(2);
}

const files = readdirSync(dir, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'))
  .sort();

for (const path of files) {
  const hash = createHash('sha256')
    .update(readFileSync(join(dir, path)))
    .digest('hex');
  process.stdout.write(`${hash}  ${path}\n`);
}
