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

export const benchmarkFixtureNames = [
  'default',
  'export-heavy',
  'reexports',
  'import-fanout',
  'chunk-saturated',
  'large',
];

const stressFixtureNames = new Set(benchmarkFixtureNames);

export const largeFixtureConfig = Object.freeze({
  seed: 8675309,
  routes: 355,
  componentsPerRoute: 18,
  utilitiesPerRoute: 4,
  lazyModulesPerRoute: 3,
  workers: 120,
  restrictedModules: 1187,
  svgAssets: 1184,
  cssModules: 217,
  localeFiles: 111,
  localeTotalBytes: 151289856,
  payloadEntriesPerComponent: 72,
  reactCompilerEvery: 3,
  secretEvery: 7,
  restrictedImportEvery: 6,
});

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

const renderParallelRouteTransformOption = parallelRouteTransform => {
  if (parallelRouteTransform === undefined) {
    return [];
  }
  if (parallelRouteTransform === false) {
    return [`      parallelRouteTransform: false,`];
  }
  if (parallelRouteTransform === true) {
    return [`      parallelRouteTransform: true,`];
  }
  return [`      parallelRouteTransform: ${parallelRouteTransform},`];
};

const benchmarkEnv = {
  lazyCompilation: 'REACT_ROUTER_BENCHMARK_LAZY_COMPILATION',
  lazyCompilationPrewarm: 'REACT_ROUTER_BENCHMARK_LAZY_COMPILATION_PREWARM',
  logPerformance: 'REACT_ROUTER_BENCHMARK_LOG_PERFORMANCE',
};

const renderBenchmarkEnvOption = (envName, enabledOption) =>
  `      ...(process.env.${envName} === '1' ? { ${enabledOption}: true } : {}),`;

const renderLazyCompilationOption = () =>
  `      ...(process.env.${benchmarkEnv.lazyCompilation} === '0'` +
  ` ? { lazyCompilation: false }` +
  ` : process.env.${benchmarkEnv.lazyCompilation} === '1'` +
  ` ? { lazyCompilation: true } : {}),`;

const createRsbuildConfig = ({
  variant,
  sourceMap,
  pluginImportPath,
  pluginReactImportPath,
  parallelRouteTransform,
}) => {
  const ssr = variant !== 'spa';

  return [
    `import { defineConfig } from '@rsbuild/core';`,
    `import { pluginReact } from '${pluginReactImportPath}';`,
    `import { pluginReactRouter } from '${pluginImportPath}';`,
    '',
    'export default defineConfig({',
    '  plugins: [',
    '    pluginReact(),',
    '    pluginReactRouter({',
    ...(ssr ? [`      serverOutput: 'module',`] : []),
    ...renderParallelRouteTransformOption(parallelRouteTransform),
    renderLazyCompilationOption(),
    renderBenchmarkEnvOption(
      benchmarkEnv.lazyCompilationPrewarm,
      'unstableLazyCompilationPrewarm'
    ),
    `      logPerformance: process.env.${benchmarkEnv.logPerformance} === '1',`,
    '    }),',
    '  ],',
    '  output: {',
    `    sourceMap: ${
      sourceMap ? `{ js: 'cheap-module-source-map', css: false }` : 'false'
    },`,
    '  },',
    '});',
    '',
  ].join('\n');
};

const createReactRouterConfig = variant => {
  const ssr = variant !== 'spa';
  const splitRouteModules = variant.includes('split');

  return [
    `import type { ReactRouterRsbuildConfig } from 'rsbuild-plugin-react-router';`,
    '',
    'export default {',
    `  ssr: ${ssr ? 'true' : 'false'},`,
    `  splitRouteModules: ${splitRouteModules ? 'true' : 'false'},`,
    '} satisfies ReactRouterRsbuildConfig;',
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

const largeId = index => String(index).padStart(4, '0');
const largePairId = index => String(index).padStart(2, '0');

const normalizeLargeConfig = (routeCount, largeConfig: any = {}) => ({
  ...largeFixtureConfig,
  ...largeConfig,
  routes: largeConfig.routes ?? routeCount ?? largeFixtureConfig.routes,
});

const createLargeStats = config => ({
  codeModules:
    config.routes *
      (2 +
        config.componentsPerRoute +
        config.utilitiesPerRoute +
        config.lazyModulesPerRoute) +
    config.workers +
    config.restrictedModules +
    3,
  dynamicImports: config.routes * config.lazyModulesPerRoute,
  routes: config.routes,
  components: config.routes * config.componentsPerRoute,
  utilities: config.routes * config.utilitiesPerRoute,
  lazyModules: config.routes * config.lazyModulesPerRoute,
  workers: config.workers,
  restrictedModules: config.restrictedModules,
  svgAssets: config.svgAssets,
  cssModules: config.cssModules,
  localeFiles: config.localeFiles,
  localeTotalBytes: config.localeTotalBytes,
});

const seededNumber = (seed, index) => {
  let value = (seed + index * 1103515245 + 12345) >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return value >>> 0;
};

const writeInBatches = async (items, writer, batchSize = 128) => {
  for (let start = 0; start < items.length; start += batchSize) {
    await Promise.all(items.slice(start, start + batchSize).map(writer));
  }
};

const range = length => Array.from({ length }, (_, index) => index);

const writeFiles = (files, batchSize = 128) =>
  writeInBatches(
    files,
    ([filePath, contents]) => writeFile(filePath, contents),
    batchSize
  );

const createLargeRoutesConfig = routeCount => {
  const routes = [];
  for (let index = 0; index < routeCount; index += 1) {
    const id = `route-${largeId(index)}`;
    routes.push(
      [
        '  {',
        `    id: '${id}',`,
        `    file: 'generated/routes/${id}.tsx',`,
        index === 0 ? '    index: true,' : `    path: '${id}',`,
        '  },',
      ].join('\n')
    );
  }

  return [
    `import type { RouteConfigEntry } from '@react-router/dev/routes';`,
    '',
    'export const generatedRoutes = [',
    ...routes,
    '] satisfies RouteConfigEntry[];',
    '',
    'export default generatedRoutes;',
    '',
  ].join('\n');
};

const createLargeRootModule = () =>
  [
    `import { createElement } from 'react';`,
    `import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';`,
    `export function Layout({ children }) {`,
    `  return createElement('html', null, createElement('head', null, createElement(Meta), createElement(Links)), createElement('body', null, children, createElement(ScrollRestoration), createElement(Scripts)));`,
    `}`,
    `export default function Root() { return createElement(Outlet); }`,
    `export function ErrorBoundary() { return createElement('main', null, 'Synthetic benchmark error'); }`,
    '',
  ].join('\n');

const createLargeUtilityModule = ({ featureIndex, utilityIndex, config }) => {
  const feature = largeId(featureIndex);
  const utility = largePairId(utilityIndex);
  const values = range(16).map(index =>
    seededNumber(config.seed, featureIndex * 1000 + utilityIndex * 100 + index)
  );

  return [
    `export const utility${feature}_${utility}Values = ${JSON.stringify(values)};`,
    `export function utility${feature}_${utility}(input) {`,
    `  return utility${feature}_${utility}Values.reduce((total, value, index) => total + ((value ^ input.length ^ index) % 997), 0);`,
    `}`,
    '',
  ].join('\n');
};

const createLargeComponentModule = ({
  featureIndex,
  componentIndex,
  config,
}) => {
  const feature = largeId(featureIndex);
  const component = largePairId(componentIndex);
  const cssIndex = largeId(
    (featureIndex * config.componentsPerRoute + componentIndex) %
      config.cssModules
  );
  const svgIndex = largeId(
    (featureIndex * config.componentsPerRoute + componentIndex) %
      config.svgAssets
  );
  const utilityIndex = componentIndex % config.utilitiesPerRoute;
  const restrictedIndex =
    (featureIndex * config.componentsPerRoute + componentIndex) %
    config.restrictedModules;
  const includeRestricted =
    config.restrictedModules > 0 &&
    (featureIndex * config.componentsPerRoute + componentIndex) %
      config.restrictedImportEvery ===
      0;
  const payload = range(config.payloadEntriesPerComponent).map(
    index =>
      `'${feature}:${component}:${largePairId(index)}:${seededNumber(
        config.seed,
        featureIndex * 10000 + componentIndex * 100 + index
      ).toString(36)}'`
  );

  return [
    ...(featureIndex % config.reactCompilerEvery === 0 ? [`'use memo';`] : []),
    `import styles from '../../../styles/style-${cssIndex}.module.css';`,
    `import iconUrl from '../../../assets/icons/icon-${svgIndex}.svg';`,
    `import { utility${feature}_${largePairId(utilityIndex)} } from '../utils/utility-${largePairId(utilityIndex)}';`,
    ...(includeRestricted
      ? [
          `import { restrictedValue${largeId(restrictedIndex)} } from '../../../restricted/restricted-${largeId(restrictedIndex)}';`,
        ]
      : []),
    '',
    `const payload = [${payload.join(', ')}];`,
    `const secretMarker = ${componentIndex % config.secretEvery === 0 ? `'synthetic-secret-${feature}-${component}'` : 'null'};`,
    '',
    `export function Card${feature}_${component}({ label = 'Feature ${feature}' }) {`,
    `  const score = utility${feature}_${largePairId(utilityIndex)}(label);`,
    includeRestricted
      ? `  const restricted = restrictedValue${largeId(restrictedIndex)};`
      : `  const restricted = '';`,
    `  return (`,
    `    <article className={styles.card} data-score={score} data-secret={secretMarker ?? undefined}>`,
    `      <img src={iconUrl} alt="" />`,
    `      <h2>{label}</h2>`,
    `      <p>{payload[(score + restricted.length) % payload.length]}</p>`,
    `    </article>`,
    `  );`,
    `}`,
    '',
  ].join('\n');
};

const createLargeShellModule = ({ featureIndex, config }) => {
  const feature = largeId(featureIndex);
  const imports = range(config.componentsPerRoute).map(
    componentIndex =>
      `import { Card${feature}_${largePairId(componentIndex)} } from './components/card-${largePairId(componentIndex)}';`
  );
  const cards = range(config.componentsPerRoute).map(
    componentIndex =>
      `      <Card${feature}_${largePairId(componentIndex)} key="${largePairId(componentIndex)}" label="Feature ${feature} card ${largePairId(componentIndex)}" />`
  );

  return [
    ...imports,
    '',
    `export function FeatureShell${feature}() {`,
    `  return (`,
    `    <section data-feature="${feature}">`,
    ...cards,
    `    </section>`,
    `  );`,
    `}`,
    '',
  ].join('\n');
};

const createLargeLazyModule = ({ featureIndex, lazyIndex, config }) => {
  const feature = largeId(featureIndex);
  const lazy = largePairId(lazyIndex);
  const values = range(24).map(index =>
    seededNumber(config.seed, featureIndex * 1000 + lazyIndex * 100 + index)
  );

  return [
    `export const lazyValue${feature}_${lazy} = ${JSON.stringify(values)};`,
    `export function Lazy${feature}_${lazy}() { return null; }`,
    '',
  ].join('\n');
};

const createLargeRouteModule = ({ featureIndex, config, isSpa }) => {
  const feature = largeId(featureIndex);
  const workerIndex = largeId(featureIndex % config.workers);
  const localeIndex = largeId(featureIndex % config.localeFiles);
  const lazyImports = range(config.lazyModulesPerRoute).map(
    lazyIndex =>
      `import('../features/feature-${feature}/lazy/lazy-${largePairId(lazyIndex)}')`
  );

  return [
    `import { FeatureShell${feature} } from '../features/feature-${feature}/shell';`,
    '',
    `const lazyModules = [${lazyImports.join(', ')}];`,
    `const localeUrl = '/generated/locales/synthetic-${localeIndex}.json';`,
    '',
    `export const handle = { syntheticFeature: ${featureIndex}, category: 'benchmark' };`,
    `export function meta() { return [{ title: 'Synthetic feature ${feature}' }]; }`,
    `export function shouldRevalidate() { return false; }`,
    `export async function clientLoader() {`,
    `  const modules = await Promise.all(lazyModules);`,
    `  if (typeof Worker !== 'undefined') {`,
    `    const worker = new Worker(new URL('../workers/worker-${workerIndex}.ts', import.meta.url), { type: 'module' });`,
    `    worker.terminate();`,
    `  }`,
    `  return { lazyCount: modules.length, localeUrl };`,
    `}`,
    ...(isSpa
      ? []
      : [
          `export async function loader() { return { localeUrl }; }`,
          `export function headers() { return { 'x-synthetic-route': '${feature}' }; }`,
          `export function HydrateFallback() { return null; }`,
        ]),
    `export default function Route${feature}() { return <FeatureShell${feature} />; }`,
    '',
  ].join('\n');
};

const writeLargeLocaleFiles = async (root, config) => {
  await mkdir(path.join(root, 'public/generated/locales'), { recursive: true });
  const baseSize = Math.floor(config.localeTotalBytes / config.localeFiles);
  const remainder = config.localeTotalBytes % config.localeFiles;

  await writeInBatches(
    range(config.localeFiles),
    index => {
      const id = largeId(index);
      const targetSize = baseSize + (index < remainder ? 1 : 0);
      const prefix = `{"id":"synthetic-${id}","messages":["`;
      const suffix = `"]}\n`;
      const payloadSize = Math.max(
        0,
        targetSize - Buffer.byteLength(prefix) - Buffer.byteLength(suffix)
      );
      return writeFile(
        path.join(root, `public/generated/locales/synthetic-${id}.json`),
        `${prefix}${'x'.repeat(payloadSize)}${suffix}`
      );
    },
    8
  );
};

const generateLargeFixture = async ({
  root,
  routeCount,
  variant,
  sourceMap,
  pluginImportPath,
  pluginReactImportPath,
  parallelRouteTransform,
  largeConfig,
}) => {
  const config = normalizeLargeConfig(routeCount, largeConfig);
  const isSpa = variant === 'spa';
  const generatedRoot = path.join(root, 'app/generated');

  await rm(root, { recursive: true, force: true });
  await Promise.all(
    [
      'assets/icons',
      'features',
      'restricted',
      'routes',
      'styles',
      'workers',
    ].map(directory =>
      mkdir(path.join(generatedRoot, directory), { recursive: true })
    )
  );

  await writeFiles([
    [
      path.join(root, 'package.json'),
      JSON.stringify({ type: 'module', private: true }, null, 2),
    ],
    [
      path.join(root, 'rsbuild.config.mjs'),
      createRsbuildConfig({
        variant,
        sourceMap,
        pluginImportPath,
        pluginReactImportPath,
        parallelRouteTransform,
      }),
    ],
    [
      path.join(root, 'react-router.config.ts'),
      createReactRouterConfig(variant),
    ],
    [
      path.join(root, 'app/routes.ts'),
      `export { default } from './generated/route-config';\n`,
    ],
    [path.join(root, 'app/root.tsx'), createLargeRootModule()],
    [
      path.join(generatedRoot, 'route-config.ts'),
      createLargeRoutesConfig(config.routes),
    ],
    [
      path.join(generatedRoot, 'shared-types.ts'),
      `export type SyntheticPayload = { id: string; score: number };\n`,
    ],
    [
      path.join(generatedRoot, 'catalog.ts'),
      `export const syntheticRouteCount = ${config.routes};\n`,
    ],
  ]);

  await writeFiles(
    range(config.svgAssets).map(index => [
      path.join(generatedRoot, `assets/icons/icon-${largeId(index)}.svg`),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#${seededNumber(config.seed, index).toString(16).slice(0, 6).padEnd(6, '0')}" d="M2 2h28v28H2z"/><path fill="#fff" d="M8 16h16v2H8z"/></svg>\n`,
    ])
  );

  await writeFiles(
    range(config.cssModules).map(index => [
      path.join(generatedRoot, `styles/style-${largeId(index)}.module.css`),
      `.card { display: grid; gap: 4px; padding: ${4 + (index % 5)}px; color: #1f2937; }\n.card img { width: 16px; height: 16px; }\n`,
    ])
  );

  await writeFiles(
    range(config.restrictedModules).map(index => [
      path.join(generatedRoot, `restricted/restricted-${largeId(index)}.ts`),
      `export const restrictedValue${largeId(index)} = 'restricted-${largeId(index)}';\n`,
    ])
  );

  await writeFiles(
    range(config.workers).map(index => [
      path.join(generatedRoot, `workers/worker-${largeId(index)}.ts`),
      `self.onmessage = event => { self.postMessage({ id: '${largeId(index)}', value: event.data }); };\n`,
    ])
  );

  await writeInBatches(
    range(config.routes),
    async featureIndex => {
      const feature = largeId(featureIndex);
      const featureRoot = path.join(
        generatedRoot,
        `features/feature-${feature}`
      );
      await Promise.all([
        mkdir(path.join(featureRoot, 'components'), { recursive: true }),
        mkdir(path.join(featureRoot, 'lazy'), { recursive: true }),
        mkdir(path.join(featureRoot, 'utils'), { recursive: true }),
      ]);

      await writeFiles([
        [
          path.join(featureRoot, 'shell.tsx'),
          createLargeShellModule({ featureIndex, config }),
        ],
        [
          path.join(generatedRoot, `routes/route-${feature}.tsx`),
          createLargeRouteModule({ featureIndex, config, isSpa }),
        ],
        ...range(config.utilitiesPerRoute).map(utilityIndex => [
          path.join(
            featureRoot,
            `utils/utility-${largePairId(utilityIndex)}.ts`
          ),
          createLargeUtilityModule({ featureIndex, utilityIndex, config }),
        ]),
        ...range(config.componentsPerRoute).map(componentIndex => [
          path.join(
            featureRoot,
            `components/card-${largePairId(componentIndex)}.tsx`
          ),
          createLargeComponentModule({
            featureIndex,
            componentIndex,
            config,
          }),
        ]),
        ...range(config.lazyModulesPerRoute).map(lazyIndex => [
          path.join(featureRoot, `lazy/lazy-${largePairId(lazyIndex)}.tsx`),
          createLargeLazyModule({ featureIndex, lazyIndex, config }),
        ]),
      ]);
    },
    24
  );

  await writeLargeLocaleFiles(root, config);

  return {
    root,
    routeCount: config.routes,
    variant,
    sourceMap,
    fixture: 'large',
    parallelRouteTransform,
    stats: createLargeStats(config),
    updateFile: path.join(root, 'app/generated/routes/route-0000.tsx'),
    updateRoutePaths: ['/'],
  };
};

export async function generateSyntheticFixture({
  root,
  routeCount,
  variant,
  sourceMap = false,
  pluginImportPath = 'rsbuild-plugin-react-router',
  pluginReactImportPath = '@rsbuild/plugin-react',
  fixture = 'default',
  parallelRouteTransform,
  largeConfig,
}) {
  if (!stressFixtureNames.has(fixture)) {
    throw new Error(
      `Unknown benchmark fixture "${fixture}". Use ${benchmarkFixtureNames.join(', ')}.`
    );
  }

  if (fixture === 'large') {
    return generateLargeFixture({
      root,
      routeCount,
      variant,
      sourceMap,
      pluginImportPath,
      pluginReactImportPath,
      parallelRouteTransform,
      largeConfig,
    });
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
    createRsbuildConfig({
      variant,
      sourceMap,
      pluginImportPath,
      pluginReactImportPath,
      parallelRouteTransform,
    })
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
    parallelRouteTransform,
    updateFile: path.join(root, 'app', routeFile(1)),
    updateRoutePaths: ['/'],
  };
}
