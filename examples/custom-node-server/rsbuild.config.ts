import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';

export default defineConfig(() => {
  const serverOutput =
    process.env.RR_SERVER_OUTPUT === 'commonjs' ? 'commonjs' : 'module';
  return {
    plugins: [
      pluginReactRouter({
        customServer: true,
        serverOutput,
      }),
      pluginReact(),
    ],
  };
});
