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

const stressFixtureNames = new Set([
  'default',
  'export-heavy',
  'reexports',
  'import-fanout',
  'chunk-saturated',
]);

export const benchmarkFixtureNames = [...stressFixtureNames];

export const padRoute = number => String(number).padStart(4, '0');

export const routeFile = index => `routes/route-${padRoute(index)}.tsx`;

export const routeId = index => `route-${padRoute(index)}`;

const routeComponentName = index => `Route${padRoute(index)}`;

const createSharedRouteExports = (index, { includeHeaders = false } = {}) => {
  const name = routeComponentName(index);
  return [
    `export const handle = { label: '${routeId(index)}' };`,
    `export function meta() { return [{ title: '${routeId(index)}' }]; }`,
    `export default function ${name}() { return null; }`,
    ...(includeHeaders
      ? [
          `export function headers() { return { 'x-route': '${routeId(index)}' }; }`,
        ]
      : []),
  ];
};

const createDefaultRouteModule = (index, profile, { isSpa }) => {
  const shared = createSharedRouteExports(index);

  if (profile === 'ssr-data') {
    if (isSpa) {
      return [
        ...shared,
        `export function shouldRevalidate() { return false; }`,
      ].join('\n');
    }

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
      ...(isSpa ? [] : [`export function HydrateFallback() { return null; }`]),
    ].join('\n');
  }

  if (profile === 'client-server-imports') {
    if (isSpa) {
      return [
        `import { clientValue } from '../client-data.client';`,
        ...shared,
        `export async function clientLoader() { return { id: '${routeId(index)}', clientValue }; }`,
      ].join('\n');
    }

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

const createExportHeavyRouteModule = (index, { isSpa }) => {
  const extraExports = Array.from({ length: 32 }, (_, extraIndex) => {
    const exportName = `unusedExport${padRoute(index)}_${String(extraIndex).padStart(2, '0')}`;
    return `export const ${exportName} = '${routeId(index)}-${extraIndex}';`;
  });

  return [
    `import { clientValue } from '../client-data.client';`,
    ...(isSpa ? [] : [`import { serverValue } from '../server-data.server';`]),
    ...createSharedRouteExports(index, { includeHeaders: !isSpa }),
    `export function links() { return []; }`,
    `export function shouldRevalidate() { return false; }`,
    `export async function clientLoader() { return { id: '${routeId(index)}', clientValue }; }`,
    `export async function clientAction() { return { ok: true }; }`,
    `export async function clientMiddleware() { return undefined; }`,
    ...(isSpa
      ? []
      : [
          `export async function loader() { return { id: '${routeId(index)}', serverValue }; }`,
          `export async function action() { return { ok: true }; }`,
          `export function HydrateFallback() { return null; }`,
        ]),
    ...extraExports,
  ].join('\n');
};

const createReexportsRouteModule = (index, { isSpa }) =>
  [
    `export { default, handle, meta, shouldRevalidate } from '../route-reexports/reexport-${padRoute(index)}';`,
    `export { clientLoader, clientAction, clientMiddleware${isSpa ? '' : ', HydrateFallback'} } from '../route-reexports/reexport-${padRoute(index)}';`,
    ...(isSpa
      ? []
      : [
          `export { loader, action, headers } from '../route-reexports/reexport-${padRoute(index)}';`,
        ]),
    `export * from '../route-reexports/reexport-all-${padRoute(index)}';`,
  ].join('\n');

const createImportFanoutRouteModule = (index, { isSpa }) => {
  const imports = Array.from({ length: 16 }, (_, fanoutIndex) => {
    const suffix = String(fanoutIndex).padStart(2, '0');
    return `import { fanoutValue${suffix} } from '../fanout/fanout-${suffix}';`;
  });
  const values = Array.from(
    { length: 16 },
    (_, fanoutIndex) => `fanoutValue${String(fanoutIndex).padStart(2, '0')}`
  ).join(', ');

  return [
    ...imports,
    ...createSharedRouteExports(index, { includeHeaders: !isSpa }),
    `const fanoutValues = [${values}];`,
    `export function shouldRevalidate() { return fanoutValues.length > ${index % 7}; }`,
    `export async function clientLoader() { return { values: fanoutValues }; }`,
    ...(isSpa
      ? []
      : [
          `export async function loader() { return { values: fanoutValues }; }`,
        ]),
  ].join('\n');
};

const createChunkSaturatedRouteModule = (index, { isSpa }) =>
  [
    `import { clientValue } from '../client-data.client';`,
    ...(isSpa ? [] : [`import { serverValue } from '../server-data.server';`]),
    ...createSharedRouteExports(index, { includeHeaders: !isSpa }),
    `const routeLabel = '${routeId(index)}';`,
    `export function shouldRevalidate() { return routeLabel.length > 0; }`,
    `export async function clientLoader() { return { routeLabel, clientValue }; }`,
    `export async function clientAction() { return { ok: routeLabel, clientValue }; }`,
    `export async function clientMiddleware() { return undefined; }`,
    ...(isSpa
      ? []
      : [
          `export function HydrateFallback() { return null; }`,
          `export async function loader() { return { routeLabel, serverValue }; }`,
          `export async function action() { return { ok: true, serverValue }; }`,
        ]),
  ].join('\n');

const createRouteModule = (index, profile, { isSpa, fixture }) => {
  if (fixture === 'export-heavy') {
    return createExportHeavyRouteModule(index, { isSpa });
  }
  if (fixture === 'reexports') {
    return createReexportsRouteModule(index, { isSpa });
  }
  if (fixture === 'import-fanout') {
    return createImportFanoutRouteModule(index, { isSpa });
  }
  if (fixture === 'chunk-saturated') {
    return createChunkSaturatedRouteModule(index, { isSpa });
  }
  return createDefaultRouteModule(index, profile, { isSpa });
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

const writeReexportFixtures = async (root, routeCount, { isSpa }) => {
  await mkdir(path.join(root, 'app/route-reexports'), { recursive: true });
  const batchSize = 64;
  for (let batchStart = 0; batchStart < routeCount; batchStart += batchSize) {
    await Promise.all(
      Array.from(
        { length: Math.min(batchSize, routeCount - batchStart) },
        (_, batchIndex) => {
          const routeIndex = batchStart + batchIndex;
          const index = routeIndex + 1;
          const module = [
            `import { clientValue } from '../client-data.client';`,
            ...(isSpa
              ? []
              : [`import { serverValue } from '../server-data.server';`]),
            ...createSharedRouteExports(index, { includeHeaders: !isSpa }),
            `export function shouldRevalidate() { return false; }`,
            `export async function clientLoader() { return { id: '${routeId(index)}', clientValue }; }`,
            `export async function clientAction() { return { ok: true }; }`,
            `export async function clientMiddleware() { return undefined; }`,
            ...(isSpa
              ? []
              : [
                  `export async function loader() { return { id: '${routeId(index)}', serverValue }; }`,
                  `export async function action() { return { ok: true }; }`,
                  `export function HydrateFallback() { return null; }`,
                ]),
          ].join('\n');
          const exportAllModule = [
            `export const reexportedValue${padRoute(index)} = '${routeId(index)}';`,
            `export function reexportedHelper${padRoute(index)}() { return reexportedValue${padRoute(index)}; }`,
          ].join('\n');
          return Promise.all([
            writeFile(
              path.join(
                root,
                `app/route-reexports/reexport-${padRoute(index)}.ts`
              ),
              `${module}\n`
            ),
            writeFile(
              path.join(
                root,
                `app/route-reexports/reexport-all-${padRoute(index)}.ts`
              ),
              `${exportAllModule}\n`
            ),
          ]);
        }
      )
    );
  }
};

const writeFanoutFixtures = async root => {
  await mkdir(path.join(root, 'app/fanout'), { recursive: true });
  await Promise.all(
    Array.from({ length: 16 }, (_, fanoutIndex) => {
      const suffix = String(fanoutIndex).padStart(2, '0');
      return writeFile(
        path.join(root, `app/fanout/fanout-${suffix}.ts`),
        `export const fanoutValue${suffix} = '${suffix}';\n`
      );
    })
  );
};

export async function generateSyntheticFixture({
  root,
  routeCount,
  variant,
  sourceMap = false,
  pluginImportPath = 'rsbuild-plugin-react-router',
  fixture = 'default',
}) {
  if (!stressFixtureNames.has(fixture)) {
    throw new Error(
      `Unknown benchmark fixture "${fixture}". Use ${[...stressFixtureNames].join(', ')}.`
    );
  }

  const isSpa = variant === 'spa';

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
      `import { createElement } from 'react';`,
      `import { Outlet, Scripts } from 'react-router';`,
      `export function Layout({ children }) {`,
      `  return createElement('html', null, createElement('head'), createElement('body', null, children, createElement(Scripts)));`,
      `}`,
      `export default function Root() { return createElement(Outlet); }`,
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

  if (fixture === 'reexports') {
    await writeReexportFixtures(root, routeCount, { isSpa });
  }
  if (fixture === 'import-fanout') {
    await writeFanoutFixtures(root);
  }

  await Promise.all(
    Array.from({ length: routeCount }, (_, routeIndex) => {
      const index = routeIndex + 1;
      const profile = routeExportProfiles[index % routeExportProfiles.length];
      return writeFile(
        path.join(root, 'app', routeFile(index)),
        `${createRouteModule(index, profile, { isSpa, fixture })}\n`
      );
    })
  );

  return {
    root,
    routeCount,
    variant,
    sourceMap,
    fixture,
  };
}
