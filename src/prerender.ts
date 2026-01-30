import type { Config } from '@react-router/dev/config';
import type { RouteConfigEntry } from '@react-router/dev/routes';

type PrerenderConfig = Config['prerender'];

type PrerenderPathsConfig =
  | boolean
  | string[]
  | ((
      args: {
        getStaticPaths: () => string[];
      }
    ) => boolean | string[] | Promise<boolean | string[]>);

type PrerenderConfigObject =
  | {
      paths?: PrerenderPathsConfig;
      unstable_concurrency?: number;
    }
  | null;

type PrerenderResolveOptions = {
  logWarning?: boolean;
  warn?: (message: string) => void;
};

type StaticPrerenderPaths = {
  paths: string[];
  paramRoutes: string[];
};

const normalizePath = (value: string): string =>
  value.replace(/\/\/+/g, '/').replace(/(.+)\/$/, '$1');

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
  if (typeof prerender === 'object' && prerender !== null && 'paths' in prerender) {
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

export const getPrerenderConcurrency = (prerender: PrerenderConfig): number => {
  if (
    typeof prerender === 'object' &&
    prerender !== null &&
    'unstable_concurrency' in prerender
  ) {
    const value = (prerender as PrerenderConfigObject)?.unstable_concurrency;
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      return value;
    }
  }
  return 1;
};
