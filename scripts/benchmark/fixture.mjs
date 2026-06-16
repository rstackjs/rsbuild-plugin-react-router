import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const routeExportProfiles = [
  'plain',
  'ssr-data',
  'split-client',
  'split-client',
  'ssr-data',
  'client-server-imports',
];

const padRoute = number => String(number).padStart(4, '0');

const routeFile = index => `routes/route-${padRoute(index)}.tsx`;

const routeId = index => `route-${padRoute(index)}`;

const routeComponentName = index => `Route${padRoute(index)}`;

const createRouteModule = (index, profile) => {
  const name = routeComponentName(index);
  const shared = [
    `export const handle = { label: '${routeId(index)}' };`,
    `export function meta() { return [{ title: '${routeId(index)}' }]; }`,
    `export default function ${name}() { return null; }`,
  ];

  if (profile === 'ssr-data') {
    return [
      `import { serverValue } from '../server-data.server';`,
      ...shared,
      `export async function loader() { return { id: '${routeId(index)}', serverValue }; }`,
      `export async function action() { return { ok: true }; }`,
      `export function headers() { return { 'x-route': '${routeId(index)}' }; }`,
      `export function shouldRevalidate() { return false; }`,
    ].join('\n');
  }

  if (profile === 'split-client') {
    return [
      `import { clientValue } from '../client-data.client';`,
      ...shared,
      `export async function clientLoader() { return { id: '${routeId(index)}', clientValue }; }`,
      `export async function clientAction() { return { ok: true }; }`,
      `export async function clientMiddleware() { return undefined; }`,
      `export function HydrateFallback() { return null; }`,
    ].join('\n');
  }

  if (profile === 'client-server-imports') {
    return [
      `import { clientValue } from '../client-data.client';`,
      `import { serverValue } from '../server-data.server';`,
      ...shared,
      `export async function loader() { return { id: '${routeId(index)}', serverValue }; }`,
      `export async function clientLoader() { return { id: '${routeId(index)}', clientValue }; }`,
    ].join('\n');
  }

  return shared.join('\n');
};

const createRoutesConfig = routeCount => {
  const routes = [];
  for (let index = 1; index <= routeCount; index += 1) {
    const id = routeId(index);
    const isIndex = index === 1;
    routes.push(
      [
        '  {',
        `    id: '${id}',`,
        `    file: '${routeFile(index)}',`,
        isIndex ? '    index: true,' : `    path: '${id}',`,
        '  },',
      ].join('\n')
    );
  }

  return [
    `import type { RouteConfigEntry } from '@react-router/dev/routes';`,
    '',
    'export default [',
    ...routes,
    '] satisfies RouteConfigEntry[];',
    '',
  ].join('\n');
};

const createRsbuildConfig = ({ variant, sourceMap, pluginImportPath }) => {
  const ssr = variant !== 'spa';

  return [
    `import { defineConfig } from '@rsbuild/core';`,
    `import { pluginReactRouter } from '${pluginImportPath}';`,
    '',
    'export default defineConfig({',
    '  plugins: [',
    '    pluginReactRouter({',
    ...(ssr ? [`      serverOutput: 'module',`] : []),
    `      logPerformance: process.env.REACT_ROUTER_BENCHMARK_LOG_PERFORMANCE === '1',`,
    '    }),',
    '  ],',
    '  output: {',
    `    sourceMap: ${sourceMap ? 'true' : 'false'},`,
    '  },',
    '});',
    '',
  ].join('\n');
};

const createReactRouterConfig = variant => {
  const ssr = variant !== 'spa';
  const splitRouteModules = variant.includes('split');

  return [
    `import type { Config } from '@react-router/dev/config';`,
    '',
    'export default {',
    `  ssr: ${ssr ? 'true' : 'false'},`,
    `  future: {`,
    `    v8_splitRouteModules: ${splitRouteModules ? 'true' : 'false'},`,
    '  },',
    '} satisfies Config;',
    '',
  ].join('\n');
};

export async function generateSyntheticFixture({
  root,
  routeCount,
  variant,
  sourceMap = false,
  pluginImportPath = 'rsbuild-plugin-react-router',
}) {
  await rm(root, { recursive: true, force: true });
  await mkdir(path.join(root, 'app/routes'), { recursive: true });

  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ type: 'module', private: true }, null, 2)
  );
  await writeFile(
    path.join(root, 'rsbuild.config.mjs'),
    createRsbuildConfig({ variant, sourceMap, pluginImportPath })
  );
  await writeFile(
    path.join(root, 'react-router.config.ts'),
    createReactRouterConfig(variant)
  );
  await writeFile(
    path.join(root, 'app/routes.ts'),
    createRoutesConfig(routeCount)
  );
  await writeFile(
    path.join(root, 'app/root.tsx'),
    [
      `import { Outlet } from 'react-router';`,
      `export default function Root() { return null; }`,
      `export function Layout() { return null; }`,
      `export function ErrorBoundary() { return null; }`,
      '',
    ].join('\n')
  );
  await writeFile(
    path.join(root, 'app/client-data.client.ts'),
    `export const clientValue = 'client';\nexport * from './client-extra.client';\n`
  );
  await writeFile(
    path.join(root, 'app/client-extra.client.ts'),
    `export const extraClientValue = 'extra-client';\n`
  );
  await writeFile(
    path.join(root, 'app/server-data.server.ts'),
    `export const serverValue = 'server';\n`
  );

  for (let index = 1; index <= routeCount; index += 1) {
    const profile = routeExportProfiles[index % routeExportProfiles.length];
    await writeFile(
      path.join(root, 'app', routeFile(index)),
      `${createRouteModule(index, profile)}\n`
    );
  }

  return {
    root,
    routeCount,
    variant,
    sourceMap,
  };
}
