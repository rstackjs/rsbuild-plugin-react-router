#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(scriptPath);
const repoRoot = path.resolve(__dirname, '..');

/**
 * The upstream ref that governs the CONTENT of the synced corpus. The
 * REACT_ROUTER_REPO env var (or --source=) only selects the LOCATION of a
 * local react-router checkout; that checkout must be clean and have this
 * exact commit checked out, otherwise the sync refuses to run. Pass
 * --update-pin to adopt the source checkout's HEAD as the new pin (this
 * rewrites the ref below in place).
 */
export const PINNED_UPSTREAM = {
  repository: 'https://github.com/remix-run/react-router',
  ref: '4cf6e62d0cdf9d7f6e09b0ea10077d7fb0e1b438',
};

/**
 * Upstream directories copied into the corpus, as
 * [sourceDirInUpstreamRepo, targetDirInCorpus].
 */
export const sourceDirs = [
  ['integration', 'integration'],
  ['packages/react-router-dev/__tests__', 'react-router-dev/__tests__'],
];

/**
 * Rsbuild-owned overlay. These files are preserved across syncs and are the
 * only files under the corpus that may be hand-edited. This list is the
 * single source of truth; it is exported into
 * tests/react-router-framework/UPSTREAM.json as `adapterOwnedFiles`.
 */
export const adapterOwnedPaths = [
  'README.md',
  'UPSTREAM.json',
  'integration/helpers/rsbuild-adapter.ts',
  'integration/helpers/create-fixture.ts',
  'integration/helpers/express.ts',
  'integration/helpers/fixtures.ts',
  'integration/helpers/vite.ts',
  'integration/playwright.config.ts',
];

const defaultSource = '/home/zack/projects/react-router';
const sourceRoot = path.resolve(
  process.env.REACT_ROUTER_REPO ??
    process.argv.find(arg => arg.startsWith('--source='))?.slice(9) ??
    defaultSource
);
const normalizeOnly = process.argv.includes('--normalize-only');
const updatePin = process.argv.includes('--update-pin');
const targetRoot = path.join(repoRoot, 'tests/react-router-framework');
const manifestPath = path.join(targetRoot, 'UPSTREAM.json');
const scratchRoot = path.join(
  repoRoot,
  'node_modules/.cache/react-router-framework-sync'
);

const packageVersionByName = {
  '@react-router/dev': '^8.0.1',
  '@react-router/express': '^8.0.1',
  '@react-router/fs-routes': '^8.0.1',
  '@react-router/node': '^8.0.1',
  '@react-router/remix-routes-option-adapter': '^8.0.1',
  '@react-router/serve': '^8.0.1',
  '@types/react': '^19.2.10',
  '@types/react-dom': '^19.2.3',
  '@vitejs/plugin-rsc': '^0.4.10',
  react: '^19.2.4',
  'react-dom': '^19.2.4',
  'react-router': '^8.0.1',
  'react-server-dom-webpack': '0.0.0-experimental-029e8bd6-20250306',
  typescript: '^5.9.3',
};

const git = (cwd, ...args) =>
  execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();

const enforcePinnedRef = async () => {
  if (!existsSync(sourceRoot)) {
    throw new Error(
      `React Router checkout not found at ${sourceRoot}. Set REACT_ROUTER_REPO ` +
        `(or pass --source=) to a local clone of ${PINNED_UPSTREAM.repository}.`
    );
  }

  const dirty = git(sourceRoot, 'status', '--porcelain');
  if (dirty) {
    throw new Error(
      `Source checkout ${sourceRoot} has uncommitted changes. The corpus must ` +
        `be reproducible from a pinned upstream commit; stash or commit the ` +
        `changes first.`
    );
  }

  const headSha = git(sourceRoot, 'rev-parse', 'HEAD');
  if (headSha === PINNED_UPSTREAM.ref) {
    return PINNED_UPSTREAM.ref;
  }

  if (!updatePin) {
    throw new Error(
      `Source checkout HEAD ${headSha} does not match the pinned upstream ref ` +
        `${PINNED_UPSTREAM.ref}.\n` +
        `Either check out the pin:\n` +
        `  git -C ${sourceRoot} checkout ${PINNED_UPSTREAM.ref}\n` +
        `or adopt the new commit as the pin:\n` +
        `  node scripts/sync-react-router-framework-tests.mjs --update-pin`
    );
  }

  const scriptSource = await readFile(scriptPath, 'utf8');
  const updatedSource = scriptSource.replace(
    `ref: '${PINNED_UPSTREAM.ref}'`,
    `ref: '${headSha}'`
  );
  if (updatedSource === scriptSource) {
    throw new Error(
      `--update-pin could not rewrite the pinned ref in ${scriptPath}.`
    );
  }
  await writeFile(scriptPath, updatedSource, 'utf8');
  PINNED_UPSTREAM.ref = headSha;
  console.log(`Updated pinned upstream ref to ${headSha}`);
  return headSha;
};

const copyIfExists = async (from, to) => {
  if (!existsSync(from)) {
    return;
  }
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, { force: true, recursive: true });
};

const preserveAdapterFiles = async () => {
  await rm(scratchRoot, { force: true, recursive: true });
  for (const relativePath of adapterOwnedPaths) {
    await copyIfExists(
      path.join(targetRoot, relativePath),
      path.join(scratchRoot, relativePath)
    );
  }
};

const restoreAdapterFiles = async () => {
  for (const relativePath of adapterOwnedPaths) {
    await copyIfExists(
      path.join(scratchRoot, relativePath),
      path.join(targetRoot, relativePath)
    );
  }
  await rm(scratchRoot, { force: true, recursive: true });
};

const copyUpstreamTests = async () => {
  for (const [source, target] of sourceDirs) {
    const sourcePath = path.join(sourceRoot, source);
    if (!existsSync(sourcePath)) {
      throw new Error(`Missing upstream React Router test path: ${sourcePath}`);
    }
    await rm(path.join(targetRoot, target), { force: true, recursive: true });
    await cp(sourcePath, path.join(targetRoot, target), {
      force: true,
      recursive: true,
    });
  }
};

const findFiles = async (directory, predicate) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.tmp') {
      continue;
    }
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findFiles(absolutePath, predicate)));
    } else if (predicate(entry.name)) {
      files.push(absolutePath);
    }
  }
  return files;
};

const normalizePackageJson = async packageJsonPath => {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  let changed = false;

  for (const section of ['dependencies', 'devDependencies']) {
    const dependencies = packageJson[section];
    if (!dependencies) {
      continue;
    }

    for (const [name, version] of Object.entries(dependencies)) {
      if (version !== 'workspace:*' && version !== 'catalog:') {
        continue;
      }
      const replacement = packageVersionByName[name];
      if (!replacement) {
        throw new Error(
          `No normalized version configured for ${name} in ${packageJsonPath}`
        );
      }
      dependencies[name] = replacement;
      changed = true;
    }
  }

  if (changed) {
    await writeFile(
      packageJsonPath,
      `${JSON.stringify(packageJson, null, 2)}\n`,
      'utf8'
    );
  }
};

/**
 * Compares the freshly synced working tree against the git index. A verified
 * corpus means the checked-in files are byte-identical to a fresh sync from
 * the pinned ref (plus the adapter-owned overlay) — i.e. nothing under the
 * corpus was hand-edited outside `adapterOwnedPaths`.
 */
const detectCorpusDrift = () => {
  // Raw output (no trim): porcelain lines are `XY <path>` and the first
  // line's status prefix may start with a significant space.
  const status = execFileSync(
    'git',
    ['-C', repoRoot, 'status', '--porcelain', '--', 'tests/react-router-framework'],
    { encoding: 'utf8' }
  );
  if (!status.trim()) {
    return [];
  }
  const adapterOwned = new Set(
    adapterOwnedPaths.map(relativePath =>
      path.posix.join('tests/react-router-framework', relativePath)
    )
  );
  return status
    .split('\n')
    .filter(line => line.length > 3)
    .map(line => line.slice(3).trim())
    .filter(entry => entry && !adapterOwned.has(entry));
};

const writeManifest = async ref => {
  const fileCount = (
    await findFiles(targetRoot, name => name !== 'UPSTREAM.json')
  ).length;
  const driftedPaths = detectCorpusDrift();
  const corpusVerified = updatePin ? true : driftedPaths.length === 0;

  const manifest = {
    repository: PINNED_UPSTREAM.repository,
    ref,
    syncedAt: new Date().toISOString(),
    sourceDirs: sourceDirs.map(([source]) => source),
    fileCount,
    adapterOwnedFiles: adapterOwnedPaths,
    corpusVerified,
  };
  if (!corpusVerified) {
    manifest.driftFileCount = driftedPaths.length;
    manifest.note =
      `${driftedPaths.length} checked-in corpus path(s) outside the ` +
      `adapter-owned overlay differ from a fresh sync of the pinned ref. ` +
      `They carry local Rsbuild adaptations; this sync run overwrote them ` +
      `in the working tree. Run ` +
      `\`git checkout -- tests/react-router-framework\` to restore them, ` +
      `or review \`git diff\` and upstream/formalize the changes.`;
  }

  // Keep syncedAt stable when nothing else changed so repeated runs are
  // idempotent at the git level.
  if (existsSync(manifestPath)) {
    try {
      const existing = JSON.parse(await readFile(manifestPath, 'utf8'));
      const withoutTimestamp = value =>
        JSON.stringify({ ...value, syncedAt: null });
      if (withoutTimestamp(existing) === withoutTimestamp(manifest)) {
        manifest.syncedAt = existing.syncedAt;
      }
    } catch {
      // Unreadable manifest: rewrite it from scratch.
    }
  }

  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );
  return { corpusVerified, driftedPaths };
};

if (!normalizeOnly) {
  const ref = await enforcePinnedRef();
  await preserveAdapterFiles();
  await copyUpstreamTests();
  await restoreAdapterFiles();

  for (const packageJsonPath of await findFiles(
    targetRoot,
    name => name === 'package.json'
  )) {
    await normalizePackageJson(packageJsonPath);
  }

  const { corpusVerified, driftedPaths } = await writeManifest(ref);
  console.log(
    `Synced React Router framework tests from ${sourceRoot}@${ref} into ${targetRoot}`
  );
  if (!corpusVerified) {
    console.warn(
      `WARNING: ${driftedPaths.length} checked-in corpus path(s) differed ` +
        `from the fresh sync and were overwritten in the working tree:\n` +
        driftedPaths.map(entry => `  - ${entry}`).join('\n') +
        `\nSee the note in tests/react-router-framework/UPSTREAM.json.`
    );
  }
} else {
  for (const packageJsonPath of await findFiles(
    targetRoot,
    name => name === 'package.json'
  )) {
    await normalizePackageJson(packageJsonPath);
  }
  console.log(
    `Normalized React Router framework test package manifests in ${targetRoot}`
  );
}
