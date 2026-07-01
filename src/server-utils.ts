import { resolve } from 'pathe';
import * as Effect from 'effect/Effect';
import type { ServerBuild } from 'react-router';
import {
  runPluginEffect,
  tryPluginPromise,
  tryPluginSync,
} from './effect-runtime.js';
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
  serverManifestId?: string;
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
  const manifestId =
    options.serverManifestId ?? 'virtual/react-router/server-manifest';
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
        
    export { default as assets } from ${JSON.stringify(manifestId)};
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return isRecord(value) && typeof value.then === 'function';
}

function isRouteDiscovery(value: unknown): boolean {
  return (
    value === undefined ||
    (isRecord(value) &&
      (value.mode === 'initial' ||
        (value.mode === 'lazy' &&
          (value.manifestPath === undefined ||
            typeof value.manifestPath === 'string'))))
  );
}

function resolveBuildExportsEffect(
  build: Record<string, unknown>
): Effect.Effect<Record<string, unknown>, Error, never> {
  const resolved = { ...build };
  return Effect.forEach(
    Object.keys(build),
    key =>
      Effect.gen(function* () {
        if (!RESOLVABLE_BUILD_EXPORTS.has(key)) {
          return;
        }
        const value = build[key];
        if (typeof value === 'function' && value.length === 0) {
          const result = yield* tryPluginSync(() => value());
          resolved[key] = isPromiseLike(result)
            ? yield* tryPluginPromise(() => result)
            : result;
          return;
        }
        if (isPromiseLike(value)) {
          resolved[key] = yield* tryPluginPromise(() => value);
        }
      }),
    { discard: true }
  ).pipe(Effect.as(resolved));
}

function isServerBuild(value: unknown): value is ServerBuild {
  return Boolean(
    isRecord(value) &&
    isRecord(value.entry) &&
    isRecord(value.entry.module) &&
    typeof value.entry.module.default === 'function' &&
    isRecord(value.routes) &&
    isRecord(value.assets) &&
    typeof value.assetsBuildDirectory === 'string' &&
    (value.basename === undefined || typeof value.basename === 'string') &&
    isRecord(value.future) &&
    typeof value.isSpaMode === 'boolean' &&
    Array.isArray(value.prerender) &&
    typeof value.publicPath === 'string' &&
    isRouteDiscovery(value.routeDiscovery) &&
    typeof value.ssr === 'boolean'
  );
}

function resolveServerBuildCandidateEffect(
  candidate: unknown
): Effect.Effect<ServerBuild | undefined, Error, never> {
  if (!isRecord(candidate)) {
    return Effect.succeed(undefined);
  }
  return resolveBuildExportsEffect(candidate).pipe(
    Effect.map(resolved => (isServerBuild(resolved) ? resolved : undefined))
  );
}

export function resolveServerBuildModuleEffect(
  buildModule: unknown,
  source: string
): Effect.Effect<ServerBuild, Error, never> {
  return Effect.gen(function* () {
    const moduleValue = isPromiseLike(buildModule)
      ? yield* tryPluginPromise(() => buildModule)
      : buildModule;
    const candidates = [() => moduleValue];
    if (isRecord(moduleValue)) {
      if ('default' in moduleValue) {
        candidates.push(() => moduleValue.default);
      }
      if ('module.exports' in moduleValue) {
        candidates.push(() => moduleValue['module.exports']);
      }
    }

    for (const getCandidate of candidates) {
      const candidate = yield* tryPluginPromise(() => getCandidate());
      const serverBuild = yield* resolveServerBuildCandidateEffect(candidate);
      if (serverBuild) {
        return serverBuild;
      }
    }
    return yield* Effect.fail(
      new Error(
        `[rsbuild-plugin-react-router] ${source} did not contain a valid React Router ServerBuild.`
      )
    );
  });
}

export function resolveServerBuildModule(
  buildModule: unknown,
  source: string
): Promise<ServerBuild> {
  return runPluginEffect(resolveServerBuildModuleEffect(buildModule, source));
}

export function resolveReactRouterServerBuildEffect(
  buildModule: unknown
): Effect.Effect<ServerBuild, Error, never> {
  return resolveServerBuildModuleEffect(buildModule, 'Imported module');
}

export function resolveReactRouterServerBuild(
  buildModule: unknown
): Promise<ServerBuild> {
  return runPluginEffect(resolveReactRouterServerBuildEffect(buildModule));
}

export { generateServerBuild };
