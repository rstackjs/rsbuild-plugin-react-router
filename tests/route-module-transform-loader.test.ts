import { describe, expect, it, rstest } from '@rstest/core';
import routeModuleTransformLoader, {
  type RouteModuleTransformLoaderOptions,
} from '../src/route-module-transform-loader';

const defaultOptions: RouteModuleTransformLoaderOptions = {
  environmentName: 'web',
  logPerformance: false,
  ssr: true,
  isBuild: false,
  isSpaMode: false,
  rootRoutePath: '/project/app/root.tsx',
};

const runLoader = (
  code: string,
  {
    options = defaultOptions,
    sourceMap = false,
  }: {
    options?: RouteModuleTransformLoaderOptions;
    sourceMap?: boolean;
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

    void routeModuleTransformLoader.call(context as never, code);
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

  it('logs route-module performance reports when enabled', async () => {
    const info = rstest.spyOn(console, 'info').mockImplementation(() => {});

    try {
      await runLoader(
        `
          export default function Route() { return null; }
        `,
        { options: { ...defaultOptions, logPerformance: true } }
      );

      expect(info).toHaveBeenCalledTimes(1);
      const message = String(info.mock.calls[0][0]);
      const prefix = '[react-router:performance] ';
      expect(message.startsWith(prefix)).toBe(true);

      const report = JSON.parse(message.slice(prefix.length));
      expect(report.environment).toBe('web');
      expect(report.operations['route:module']).toMatchObject({
        count: 1,
        slowest: [
          {
            resource: '/project/app/routes/page.tsx?react-router-route',
          },
        ],
      });
    } finally {
      info.mockRestore();
    }
  });
});
