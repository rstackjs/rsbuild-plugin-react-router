import { Effect } from 'effect';
import type { ReactRouterManifestForDev } from './manifest.js';
import type { PluginOptions, RouteManifestItem } from './types.js';
import { createDelayedPluginTask, tryPluginPromise } from './effect-runtime.js';

const DEFAULT_LAZY_COMPILATION_TRIGGER_PREFIX = '/_rspack/lazy/trigger';
const DEFAULT_PREWARM_DELAY_MS = 0;
const DEFAULT_ROUTE_PREWARM_LIMIT = 8;
const PREWARM_FETCH_CONCURRENCY = 8;
const PREWARM_TRIGGER_CANDIDATES = 4;

type LazyCompilationPrewarmOptions = Exclude<
  NonNullable<PluginOptions['lazyCompilationPrewarm']>,
  boolean
>;

type LazyCompilationPrewarmConfig = {
  entry: boolean;
  routeIds?: Set<string>;
  routeLimit: number;
  delayMs: number;
  triggerPrefix: string;
};

type LazyCompilationPrewarmController = {
  setServerOrigin(origin: string): void;
  setManifest(manifest: ReactRouterManifestForDev | null): void;
  schedule(): void;
  cancelEffect(): Effect.Effect<void, Error, never>;
};

const parsePositiveInteger = (
  value: number | undefined,
  fallback: number
): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;

export const normalizeLazyCompilationPrewarmOptions = (
  options: PluginOptions['lazyCompilationPrewarm']
): LazyCompilationPrewarmConfig | null => {
  if (!options) {
    return null;
  }

  const normalized: LazyCompilationPrewarmOptions =
    options === true ? {} : options;
  const routes = normalized.routes ?? true;
  const routeIds = Array.isArray(routes) ? new Set(routes) : undefined;
  const routeLimit =
    typeof routes === 'number'
      ? parsePositiveInteger(routes, DEFAULT_ROUTE_PREWARM_LIMIT)
      : routes === false
        ? 0
        : DEFAULT_ROUTE_PREWARM_LIMIT;

  return {
    entry: normalized.entry ?? true,
    routeIds,
    routeLimit,
    delayMs: parsePositiveInteger(normalized.delayMs, DEFAULT_PREWARM_DELAY_MS),
    triggerPrefix:
      normalized.triggerPrefix ?? DEFAULT_LAZY_COMPILATION_TRIGGER_PREFIX,
  };
};

const collectRouteAssets = (
  routes: Record<string, RouteManifestItem>,
  config: LazyCompilationPrewarmConfig
): string[] => {
  if (config.routeLimit < 1) {
    return [];
  }

  const assets: string[] = [];
  for (const [routeId, route] of Object.entries(routes)) {
    if (config.routeIds && !config.routeIds.has(routeId)) {
      continue;
    }
    assets.push(
      route.module,
      route.clientActionModule ?? '',
      route.clientLoaderModule ?? '',
      route.clientMiddlewareModule ?? '',
      route.hydrateFallbackModule ?? ''
    );
    if (assets.length >= config.routeLimit) {
      break;
    }
  }

  return assets;
};

export const collectLazyCompilationPrewarmAssets = (
  manifest: ReactRouterManifestForDev,
  config: LazyCompilationPrewarmConfig
): string[] => {
  const assets = [
    ...(config.entry ? [manifest.entry.module, ...manifest.entry.imports] : []),
    ...collectRouteAssets(manifest.routes, config),
  ].filter(Boolean);

  return Array.from(new Set(assets));
};

const toAbsoluteUrl = (origin: string, asset: string): string =>
  new URL(asset, origin).toString();

const parseJsonStringLiteral = (value: string): string | null => {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : null;
  } catch {
    return null;
  }
};

export const extractLazyCompilationModuleKeys = (source: string): string[] => {
  const keys = new Set<string>();
  const pattern = /activate\(\{\s*data:\s*("(?:\\.|[^"\\])*")/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    const key = parseJsonStringLiteral(match[1]);
    if (key) {
      keys.add(key);
    }
  }

  return Array.from(keys);
};

const fetchLazyCompilationKeys = (
  origin: string,
  assets: readonly string[]
): Effect.Effect<string[], Error, never> =>
  Effect.forEach(
    assets,
    asset =>
      tryPluginPromise(async () => {
        const response = await fetch(toAbsoluteUrl(origin, asset));
        if (!response.ok) {
          return [];
        }
        return extractLazyCompilationModuleKeys(await response.text());
      }),
    { concurrency: PREWARM_FETCH_CONCURRENCY }
  ).pipe(Effect.map(results => Array.from(new Set(results.flat()))));

const getTriggerCandidates = (
  origin: string,
  triggerPrefix: string
): string[] => {
  const candidates = [triggerPrefix];
  for (let index = 0; index < PREWARM_TRIGGER_CANDIDATES; index += 1) {
    candidates.push(`${triggerPrefix}__${index}`);
  }
  return candidates.map(candidate => toAbsoluteUrl(origin, candidate));
};

const postLazyCompilationKeys = (
  origin: string,
  triggerPrefix: string,
  keys: readonly string[]
): Effect.Effect<void, Error, never> => {
  if (keys.length === 0) {
    return Effect.void;
  }

  return Effect.gen(function* () {
    const body = keys.join('\n');
    let lastError: Error | undefined;

    for (const url of getTriggerCandidates(origin, triggerPrefix)) {
      const accepted = yield* tryPluginPromise(async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body,
        });
        return response.ok;
      }).pipe(
        Effect.catchAll(error => {
          lastError = error;
          return Effect.succeed(false);
        })
      );

      if (accepted) {
        return;
      }
    }

    yield* Effect.fail(
      lastError ??
        new Error(
          '[rsbuild-plugin-react-router] Lazy compilation prewarm trigger was not accepted.'
        )
    );
  });
};

export const prewarmLazyCompilation = ({
  manifest,
  serverOrigin,
  config,
}: {
  manifest: ReactRouterManifestForDev;
  serverOrigin: string;
  config: LazyCompilationPrewarmConfig;
}): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    const assets = collectLazyCompilationPrewarmAssets(manifest, config);
    const keys = yield* fetchLazyCompilationKeys(serverOrigin, assets);
    yield* postLazyCompilationKeys(serverOrigin, config.triggerPrefix, keys);
  });

export const createLazyCompilationPrewarmController = ({
  config,
  onError,
}: {
  config: LazyCompilationPrewarmConfig;
  onError: (error: Error) => void;
}): LazyCompilationPrewarmController => {
  let serverOrigin: string | undefined;
  let manifest: ReactRouterManifestForDev | null = null;
  const task = createDelayedPluginTask({
    delayMs: config.delayMs,
    run: () =>
      Effect.gen(function* () {
        if (!serverOrigin || !manifest) {
          return;
        }
        yield* prewarmLazyCompilation({
          manifest,
          serverOrigin,
          config,
        });
      }),
    onError,
  });

  return {
    setServerOrigin(origin) {
      serverOrigin = origin;
    },
    setManifest(nextManifest) {
      manifest = nextManifest;
    },
    schedule() {
      task.schedule();
    },
    cancelEffect() {
      manifest = null;
      serverOrigin = undefined;
      return task.cancelEffect();
    },
  };
};
