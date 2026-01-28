import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';
import 'react-router';

export default defineConfig(() => {
  return {
    plugins: [pluginReactRouter(), pluginReact()],
    server: {
      port: 3010,
    },
  };
});
