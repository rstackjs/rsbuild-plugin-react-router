import * as Effect from 'effect/Effect';
import type { ReactRouterManifestForDev } from './manifest.js';
import type { RouteManifestItem } from './types.js';
import { createDelayedPluginTask, tryPluginPromise } from './effect-runtime.js';

const DEFAULT_LAZY_COMPILATION_TRIGGER_PREFIX = '/_rspack/lazy/trigger';
const DEFAULT_PREWARM_DELAY_MS = 0;
const DEFAULT_ROUTE_PREWARM_LIMIT = 8;
const PREWARM_FETCH_CONCURRENCY = 8;
const PREWARM_TRIGGER_CANDIDATES = 4;

type LazyCompilationPrewarmConfig = {
  entry: boolean;
  routeLimit: number;
  delayMs: number;
};

type LazyCompilationPrewarmController = {
  setServerOrigin(origin: string): void;
  setManifest(manifest: ReactRouterManifestForDev | null): void;
  schedule(): void;
  cancelEffect(): Effect.Effect<void, Error, never>;
};

export type RspackLazyCompilationTriggerClient = {
  extractModuleKeys(source: string): string[];
  trigger(
    origin: string,
    keys: readonly string[]
  ): Effect.Effect<void, Error, never>;
};

export const normalizeLazyCompilationPrewarmOptions = (
  options: boolean | undefined
): LazyCompilationPrewarmConfig | null => {
  if (!options) {
    return null;
  }

  return {
    entry: true,
    routeLimit: DEFAULT_ROUTE_PREWARM_LIMIT,
    delayMs: DEFAULT_PREWARM_DELAY_MS,
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
  for (const routeId in routes) {
    const route = routes[routeId];
    if (route.module) {
      assets.push(route.module);
    }
    if (route.clientActionModule) {
      assets.push(route.clientActionModule);
    }
    if (route.clientLoaderModule) {
      assets.push(route.clientLoaderModule);
    }
    if (route.clientMiddlewareModule) {
      assets.push(route.clientMiddlewareModule);
    }
    if (route.hydrateFallbackModule) {
      assets.push(route.hydrateFallbackModule);
    }
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

const extractLazyCompilationModuleKeys = (source: string): string[] => {
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

export const createRspackLazyCompilationTriggerClient = (
  triggerPrefix: string = DEFAULT_LAZY_COMPILATION_TRIGGER_PREFIX
): RspackLazyCompilationTriggerClient => ({
  extractModuleKeys: extractLazyCompilationModuleKeys,
  trigger(origin, keys) {
    return postLazyCompilationKeys(origin, triggerPrefix, keys);
  },
});

const fetchLazyCompilationKeys = (
  origin: string,
  assets: readonly string[],
  triggerClient: RspackLazyCompilationTriggerClient
): Effect.Effect<string[], Error, never> =>
  Effect.forEach(
    assets,
    asset =>
      tryPluginPromise(async () => {
        const response = await fetch(toAbsoluteUrl(origin, asset));
        if (!response.ok) {
          return [];
        }
        return triggerClient.extractModuleKeys(await response.text());
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

const prewarmLazyCompilation = ({
  manifest,
  serverOrigin,
  config,
  triggerClient = createRspackLazyCompilationTriggerClient(),
}: {
  manifest: ReactRouterManifestForDev;
  serverOrigin: string;
  config: LazyCompilationPrewarmConfig;
  triggerClient?: RspackLazyCompilationTriggerClient;
}): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    const assets = collectLazyCompilationPrewarmAssets(manifest, config);
    const keys = yield* fetchLazyCompilationKeys(
      serverOrigin,
      assets,
      triggerClient
    );
    yield* triggerClient.trigger(serverOrigin, keys);
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
  let lastPrewarmAssetsKey: string | undefined;
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
      if (!nextManifest) {
        lastPrewarmAssetsKey = undefined;
        return;
      }
      const assetsKey = collectLazyCompilationPrewarmAssets(
        nextManifest,
        config
      ).join('\n');
      if (assetsKey === lastPrewarmAssetsKey) {
        return;
      }
      lastPrewarmAssetsKey = assetsKey;
      task.reschedule();
    },
    schedule() {
      task.schedule();
    },
    cancelEffect() {
      manifest = null;
      serverOrigin = undefined;
      lastPrewarmAssetsKey = undefined;
      return task.cancelEffect();
    },
  };
};
