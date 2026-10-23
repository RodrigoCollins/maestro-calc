import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const isShardFlag = (argument) => argument === '--shard' || argument.startsWith('--shard=');

/** Every shard by default, or the one named by `--shard <name>` / `--shard=<name>`. */
export const selectShards = (argv, names) => {
  const index = argv.findIndex(isShardFlag);
  if (index === -1) return names;
  if (argv.filter(isShardFlag).length > 1) throw new Error('only one --shard is allowed');
  const argument = argv[index];
  const name = argument.startsWith('--shard=')
    ? argument.slice('--shard='.length)
    : argv[index + 1];
  if (name === undefined || name === '') throw new Error('--shard needs a name');
  if (!names.includes(name)) throw new Error(`unknown mutation shard: ${name}`);
  return [name];
};

const main = async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const packageDir = join(root, 'packages', 'core');
  const { shardNames } = await import(pathToFileURL(join(packageDir, 'stryker.config.mjs')).href);
  const args = process.argv.slice(2);
  // Validate the shard first, so `--list --shard nope` fails like `--shard nope`.
  const selected = selectShards(args, shardNames);
  if (args.includes('--list')) {
    process.stdout.write(`${shardNames.join('\n')}\n`);
    return 0;
  }
  // Run the Stryker script with this Node: `npx` is `npx.cmd` on Windows and cannot be spawned
  // without a shell. Its package `exports` hide the bin, so it is found next to `package.json`.
  const strykerDir = dirname(
    createRequire(join(packageDir, 'package.json')).resolve('@stryker-mutator/core/package.json'),
  );
  const strykerBin = join(strykerDir, 'bin', 'stryker.js');
  const failed = [];
  for (const shard of selected) {
    const started = Date.now();
    process.stdout.write(`\n=== mutation shard: ${shard} ===\n`);
    const { status, error } = spawnSync(process.execPath, [strykerBin, 'run'], {
      cwd: packageDir,
      env: { ...process.env, STRYKER_SHARD: shard },
      stdio: 'inherit',
    });
    if (error) process.stderr.write(`could not run Stryker: ${error.message}\n`);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    process.stdout.write(`=== shard ${shard}: exit ${String(status)} in ${seconds} s ===\n`);
    if (status !== 0) failed.push(shard);
  }
  if (failed.length > 0) process.stderr.write(`failed shards: ${failed.join(', ')}\n`);
  return failed.length > 0 ? 1 : 0;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exitCode = await main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
