#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
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
const originalPinnedUpstreamRef = PINNED_UPSTREAM.ref;

const rootPackageJson = JSON.parse(
  await readFile(path.join(repoRoot, 'package.json'), 'utf8')
);

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
  'tsconfig.base.json',
  'integration/helpers/fixture-workspace-dependencies.ts',
  'integration/helpers/rsbuild-adapter.ts',
  'integration/helpers/create-fixture.ts',
  'integration/helpers/express.ts',
  'integration/helpers/fixtures.ts',
  'integration/helpers/global-setup.ts',
  'integration/helpers/global-teardown.ts',
  'integration/helpers/rsbuild.ts',
  'integration/helpers/test-resource-guard.ts',
  'integration/playwright.config.ts',
];

/**
 * Upstream corpus files that intentionally carry Rsbuild-specific adaptations
 * in-place. These are preserved across syncs the same way adapter-owned helper
 * files are preserved, but are separated so the amount of local drift remains
 * visible and reviewable.
 */
export const adaptedCorpusPaths = [
  'integration/absolute-base-test.ts',
  'integration/action-test.ts',
  'integration/basename-test.ts',
  'integration/build-test.ts',
  'integration/catch-boundary-data-test.ts',
  'integration/cli-test.ts',
  'integration/client-data-test.ts',
  'integration/css-lazy-loading-test.ts',
  'integration/css-test.ts',
  'integration/deduped-route-modules-test.ts',
  'integration/dev-custom-entry-test.ts',
  'integration/dev-test.ts',
  'integration/dot-client-test.ts',
  'integration/dot-server-test.ts',
  'integration/dotenv-test.ts',
  'integration/extra-server-environment-test.ts',
  'integration/fog-of-war-test.ts',
  'integration/fs-routes-test.ts',
  'integration/helpers/rsbuild-template',
  'integration/helpers/rsc-framework',
  'integration/helpers/rsc-preview',
  'integration/helpers/stream.ts',
  'integration/helpers/templates.ts',
  'integration/hmr-hdr-rsc-test.ts',
  'integration/hmr-hdr-test.ts',
  'integration/tsconfig.json',
  'integration/link-test.ts',
  'integration/loader-context-test.ts',
  'integration/manifests-test.ts',
  'integration/mdx-test.ts',
  'integration/middleware-test.ts',
  'integration/node-env-test.ts',
  'integration/package.json',
  'integration/prefetch-test.ts',
  'integration/prerender-test.ts',
  'integration/presets-test.ts',
  'integration/preview-test.ts',
  'integration/react-router-serve-test.ts',
  'integration/redirects-test.ts',
  'integration/route-added-test.ts',
  'integration/route-config-test.ts',
  'integration/route-exports-modified-offscreen-test.ts',
  'integration/rsc/rsc-framework-test.ts',
  'integration/rsc/rsc-prerender-test.ts',
  'integration/rsc/utils.ts',
  'integration/server-bundles-test.ts',
  'integration/server-fs-allow-test.ts',
  'integration/session-storage-denied-test.ts',
  'integration/single-fetch-test.ts',
  'integration/spa-mode-test.ts',
  'integration/split-route-modules-test.ts',
  'integration/sri-test.ts',
  'integration/typegen-test.ts',
  'integration/unused-route-exports-test.ts',
  'react-router-dev/__tests__/rsc-virtual-route-modules-test.ts',
];

/**
 * Corpus renames applied on top of the upstream layout. Keys are the upstream
 * path (as it appears in a fresh sync of the pinned ref, relative to the corpus
 * root); values are the corpus path they now live at. These are hand-maintained
 * because the corpus is repo-owned and rsbuild-adapted: upstream filenames and
 * directory names that say "vite" are misleading under rsbuild, so they were
 * renamed to rsbuild-flavored names via `git mv` (history preserved). This map
 * is exported into UPSTREAM.json as `renames` so the provenance of each moved
 * path stays discoverable. A separate repurpose of this sync script is planned;
 * for now the map is descriptive metadata only (the sync flow does not consume
 * it to move files).
 */
export const corpusRenames = {
  // Earlier collapse: the upstream Vite 7 / Vite 8 template pair was merged into
  // a single template (the Vite major split is meaningless for rsbuild), then
  // that template was renamed to an rsbuild-flavored name below.
  'integration/helpers/vite-8-template': 'integration/helpers/vite-7-template',

  // Infrastructure renames (files + directories).
  'integration/helpers/vite.ts': 'integration/helpers/rsbuild.ts',
  'integration/helpers/vite-7-template': 'integration/helpers/rsbuild-template',
  'integration/helpers/rsc-vite': 'integration/helpers/rsc-preview',
  'integration/helpers/rsc-vite-framework': 'integration/helpers/rsc-framework',

  // Framework-mode integration test files: drop the misleading `vite-` prefix.
  'integration/vite-absolute-base-test.ts': 'integration/absolute-base-test.ts',
  'integration/vite-basename-test.ts': 'integration/basename-test.ts',
  'integration/vite-build-test.ts': 'integration/build-test.ts',
  'integration/vite-css-lazy-loading-test.ts':
    'integration/css-lazy-loading-test.ts',
  'integration/vite-css-test.ts': 'integration/css-test.ts',
  'integration/vite-dev-custom-entry-test.ts':
    'integration/dev-custom-entry-test.ts',
  'integration/vite-dev-test.ts': 'integration/dev-test.ts',
  'integration/vite-dot-client-test.ts': 'integration/dot-client-test.ts',
  'integration/vite-dot-server-test.ts': 'integration/dot-server-test.ts',
  'integration/vite-dotenv-test.ts': 'integration/dotenv-test.ts',
  'integration/vite-extra-server-environment-test.ts':
    'integration/extra-server-environment-test.ts',
  'integration/vite-hmr-hdr-rsc-test.ts': 'integration/hmr-hdr-rsc-test.ts',
  'integration/vite-hmr-hdr-test.ts': 'integration/hmr-hdr-test.ts',
  'integration/vite-loader-context-test.ts':
    'integration/loader-context-test.ts',
  'integration/vite-manifests-test.ts': 'integration/manifests-test.ts',
  'integration/vite-node-env-test.ts': 'integration/node-env-test.ts',
  'integration/vite-prerender-test.ts': 'integration/prerender-test.ts',
  'integration/vite-presets-test.ts': 'integration/presets-test.ts',
  'integration/vite-preview-test.ts': 'integration/preview-test.ts',
  'integration/vite-route-added-test.ts': 'integration/route-added-test.ts',
  'integration/vite-route-exports-modified-offscreen-test.ts':
    'integration/route-exports-modified-offscreen-test.ts',
  'integration/vite-server-bundles-test.ts':
    'integration/server-bundles-test.ts',
  'integration/vite-server-fs-allow-test.ts':
    'integration/server-fs-allow-test.ts',
  'integration/vite-spa-mode-test.ts': 'integration/spa-mode-test.ts',
  'integration/vite-unused-route-exports-test.ts':
    'integration/unused-route-exports-test.ts',
};

export const removedUpstreamPaths = [
  'integration/helpers/vite-plugin-cloudflare-template',
  'integration/vite-plugin-cloudflare-test.ts',
  'integration/vite-plugin-order-validation-test.ts',
];

const preservedCorpusPaths = [
  ...new Set([
    ...adapterOwnedPaths,
    ...adaptedCorpusPaths,
    ...Object.values(corpusRenames),
  ]),
];

const defaultSource = '/home/zack/projects/react-router';
const sourceRoot = path.resolve(
  process.env.REACT_ROUTER_REPO ??
    process.argv.find(arg => arg.startsWith('--source='))?.slice(9) ??
    defaultSource
);
const normalizeOnly = process.argv.includes('--normalize-only');
const updatePin = process.argv.includes('--update-pin');

const toCorpusRelativePath = (root, absolutePath) =>
  path.relative(root, absolutePath).split(path.sep).join('/');

const isPreservedCorpusPath = relativePath =>
  preservedCorpusPaths.some(
    preservedPath =>
      relativePath === preservedPath ||
      relativePath.startsWith(`${preservedPath}/`)
  );
const targetRoot = path.join(repoRoot, 'tests/react-router-framework');
const manifestPath = path.join(targetRoot, 'UPSTREAM.json');
const scratchRoot = path.join(
  repoRoot,
  'node_modules/.cache/react-router-framework-sync'
);
const stagedTargetRoot = path.join(scratchRoot, 'target');
const preservedRoot = path.join(scratchRoot, 'preserved');
const backupRoot = path.join(scratchRoot, 'previous');

const packageVersionByName = {
  '@react-router/dev': '^8.0.1',
  '@react-router/express': '^8.0.1',
  '@react-router/fs-routes': '^8.0.1',
  '@react-router/node': '^8.0.1',
  '@react-router/remix-routes-option-adapter': '^8.0.1',
  '@react-router/serve': '^8.0.1',
  '@types/react': '^19.2.10',
  '@types/react-dom': '^19.2.3',
  '@rsbuild/core': '2.1.0',
  '@rsbuild/plugin-react': '2.1.0',
  react: '^19.2.4',
  'react-dom': '^19.2.4',
  'react-router': '^8.0.1',
  'react-server-dom-rspack': '0.0.2',
  'rsbuild-plugin-react-router': `^${rootPackageJson.version}`,
  'rsbuild-plugin-rsc': '^0.1.1',
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

  PINNED_UPSTREAM.ref = headSha;
  return headSha;
};

const copyIfExists = async (from, to) => {
  if (!existsSync(from)) {
    return;
  }
  await mkdir(path.dirname(to), { recursive: true });
  await cp(from, to, { force: true, recursive: true });
};

const preserveAdapterFiles = async (workRoot = targetRoot) => {
  await rm(preservedRoot, { force: true, recursive: true });
  for (const relativePath of preservedCorpusPaths) {
    await copyIfExists(
      path.join(workRoot, relativePath),
      path.join(preservedRoot, relativePath)
    );
  }
};

const restoreAdapterFiles = async (workRoot = targetRoot) => {
  for (const relativePath of preservedCorpusPaths) {
    await copyIfExists(
      path.join(preservedRoot, relativePath),
      path.join(workRoot, relativePath)
    );
  }
};

const copyUpstreamTests = async (workRoot = targetRoot) => {
  for (const [source, target] of sourceDirs) {
    const sourcePath = path.join(sourceRoot, source);
    if (!existsSync(sourcePath)) {
      throw new Error(`Missing upstream React Router test path: ${sourcePath}`);
    }
    await rm(path.join(workRoot, target), { force: true, recursive: true });
    await cp(sourcePath, path.join(workRoot, target), {
      force: true,
      recursive: true,
    });
  }

  for (const sourcePath of [
    ...Object.keys(corpusRenames),
    ...removedUpstreamPaths,
  ]) {
    await rm(path.join(workRoot, sourcePath), {
      force: true,
      recursive: true,
    });
  }
};

const replaceCorpusFromStage = async () => {
  await rm(backupRoot, { force: true, recursive: true });
  await rename(targetRoot, backupRoot);
  try {
    await rename(stagedTargetRoot, targetRoot);
  } catch (error) {
    await rename(backupRoot, targetRoot);
    throw error;
  }
  await moveLocalCorpusDirs(backupRoot, targetRoot);
  await rm(backupRoot, { force: true, recursive: true });
};

const copyCorpusTree = async (from, to) => {
  await mkdir(to, { recursive: true });
  const entries = await readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.tmp') {
      continue;
    }
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await copyCorpusTree(sourcePath, targetPath);
    } else {
      await cp(sourcePath, targetPath, { force: true, recursive: true });
    }
  }
};

const moveLocalCorpusDirs = async (from, to) => {
  if (!existsSync(from)) {
    return;
  }
  const entries = await readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const sourcePath = path.join(from, entry.name);
    const targetPath = path.join(to, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.tmp') {
      await mkdir(path.dirname(targetPath), { recursive: true });
      await rm(targetPath, { force: true, recursive: true });
      await rename(sourcePath, targetPath);
      continue;
    }
    await moveLocalCorpusDirs(sourcePath, targetPath);
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
      if (!version.startsWith('workspace:') && version !== 'catalog:') {
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
 * the pinned ref plus the declared local overlay — i.e. nothing under the
 * corpus was hand-edited outside `preservedCorpusPaths`.
 */
const detectCorpusDrift = () => {
  // Raw output (no trim): porcelain lines are `XY <path>` and the first
  // line's status prefix may start with a significant space.
  const status = execFileSync(
    'git',
    [
      '-C',
      repoRoot,
      'status',
      '--porcelain',
      '--',
      'tests/react-router-framework',
    ],
    { encoding: 'utf8' }
  );
  if (!status.trim()) {
    return [];
  }
  const preserved = preservedCorpusPaths.map(relativePath =>
    path.posix.join('tests/react-router-framework', relativePath)
  );
  const isPreservedPath = entry =>
    preserved.some(
      preservedPath =>
        entry === preservedPath || entry.startsWith(`${preservedPath}/`)
    );

  return status
    .split('\n')
    .filter(line => line.length > 3)
    .map(line => line.slice(3).trim())
    .filter(entry => entry && !isPreservedPath(entry));
};

const getCorpusVerification = () => {
  const status = execFileSync(
    'git',
    [
      '-C',
      repoRoot,
      'status',
      '--porcelain',
      '--',
      'tests/react-router-framework',
    ],
    { encoding: 'utf8' }
  );
  return {
    untrackedDriftPaths: detectCorpusDrift(),
  };
};

const writeManifest = async ref => {
  const fileCount = (
    await findFiles(targetRoot, name => name !== 'UPSTREAM.json')
  ).length;
  const { untrackedDriftPaths } = getCorpusVerification();
  const corpusVerified = untrackedDriftPaths.length === 0;

  const manifest = {
    repository: PINNED_UPSTREAM.repository,
    ref,
    syncedAt: new Date().toISOString(),
    sourceDirs: sourceDirs.map(([source]) => source),
    fileCount,
    adapterOwnedFiles: adapterOwnedPaths,
    adaptedCorpusFiles: adaptedCorpusPaths,
    renames: corpusRenames,
    removedUpstreamFiles: removedUpstreamPaths,
    corpusVerified,
    preservedLocalPathCount: preservedCorpusPaths.length,
  };
  if (!corpusVerified) {
    manifest.driftFileCount = untrackedDriftPaths.length;
    manifest.note =
      `${untrackedDriftPaths.length} checked-in corpus path(s) outside the ` +
      `declared local overlay differ from a fresh sync of the pinned ref. ` +
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
  return { corpusVerified, untrackedDriftPaths };
};

if (!normalizeOnly) {
  const ref = await enforcePinnedRef();
  await rm(scratchRoot, { force: true, recursive: true });
  await mkdir(stagedTargetRoot, { recursive: true });
  await preserveAdapterFiles(targetRoot);
  await copyUpstreamTests(stagedTargetRoot);
  await restoreAdapterFiles(stagedTargetRoot);

  for (const packageJsonPath of await findFiles(
    stagedTargetRoot,
    name => name === 'package.json'
  )) {
    if (
      isPreservedCorpusPath(
        toCorpusRelativePath(stagedTargetRoot, packageJsonPath)
      )
    ) {
      continue;
    }
    await normalizePackageJson(packageJsonPath);
  }
  await replaceCorpusFromStage();

  const { corpusVerified, untrackedDriftPaths } = await writeManifest(ref);
  console.log(
    `Synced React Router framework tests from ${sourceRoot}@${ref} into ${targetRoot}`
  );
  if (!corpusVerified) {
    console.warn(
      `WARNING: ${untrackedDriftPaths.length} checked-in corpus path(s) differed ` +
        `from the fresh sync and were overwritten in the working tree:\n` +
        untrackedDriftPaths.map(entry => `  - ${entry}`).join('\n') +
        `\nSee the note in tests/react-router-framework/UPSTREAM.json.`
    );
  }

  if (updatePin) {
    const scriptSource = await readFile(scriptPath, 'utf8');
    const updatedSource = scriptSource.replace(
      `ref: '${originalPinnedUpstreamRef}'`,
      `ref: '${ref}'`
    );
    if (updatedSource === scriptSource) {
      throw new Error(
        `--update-pin could not rewrite the pinned ref in ${scriptPath}.`
      );
    }
    await writeFile(scriptPath, updatedSource, 'utf8');
    console.log(`Updated pinned upstream ref to ${ref}`);
  }
  await rm(scratchRoot, { force: true, recursive: true });
} else {
  await rm(scratchRoot, { force: true, recursive: true });
  await copyCorpusTree(targetRoot, stagedTargetRoot);
  for (const packageJsonPath of await findFiles(
    stagedTargetRoot,
    name => name === 'package.json'
  )) {
    if (
      isPreservedCorpusPath(
        toCorpusRelativePath(stagedTargetRoot, packageJsonPath)
      )
    ) {
      continue;
    }
    await normalizePackageJson(packageJsonPath);
  }
  await replaceCorpusFromStage();
  await rm(scratchRoot, { force: true, recursive: true });
  console.log(
    `Normalized React Router framework test package manifests in ${targetRoot}`
  );
}
