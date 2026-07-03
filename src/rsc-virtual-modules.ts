import { relative, resolve } from 'pathe';
import type { Config } from './react-router-config.js';
import type { Route } from './types.js';
import { getVirtualModuleFilePath } from './virtual-modules.js';
import {
  createRscInternalClientModule,
  createRscRouteConfig,
} from './rsc-route-config.js';

const RSC_VIRTUAL_ALIAS_IDS = [
  'routes',
  'route-discovery',
  'inject-hmr-runtime',
  'basename',
  'allowed-action-origins',
  'react-router-serve-config',
  'bootstrap-scripts',
] as const;

type RscVirtualModulesOptions = {
  allowedActionOrigins: string[] | undefined;
  appDirectory: string;
  basename: string;
  buildDirectory: string;
  isBuild: boolean;
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
  const bootstrapPublicPath = publicPath.endsWith('/')
    ? publicPath
    : `${publicPath}/`;

  return {
    'virtual/react-router/unstable_rsc/routes': createRscRouteConfig({
      appDirectory,
      routes,
    }),
    'virtual/react-router/unstable_rsc/route-discovery': `export default ${JSON.stringify(
      ssr === false ? { mode: 'initial' } : (routeDiscovery ?? { mode: 'lazy' })
    )};`,
    'virtual/react-router/unstable_rsc/inject-hmr-runtime': !isBuild
      ? `if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
  import.meta.webpackHot.on("rsc:update", () => {
    requestAnimationFrame(() => {
      globalThis.__reactRouterDataRouter?.revalidate?.();
    });
  });
}`
      : '',
    'virtual/react-router/unstable_rsc/basename': `export default ${JSON.stringify(
      basename
    )};`,
    'virtual/react-router/unstable_rsc/allowed-action-origins': `export default ${JSON.stringify(
      allowedActionOrigins
    )};`,
    'virtual/react-router/unstable_rsc/react-router-serve-config': `export default ${JSON.stringify(
      {
        assetsBuildDirectory: rscAssetsBuildDirectory,
        publicPath,
      }
    )};`,
    'virtual/react-router/unstable_rsc/bootstrap-scripts': `export default ${JSON.stringify(
      [`${bootstrapPublicPath}static/js/index.js`]
    )};`,
    'virtual/react-router/rsc-internal-client': createRscInternalClientModule(),
  };
};
