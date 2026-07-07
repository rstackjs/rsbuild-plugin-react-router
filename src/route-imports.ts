import type { Rspack } from '@rsbuild/core';
import { resolve } from 'pathe';

import {
  BUILD_CLIENT_ROUTE_QUERY_STRING,
  JS_EXTENSIONS,
  PLUGIN_NAME,
} from './constants.js';
import type { Route } from './types.js';

type QuerylessRouteImportResolveData = {
  request?: string;
  context?: string;
  contextInfo?: {
    issuer?: string;
  };
};

type QuerylessRouteImportFactory = {
  hooks: {
    beforeResolve: {
      tap: (
        pluginName: string,
        handler: (data: QuerylessRouteImportResolveData) => void
      ) => void;
    };
  };
};

type QuerylessRouteImportPlugin = {
  name: string;
  apply(compiler: Rspack.Compiler): void;
};

const RSC_CLIENT_ROUTE_MODULE_QUERY_PREFIX = '?client-route-module=';
const RSC_SHARED_CLIENT_ROUTE_MODULE_QUERY = '?client-route-module=shared';

const isRscClientRouteModuleIssuer = (issuer: string): boolean =>
  issuer.includes(RSC_CLIENT_ROUTE_MODULE_QUERY_PREFIX);

export const resolveQuerylessRouteImportRequest = ({
  compilerName,
  context,
  issuer,
  request,
  routeByFilePath,
}: {
  compilerName?: string;
  context?: string;
  issuer?: string;
  request?: string;
  routeByFilePath: ReadonlyMap<string, Route>;
}): string | undefined => {
  if (
    typeof request !== 'string' ||
    typeof context !== 'string' ||
    typeof issuer !== 'string' ||
    request.includes('?') ||
    (!request.startsWith('.') && !request.startsWith('/'))
  ) {
    return;
  }

  const issuerPath = issuer.split('?')[0];
  if (!routeByFilePath.has(issuerPath)) {
    return;
  }

  const isRscClientIssuer = isRscClientRouteModuleIssuer(issuer);
  if (compilerName !== 'web' && !isRscClientIssuer) {
    return;
  }

  const candidate = resolve(context, request);
  const routeFilePath = routeByFilePath.has(candidate)
    ? candidate
    : JS_EXTENSIONS.map(extension => `${candidate}${extension}`).find(
        candidate => routeByFilePath.has(candidate)
      );

  if (!routeFilePath) {
    return;
  }

  return `${routeFilePath}${
    isRscClientIssuer
      ? RSC_SHARED_CLIENT_ROUTE_MODULE_QUERY
      : BUILD_CLIENT_ROUTE_QUERY_STRING
  }`;
};

export const createQuerylessRouteImportPlugin = (
  routeByFilePath: ReadonlyMap<string, Route>
): QuerylessRouteImportPlugin => ({
  name: `${PLUGIN_NAME}:queryless-route-imports`,
  apply(compiler: Rspack.Compiler) {
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, factory => {
      const typedFactory = factory as QuerylessRouteImportFactory;
      typedFactory.hooks.beforeResolve.tap(PLUGIN_NAME, data => {
        const resolvedRequest = resolveQuerylessRouteImportRequest({
          compilerName: compiler.options?.name,
          context: data?.context ?? data?.contextInfo?.issuer,
          issuer: data?.contextInfo?.issuer,
          request: data?.request,
          routeByFilePath,
        });
        if (resolvedRequest) {
          data.request = resolvedRequest;
        }
      });
    });
  },
});
