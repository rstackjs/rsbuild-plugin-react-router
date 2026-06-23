import { describe, expect, it } from '@rstest/core';
import {
  ReactRouterDevGenerationCoordinator,
  loadReactRouterServerBuild,
  registerReactRouterDevServer,
} from '../src/dev-generation-coordinator';

const createManifest = (hasLoader: boolean) =>
  ({
    version: hasLoader ? 'with-loader' : 'without-loader',
    url: '/static/js/manifest.js',
    hmr: undefined,
    routes: {
      'routes/page': {
        id: 'routes/page',
        module: '/app/routes/page.tsx',
        hasLoader,
      },
    },
  }) as any;

const createBuild = (assets: any, loader?: () => unknown) =>
  ({
    assets,
    routes: {
      'routes/page': {
        id: 'routes/page',
        module: loader ? { loader } : {},
      },
    },
  }) as any;

describe('ReactRouterDevGenerationCoordinator', () => {
  it('rejects a server build whose embedded manifest does not match the staged web candidate', () => {
    const coordinator = new ReactRouterDevGenerationCoordinator();
    const firstManifest = createManifest(false);
    const firstWeb = coordinator.stageWeb({
      browserManifest: firstManifest,
      serverManifest: firstManifest,
      serverManifestsByBundleId: {},
      moduleExportsByRouteId: {},
    });
    const firstNode = coordinator.stageNode({
      buildsByEntryName: {
        'static/js/app': createBuild(firstManifest),
      },
    });
    const firstGeneration = coordinator.commit(firstWeb, firstNode);

    const nextManifest = createManifest(true);
    const nextWeb = coordinator.stageWeb({
      browserManifest: nextManifest,
      serverManifest: nextManifest,
      serverManifestsByBundleId: {},
      moduleExportsByRouteId: {},
    });
    const mismatchedNode = coordinator.stageNode({
      buildsByEntryName: {
        'static/js/app': createBuild(firstManifest, () => 'data'),
      },
    });

    expect(() => coordinator.commit(nextWeb, mismatchedNode)).toThrow(
      'does not match the staged web manifest'
    );
    expect(coordinator.getCommitted()).toBe(firstGeneration);
  });

  it('keeps serving the last committed build after a rejected candidate', async () => {
    const coordinator = new ReactRouterDevGenerationCoordinator();
    const server = {};
    const manifest = createManifest(false);
    const build = createBuild(manifest);

    registerReactRouterDevServer(server, coordinator);
    coordinator.commit(
      coordinator.stageWeb({
        browserManifest: manifest,
        serverManifest: manifest,
        serverManifestsByBundleId: {},
        moduleExportsByRouteId: {},
      }),
      coordinator.stageNode({
        buildsByEntryName: {
          'static/js/app': build,
        },
      })
    );
    coordinator.reject(new Error('candidate failed'));

    await expect(loadReactRouterServerBuild(server)).resolves.toBe(build);
  });

  it('rejects node-new web-old route export mismatches even when the embedded manifest is old-coherent', () => {
    const coordinator = new ReactRouterDevGenerationCoordinator();
    const manifest = createManifest(false);
    const web = coordinator.stageWeb({
      browserManifest: manifest,
      serverManifest: manifest,
      serverManifestsByBundleId: {},
      moduleExportsByRouteId: {},
    });
    const node = coordinator.stageNode({
      buildsByEntryName: {
        'static/js/app': createBuild(manifest, () => 'data'),
      },
    });

    expect(() => coordinator.commit(web, node)).toThrow(
      'loader export does not match the staged web manifest'
    );
    expect(coordinator.getCommitted()).toBeNull();
  });

  it('custom server helper waits for the initial committed generation', async () => {
    const coordinator = new ReactRouterDevGenerationCoordinator();
    const server = {};
    const manifest = createManifest(false);
    const build = createBuild(manifest);
    registerReactRouterDevServer(server, coordinator);

    const pendingBuild = loadReactRouterServerBuild(server);
    let resolved = false;
    pendingBuild.then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(false);

    coordinator.commit(
      coordinator.stageWeb({
        browserManifest: manifest,
        serverManifest: manifest,
        serverManifestsByBundleId: {},
        moduleExportsByRouteId: {},
      }),
      coordinator.stageNode({
        buildsByEntryName: {
          'static/js/app': build,
        },
      })
    );

    await expect(pendingBuild).resolves.toBe(build);
  });
});
