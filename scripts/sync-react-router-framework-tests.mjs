#!/usr/bin/env node

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const defaultSource = '/home/zack/projects/react-router';
const sourceRoot = path.resolve(
  process.env.REACT_ROUTER_REPO ??
    process.argv.find(arg => arg.startsWith('--source='))?.slice(9) ??
    defaultSource
);
const normalizeOnly = process.argv.includes('--normalize-only');
const targetRoot = path.join(repoRoot, 'tests/react-router-framework');
const scratchRoot = path.join(
  repoRoot,
  'node_modules/.cache/react-router-framework-sync'
);

const adapterOwnedPaths = [
  'README.md',
  'integration/helpers/rsbuild-adapter.ts',
  'integration/helpers/create-fixture.ts',
  'integration/helpers/express.ts',
  'integration/helpers/fixtures.ts',
  'integration/helpers/vite.ts',
  'integration/playwright.config.ts',
];

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
  const copies = [
    ['integration', 'integration'],
    ['packages/react-router-dev/__tests__', 'react-router-dev/__tests__'],
  ];

  for (const [source, target] of copies) {
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

const findPackageJsonFiles = async directory => {
  const entries = await import('node:fs/promises').then(fs =>
    fs.readdir(directory, { withFileTypes: true })
  );
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.tmp') {
      continue;
    }
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findPackageJsonFiles(absolutePath)));
    } else if (entry.name === 'package.json') {
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

if (!normalizeOnly) {
  await preserveAdapterFiles();
  await copyUpstreamTests();
  await restoreAdapterFiles();
}

for (const packageJsonPath of await findPackageJsonFiles(targetRoot)) {
  await normalizePackageJson(packageJsonPath);
}

console.log(
  normalizeOnly
    ? `Normalized React Router framework test package manifests in ${targetRoot}`
    : `Synced React Router framework tests from ${sourceRoot} into ${targetRoot}`
);
