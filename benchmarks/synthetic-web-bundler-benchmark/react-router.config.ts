import type { ReactRouterRsbuildConfig } from 'rsbuild-plugin-react-router';

export default {
  appDirectory: 'app',
  basename: '/',
  buildDirectory: process.env.SYNTHETIC_BUILD_DIR ?? 'dist/rsbuild',
  future: {
    unstable_subResourceIntegrity: false,
  },
  serverBuildFile: 'index.js',
  serverModuleFormat: 'esm',
  splitRouteModules: true,
  ssr: true,
} satisfies ReactRouterRsbuildConfig;
