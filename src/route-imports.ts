import { realpathSync } from 'node:fs';
import { resolve } from 'pathe';
import { rspack, type Rspack } from '@rsbuild/core';

import { PLUGIN_NAME } from './constants.js';
import type { Route } from './types.js';

export const createRouteFilePathMap = (
  appDirectory: string,
  routes: Record<string, Route>
): Map<string, Route> => {
  const routeByFilePath = new Map<string, Route>();
  for (const route of Object.values(routes)) {
    const filePath = resolve(appDirectory, route.file);
    routeByFilePath.set(filePath, route);
    try {
      routeByFilePath.set(resolve(realpathSync(filePath)), route);
    } catch (error) {
      // Leave missing/generated routes for the compiler to diagnose.
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT' && code !== 'ENOTDIR') throw error;
    }
  }
  return routeByFilePath;
};

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
  issuer,
  issuerLayer,
  rsc = false,
  request,
  resolvedPath,
  routeByFilePath,
}: {
  compilerName?: string;
  issuer?: string;
  issuerLayer?: string;
  rsc?: boolean;
  request?: string;
  resolvedPath: string;
  routeByFilePath: ReadonlyMap<string, Route>;
}): string | undefined => {
  if (
    typeof request !== 'string' ||
    typeof issuer !== 'string' ||
    request.includes('?') ||
    !isEligibleRouteIssuer(issuer, compilerName, rsc, routeByFilePath)
  ) {
    return;
  }

  const isRscClientIssuer =
    isRscClientRouteModuleIssuer(issuer) ||
    (rsc && issuerLayer === rspack.experiments.rsc.Layers.ssr);
  const isWebCompiler = compilerName === 'web';
  if (!routeByFilePath.has(resolvedPath)) {
    return;
  }

  if (!rsc && isWebCompiler) {
    return `${resolvedPath}${CLASSIC_CLIENT_ROUTE_MODULE_QUERY}`;
  }

  if (isWebCompiler || isRscClientIssuer) {
    return `${resolvedPath}${RSC_SHARED_CLIENT_ROUTE_MODULE_QUERY}`;
  }

  return `${resolvedPath}${RSC_SERVER_ROUTE_MODULE_QUERY}`;
};

export const createQuerylessRouteImportPlugin = (
  routeByFilePath: ReadonlyMap<string, Route>,
  options: { rsc?: boolean } = {}
): QuerylessRouteImportPlugin => ({
  name: `${PLUGIN_NAME}:queryless-route-imports`,
  apply(compiler: Rspack.Compiler) {
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, factory => {
      factory.hooks.afterResolve.tap(PLUGIN_NAME, data => {
        const createData = data.createData;
        if (!createData) {
          return;
        }
        const resolvedRequest = resolveQuerylessRouteImportRequest({
          compilerName: compiler.options?.name,
          issuer: data.contextInfo.issuer,
          issuerLayer: data.contextInfo.issuerLayer,
          rsc: options.rsc,
          request: data.request,
          resolvedPath: createData.resource,
          routeByFilePath,
        });
        if (resolvedRequest) {
          const query = resolvedRequest.slice(createData.resource.length);
          createData.resource = resolvedRequest;
          createData.request += query;
          createData.userRequest += query;
        }
      });
    });
  },
});
