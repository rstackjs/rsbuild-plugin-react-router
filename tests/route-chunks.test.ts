import { describe, expect, it } from '@rstest/core';
import { getExportNames } from '../src/export-utils';
import {
  detectRouteChunksIfEnabled,
  getRouteChunkCode,
  getRouteChunkEntryName,
  getRouteChunkIfEnabled,
  getRouteChunkModuleId,
  getRouteChunkNameFromModuleId,
  isRouteChunkModuleId,
  routeChunkExportNames,
  type RouteChunkConfig,
  type RouteChunkExportName,
  type RouteChunkInfo,
  validateRouteChunks,
} from '../src/route-chunks';

const config: RouteChunkConfig = {
  splitRouteModules: true,
  appDirectory: '/app',
  rootRouteFile: 'root.tsx',
};

const disabledConfig: RouteChunkConfig = {
  ...config,
  splitRouteModules: false,
};

const enforceConfig: RouteChunkConfig = {
  ...config,
  splitRouteModules: 'enforce',
};

const routeId = '/app/routes/demo.tsx';
const rootRouteId = '/app/root.tsx';

const emptyChunkInfo: RouteChunkInfo = {
  chunkedExports: [],
  hasRouteChunks: false,
  hasRouteChunkByExportName: {
    clientAction: false,
    clientLoader: false,
    clientMiddleware: false,
    HydrateFallback: false,
  },
};

const clientExportFixtures: Record<RouteChunkExportName, string> = {
  clientAction: `export const clientAction = async () => {};`,
  clientLoader: `export const clientLoader = async () => {};`,
  clientMiddleware: `export const clientMiddleware = async () => {};`,
  HydrateFallback: `export function HydrateFallback() { return null; }`,
};

const codeWithClientAction = `
  export const clientAction = async () => {};
  export default function Route() { return null; }
`;

const codeWithClientActionSharedWithDefault = `
  const helper = () => null;
  export default function Route() { return helper(); }
  export const clientAction = async () => helper();
`;

const codeWithActionAndDefault = `
  import { json } from 'react-router';
  export async function action() { return json({}); }
  export default function Route() { return null; }
`;

const detect = (code: string, id = routeId) =>
  detectRouteChunksIfEnabled(new Map(), config, id, code);

const expectOnlyChunkedExport = (
  result: RouteChunkInfo,
  exportName: RouteChunkExportName
) => {
  expect(result.hasRouteChunks).toBe(true);
  expect(result.chunkedExports).toEqual([exportName]);
  for (const name of routeChunkExportNames) {
    expect(result.hasRouteChunkByExportName[name]).toBe(name === exportName);
  }
};

const expectNoRouteChunks = (result: RouteChunkInfo) => {
  expect(result).toEqual(emptyChunkInfo);
};

const expectExports = async (
  code: string | null,
  expectedExports: string[],
  unexpectedExports: string[] = []
) => {
  expect(code).not.toBeNull();
  const exports = await getExportNames(code ?? '');
  for (const exportName of expectedExports) {
    expect(exports).toContain(exportName);
  }
  for (const exportName of unexpectedExports) {
    expect(exports).not.toContain(exportName);
  }
};

describe('route chunks', () => {
  describe('detect route chunks', () => {
    it.each(routeChunkExportNames)(
      'detects a splittable %s export independently',
      async exportName => {
        const code = `
          ${clientExportFixtures[exportName]}
          export default function Route() { return null; }
        `;

        const result = await detect(code);

        expectOnlyChunkedExport(result, exportName);
      }
    );

    it('detects all four client exports as independently splittable', async () => {
      const code = `
        const actionHelper = () => null;
        const loaderHelper = () => null;
        const middlewareHelper = () => null;
        const fallbackHelper = () => null;
        export const clientAction = async () => actionHelper();
        export const clientLoader = async () => loaderHelper();
        export const clientMiddleware = async () => middlewareHelper();
        export function HydrateFallback() { return fallbackHelper(); }
        export default function Route() { return null; }
      `;

      const result = await detect(code);

      expect(result.hasRouteChunks).toBe(true);
      expect(result.hasRouteChunkByExportName).toEqual({
        clientAction: true,
        clientLoader: true,
        clientMiddleware: true,
        HydrateFallback: true,
      });
      expect(result.chunkedExports).toEqual(routeChunkExportNames);
    });

    it('allows client exports to depend on imports', async () => {
      const code = `
        import { json } from 'react-router';
        export const clientLoader = async () => json({});
        export default function Route() { return null; }
      `;

      const result = await detect(code);

      expectOnlyChunkedExport(result, 'clientLoader');
    });

    it('does not split two client exports that share a top-level helper', async () => {
      const code = `
        const shared = () => {};
        export const clientAction = async () => shared();
        export const clientLoader = async () => shared();
      `;

      const result = await detect(code);

      expectNoRouteChunks(result);
    });

    it('does not split a client export that shares top-level code with the default export', async () => {
      const result = await detect(codeWithClientActionSharedWithDefault);

      expectNoRouteChunks(result);
    });

    it('splits a single-binding destructured client export', async () => {
      const code = `
        function make() { return { clientAction: async () => {} }; }
        export const { clientAction } = make();
        export default function Route() { return null; }
      `;

      const result = await detect(code);

      expectOnlyChunkedExport(result, 'clientAction');
    });

    it('does not split a multi-binding destructured client export sharing a declarator', async () => {
      const code = `
        function make() { return { clientAction: async () => {}, foo: 1 }; }
        export const { clientAction, foo } = make();
        export default function Route() { return null; }
      `;

      const result = await detect(code);

      expectNoRouteChunks(result);
    });

    it('splits an isolated client export while leaving a non-splittable sibling unsplit', async () => {
      const code = `
        const actionHelper = () => null;
        const shared = () => null;
        export const clientAction = async () => actionHelper();
        export const clientLoader = async () => shared();
        export default function Route() { return shared(); }
      `;

      const result = await detect(code);

      expect(result.hasRouteChunks).toBe(true);
      expect(result.chunkedExports).toEqual(['clientAction']);
      expect(result.hasRouteChunkByExportName.clientAction).toBe(true);
      expect(result.hasRouteChunkByExportName.clientLoader).toBe(false);
    });

    it('does not scan sibling declarators from shared export statements as dependencies', async () => {
      const code = `
        const serverOnly = () => null;
        export const clientAction = async () => null, helper = serverOnly();
        export default function Route() { return helper; }
      `;

      const result = await detect(code);

      expectOnlyChunkedExport(result, 'clientAction');
    });

    it('orders chunkedExports by routeChunkExportNames, not source order', async () => {
      const code = `
        export function HydrateFallback() { return null; }
        export const clientLoader = async () => {};
        export const clientAction = async () => {};
        export default function Route() { return null; }
      `;

      const result = await detect(code);

      expect(result.chunkedExports).toEqual([
        'clientAction',
        'clientLoader',
        'HydrateFallback',
      ]);
    });
  });

  describe('generate route chunk code', () => {
    it('omits chunkable client exports from the main chunk while retaining default and server exports', async () => {
      const code = `
        import { json } from 'react-router';
        export async function action() { return json({}); }
        export const clientAction = async () => {};
        export default function Route() { return null; }
      `;

      const chunk = await getRouteChunkIfEnabled(
        new Map(),
        config,
        routeId,
        'main',
        code
      );

      await expectExports(chunk, ['default', 'action'], ['clientAction']);
    });

    it('generates an individual client chunk with only that client export', async () => {
      const code = `
        import { json } from 'react-router';
        export async function action() { return json({}); }
        export const clientAction = async () => {};
        export default function Route() { return null; }
      `;

      const chunk = await getRouteChunkIfEnabled(
        new Map(),
        config,
        routeId,
        'clientAction',
        code
      );

      await expectExports(chunk, ['clientAction'], ['default', 'action']);
    });

    it('keeps only import specifiers used by an individual client chunk', async () => {
      const code = `
        import { json, useFetcher } from 'react-router';
        export const clientLoader = async () => json({});
        export default function Route() { return useFetcher(); }
      `;

      const chunk = await getRouteChunkIfEnabled(
        new Map(),
        config,
        routeId,
        'clientLoader',
        code
      );

      expect(chunk).toMatch(/import\s*\{\s*json\s*\}\s*from/);
      expect(chunk).not.toContain('useFetcher');
      await expectExports(chunk, ['clientLoader'], ['default']);
    });

    it('returns null for the main chunk when only client exports exist', async () => {
      const code = `
        export const clientAction = async () => {};
        export const clientLoader = async () => {};
      `;

      const chunk = await getRouteChunkIfEnabled(
        new Map(),
        config,
        routeId,
        'main',
        code
      );

      expect(chunk).toBeNull();
    });

    it('returns null for a non-chunkable individual client export', async () => {
      const chunk = await getRouteChunkIfEnabled(
        new Map(),
        config,
        routeId,
        'clientAction',
        codeWithClientActionSharedWithDefault
      );

      expect(chunk).toBeNull();
    });

    it('returns the full main chunk when a module has no chunkable exports', async () => {
      const chunk = await getRouteChunkIfEnabled(
        new Map(),
        config,
        routeId,
        'main',
        codeWithActionAndDefault
      );

      await expectExports(chunk, ['default', 'action'], ['clientAction']);
    });

    it('dispatches main and named chunk generation through getRouteChunkCode', async () => {
      const cache = new Map();
      const mainChunk = getRouteChunkCode(
        codeWithClientAction,
        'main',
        cache,
        'routes/demo.tsx'
      );
      const clientActionChunk = getRouteChunkCode(
        codeWithClientAction,
        'clientAction',
        cache,
        'routes/demo.tsx'
      );

      await expectExports(mainChunk ?? null, ['default'], ['clientAction']);
      await expectExports(clientActionChunk ?? null, ['clientAction'], ['default']);
    });

    it('round-trips route chunk module ids and entry names', () => {
      const moduleId = getRouteChunkModuleId(
        '/app/routes/r.tsx',
        'clientAction'
      );

      expect(moduleId).toBe('/app/routes/r.tsx?route-chunk=clientAction');
      expect(isRouteChunkModuleId(moduleId)).toBe(true);
      expect(getRouteChunkNameFromModuleId(moduleId)).toBe('clientAction');
      expect(getRouteChunkNameFromModuleId('/app/routes/r.tsx?route-chunk=main')).toBe(
        'main'
      );
      expect(getRouteChunkNameFromModuleId('/app/routes/r.tsx')).toBeNull();
      expect(
        getRouteChunkNameFromModuleId('/app/routes/r.tsx?route-chunk=bogus')
      ).toBeNull();
      expect(getRouteChunkEntryName('routes/clients', 'clientAction')).toBe(
        'routes/clients-client-action'
      );
    });
  });

  describe('mode + early-exit', () => {
    it('returns no route chunks without parsing when splitRouteModules is disabled or absent', async () => {
      const invalidCode = `export const clientAction = ;`;
      const absentConfig: RouteChunkConfig = {
        ...config,
        splitRouteModules: undefined,
      };

      await expect(
        detectRouteChunksIfEnabled(new Map(), disabledConfig, routeId, invalidCode)
      ).resolves.toEqual(emptyChunkInfo);
      await expect(
        detectRouteChunksIfEnabled(new Map(), absentConfig, routeId, invalidCode)
      ).resolves.toEqual(emptyChunkInfo);
    });

    it('early-exits when no client export name substring appears', async () => {
      const result = await detect(codeWithActionAndDefault);

      expectNoRouteChunks(result);
    });

    it('does not create a chunk from a client export name mentioned only in a comment', async () => {
      const code = `
        // clientAction is mentioned here, but no such export exists.
        export default function Route() { return null; }
      `;

      const result = await detect(code);

      expectNoRouteChunks(result);
    });

    it('returns null when route chunk generation is disabled', async () => {
      await expect(
        getRouteChunkIfEnabled(
          new Map(),
          disabledConfig,
          routeId,
          'main',
          codeWithClientAction
        )
      ).resolves.toBeNull();
    });
  });

  describe('root route', () => {
    it.each([
      ['/app/root.tsx', true],
      ['/app/./root.tsx', true],
      ['/app/root.tsx?react-router-route', true],
      ['/app/routes/root.tsx', false],
    ])(
      'detects root route identity for %s',
      async (id, isRootRoute) => {
        const result = await detect(codeWithClientAction, id);

        expect(result.hasRouteChunks).toBe(!isRootRoute);
        expect(result.hasRouteChunkByExportName.clientAction).toBe(!isRootRoute);
      }
    );

    it('generates a named chunk for the root route because generation has no root guard', async () => {
      const chunk = await getRouteChunkIfEnabled(
        new Map(),
        config,
        rootRouteId,
        'clientAction',
        codeWithClientAction
      );

      await expectExports(chunk, ['clientAction'], ['default']);
    });

    it('does not enforce route chunk validity for the root route', () => {
      expect(() =>
        validateRouteChunks({
          config: enforceConfig,
          id: rootRouteId,
          valid: {
            clientAction: false,
            clientLoader: false,
            clientMiddleware: false,
            HydrateFallback: false,
          },
        })
      ).not.toThrow();
    });
  });

  describe('enforce mode', () => {
    it('allows all valid route chunks', () => {
      expect(() =>
        validateRouteChunks({
          config: enforceConfig,
          id: routeId,
          valid: {
            clientAction: true,
            clientLoader: true,
            clientMiddleware: true,
            HydrateFallback: true,
          },
        })
      ).not.toThrow();
    });

    it('throws a singular guidance message for one invalid route chunk', () => {
      expect(() =>
        validateRouteChunks({
          config: enforceConfig,
          id: routeId,
          valid: {
            clientAction: false,
            clientLoader: true,
            clientMiddleware: true,
            HydrateFallback: true,
          },
        })
      ).toThrowError(
        /Error splitting route module:[\s\S]*clientAction[\s\S]*This export[\s\S]*its own chunk[\s\S]*it shares/
      );
    });

    it('throws a plural guidance message listing every invalid route chunk', () => {
      expect(() =>
        validateRouteChunks({
          config: enforceConfig,
          id: routeId,
          valid: {
            clientAction: false,
            clientLoader: false,
            clientMiddleware: true,
            HydrateFallback: true,
          },
        })
      ).toThrowError(
        /Error splitting route module:[\s\S]*clientAction[\s\S]*clientLoader[\s\S]*These exports[\s\S]*their own chunks[\s\S]*they share/
      );
    });
  });
});
