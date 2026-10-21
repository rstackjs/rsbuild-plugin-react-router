import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginRemix2 } from 'rsbuild-plugin-react-router/remix2';

export default defineConfig({
  plugins: [pluginRemix2(), pluginReact()],
  server: { port: Number(process.env.PORT || 3032), strictPort: true },
});
