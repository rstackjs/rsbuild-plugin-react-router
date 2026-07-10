import { describe, expect, it } from '@rstest/core';
import {
  createRouteChunkArtifact,
  createRouteClientEntryArtifact,
} from '../src/route-artifacts';
import {
  emptyRouteChunkSnippet,
  getRouteChunkIfEnabled,
  getRouteChunkModuleId,
  type RouteChunkCache,
  type RouteChunkConfig,
  type RouteChunkName,
} from '../src/route-chunks';

const routeChunkConfig: RouteChunkConfig = {
  splitRouteModules: true,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

const disabledRouteChunkConfig: RouteChunkConfig = {
  ...routeChunkConfig,
  splitRouteModules: false,
};

const enforceRouteChunkConfig: RouteChunkConfig = {
  ...routeChunkConfig,
  splitRouteModules: 'enforce',
};

const resourcePath = '/app/routes/demo.tsx';
const routeRequest = `${resourcePath}?react-router-route`;
const mainRouteChunkRequest = getRouteChunkModuleId(resourcePath, 'main');
const customExportChunkRequest = getRouteChunkModuleId(
  resourcePath,
  'customExport'
);

const createRouteChunk = async (
  source: string,
  chunkName: RouteChunkName,
  options: {
    config?: RouteChunkConfig;
    cache?: RouteChunkCache;
    isBuild?: boolean;
  } = {}
) =>
  createRouteChunkArtifact({
    code: source,
    resource: getRouteChunkModuleId(resourcePath, chunkName),
    resourcePath,
    routeChunkConfig: options.config ?? routeChunkConfig,
    routeChunkCache: options.cache,
    isBuild: options.isBuild ?? true,
  });

describe('route artifact helpers', () => {
  describe('createRouteClientEntryArtifact', () => {
    it('generates web route reexports that filter server-only exports', async () => {
      const result = await createRouteClientEntryArtifact({
        code: `
          export async function loader() { return null; }
          export async function clientLoader() { return null; }
          export { meta as meta };
          export const customExport = true;
          const meta = () => [];
          export default function Route() { return null; }
        `,
        resourcePath,
        environmentName: 'web',
        isBuild: false,
        routeChunkConfig: disabledRouteChunkConfig,
      });

      expect(result).toEqual({
        code: `export { clientLoader, customExport, default, meta } from ${JSON.stringify(routeRequest)};`,
      });
    });

    it('includes server-only route exports for node route entries', async () => {
      const result = await createRouteClientEntryArtifact({
        code: `
          export async function loader() { return null; }
          export async function action() { return null; }
          export async function clientLoader() { return null; }
          export default function Route() { return null; }
        `,
        resourcePath,
        environmentName: 'node',
        isBuild: true,
        routeChunkConfig,
      });

      expect(result).toEqual({
        code: `export { action, clientLoader, default, loader } from ${JSON.stringify(
          resourcePath
        )};`,
      });
    });

    it('excludes split client exports from web build route entries', async () => {
      const result = await createRouteClientEntryArtifact({
        code: `
            export const clientAction = async () => {};
            export async function clientLoader() { return null; }
            export default function Route() { return null; }
          `,
        resourcePath,
        environmentName: 'web',
        isBuild: true,
        routeChunkConfig,
      });

      expect(result).toEqual({
        code: `export { default } from ${JSON.stringify(
          mainRouteChunkRequest
        )};`,
      });
    });

    it('reexports independent custom exports from shared route chunks', async () => {
      const result = await createRouteClientEntryArtifact({
        code: `
          export const clientLoader = async () => {};
          export const customExport = true;
          export default function Route() { return null; }
        `,
        resourcePath,
        environmentName: 'web',
        isBuild: true,
        routeChunkConfig,
      });

      expect(result).toEqual({
        code: [
          `export { default } from ${JSON.stringify(mainRouteChunkRequest)};`,
          `export { customExport } from ${JSON.stringify(
            customExportChunkRequest
          )};`,
        ].join('\n'),
      });
    });

    it('keeps the full route module when no route exports split', async () => {
      const result = await createRouteClientEntryArtifact({
        code: `
          export const clientLoader = async () => {};
          clientLoader.hydrate = true;
          export const customExport = true;
          export default function Route() { return null; }
        `,
        resourcePath,
        environmentName: 'web',
        isBuild: true,
        routeChunkConfig,
      });

      expect(result).toEqual({
        code: `export { clientLoader, customExport, default } from ${JSON.stringify(
          routeRequest
        )};`,
      });
    });

    it('does not run split analysis for root route client entries', async () => {
      const rootResourcePath = '/app/root.tsx';
      const result = await createRouteClientEntryArtifact({
        code: `
            export async function clientLoader() { return null; }
            export function HydrateFallback() { return null; }
            export default function Root() { return null; }
          `,
        resourcePath: rootResourcePath,
        environmentName: 'web',
        isBuild: true,
        routeChunkConfig,
      });

      expect(result).toEqual({
        code: `export { HydrateFallback, clientLoader, default } from ${JSON.stringify(
          `${rootResourcePath}?react-router-route`
        )};`,
      });
    });

    it('generates route reexports for dev web entries', async () => {
      const result = await createRouteClientEntryArtifact({
        code: `
          export async function clientLoader() { return null; }
          export default function Route() { return null; }
        `,
        resourcePath,
        environmentName: 'web',
        isBuild: false,
        routeChunkConfig: disabledRouteChunkConfig,
      });

      expect(result).toEqual({
        code: `export { clientLoader, default } from ${JSON.stringify(
          routeRequest
        )};`,
      });
    });

    it('self-accepts dev HMR route entries so metadata is refreshed', async () => {
      const result = await createRouteClientEntryArtifact({
        code: `
          export async function loader() { return null; }
          export default function Route() { return null; }
        `,
        resourcePath,
        environmentName: 'web',
        isBuild: false,
        routeChunkConfig: disabledRouteChunkConfig,
        routeId: 'routes/demo',
        devHmr: true,
      });

      expect(result.code).toContain('import.meta.webpackHot.accept();');
      expect(result.code).not.toContain(
        'import.meta.webpackHot.accept("./demo.tsx?react-router-route"'
      );
      expect(result.code).toContain('"hasLoader":true');
    });
  });

  describe('createRouteChunkArtifact', () => {
    it('returns the disabled split-route empty snippet with a null map', async () => {
      await expect(
        createRouteChunk(
          `export const clientLoader = async () => {};`,
          'clientLoader',
          {
            config: disabledRouteChunkConfig,
            isBuild: true,
          }
        )
      ).resolves.toEqual({
        code: emptyRouteChunkSnippet(),
        map: null,
      });
    });

    it('rejects invalid route chunk names before generating code', async () => {
      await expect(
        createRouteChunkArtifact({
          code: `export const clientLoader = async () => {};`,
          resource: `${resourcePath}?route-chunk=invalid-name`,
          resourcePath,
          routeChunkConfig,
          isBuild: true,
        })
      ).rejects.toThrow(
        `Invalid route chunk name in "${resourcePath}?route-chunk=invalid-name"`
      );
    });

    it('generates the expected route chunk code from source', async () => {
      const source = `
        export const clientAction = async () => {};
        export default function Route() { return null; }
      `;
      const cache: RouteChunkCache = new Map();
      const expectedCode = await getRouteChunkIfEnabled(
        cache,
        routeChunkConfig,
        resourcePath,
        'clientAction',
        source
      );

      const result = await createRouteChunk(source, 'clientAction', { cache });

      expect(result).toEqual({ code: expectedCode, map: null });
    });

    it('omits server-only exports and imports from main route chunks', async () => {
      const result = await createRouteChunk(
        `
          import { clientValue } from '../client-data.client';
          import { serverValue } from '../server-data.server';
          export async function loader() { return serverValue; }
          export async function clientLoader() { return clientValue; }
          export default function Route() { return null; }
        `,
        'main'
      );

      expect(result.code).not.toContain('server-data.server');
      expect(result.code).not.toContain('loader');
      expect(result.code).not.toContain('clientLoader');
      expect(result.code).toContain('function Route');
    });

    it('generates route chunks through the Effect API', async () => {
      const source = `
        export const clientAction = async () => {};
        export default function Route() { return null; }
      `;
      const cache: RouteChunkCache = new Map();
      const expectedCode = await getRouteChunkIfEnabled(
        cache,
        routeChunkConfig,
        resourcePath,
        'clientAction',
        source
      );

      const result = await createRouteChunkArtifact({
        code: source,
        resource: getRouteChunkModuleId(resourcePath, 'clientAction'),
        resourcePath,
        routeChunkConfig,
        routeChunkCache: cache,
        isBuild: true,
      });

      expect(result).toEqual({ code: expectedCode, map: null });
    });

    it('skips ESM transforms for named chunks when no route chunk exports exist', async () => {
      await expect(
        createRouteChunkArtifact({
          code: `export default function Route() { return null; }`,
          resource: getRouteChunkModuleId(resourcePath, 'clientLoader'),
          resourcePath: '/app/routes/demo.cts',
          routeChunkConfig,
          isBuild: true,
        })
      ).resolves.toEqual({
        code: emptyRouteChunkSnippet(),
        map: null,
      });
    });

    it('validates enforce-mode main chunks against generated chunk exports', async () => {
      await expect(
        createRouteChunk(
          `
            const shared = () => null;
            export const clientAction = async () => shared();
            export default function Route() { return shared(); }
          `,
          'main',
          {
            config: enforceRouteChunkConfig,
          }
        )
      ).rejects.toThrow('Error splitting route module: routes/demo.tsx');
    });
  });
});
