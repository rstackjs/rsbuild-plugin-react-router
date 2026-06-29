export default {
  appDirectory: 'app',
  buildDirectory: 'build',
  routeDiscovery: { mode: 'lazy' },
  serverBundles: async ({ branch }) =>
    branch.at(-1)?.path === 'other' ? 'other' : 'index',
  ssr: true,
};
