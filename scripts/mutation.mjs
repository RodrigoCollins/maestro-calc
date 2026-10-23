import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const isShardFlag = (argument) => argument === '--shard' || argument.startsWith('--shard=');

/**
 * Only `--list`, `--shard <name>` and `--shard=<name>` exist: a typo such as `--shards` must fail
 * instead of silently running every shard. The word after a bare `--shard` is its value.
 */
const rejectUnknownArguments = (argv) => {
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--shard') index += 1;
    else if (argument !== '--list' && !argument.startsWith('--shard=')) {
      throw new Error(`unknown argument: ${argument}`);
    }
  }
};

/** Every shard by default, or the one named by `--shard <name>` / `--shard=<name>`. */
export const selectShards = (argv, names) => {
  rejectUnknownArguments(argv);
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

/**
 * Shard name to the package directory that owns it. The packages are the directories of
 * `packages/` that have a `stryker.config.mjs`, in name order (`core` before `data`), so a package
 * that adds a config joins the run without a list to keep. A name two packages declare would run
 * the wrong one, so it is an error.
 */
export const loadShardOwners = async (root) => {
  const owners = new Map();
  const packages = readdirSync(join(root, 'packages'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, 'packages', entry.name))
    .filter((directory) => existsSync(join(directory, 'stryker.config.mjs')))
    .sort();
  for (const directory of packages) {
    const { shardNames } = await import(pathToFileURL(join(directory, 'stryker.config.mjs')).href);
    for (const shard of shardNames) {
      if (owners.has(shard)) throw new Error(`mutation shard declared twice: ${shard}`);
      owners.set(shard, directory);
    }
  }
  return owners;
};

const main = async () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const owners = await loadShardOwners(root);
  const shardNames = [...owners.keys()];
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
    createRequire(join(root, 'package.json')).resolve('@stryker-mutator/core/package.json'),
  );
  const strykerBin = join(strykerDir, 'bin', 'stryker.js');
  const failed = [];
  for (const shard of selected) {
    const started = Date.now();
    process.stdout.write(`\n=== mutation shard: ${shard} ===\n`);
    const { status, error } = spawnSync(process.execPath, [strykerBin, 'run'], {
      cwd: owners.get(shard),
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
