import { describe, expect, it } from '@rstest/core';
import type {
  ReactRouterManifestForDev,
  RouteManifestModuleExports,
} from '../src/manifest';
import { createReactRouterManifestSnapshot } from '../src/manifest-snapshot';
import type { ReactRouterServerBuildPlan } from '../src/server-build-plan';
import type { Route, RouteManifestItem } from '../src/types';

const createRoute = (id: string): RouteManifestItem => ({
  id,
  module: `/assets/${id}.js`,
  hasAction: false,
  hasLoader: true,
  hasClientAction: false,
  hasClientLoader: false,
  hasClientMiddleware: false,
  hasDefaultExport: true,
  hasErrorBoundary: false,
  imports: ['/assets/shared.js'],
  css: [`/assets/${id}.css`],
});

const createManifest = (version = 'first'): ReactRouterManifestForDev => ({
  version,
  url: `/assets/manifest-${version}.js`,
  entry: {
    module: '/assets/entry.client.js',
    imports: ['/assets/runtime.js'],
    css: ['/assets/entry.css'],
  },
  sri: undefined,
  routes: {
    root: createRoute('root'),
    admin: createRoute('admin'),
    shop: createRoute('shop'),
  },
});

const createPlan = (bundleIds: string[] = []): ReactRouterServerBuildPlan => ({
  defaultEntryName: 'static/js/app',
  entryNames: [
    'static/js/app',
    ...bundleIds.map(bundleId => `${bundleId}/index`),
  ],
  serverBundleEntries: bundleIds.map(bundleId => ({
    bundleId,
    entryName: `${bundleId}/index`,
  })),
});

const createBundleRoutes = (...routeIds: string[]): Record<string, Route> =>
  Object.fromEntries(routeIds.map(id => [id, { id, file: `${id}.tsx` }]));

describe('React Router manifest snapshots', () => {
  it('creates a complete default-only snapshot without SRI', () => {
    const manifest = createManifest();
    const moduleExportsByRouteId = { root: ['default', 'loader'] };
    const snapshot = createReactRouterManifestSnapshot({
      manifest,
      sri: undefined,
      moduleExportsByRouteId,
      serverBuildPlan: createPlan(),
      routesByServerBundleId: {},
    });

    expect(snapshot.browser).toEqual(manifest);
    expect(snapshot.server).toEqual(manifest);
    expect(snapshot.moduleExportsByRouteId).toEqual(moduleExportsByRouteId);
    expect(snapshot.serverByBundleId).toEqual({});
    expect(snapshot.serverByEntryName).toEqual({
      'static/js/app': manifest,
    });
    expect(snapshot.serverByEntryName['static/js/app']).toBe(snapshot.server);
  });

  it.each([true as const, { '/assets/entry.client.js': 'sha384-entry' }])(
    'keeps browser manifests free of server SRI %j',
    sri => {
      const manifest = { ...createManifest(), sri };
      const snapshot = createReactRouterManifestSnapshot({
        manifest,
        sri,
        moduleExportsByRouteId: {},
        serverBuildPlan: createPlan(),
        routesByServerBundleId: {},
      });

      expect(snapshot.browser).toEqual({ ...manifest, sri: undefined });
      expect(snapshot.server).toEqual(manifest);
      expect(snapshot.server.sri).toEqual(sri);
      expect(manifest.sri).toBe(sri);
    }
  );

  it('filters bundle routes and maps every planned server entry', () => {
    const manifest = createManifest();
    const snapshot = createReactRouterManifestSnapshot({
      manifest,
      sri: undefined,
      moduleExportsByRouteId: {},
      serverBuildPlan: createPlan(['admin', 'shop', 'missing']),
      routesByServerBundleId: {
        admin: createBundleRoutes('root', 'admin', 'not-in-manifest'),
        shop: createBundleRoutes('root', 'shop'),
        unplanned: createBundleRoutes('root'),
      },
    });

    expect(Object.keys(snapshot.serverByBundleId)).toEqual(['admin', 'shop']);
    expect(Object.keys(snapshot.serverByEntryName)).toEqual([
      'static/js/app',
      'admin/index',
      'shop/index',
    ]);
    expect(snapshot.server.routes).toEqual(manifest.routes);
    expect(snapshot.serverByBundleId.admin.routes).toEqual({
      root: manifest.routes.root,
      admin: manifest.routes.admin,
    });
    expect(snapshot.serverByBundleId.shop.routes).toEqual({
      root: manifest.routes.root,
      shop: manifest.routes.shop,
    });
    expect(snapshot.serverByEntryName['admin/index']).toBe(
      snapshot.serverByBundleId.admin
    );
    expect(snapshot.serverByEntryName['shop/index']).toBe(
      snapshot.serverByBundleId.shop
    );
  });

  it('detaches nested manifest, SRI, export, and plan inputs', () => {
    const manifest = createManifest();
    const sri = { '/assets/entry.client.js': 'sha384-entry' };
    manifest.sri = sri;
    const rootExports = ['default', 'loader'];
    const moduleExportsByRouteId: RouteManifestModuleExports = {
      root: rootExports,
    };
    const serverBuildPlan = createPlan(['admin']);
    const routesByServerBundleId = {
      admin: createBundleRoutes('root', 'admin'),
    };
    const snapshot = createReactRouterManifestSnapshot({
      manifest,
      sri,
      moduleExportsByRouteId,
      serverBuildPlan,
      routesByServerBundleId,
    });
    const expected = structuredClone(snapshot);

    manifest.entry.imports.push('/assets/later.js');
    manifest.routes.root.module = '/assets/changed.js';
    manifest.routes.root.css.push('/assets/later.css');
    delete manifest.routes.admin;
    sri['/assets/entry.client.js'] = 'sha384-changed';
    rootExports.push('action');
    moduleExportsByRouteId.shop = ['default'];
    serverBuildPlan.defaultEntryName = 'different-entry';
    serverBuildPlan.serverBundleEntries.length = 0;
    delete routesByServerBundleId.admin.root;

    expect(snapshot).toEqual(expected);
    expect(snapshot.browser.routes.root).not.toBe(manifest.routes.root);
    expect(snapshot.server.sri).not.toBe(sri);
    expect(snapshot.moduleExportsByRouteId.root).not.toBe(rootExports);
  });

  it('does not carry removed bundles or SRI into a later snapshot', () => {
    const sri = { '/assets/entry.client.js': 'sha384-first' };
    const first = createReactRouterManifestSnapshot({
      manifest: { ...createManifest(), sri },
      sri,
      moduleExportsByRouteId: { root: ['default', 'loader'] },
      serverBuildPlan: createPlan(['admin']),
      routesByServerBundleId: {
        admin: createBundleRoutes('root', 'admin'),
      },
    });
    const second = createReactRouterManifestSnapshot({
      manifest: { ...createManifest('second'), sri },
      sri: undefined,
      moduleExportsByRouteId: { root: ['default'] },
      serverBuildPlan: createPlan(),
      routesByServerBundleId: {},
    });

    expect(second.browser.sri).toBeUndefined();
    expect(second.server.sri).toBeUndefined();
    expect(second.serverByBundleId).toEqual({});
    expect(Object.keys(second.serverByEntryName)).toEqual(['static/js/app']);
    expect(second.moduleExportsByRouteId).toEqual({ root: ['default'] });
    expect(first.browser.sri).toBeUndefined();
    expect(first.server.sri).toEqual(sri);
    expect(Object.keys(first.serverByBundleId)).toEqual(['admin']);
  });
});
