import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  build,
  createEditor,
  createProject,
  expectBuildSucceeded,
  rsbuildConfig,
} from './helpers/rsbuild.js';

const readAssets = (cwd: string) =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        'const build = await import("./build/server/index.js"); console.log(JSON.stringify(build.assets));',
      ],
      { cwd, encoding: 'utf8' }
    )
  );

test('node-only builds preserve finalized browser assets across invocations', async () => {
  const cwd = await createProject({});
  await createEditor(cwd)(
    'app/root.tsx',
    contents =>
      `export const loader = () => ({ message: "original server" });\n${contents}`
  );
  expectBuildSucceeded(build({ cwd }));
  const before = readAssets(cwd);
  await createEditor(cwd)('app/root.tsx', contents =>
    contents.replace('original server', 'updated server')
  );
  expectBuildSucceeded(build({ cwd, environment: 'node' }));
  const after = readAssets(cwd);
  expect(after).toEqual(before);
  expect(
    fs.existsSync(path.join(cwd, 'build/client', after.entry.module))
  ).toBe(true);
  const result = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      'const build = await import("./build/server/index.js"); console.log(JSON.stringify(await build.routes.root.module.loader()));',
    ],
    { cwd, encoding: 'utf8' }
  );
  expect(JSON.parse(result)).toEqual({ message: 'updated server' });
});

test('node-only builds explain when a browser build is required', async () => {
  const cwd = await createProject({});
  const result = build({ cwd, environment: 'node' });
  expect(result.status).not.toBe(0);
  expect(`${result.stdout}\n${result.stderr}`).toContain(
    'Run a full build before building only the node environment'
  );
});

test('node-only builds isolate manifests for projects sharing node_modules', async () => {
  const first = await createProject({});
  const second = await createProject({});
  expect(fs.realpathSync(path.join(first, 'node_modules'))).toBe(
    fs.realpathSync(path.join(second, 'node_modules'))
  );
  expectBuildSucceeded(build({ cwd: first }));
  const before = readAssets(first);
  expectBuildSucceeded(build({ cwd: second }));
  expectBuildSucceeded(build({ cwd: first, environment: 'node' }));
  expect(readAssets(first)).toEqual(before);
});

for (const name of ['loader', 'action']) {
  for (const operation of ['add', 'remove']) {
    test(`node-only builds reject ${operation} of a route ${name}`, async () => {
      const declaration = `export const ${name} = () => 'server';\n`;
      const cwd = await createProject({
        'rsbuild.config.ts': await rsbuildConfig.basic({ buildCache: true }),
      });
      if (operation === 'remove') {
        await createEditor(cwd)('app/root.tsx', source => declaration + source);
      }
      expectBuildSucceeded(build({ cwd }));
      expectBuildSucceeded(build({ cwd, environment: 'node' }));
      await createEditor(cwd)('app/root.tsx', source =>
        operation === 'add'
          ? declaration + source
          : source.replace(declaration, '')
      );
      const result = build({ cwd, environment: 'node' });
      expect(result.status).not.toBe(0);
      expect(`${result.stdout}\n${result.stderr}`).toContain(
        'loader/action exports changed'
      );
    });
  }
}

test('node-only builds retain a CDN prefix configured only for web', async () => {
  const config = (await rsbuildConfig.basic({})).replace(
    'defineConfig({',
    'defineConfig({ environments: { web: { output: { assetPrefix: "https://cdn.example.test/app/" } } },'
  );
  const cwd = await createProject({ 'rsbuild.config.ts': config });
  expectBuildSucceeded(build({ cwd }));
  const before = readAssets(cwd);
  expect(before.entry.module).toMatch(/^https:\/\/cdn\.example\.test\/app\//);
  expectBuildSucceeded(build({ cwd, environment: 'node' }));
  expect(readAssets(cwd)).toEqual(before);
});
