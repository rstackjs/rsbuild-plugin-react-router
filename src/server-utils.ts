import { resolve } from 'pathe';
import type { Route } from './types.js';

/**
 * Generates the server build template string.
 *
 * Note: Federation mode used to require async `import()` wrappers for entrypoints.
 * With Rspack/@module-federation support for `experiments.asyncStartup`, the
 * server build can always use static imports.
 */
interface ServerBuildOptions {
  entryServerPath: string;
  assetsBuildDirectory: string;
  basename: string;
  appDirectory: string;
  ssr: boolean;
  future?: unknown;
  allowedActionOrigins?: string[];
  prerender?: string[];
  publicPath?: string;
  routeDiscovery:
    | {
        mode: 'lazy';
        manifestPath?: string;
      }
    | {
        mode: 'initial';
      }
    | undefined;
}

function generateStaticTemplate(
  routes: Record<string, Route>,
  options: ServerBuildOptions
): string {
  return `
    import * as entryServer from ${JSON.stringify(options.entryServerPath)};
    ${Object.keys(routes)
      .map((key, index) => {
        const route = routes[key];
        return `import * as route${index} from ${JSON.stringify(
          `${resolve(options.appDirectory, route.file)}?react-router-route`
        )};`;
      })
      .join('\n')}
        
    export { default as assets } from "virtual/react-router/server-manifest";
    export const assetsBuildDirectory = ${JSON.stringify(
      options.assetsBuildDirectory
    )};
    export const basename = ${JSON.stringify(options.basename)};
    export const future = ${JSON.stringify(options.future ?? {})};
    export const isSpaMode = ${!options.ssr};
    export const ssr = ${options.ssr};
    export const routeDiscovery = ${JSON.stringify(options.routeDiscovery)};
    export const prerender = ${JSON.stringify(options.prerender ?? [])};
    export const publicPath = ${JSON.stringify(options.publicPath ?? '/')};
    export const entry = { module: entryServer };
    export const allowedActionOrigins = ${JSON.stringify(options.allowedActionOrigins)};
    export var routes = {};
    ${Object.keys(routes)
      .map((key, index) => {
        const route = routes[key];
        return `routes[${JSON.stringify(key)}] = {
          id: ${JSON.stringify(route.id)},
          parentId: ${JSON.stringify(route.parentId)},
          path: ${JSON.stringify(route.path)},
          index: ${JSON.stringify(route.index)},
          caseSensitive: ${JSON.stringify(route.caseSensitive)},
          module: route${index}
        };`;
      })
      .join('\n    ')}
  `;
}

/**
 * Generates the server build module content
 * @param routes The route manifest
 * @param options Build options
 * @returns The generated module content as a string
 */
function generateServerBuild(
  routes: Record<string, Route>,
  options: ServerBuildOptions & { federation?: boolean }
): string {
  return generateStaticTemplate(routes, options);
}

const RESOLVABLE_BUILD_EXPORTS = new Set([
  'allowedActionOrigins',
  'assets',
  'assetsBuildDirectory',
  'basename',
  'entry',
  'future',
  'isSpaMode',
  'prerender',
  'publicPath',
  'routeDiscovery',
  'routes',
  'ssr',
]);

const isPromiseLike = (value: unknown): value is Promise<unknown> =>
  typeof (value as Promise<unknown>)?.then === 'function';

export const normalizeBuildModule = <T extends Record<string, any>>(build: T): T => {
  if (!build || typeof build !== 'object') {
    return build;
  }
  if (
    'default' in build &&
    Object.keys(build).length === 1 &&
    typeof build.default === 'object' &&
    build.default
  ) {
    return build.default as T;
  }
  return build;
};

export const resolveBuildExports = async <T extends Record<string, any>>(
  build: T
): Promise<T> => {
  const resolved: Record<string, any> = { ...build };
  for (const key of Object.keys(build)) {
    if (!RESOLVABLE_BUILD_EXPORTS.has(key)) {
      continue;
    }
    const value = build[key];
    if (typeof value === 'function' && value.length === 0) {
      const result = value();
      resolved[key] = isPromiseLike(result) ? await result : result;
      continue;
    }
    if (isPromiseLike(value)) {
      resolved[key] = await value;
    }
  }
  return resolved as T;
};

export { generateServerBuild };
