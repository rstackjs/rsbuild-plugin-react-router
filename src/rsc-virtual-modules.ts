import { relative, resolve } from 'pathe';
import type { Config } from './react-router-config.js';
import type { Route } from './types.js';
import { combineURLs, normalizeAssetPrefix } from './plugin-utils.js';
import { getVirtualModuleFilePath } from './virtual-modules.js';
import {
  createRscInternalClientModule,
  createRscRouteConfig,
} from './rsc-route-config.js';

const defaultExport = (value: unknown): string =>
  `export default ${JSON.stringify(value)};`;

const RSC_VIRTUAL_ALIAS_IDS = [
  'routes',
  'route-discovery',
  'inject-hmr-runtime',
  'basename',
  'allowed-action-origins',
  'react-router-serve-config',
  'bootstrap-scripts',
  'server-manifest',
] as const;

type RscVirtualModulesOptions = {
  allowedActionOrigins: string[] | undefined;
  appDirectory: string;
  basename: string;
  buildDirectory: string;
  isBuild: boolean;
  /** Resolved web `output.distPath.js` segment, e.g. `static/js`. */
  jsDistPath: string;
  outputClientPath: string;
  publicPath: string;
  routeDiscovery: Config['routeDiscovery'];
  routes: Record<string, Route>;
  ssr: boolean;
};

export const createReactRouterRscResolveAliases = (
  rootPath: string
): Record<string, string> => ({
  ...Object.fromEntries(
    RSC_VIRTUAL_ALIAS_IDS.flatMap(id => {
      const moduleId = `virtual/react-router/unstable_rsc/${id}`;
      const modulePath = resolve(rootPath, getVirtualModuleFilePath(moduleId));
      return [
        [`virtual:react-router/unstable_rsc/${id}`, modulePath],
        [moduleId, modulePath],
      ];
    })
  ),
  'react-router/internal/react-server-client': resolve(
    rootPath,
    getVirtualModuleFilePath('virtual/react-router/rsc-internal-client')
  ),
});

export const createReactRouterRscVirtualModules = ({
  allowedActionOrigins,
  appDirectory,
  basename,
  buildDirectory,
  isBuild,
  jsDistPath,
  outputClientPath,
  publicPath,
  routeDiscovery,
  routes,
  ssr,
}: RscVirtualModulesOptions): Record<string, string> => {
  const rscAssetsBuildDirectory = relative(
    resolve(buildDirectory, 'server'),
    outputClientPath
  );
  const bootstrapPublicPath = normalizeAssetPrefix(publicPath);

  return {
    'virtual/react-router/unstable_rsc/routes': createRscRouteConfig({
      appDirectory,
      routes,
    }),
    'virtual/react-router/unstable_rsc/route-discovery': defaultExport(
      ssr === false ? { mode: 'initial' } : (routeDiscovery ?? { mode: 'lazy' })
    ),
    'virtual/react-router/unstable_rsc/inject-hmr-runtime': !isBuild
      ? `if (import.meta.webpackHot) {
  // The RSC client entry owns update navigation; this boundary only self-accepts.
  import.meta.webpackHot.accept();
}`
      : '',
    'virtual/react-router/unstable_rsc/basename': defaultExport(basename),
    'virtual/react-router/unstable_rsc/allowed-action-origins':
      defaultExport(allowedActionOrigins),
    'virtual/react-router/unstable_rsc/react-router-serve-config':
      defaultExport({
        assetsBuildDirectory: rscAssetsBuildDirectory,
        publicPath,
      }),
    'virtual/react-router/unstable_rsc/bootstrap-scripts': defaultExport([
      combineURLs(bootstrapPublicPath, `${jsDistPath}/index.js`),
    ]),
    'virtual/react-router/unstable_rsc/server-manifest': `export default function getServerManifest() {
  return __webpack_require__.rscM?.serverManifest;
}
`,
    'virtual/react-router/rsc-internal-client': createRscInternalClientModule(),
  };
};
