import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  build,
  createEditor,
  createProject,
  expectBuildSucceeded,
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
