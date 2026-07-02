import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  assertReactRouterRscSupport,
  createReactRouterRscResolveAliases,
  createReactRouterRscVirtualModules,
} from '../src/rsc-support';

describe('RSC support helpers', () => {
  it('creates aliases for upstream colon virtual IDs and internal client modules', () => {
    const aliases = createReactRouterRscResolveAliases('/repo');

    expect(aliases).toMatchObject({
      'virtual:react-router/unstable_rsc/routes': expect.stringContaining(
        'virtual/react-router/unstable_rsc/routes.js'
      ),
      'virtual/react-router/unstable_rsc/routes': expect.stringContaining(
        'virtual/react-router/unstable_rsc/routes.js'
      ),
      'react-router/internal/react-server-client': expect.stringContaining(
        'virtual/react-router/rsc-internal-client.js'
      ),
    });
  });

  it('creates only RSC virtual modules with normalized bootstrap scripts', () => {
    const modules = createReactRouterRscVirtualModules({
      appDirectory: '/repo/app',
      basename: '/',
      buildDirectory: '/repo/build',
      isBuild: false,
      outputClientPath: '/repo/build/client',
      publicPath: '/assets',
      routeDiscovery: { mode: 'initial' },
      routes: {
        root: {
          id: 'root',
          file: 'root.tsx',
          path: '',
        },
      },
      ssr: true,
    });

    expect(modules['virtual/react-router/server-build']).toBeUndefined();
    expect(
      modules['virtual/react-router/unstable_rsc/bootstrap-scripts']
    ).toContain('/assets/static/js/index.js');
    expect(
      modules['virtual/react-router/unstable_rsc/inject-hmr-runtime']
    ).toContain('rsc:update');
  });

  it('rejects React Router versions before the RSC export surface', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'rr-rsc-support-'));
    const packageJsonPath = join(tempDir, 'react-router.json');
    writeFileSync(packageJsonPath, JSON.stringify({ version: '7.17.0' }));

    try {
      expect(() =>
        assertReactRouterRscSupport({
          pluginName: 'test-plugin',
          resolvePackagePath: specifier =>
            specifier === 'react-router/package.json'
              ? packageJsonPath
              : '/repo/node_modules/fake.js',
        })
      ).toThrow('requires react-router >=7.18.0 or >=8.0.0');
    } finally {
      rmSync(tempDir, { force: true, recursive: true });
    }
  });

  it('rejects missing RSC runtime dependencies', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'rr-rsc-support-'));
    const packageJsonPath = join(tempDir, 'react-router.json');
    writeFileSync(packageJsonPath, JSON.stringify({ version: '8.0.1' }));

    try {
      expect(() =>
        assertReactRouterRscSupport({
          pluginName: 'test-plugin',
          resolvePackagePath: specifier =>
            specifier === 'react-router/package.json'
              ? packageJsonPath
              : undefined,
        })
      ).toThrow('requires `react-server-dom-rspack/client.browser`');
    } finally {
      rmSync(tempDir, { force: true, recursive: true });
    }
  });
});
