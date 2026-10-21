import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import type { Rspack } from '@rsbuild/core';
import type { ResolvedRemix2Config } from './types.js';

export const REMIX2_ASSETS_MODULE_ID: string = 'virtual/remix2/assets';
export const REMIX2_SERVER_MODULE_ID: string = 'virtual/remix2/server-build';

export function remix2VirtualPath(root: string, id: string): string {
  return resolve(root, `node_modules/${id}.js`);
}

export function generateRemix2ServerBuild(
  config: ResolvedRemix2Config,
  mode: 'development' | 'production'
): string {
  const routes = Object.values(config.routes);
  return [
    `import * as entryModule from ${JSON.stringify(config.entryServerFilePath)};`,
    `export { assets } from ${JSON.stringify(REMIX2_ASSETS_MODULE_ID)};`,
    ...routes.map(
      (route, index) =>
        `import * as route${index} from ${JSON.stringify(resolve(config.appDirectory, route.file))};`
    ),
    'export const entry = { module: entryModule };',
    `export const routes = {${routes
      .map(
        (route, index) =>
          `${JSON.stringify(route.id)}: { ...${JSON.stringify(route)}, module: route${index} }`
      )
      .join(',')}};`,
    `export const mode = ${JSON.stringify(mode)};`,
    `export const publicPath = ${JSON.stringify(config.publicPath)};`,
    `export const assetsBuildDirectory = ${JSON.stringify(config.relativeAssetsBuildDirectory)};`,
    `export const future = ${JSON.stringify(config.future)};`,
    'export const isSpaMode = false;',
  ].join('\n');
}

const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map(name => `node:${name}`),
]);

export function remix2ServerExternals(
  config: ResolvedRemix2Config,
  resolveOptions: Rspack.ResolveOptions = {}
): (
  data: Rspack.ExternalItemFunctionData,
  callback: (
    error?: Error,
    result?: Rspack.ExternalItemValue,
    type?: Rspack.ExternalsType
  ) => void
) => void {
  const aliases = Object.keys(resolveOptions.alias || {});
  return (
    { request, context, getResolve }: Rspack.ExternalItemFunctionData,
    callback
  ) => {
    const path = request?.split(/[?#]/, 1)[0];
    if (
      !request ||
      request.startsWith('.') ||
      request.startsWith('/') ||
      request.startsWith('virtual/') ||
      request.startsWith('#') ||
      aliases.some(key =>
        key.endsWith('$')
          ? path === key.slice(0, -1)
          : path === key || path?.startsWith(`${key}/`)
      )
    ) {
      callback();
      return;
    }
    const bundle = config.serverDependenciesToBundle;
    const shouldBundle =
      bundle === 'all' ||
      bundle?.some(pattern =>
        typeof pattern === 'string'
          ? request === pattern || request.startsWith(`${pattern}/`)
          : new RegExp(pattern.source, pattern.flags).test(request)
      );
    const externalize = () =>
      callback(
        undefined,
        request,
        config.serverModuleFormat === 'esm' ? 'module' : 'commonjs'
      );
    if (builtins.has(request)) {
      externalize();
    } else if (shouldBundle) {
      callback();
    } else if (resolveOptions.tsConfig && context && getResolve) {
      getResolve({ modules: [] })(context, request, (error, resolved) => {
        if (!error && resolved) callback();
        else externalize();
      });
    } else {
      externalize();
    }
  };
}
