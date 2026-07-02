import type { Config } from './react-router-config.js';
import type { RouteConfigEntry } from '@react-router/dev/routes';
import { matchRoutes } from 'react-router';

type ReactRouterPrerenderConfig = Config['prerender'];
type MatchRouteObject =
  Parameters<typeof matchRoutes>[0] extends Array<infer R> ? R : never;

type PrerenderPathsConfig =
  | boolean
  | string[]
  | ((args: {
      getStaticPaths: () => string[];
    }) => boolean | string[] | Promise<boolean | string[]>);

type PrerenderConfigObject = Extract<
  NonNullable<ReactRouterPrerenderConfig>,
  { paths: unknown }
> & {
  unstable_concurrency?: number;
};

type PrerenderConfig = ReactRouterPrerenderConfig | PrerenderConfigObject;
type PrerenderConcurrencyConfig =
  | {
      key: 'prerender.concurrency' | 'prerender.unstable_concurrency';
      value: number;
    }
  | undefined;

type PrerenderResolveOptions = {
  logWarning?: boolean;
  warn?: (message: string) => void;
};

type StaticPrerenderPaths = {
  paths: string[];
  paramRoutes: string[];
};

type SsrFalsePrerenderRoute = {
  id: string;
  parentId?: string;
  path?: string;
  index?: boolean;
  hasLoader?: boolean;
  hasClientLoader?: boolean;
};

type SsrFalsePrerenderExportOptions = {
  routes: Record<string, SsrFalsePrerenderRoute>;
  manifestRoutes: Record<string, SsrFalsePrerenderRoute>;
  routeExports: Record<string, readonly string[] | undefined>;
  prerenderPaths: string[];
};

const normalizePath = (value: string): string =>
  value.replace(/\/\/+/g, '/').replace(/(.+)\/$/, '$1');

const groupRoutesByParentId = (
  manifest: Record<string, any>
): Record<string, any[]> => {
  const grouped: Record<string, any[]> = {};
  Object.values(manifest).forEach(route => {
    if (!route) {
      return;
    }
    const parentId = route.parentId || '';
    grouped[parentId] ??= [];
    grouped[parentId].push(route);
  });
  return grouped;
};

export const createPrerenderRoutes = (
  manifest: Record<string, any>,
  parentId = '',
  grouped: Record<string, any[]> = groupRoutesByParentId(manifest)
): MatchRouteObject[] => {
  return (grouped[parentId] || []).map(route => {
    const common = { id: route.id, path: route.path };
    if (route.index) {
      return { index: true, ...common } as MatchRouteObject;
    }
    return {
      ...common,
      children: createPrerenderRoutes(manifest, route.id, grouped),
    } as MatchRouteObject;
  });
};

export const normalizePrerenderMatchPath = (path: string): string =>
  `/${path}/`.replace(/^\/\/+/, '/');

export const getSsrFalsePrerenderExportErrors = ({
  routes,
  manifestRoutes,
  routeExports,
  prerenderPaths,
}: SsrFalsePrerenderExportOptions): string[] => {
  if (prerenderPaths.length === 0) {
    return [];
  }

  const prerenderRoutes = createPrerenderRoutes(routes);
  const prerenderedRoutes = new Set<string>();
  for (const path of prerenderPaths) {
    const matches = matchRoutes(
      prerenderRoutes,
      normalizePrerenderMatchPath(path)
    );
    if (!matches) {
      throw new Error(
        `Unable to prerender path because it does not match any routes: ${path}`
      );
    }
    matches.forEach(match => prerenderedRoutes.add(match.route.id as string));
  }

  const errors: string[] = [];
  for (const [routeId, route] of Object.entries(manifestRoutes)) {
    const exports = routeExports[routeId] ?? [];
    const invalidApis: string[] = [];

    if (exports.includes('headers')) invalidApis.push('headers');
    if (exports.includes('action')) invalidApis.push('action');

    if (invalidApis.length > 0) {
      errors.push(
        `Prerender: ${invalidApis.length} invalid route export(s) in ` +
          `\`${routeId}\` when pre-rendering with \`ssr:false\`: ` +
          `${invalidApis.map(api => `\`${api}\``).join(', ')}. ` +
          `See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
      );
    }

    if (!prerenderedRoutes.has(routeId)) {
      if (exports.includes('loader')) {
        errors.push(
          `Prerender: 1 invalid route export in \`${routeId}\` when pre-rendering with ` +
            `\`ssr:false\`: \`loader\`. ` +
            `See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
        );
      }

      let parentRoute =
        route.parentId && manifestRoutes[route.parentId]
          ? manifestRoutes[route.parentId]
          : null;
      while (parentRoute) {
        if (parentRoute.hasLoader && !parentRoute.hasClientLoader) {
          errors.push(
            `Prerender: 1 invalid route export in \`${parentRoute.id}\` when ` +
              `pre-rendering with \`ssr:false\`: \`loader\`. ` +
              `See https://reactrouter.com/how-to/pre-rendering#invalid-exports for more information.`
          );
        }
        parentRoute =
          parentRoute.parentId && manifestRoutes[parentRoute.parentId]
            ? manifestRoutes[parentRoute.parentId]
            : null;
      }
    }
  }

  return errors;
};

export const getStaticPrerenderPaths = (
  routes: RouteConfigEntry[]
): StaticPrerenderPaths => {
  const paths = ['/'];
  const paramRoutes: string[] = [];

  const recurse = (
    entries: RouteConfigEntry[],
    prefix = '',
    hasDynamicParent = false
  ) => {
    for (const route of entries) {
      const routePath = route.path ?? '';
      const segments = routePath.split('/').filter(Boolean);
      const hasDynamicSegment =
        segments.some(segment => segment.startsWith(':') || segment === '*') ||
        routePath === '*';
      const nextHasDynamic = hasDynamicParent || hasDynamicSegment;

      if (routePath) {
        const fullPath = normalizePath([prefix, routePath].join('/'));
        if (nextHasDynamic) {
          paramRoutes.push(fullPath);
        } else {
          paths.push(fullPath);
        }
      }

      if (route.children) {
        const newPrefix = routePath
          ? normalizePath([prefix, routePath].join('/'))
          : prefix;
        recurse(route.children, newPrefix, nextHasDynamic);
      }
    }
  };

  recurse(routes);

  return {
    paths: paths.map(normalizePath),
    paramRoutes: paramRoutes.map(normalizePath),
  };
};

export const resolvePrerenderPaths = async (
  prerender: PrerenderConfig,
  ssr: boolean,
  routes: RouteConfigEntry[],
  options: PrerenderResolveOptions = {}
): Promise<string[]> => {
  if (prerender == null || prerender === false) {
    return [];
  }

  let pathsConfig: PrerenderPathsConfig | undefined;
  if (
    typeof prerender === 'object' &&
    prerender !== null &&
    'paths' in prerender
  ) {
    pathsConfig = (prerender as PrerenderConfigObject)?.paths;
  } else {
    pathsConfig = prerender as PrerenderPathsConfig;
  }

  if (pathsConfig === false) {
    return [];
  }

  const { paths, paramRoutes } = getStaticPrerenderPaths(routes);

  if (pathsConfig === true) {
    if (options.logWarning && !ssr && paramRoutes.length > 0) {
      const warn =
        options.warn ??
        ((message: string) => {
          console.warn(message);
        });
      warn(
        [
          'Warning: Paths with dynamic/splat params cannot be prerendered when using `prerender: true`.',
          'You may want to use the `prerender()` API to prerender the following paths:',
          ...paramRoutes.map(path => `  - ${path}`),
        ].join('\n')
      );
    }
    return paths;
  }

  if (typeof pathsConfig === 'function') {
    const resolved = await pathsConfig({
      getStaticPaths: () => paths,
    });
    if (resolved === true) {
      return paths;
    }
    if (resolved === false || resolved == null) {
      return [];
    }
    return resolved;
  }

  return pathsConfig ?? [];
};

export const getPrerenderConcurrency = (
  prerender: PrerenderConfig,
  _cpuCount?: number
): number => {
  const config = getPrerenderConfigObject(prerender);
  const value = getPrerenderConcurrencyConfig(config)?.value;
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  // Match React Router's default. Parallel prerendering can fan out loaders and
  // external requests, so it must remain explicitly opt-in.
  return 1;
};

const getPrerenderConfigObject = (
  prerender: PrerenderConfig
): PrerenderConfigObject | null =>
  typeof prerender === 'object' &&
  prerender !== null &&
  !Array.isArray(prerender)
    ? (prerender as PrerenderConfigObject)
    : null;

const getPrerenderConcurrencyConfig = (
  config: PrerenderConfigObject | null
): PrerenderConcurrencyConfig => {
  if (config?.concurrency !== undefined) {
    return {
      key: 'prerender.concurrency',
      value: config.concurrency,
    };
  }

  if (config?.unstable_concurrency !== undefined) {
    return {
      key: 'prerender.unstable_concurrency',
      value: config.unstable_concurrency,
    };
  }
};

const isValidPrerenderPathsConfig = (
  value: unknown
): value is PrerenderPathsConfig =>
  typeof value === 'boolean' ||
  typeof value === 'function' ||
  Array.isArray(value);

export const validatePrerenderConfig = (
  prerender: PrerenderConfig
): string | null => {
  if (!prerender) {
    return null;
  }

  const config = getPrerenderConfigObject(prerender);
  const pathsConfig = config && 'paths' in config ? config.paths : prerender;

  const isValidConfig = isValidPrerenderPathsConfig(pathsConfig);

  if (!isValidConfig) {
    return 'The `prerender`/`prerender.paths` config must be a boolean, an array of string paths, or a function returning a boolean or array of string paths.';
  }

  const concurrency = getPrerenderConcurrencyConfig(config);

  if (
    concurrency &&
    (!Number.isInteger(concurrency.value) || concurrency.value <= 0)
  ) {
    return `The \`${concurrency.key}\` config must be a positive integer if specified.`;
  }

  return null;
};
