import { describe, expect, it } from '@rstest/core';
import {
  createReactRouterNodeEntries,
  createReactRouterServerBuildPlan,
} from '../src/server-build-plan';

describe('React Router server build plan', () => {
  it('creates a default-only plan when no server bundles are configured', () => {
    expect(
      createReactRouterServerBuildPlan({
        routesByServerBundleId: {},
        serverBuildFile: undefined,
        defaultEntryName: 'static/js/app',
      })
    ).toEqual({
      defaultEntryName: 'static/js/app',
      entryNames: ['static/js/app'],
      serverBundleEntries: [],
    });
  });

  it('creates deterministic bundle entries from the configured server build file', () => {
    expect(
      createReactRouterServerBuildPlan({
        routesByServerBundleId: {
          admin: {
            root: { id: 'root', file: 'root.tsx', path: '' },
          },
          empty: {},
          shop: {
            root: { id: 'root', file: 'root.tsx', path: '' },
          },
        },
        serverBuildFile: 'server-entry.js',
        defaultEntryName: 'static/js/app',
      })
    ).toEqual({
      defaultEntryName: 'static/js/app',
      entryNames: [
        'static/js/app',
        'admin/server-entry',
        'shop/server-entry',
      ],
      serverBundleEntries: [
        { bundleId: 'admin', entryName: 'admin/server-entry' },
        { bundleId: 'shop', entryName: 'shop/server-entry' },
      ],
    });
  });

  it('rejects bundle entries that collide with reserved node entries', () => {
    expect(() =>
      createReactRouterServerBuildPlan({
        routesByServerBundleId: {
          'static/js': {
            root: { id: 'root', file: 'root.tsx', path: '' },
          },
        },
        serverBuildFile: 'app.js',
        defaultEntryName: 'static/js/react-router-server-build',
      })
    ).toThrow('conflicts with a reserved node entry');
  });
});

describe('React Router node entries', () => {
  const serverBundleEntries = [
    { bundleId: 'admin', entryName: 'admin/index' },
  ];

  it('uses the generated server build as the app entry without a custom server', () => {
    expect(
      createReactRouterNodeEntries({
        hasServerApp: false,
        isBuild: false,
        serverAppPath: '/project/server/index.ts',
        entryServerPath: '/project/app/entry.server.tsx',
        defaultEntryName: 'static/js/app',
        serverBundleEntries,
      })
    ).toEqual({
      'static/js/app': 'virtual/react-router/server-build',
      'static/js/entry.server': '/project/app/entry.server.tsx',
      'admin/index': 'virtual/react-router/server-build-admin',
    });
  });

  it('adds a private generated server build only for custom-server development', () => {
    expect(
      createReactRouterNodeEntries({
        hasServerApp: true,
        isBuild: false,
        serverAppPath: '/project/server/index.ts',
        entryServerPath: '/project/app/entry.server.tsx',
        defaultEntryName: 'static/js/react-router-server-build',
        serverBundleEntries,
      })
    ).toEqual({
      'static/js/app': '/project/server/index.ts',
      'static/js/react-router-server-build':
        'virtual/react-router/server-build',
      'static/js/entry.server': '/project/app/entry.server.tsx',
      'admin/index': 'virtual/react-router/server-build-admin',
    });
  });

  it('omits the private generated server build during custom-server production builds', () => {
    expect(
      createReactRouterNodeEntries({
        hasServerApp: true,
        isBuild: true,
        serverAppPath: '/project/server/index.ts',
        entryServerPath: '/project/app/entry.server.tsx',
        defaultEntryName: 'static/js/react-router-server-build',
        serverBundleEntries,
      })
    ).toEqual({
      'static/js/app': '/project/server/index.ts',
      'static/js/entry.server': '/project/app/entry.server.tsx',
      'admin/index': 'virtual/react-router/server-build-admin',
    });
  });
});
