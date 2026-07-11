import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';
import 'react-router';
import { join } from 'node:path';

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
      : process.env.RR_LAZY_COMPILATION === 'full'
        ? { entries: true, imports: true }
      : undefined;
  const fullLazyCompilation = process.env.RR_LAZY_COMPILATION === 'full';

  return {
    plugins: [
      pluginReactRouter({
        lazyCompilation,
        unstableLazyCompilationRouteEntries: fullLazyCompilation
          ? {
              eagerRouteFiles: [
                join(process.cwd(), 'app/root.tsx'),
                join(process.cwd(), 'app/routes/home.tsx'),
              ],
            }
          : undefined,
      }),
      pluginReact(),
      pluginLess(),
      pluginSass(),
    ],
  };
});
