import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const fixtureRoot = resolve(packageRoot, 'examples/remix2-runtime');
const mode = process.argv[2] || 'all';
assert(
  ['native', 'plugin', 'all'].includes(mode),
  'Usage: node scripts/test-remix2-isolated.mts [native|plugin|all]'
);
const workspace = await mkdtemp(resolve(tmpdir(), 'remix2-isolated-'));
assert(
  !workspace.startsWith(packageRoot + '/'),
  'Acceptance must run outside the plugin workspace'
);
console.log(`Isolated acceptance artifacts retained at ${workspace}`);

async function run(
  command: string,
  args: string[],
  cwd: string,
  capture = false
) {
  console.log(`$ ${command} ${args.join(' ')} (${cwd})`);
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });
  let output = '';
  child.stdout?.on('data', chunk => {
    output += chunk;
  });
  await new Promise<void>((done, fail) => {
    child.once('error', fail);
    child.once('exit', code => {
      if (code === 0) done();
      else
        fail(
          new Error(
            `${command} ${args.join(' ')} exited ${code}; artifacts at ${workspace}`
          )
        );
    });
  });
  return output;
}

async function entryHashes(cwd: string) {
  const hashes: Record<string, string> = {};
  for (const file of ['app/entry.client.tsx', 'app/entry.server.tsx']) {
    hashes[file] = createHash('sha256')
      .update(await readFile(resolve(cwd, file)))
      .digest('hex');
  }
  return hashes;
}

async function prepare(name: string, artifact?: string) {
  const cwd = resolve(workspace, name);
  await cp(fixtureRoot, cwd, {
    recursive: true,
    filter: path =>
      !/(?:^|\/)(?:node_modules|build|test-results|playwright-report)(?:\/|$)/.test(
        path.slice(fixtureRoot.length)
      ) && !path.endsWith('/package-lock.json'),
  });
  if (artifact) {
    const file = resolve(cwd, 'package.json');
    const pkg = JSON.parse(await readFile(file, 'utf8'));
    pkg.devDependencies['rsbuild-plugin-react-router'] = `file:${artifact}`;
    await writeFile(file, JSON.stringify(pkg, null, 2) + '\n');
  }
  const hashes = await entryHashes(cwd);
  // npm avoids the parent pnpm workspace's router override and peer auto-installation.
  await run(
    'npm',
    [
      'install',
      '--include=dev',
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      '--registry=https://registry.npmjs.org',
    ],
    cwd
  );
  return { cwd, hashes };
}

async function checkEntries(cwd: string, hashes: Record<string, string>) {
  assert.deepEqual(
    await entryHashes(cwd),
    hashes,
    'Custom entry files changed during acceptance'
  );
  console.log(`Unchanged custom entries ${JSON.stringify(hashes)}`);
}

if (mode !== 'plugin') {
  const { cwd, hashes } = await prepare('native');
  await run('npm', ['run', 'test:versions'], cwd);
  await run('npm', ['run', 'typecheck'], cwd);
  await run('npm', ['run', 'build:native'], cwd);
  await checkEntries(cwd, hashes);
  await run('npm', ['run', 'test:artifacts'], cwd);
  await run('npm', ['run', 'test:http'], cwd);
  await run('npm', ['run', 'test:e2e:production'], cwd);
  await checkEntries(cwd, hashes);
  console.log('Stock native Remix 2 reference acceptance passed.');
}

if (mode !== 'native') {
  const supplied = process.env.REMIX2_PLUGIN_TARBALL;
  let artifact: string;
  if (supplied) {
    assert(
      isAbsolute(supplied),
      'REMIX2_PLUGIN_TARBALL must be an absolute packed artifact path'
    );
    artifact = supplied;
  } else {
    const packed = JSON.parse(
      await run(
        'npm',
        ['pack', '--ignore-scripts', '--json', '--pack-destination', workspace],
        packageRoot,
        true
      )
    );
    artifact = resolve(workspace, packed[0].filename);
  }
  const { cwd, hashes } = await prepare('plugin', artifact);
  const gates: string[] = [];
  for (const script of ['test:package', 'test:versions']) {
    try {
      await run('npm', ['run', script], cwd);
    } catch (error) {
      gates.push(String(error));
    }
  }
  assert.equal(
    gates.length,
    0,
    `Packed plugin isolation red gates:\n${gates.join('\n')}`
  );
  await run('npm', ['run', 'typecheck'], cwd);
  await run('npm', ['run', 'typecheck:plugin'], cwd);
  await run('npm', ['run', 'test:failures'], cwd);
  await run('npm', ['run', 'test:dev-generation'], cwd);
  await run('npm', ['run', 'test:dev-assets'], cwd);
  await run('npm', ['run', 'test:review-regressions'], cwd);
  await run('npm', ['run', 'test:aliases'], cwd);
  await checkEntries(cwd, hashes);
  await run('npm', ['run', 'test:e2e:dev'], cwd);
  await checkEntries(cwd, hashes);
  await run('npm', ['run', 'build'], cwd);
  await checkEntries(cwd, hashes);
  await run('npm', ['run', 'test:artifacts'], cwd);
  await run('npm', ['run', 'test:http'], cwd);
  await run('npm', ['run', 'test:e2e:production'], cwd);
  await checkEntries(cwd, hashes);
  console.log('Packed plugin native Remix 2 acceptance passed.');
}
