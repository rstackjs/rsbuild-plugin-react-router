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

const isEligibleRouteIssuer = (
  issuer: string,
  compilerName: string | undefined,
  rsc: boolean,
  routeByFilePath: ReadonlyMap<string, Route>
): boolean =>
  routeByFilePath.has(issuer.split('?')[0]) &&
  (rsc || compilerName === 'web' || isRscClientRouteModuleIssuer(issuer));

export const resolveQuerylessRouteImportRequest = ({
  compilerName,
  context,
  issuer,
  rsc = false,
  request,
  resolvedPath,
  routeByFilePath,
}: {
  compilerName?: string;
  context?: string;
  issuer?: string;
  rsc?: boolean;
  request?: string;
  resolvedPath?: string;
  routeByFilePath: ReadonlyMap<string, Route>;
}): string | undefined => {
  if (
    typeof request !== 'string' ||
    typeof context !== 'string' ||
    typeof issuer !== 'string' ||
    request.includes('?') ||
    (!resolvedPath && !request.startsWith('.') && !request.startsWith('/')) ||
    !isEligibleRouteIssuer(issuer, compilerName, rsc, routeByFilePath)
  ) {
    return;
  }

  const isRscClientIssuer = isRscClientRouteModuleIssuer(issuer);
  const isWebCompiler = compilerName === 'web';
  const candidate = resolvedPath ?? resolve(context, request);
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
      factory.hooks.beforeResolve.tapAsync(PLUGIN_NAME, (data, done) => {
        const input = {
          compilerName: compiler.options?.name,
          context: data?.context ?? data?.contextInfo?.issuer,
          issuer: data?.contextInfo?.issuer,
          rsc: options.rsc,
          request: data?.request,
          routeByFilePath,
        };
        const resolvedRequest = resolveQuerylessRouteImportRequest(input);
        if (resolvedRequest) {
          data.request = resolvedRequest;
          done();
          return;
        }

        if (
          typeof input.request !== 'string' ||
          typeof input.context !== 'string' ||
          typeof input.issuer !== 'string' ||
          input.request.includes('?') ||
          input.request.startsWith('.') ||
          input.request.startsWith('/') ||
          !isEligibleRouteIssuer(
            input.issuer,
            input.compilerName,
            Boolean(input.rsc),
            routeByFilePath
          )
        ) {
          done();
          return;
        }

        factory
          .getResolver('normal', {})
          .resolve({}, input.context, input.request, {}, (error, resolved) => {
            if (!error && typeof resolved === 'string') {
              const routeRequest = resolveQuerylessRouteImportRequest({
                ...input,
                resolvedPath: resolved,
              });
              if (routeRequest) {
                data.request = routeRequest;
              }
            }
            done();
          });
      });
    });
  },
});
