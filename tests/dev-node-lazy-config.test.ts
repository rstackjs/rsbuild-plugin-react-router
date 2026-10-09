import { createRsbuild } from '@rsbuild/core';
import { createStubRsbuild } from '@scripts/test-helper';
import { expect, it } from '@rstest/core';
import { pluginReactRouter } from '../src';
import { registerNodeLazyCompilation } from '../src/dev-node-lazy-config';

it.each([{ rsc: true }, { federation: true }])(
  'rejects an unsupported server lazy compilation mode %j',
  async mode => {
    const rsbuild = await createStubRsbuild({ rsbuildConfig: {} });
    rsbuild.addPlugins([
      pluginReactRouter({ unstableServerLazyCompilation: true, ...mode }),
    ]);
    await expect(rsbuild.unwrapConfig()).rejects.toThrow(
      'only supported for classic SSR without RSC or federation'
    );
  }
);

it.each([
  {
    kind: 'client',
    lazy: { client: '/custom-lazy-client.js' },
    message: 'cannot use a custom Node lazy client',
  },
  {
    kind: 'backend',
    lazy: { backend: {} },
    message: 'Custom backends are unsupported',
  },
])('rejects unsupported Node lazy $kind', async ({ lazy, message }) => {
  const rsbuild = await createRsbuild({
    config: {
      mode: 'development',
      environments: {
        node: {
          output: { target: 'node' },
          tools: {
            rspack: config => {
              Object.assign(config, { lazyCompilation: lazy });
            },
          },
        },
      },
    },
  });
  rsbuild.addPlugins([
    { name: 'test-node-lazy-config', setup: registerNodeLazyCompilation },
  ]);
  await expect(rsbuild.initConfigs()).rejects.toThrow(message);
});
