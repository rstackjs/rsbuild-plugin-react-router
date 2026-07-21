import type { Rspack } from '@rsbuild/core';
import { resolve } from 'pathe';

import { JS_EXTENSIONS, PLUGIN_NAME } from './constants.js';
import type { Route } from './types.js';

type QuerylessRouteImportPlugin = {
  name: string;
  apply(compiler: Rspack.Compiler): void;
};

const RSC_CLIENT_ROUTE_MODULE_QUERY_PREFIX = '?client-route-module=';
const RSC_SHARED_CLIENT_ROUTE_MODULE_QUERY = '?client-route-module=shared';
const RSC_SERVER_ROUTE_MODULE_QUERY = '?server-route-module=';
const CLASSIC_CLIENT_ROUTE_MODULE_QUERY = '?react-router-route';

const isRscClientRouteModuleIssuer = (issuer: string): boolean =>
  issuer.includes(RSC_CLIENT_ROUTE_MODULE_QUERY_PREFIX);

export const resolveQuerylessRouteImportRequest = ({
  compilerName,
  context,
  issuer,
  rsc = false,
  request,
  routeByFilePath,
}: {
  compilerName?: string;
  context?: string;
  issuer?: string;
  rsc?: boolean;
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
  const isWebCompiler = compilerName === 'web';
  if (!rsc && !isWebCompiler && !isRscClientIssuer) {
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

  if (!rsc && isWebCompiler) {
    return `${routeFilePath}${CLASSIC_CLIENT_ROUTE_MODULE_QUERY}`;
  }

  if (isWebCompiler || isRscClientIssuer) {
    return `${routeFilePath}${RSC_SHARED_CLIENT_ROUTE_MODULE_QUERY}`;
  }

  return `${routeFilePath}${RSC_SERVER_ROUTE_MODULE_QUERY}`;
};

export const createQuerylessRouteImportPlugin = (
  routeByFilePath: ReadonlyMap<string, Route>,
  options: { rsc?: boolean } = {}
): QuerylessRouteImportPlugin => ({
  name: `${PLUGIN_NAME}:queryless-route-imports`,
  apply(compiler: Rspack.Compiler) {
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, factory => {
      factory.hooks.beforeResolve.tap(PLUGIN_NAME, data => {
        const resolvedRequest = resolveQuerylessRouteImportRequest({
          compilerName: compiler.options?.name,
          context: data?.context ?? data?.contextInfo?.issuer,
          issuer: data?.contextInfo?.issuer,
          rsc: options.rsc,
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
