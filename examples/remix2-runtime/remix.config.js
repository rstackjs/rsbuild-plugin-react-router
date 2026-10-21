/** @type {import('@remix-run/dev').AppConfig} */
export default {
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildPath: 'build/server/index.js',
  serverModuleFormat: 'esm',
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    unstable_singleFetch: false,
    unstable_lazyRouteDiscovery: false,
  },
};
