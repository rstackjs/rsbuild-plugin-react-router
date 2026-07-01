import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';

type ReactRouterRscOptions = NonNullable<
  Parameters<typeof pluginReactRouter>[0]
> & {
  rsc: true;
};

const reactRouterRscOptions = {
  rsc: true,
} satisfies ReactRouterRscOptions;

export default defineConfig({
  plugins: [pluginReact(), pluginReactRouter(reactRouterRscOptions)],
});
