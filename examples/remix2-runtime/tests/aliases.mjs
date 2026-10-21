import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { createRsbuild } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import {
  pluginRemix2,
  loadRemix2ServerBuild,
} from 'rsbuild-plugin-react-router/remix2';
import { createRequestHandler } from '@remix-run/node';

const require = createRequire(import.meta.url);
const { readConfig } = require('@remix-run/dev/dist/config.js');

async function assertNativeResponse(build, mode, expected) {
  const response = await createRequestHandler(
    build,
    mode
  )(new Request('http://localhost/?_data=routes%2F_index'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expected);
}

test(
  'normal prefix aliases compile server subpaths before native evaluation',
  { timeout: 30000 },
  async () => {
    const routeFile = resolve('app/routes/_index.tsx');
    const original = await readFile(routeFile, 'utf8');
    let server;
    try {
      await writeFile(
        routeFile,
        original.replace("'../state.server'", "'~/state.server'")
      );
      const rsbuild = await createRsbuild({
        cwd: process.cwd(),
        rsbuildConfig: {
          plugins: [
            pluginRemix2(),
            pluginReact(),
            {
              name: 'acceptance:normalized-alias',
              setup(api) {
                api.onAfterCreateCompiler(({ compiler }) => {
                  const node = compiler.compilers.find(
                    child => child.name === 'node'
                  );
                  console.log(
                    'Normalized node alias',
                    JSON.stringify(node.options.resolve.alias)
                  );
                  node.hooks.done.tap('acceptance:normalized-alias', stats => {
                    assert.equal(stats.hasErrors(), false);
                    console.log('Node compilation finished without errors');
                  });
                });
              },
            },
          ],
          resolve: { alias: { '~': resolve('app') } },
          server: { middlewareMode: true },
          dev: { cliShortcuts: false },
        },
      });
      server = await rsbuild.createDevServer();
      const build = await loadRemix2ServerBuild(server);
      await assertNativeResponse(build, 'development', {
        message: 'native-loader-v1',
        revision: 0,
        digest: createHash('sha256')
          .update('REMIX2_LOADER_ONLY_NODE_SENTINEL')
          .digest('hex')
          .slice(0, 8),
      });
    } finally {
      await server?.close();
      await writeFile(routeFile, original);
    }
  }
);

test(
  'native aliases preserve prefix, exact, array, ignored, and tsconfig resolution without bundling lookalike packages',
  { timeout: 60000 },
  async () => {
    const routeFile = resolve('app/routes/_index.tsx');
    const tsconfigFile = resolve('tsconfig.json');
    const originalRoute = await readFile(routeFile, 'utf8');
    const originalTsconfig = await readFile(tsconfigFile, 'utf8');
    const directory = resolve('app/review-alias');
    const packages = ['review-alias-ish', 'review-exact', 'review-exact-ish'];
    let server;
    const previousMode = process.env.NODE_ENV;
    try {
      await mkdir(directory, { recursive: true });
      for (const [file, value] of [
        ['index.ts', 'alias-root'],
        ['state.server.ts', 'alias-subpath'],
        ['exact.server.ts', 'alias-exact'],
        ['mapped.server.ts', 'tsconfig-subpath'],
      ]) {
        await writeFile(
          resolve(directory, file),
          `export default ${JSON.stringify(value)};`
        );
      }
      for (const name of packages) {
        const packageDirectory = resolve('node_modules', name);
        await mkdir(packageDirectory, { recursive: true });
        await writeFile(
          resolve(packageDirectory, 'package.json'),
          JSON.stringify({ name, main: 'index.cjs' })
        );
        await writeFile(
          resolve(packageDirectory, 'index.cjs'),
          `module.exports = { value: ${JSON.stringify(name)}, token: {} };`
        );
      }
      await writeFile(
        resolve('node_modules/review-exact/subpath.cjs'),
        'module.exports = { value: "external-exact-subpath", token: {} };'
      );
      const tsconfig = JSON.parse(originalTsconfig);
      tsconfig.compilerOptions.baseUrl = '.';
      tsconfig.compilerOptions.paths = {
        'review-mapped/*': ['app/review-alias/*'],
        'review-mapped-root': ['app/review-alias/index.ts'],
      };
      await writeFile(tsconfigFile, JSON.stringify(tsconfig));
      await writeFile(
        routeFile,
        `
      import { json } from '@remix-run/node';
      import root from 'review-alias';
      import queriedRoot from 'review-alias?review-alias';
      import subpath from 'review-alias/state.server';
      import exact from 'review-exact';
      import queriedExact from 'review-exact?review-alias';
      import array from 'review-array/state.server';
      import ignored from 'review-ignored';
      import mapped from 'review-mapped/mapped.server';
      import mappedRoot from 'review-mapped-root';
      import prefixLookalike from 'review-alias-ish';
      import exactSubpath from 'review-exact/subpath.cjs';
      import exactLookalike from 'review-exact-ish';
      export const reviewExternals = [prefixLookalike, exactSubpath, exactLookalike];
      export function loader() {
        return json({
          root, queriedRoot, subpath, exact, queriedExact, array, mapped, mappedRoot,
          ignored: Object.keys(ignored),
          external: reviewExternals.map(module => module.value),
        });
      }
      export default function Index() { return null; }
    `
      );
      const expected = {
        root: 'alias-root',
        queriedRoot: 'alias-root',
        subpath: 'alias-subpath',
        exact: 'alias-exact',
        queriedExact: 'alias-exact',
        array: 'alias-subpath',
        mapped: 'tsconfig-subpath',
        mappedRoot: 'alias-root',
        ignored: [],
        external: [
          'review-alias-ish',
          'external-exact-subpath',
          'review-exact-ish',
        ],
      };
      const externalModules = [
        require('review-alias-ish'),
        require('review-exact/subpath.cjs'),
        require('review-exact-ish'),
      ];
      function assertExternalIdentity(build) {
        for (const [index, module] of externalModules.entries())
          assert.strictEqual(
            build.routes['routes/_index'].module.reviewExternals[index],
            module,
            'Genuine dependencies must retain their native module identity'
          );
      }
      async function configured(format, buildPath) {
        const config = await readConfig(process.cwd(), process.env.NODE_ENV);
        config.serverModuleFormat = format;
        config.serverBuildPath = resolve(buildPath);
        return createRsbuild({
          cwd: process.cwd(),
          rsbuildConfig: {
            plugins: [pluginRemix2({ config }), pluginReact()],
            resolve: {
              alias: () => ({
                'review-alias': './app/review-alias',
                'review-exact$': './app/review-alias/exact.server.ts',
                'review-array': ['./app/review-missing', './app/review-alias'],
                'review-ignored': false,
              }),
            },
            server: { middlewareMode: true },
            dev: { cliShortcuts: false },
            performance: { printFileSize: false },
          },
        });
      }
      for (const format of ['esm', 'cjs']) {
        process.env.NODE_ENV = 'development';
        const dev = await configured(
          format,
          `build/review-alias-${format}/index.js`
        );
        server = await dev.createDevServer();
        const build = await loadRemix2ServerBuild(server);
        assertExternalIdentity(build);
        await assertNativeResponse(build, 'development', expected);
        await server.close();
        server = undefined;
        process.env.NODE_ENV = 'production';
        const production = await configured(
          format,
          `build/review-alias-${format}/index.js`
        );
        await production.build();
        const emittedPath = resolve(`build/review-alias-${format}/index.js`);
        const emitted =
          format === 'cjs'
            ? require(emittedPath)
            : await import(pathToFileURL(emittedPath).href);
        assertExternalIdentity(emitted);
        await assertNativeResponse(emitted, 'production', expected);
      }
    } finally {
      if (previousMode === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousMode;
      await server?.close();
      await writeFile(routeFile, originalRoute);
      await writeFile(tsconfigFile, originalTsconfig);
      await rm(directory, { recursive: true, force: true });
      for (const name of packages)
        await rm(resolve('node_modules', name), {
          recursive: true,
          force: true,
        });
    }
  }
);
