// The post-deploy job of `.github/workflows/deploy.yml`, against the live site.
// Usage: node apps/web/scripts/production.ts smoke | indexnow [--dry-run]
import process from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';
import { indexNowRequest } from '../src/seo/indexnow.ts';
import { smokeProblems, submitIndexNow } from '../src/seo/production.ts';

const ATTEMPTS = 4;
const PAUSE_MS = 15_000;

const request = indexNowRequest();
const [command, flag] = process.argv.slice(2);

// The build check can turn green a moment before every edge serves the new version.
const smoke = async (): Promise<void> => {
  for (let attempt = 1; ; attempt += 1) {
    const problems = await smokeProblems(request, fetch);
    if (problems.length === 0) {
      process.stdout.write(
        `smoke: ${String(request.urlList.length)} pages and the key answer 200\n`,
      );
      return;
    }
    process.stderr.write(`smoke attempt ${String(attempt)}:\n${problems.join('\n')}\n`);
    if (attempt === ATTEMPTS) process.exit(1);
    await sleep(PAUSE_MS);
  }
};

const indexnow = async (): Promise<void> => {
  if (flag === '--dry-run') {
    process.stdout.write(`${JSON.stringify(request, null, 2)}\n`);
    return;
  }
  const status = await submitIndexNow(request, fetch);
  process.stdout.write(
    `indexnow: ${String(request.urlList.length)} URLs, answered ${String(status)}\n`,
  );
};

if (command === 'smoke') await smoke();
else if (command === 'indexnow') await indexnow();
else {
  process.stderr.write('usage: production.ts smoke | indexnow [--dry-run]\n');
  process.exit(2);
}
