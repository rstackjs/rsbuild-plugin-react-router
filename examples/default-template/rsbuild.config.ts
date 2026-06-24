import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';
import 'react-router';

// Extend the app load context type for loaders/actions.
declare module 'react-router' {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export default defineConfig(() => {
  const lazyCompilation =
    process.env.RR_LAZY_COMPILATION === 'entries'
      ? { entries: true }
      : undefined;

  return {
    plugins: [
      pluginReactRouter({ lazyCompilation }),
      pluginReact(),
      pluginLess(),
      pluginSass(),
    ],
  };
});
