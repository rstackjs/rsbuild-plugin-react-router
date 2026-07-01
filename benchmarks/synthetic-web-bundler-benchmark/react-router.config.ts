import type { Config } from '@react-router/dev/config';

type SyntheticReactRouterConfig = Config & {
  splitRouteModules?: boolean | 'enforce';
};

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
} satisfies SyntheticReactRouterConfig;
