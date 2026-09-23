import { mkdirSync, mkdtempSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rspack, type Rspack } from '@rsbuild/core';
import { describe, expect, it } from '@rstest/core';

import {
  createQuerylessRouteImportPlugin,
  createRouteFilePathMap,
  resolveQuerylessRouteImportRequest,
} from '../src/route-imports';
import type { Route } from '../src/types';

const routeByFilePath = new Map<string, Route>([
  [
    '/app/routes/source.tsx',
    { id: 'routes/source', file: 'routes/source.tsx' },
  ],
  [
    '/app/routes/target.tsx',
    { id: 'routes/target', file: 'routes/target.tsx' },
  ],
]);

describe('queryless route imports', () => {
  it('rewrites web route imports to client route build requests', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'web',
        issuer: '/app/routes/source.tsx',
        request: './target',
        resolvedPath: '/app/routes/target.tsx',
        routeByFilePath,
      })
    ).toBe('/app/routes/target.tsx?react-router-route');
  });

  it('rewrites a resolved alias to the same registered route', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'web',
        issuer: '/app/routes/source.tsx',
        request: '@app/routes/target',
        resolvedPath: '/app/routes/target.tsx',
        routeByFilePath,
      })
    ).toBe('/app/routes/target.tsx?react-router-route');
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'web',
        issuer: '/app/routes/source.tsx',
        request: '@app/routes/target?raw',
        resolvedPath: '/app/routes/target.tsx',
        routeByFilePath,
      })
    ).toBeUndefined();
  });

  it('rewrites RSC client route module imports to shared client modules', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'node',
        issuer: '/app/routes/source.tsx?client-route-module=default',
        request: './target',
        resolvedPath: '/app/routes/target.tsx',
        routeByFilePath,
      })
    ).toBe('/app/routes/target.tsx?client-route-module=shared');
  });

  it('leaves classic node route imports alone', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'node',
        issuer: '/app/routes/source.tsx?server-route-module=',
        request: './target',
        resolvedPath: '/app/routes/target.tsx',
        routeByFilePath,
      })
    ).toBeUndefined();
  });

  it('rewrites RSC web route imports to shared client route modules', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'web',
        issuer: '/app/routes/source.tsx',
        rsc: true,
        request: './target',
        resolvedPath: '/app/routes/target.tsx',
        routeByFilePath,
      })
    ).toBe('/app/routes/target.tsx?client-route-module=shared');
  });

  it('rewrites RSC node route imports to server route modules', () => {
    expect(
      resolveQuerylessRouteImportRequest({
        compilerName: 'node',
        issuer: '/app/routes/source.tsx?server-route-module=',
        rsc: true,
        request: './target',
        resolvedPath: '/app/routes/target.tsx',
        routeByFilePath,
      })
    ).toBe('/app/routes/target.tsx?server-route-module=');
  });
});

describe('queryless route imports with the native resolver', () => {
  it.each([
    'alias',
    'dependency alias',
    'relative alias',
    'absolute alias',
    'package imports',
    'extension priority',
    'directory index',
    'TypeScript paths',
    'symlink target',
    'symlink issuer',
    'symlinks disabled',
    'RSC browser',
    'RSC SSR',
    'RSC server',
  ])('uses the actual route resolved for %s', async kind => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-import-'));
    const source = join(root, 'source.js');
    const target = join(root, 'target.js');
    const wrong = join(root, 'wrong.js');
    const request =
      kind === 'relative alias'
        ? './wrong.js'
        : kind === 'absolute alias'
          ? wrong
          : kind === 'package imports'
            ? '#route'
            : kind === 'extension priority'
              ? './target'
              : kind === 'directory index'
                ? './directory'
                : '@route';
    const resolve: Rspack.ResolveOptions = {
      extensions: ['.js', '.tsx'],
      alias: { [request]: target },
    };
    if (kind === 'symlinks disabled') resolve.symlinks = false;
    if (kind === 'dependency alias') {
      resolve.alias = { '@route': wrong };
      resolve.byDependency = { esm: { alias: { '@route': target } } };
    }
    if (kind === 'package imports') {
      delete resolve.alias;
      writeFileSync(
        join(root, 'package.json'),
        JSON.stringify({
          imports: {
            '#route': { import: './target.js', default: './wrong.js' },
          },
        })
      );
    }
    if (kind === 'extension priority') {
      delete resolve.alias;
      writeFileSync(
        join(root, 'target.tsx'),
        `export const value = 'wrong extension';`
      );
    }
    if (kind === 'directory index') {
      delete resolve.alias;
      mkdirSync(join(root, 'directory'));
      writeFileSync(
        join(root, 'directory/index.js'),
        `export { value } from '../target.js';`
      );
    }
    if (kind === 'TypeScript paths') {
      delete resolve.alias;
      const tsconfig = join(root, 'tsconfig.json');
      writeFileSync(
        tsconfig,
        JSON.stringify({
          compilerOptions: {
            baseUrl: '.',
            paths: { '@route': ['./target.js'] },
          },
        })
      );
      resolve.tsConfig = tsconfig;
    }
    writeFileSync(
      source,
      `import { value } from ${JSON.stringify(request)}; console.log(value);`
    );
    writeFileSync(target, `export const value = 'correct route';`);
    writeFileSync(wrong, `export const value = 'wrong route';`);
    const realTarget = kind === 'symlink target' ? join(root, 'real-target.js') : target;
    if (kind.startsWith('symlink')) {
      const file = kind === 'symlink issuer' ? source : target;
      const realFile = join(root, kind === 'symlink issuer' ? 'real-source.js' : 'real-target.js');
      renameSync(file, realFile);
      symlinkSync(realFile, file);
    }
    const files = [
      source,
      target,
      wrong,
      join(root, 'target.tsx'),
      join(root, 'directory/index.js'),
    ];
    const routes = createRouteFilePathMap(root, Object.fromEntries(files.map(file => [file, {id: file, file}])));
    const rsc = kind.startsWith('RSC');
    const query =
      kind === 'RSC server'
        ? '?server-route-module='
        : rsc
          ? '?client-route-module=shared'
          : '?react-router-route';
    const layer =
      kind === 'RSC SSR'
        ? rspack.experiments.rsc.Layers.ssr
        : kind === 'RSC server'
          ? rspack.experiments.rsc.Layers.rsc
          : undefined;
    const queryCheckLoader = join(root, 'check-query.cjs');
    writeFileSync(
      queryCheckLoader,
      `module.exports = function(source) {
      require('node:assert/strict').equal(this.resourceQuery, ${JSON.stringify(query)});
      return source;
    };`
    );
    const compiler = rspack({
      name: layer ? 'node' : 'web',
      mode: 'production',
      context: root,
      entry: { main: { import: './source.js', layer } },
      cache: false,
      resolve,
      module: {
        rules: [{ test: /(?:target|index)\.js$/, use: [queryCheckLoader] }],
      },
      output: { path: join(root, 'dist') },
      optimization: { minimize: false, concatenateModules: false },
      plugins: [createQuerylessRouteImportPlugin(routes, { rsc })],
    });
    compiler.hooks.shouldEmit.tap('RouteImportTest', () => false);
    try {
      const stats = await new Promise<Rspack.Stats>((resolve, reject) => {
        compiler.run((error, stats) => {
          if (error || !stats || stats.hasErrors())
            reject(
              error ?? new Error(stats?.toString({ all: false, errors: true }))
            );
          else resolve(stats);
        });
      });
      const resources = Array.from(
        stats.compilation.modules,
        module => (module as Rspack.NormalModule).resource
      );
      expect(resources).toContain(`${realTarget}${query}`);
      expect(resources).not.toContain(target);
      expect(resources.some(resource => resource?.includes('wrong.js'))).toBe(
        false
      );
      expect(resources.some(resource => resource?.includes('target.tsx'))).toBe(
        false
      );
      if (kind === 'directory index') {
        expect(resources).toContain(
          `${join(root, 'directory/index.js')}?react-router-route`
        );
      }
    } finally {
      await new Promise<void>((resolve, reject) =>
        compiler.close(error => (error ? reject(error) : resolve()))
      );
      rmSync(root, { recursive: true, force: true });
    }
  });
});
