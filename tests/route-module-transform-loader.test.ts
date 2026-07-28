import {
  originalPositionFor,
  TraceMap,
} from '@jridgewell/trace-mapping';
import { describe, expect, it, rstest } from '@rstest/core';
import routeModuleTransformLoader, {
  flushRouteModuleTransformLoaderPerformance,
  type RouteModuleTransformLoaderOptions,
} from '../src/route-module-transform-loader';

const defaultOptions: RouteModuleTransformLoaderOptions = {
  environmentName: 'web',
  performanceScopeId: 'web:dev:ssr:/project/app/root.tsx',
  logPerformance: false,
  ssr: true,
  isBuild: false,
  isSpaMode: false,
  rootRoutePath: '/project/app/root.tsx',
  devHmr: false,
};

const runLoader = (
  code: string,
  {
    options = defaultOptions,
    sourceMap = false,
    inputSourceMap,
  }: {
    options?: RouteModuleTransformLoaderOptions;
    sourceMap?: boolean;
    inputSourceMap?: Record<string, unknown>;
  } = {}
) =>
  new Promise<{ code: string; map: unknown }>((resolve, reject) => {
    const context = {
      resource: '/project/app/routes/page.tsx?react-router-route',
      resourcePath: '/project/app/routes/page.tsx',
      sourceMap,
      async: () => (error: Error | null, result?: string, map?: unknown) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ code: result ?? '', map });
      },
      getOptions: () => options,
    };

    void routeModuleTransformLoader.call(
      context as never,
      code,
      inputSourceMap as never
    );
  });

describe('route module transform loader', () => {
  it('transforms route modules through the loader API', async () => {
    const result = await runLoader(`
      export async function loader() { return null; }
      export default function Route() { return null; }
    `);

    expect(result.code).toContain('export default _withComponentProps');
    expect(result.code).not.toContain('export async function loader');
    expect(result.map).toBeUndefined();
  });

  it('emits a source map when the loader context requests one', async () => {
    const result = await runLoader(
      `
        export default function Route() { return null; }
      `,
      { sourceMap: true }
    );

    expect(result.map).toBeDefined();
  });

  it('composes its source map with the map from the preceding loader', async () => {
    const source = `
      export default function Route() { return null; }
    `;
    const result = await runLoader(source, {
      sourceMap: true,
      inputSourceMap: {
        version: 3,
        names: [],
        sources: ['original-route.tsx'],
        sourcesContent: [source],
        mappings: 'AAAA;AACA;AACA',
      },
    });

    expect(result.map).toMatchObject({
      sources: ['original-route.tsx'],
      sourcesContent: [source],
    });
    const transformedExportLine =
      result.code
        .split('\n')
        .findIndex(line => line.startsWith('export default')) + 1;
    expect(
      originalPositionFor(new TraceMap(result.map as never), {
        line: transformedExportLine,
        column: 0,
      })
    ).toMatchObject({
      source: 'original-route.tsx',
      line: 2,
    });
  });

  it('registers lowered route components for dev HMR', async () => {
    const result = await runLoader(
      `
        const Route = () => React.createElement('h1', null, 'Hello');
        export default Route;
      `,
      { options: { ...defaultOptions, devHmr: true } }
    );

    expect(result.code).toContain('$RefreshReg$(Route, "Route")');
  });

  it('aggregates route-module performance reports when enabled', async () => {
    const info = rstest.spyOn(console, 'info').mockImplementation(() => {});

    try {
      await runLoader(
        `
          export default function Route() { return null; }
        `,
        { options: { ...defaultOptions, logPerformance: true } }
      );
      await runLoader(
        `
          export default function Route() { return null; }
        `,
        { options: { ...defaultOptions, logPerformance: true } }
      );

      expect(info).not.toHaveBeenCalled();
      flushRouteModuleTransformLoaderPerformance();
      expect(info).toHaveBeenCalledTimes(1);
      const message = String(info.mock.calls[0][0]);
      const prefix = '[react-router:performance] ';
      expect(message.startsWith(prefix)).toBe(true);

      const report = JSON.parse(message.slice(prefix.length));
      expect(report.environment).toBe('web');
      expect(report.partial).toBe(true);
      expect(report.workerId).toMatch(/^process-\d+:thread-\d+$/);
      expect(report.operations['route:module']).toMatchObject({
        count: 2,
      });
      expect(report.operations['route:module'].slowest[0].resource).toBe(
        '/project/app/routes/page.tsx?react-router-route'
      );
    } finally {
      flushRouteModuleTransformLoaderPerformance();
      info.mockRestore();
    }
  });

  it('keeps route-module performance scopes isolated', async () => {
    const info = rstest.spyOn(console, 'info').mockImplementation(() => {});

    try {
      await runLoader(
        `
          export default function Route() { return null; }
        `,
        {
          options: {
            ...defaultOptions,
            logPerformance: true,
            performanceScopeId: 'scope-a',
          },
        }
      );
      await runLoader(
        `
          export default function Route() { return null; }
        `,
        {
          options: {
            ...defaultOptions,
            logPerformance: true,
            performanceScopeId: 'scope-b',
          },
        }
      );

      flushRouteModuleTransformLoaderPerformance();

      expect(info).toHaveBeenCalledTimes(2);
      for (const call of info.mock.calls) {
        const message = String(call[0]);
        const report = JSON.parse(
          message.slice('[react-router:performance] '.length)
        );
        expect(report.environment).toBe('web');
        expect(report.operations['route:module'].count).toBe(1);
      }
    } finally {
      flushRouteModuleTransformLoaderPerformance();
      info.mockRestore();
    }
  });
});
