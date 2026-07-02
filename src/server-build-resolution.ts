// Internal module: exposes the Effect-based ServerBuild resolution used by
// dev-runtime code. Not re-exported from the package entry so the public
// declaration graph stays free of `effect` types; external callers go through
// the Promise wrappers in server-utils.ts.
import * as Effect from 'effect/Effect';
import type { ServerBuild } from 'react-router';
import { tryPluginPromise, tryPluginSync } from './effect-runtime.js';

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
