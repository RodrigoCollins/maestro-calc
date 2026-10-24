import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Fills the content store the component tests read. `astro sync` writes it to the build cache
 * (`node_modules/.astro`), but under vitest Astro runs in dev mode and reads `.astro`, which only
 * a dev server fills. Syncing here and copying the store makes `astro:content` return the real
 * Markdown entries, so a test never sees a stale or empty collection.
 */
export default function setup(): void {
  const root = import.meta.dirname;
  execFileSync('npx', ['astro', 'sync'], { cwd: root, stdio: 'pipe' });
  mkdirSync(join(root, '.astro'), { recursive: true });
  copyFileSync(
    join(root, 'node_modules', '.astro', 'data-store.json'),
    join(root, '.astro', 'data-store.json'),
  );
}
