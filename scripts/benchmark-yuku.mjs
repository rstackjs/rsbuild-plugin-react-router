#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readdir, symlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createJiti } from 'jiti';

const iterations = Number(process.env.BENCH_ITERATIONS ?? 250);
const sampleCount = Number(process.env.BENCH_SAMPLES ?? 24);

const exec = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(
      [`Command failed: ${cmd} ${args.join(' ')}`, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n')
    );
  }
  return result.stdout;
};

const createOldCheckout = async repoRoot => {
  const dir = await mkdtemp(path.join(tmpdir(), 'rr-yuku-before-'));
  const archive = path.join(dir, 'head.tar');
  exec('git', ['archive', 'HEAD', '-o', archive], { cwd: repoRoot });
  const checkout = path.join(dir, 'repo');
  exec('mkdir', ['-p', checkout]);
  exec('tar', ['-xf', archive, '-C', checkout]);
  await linkNodeModules(repoRoot, checkout);
  return checkout;
};

const linkNodeModules = async (repoRoot, checkout) => {
  const sourceNodeModules = path.join(repoRoot, 'node_modules');
  const targetNodeModules = path.join(checkout, 'node_modules');
  await mkdir(targetNodeModules, { recursive: true });

  for (const entry of await readdir(sourceNodeModules, {
    withFileTypes: true,
  })) {
    if (entry.name === '.pnpm') {
      continue;
    }
    const source = path.join(sourceNodeModules, entry.name);
    const target = path.join(targetNodeModules, entry.name);
    if (entry.name.startsWith('@') && entry.isDirectory()) {
      await mkdir(target, { recursive: true });
      for (const scoped of await readdir(source)) {
        const scopedTarget = path.join(target, scoped);
        if (!existsSync(scopedTarget)) {
          await symlink(path.join(source, scoped), scopedTarget);
        }
      }
      continue;
    }
    if (!existsSync(target)) {
      await symlink(source, target);
    }
  }

  const oldOnlyPackages = [
    '@babel/core',
    '@babel/generator',
    '@babel/parser',
    '@babel/traverse',
    '@babel/types',
    'babel-dead-code-elimination',
    'es-module-lexer',
    'esbuild',
  ];
  for (const packageName of oldOnlyPackages) {
    await linkPnpmPackage(sourceNodeModules, targetNodeModules, packageName);
  }
};

const linkPnpmPackage = async (
  sourceNodeModules,
  targetNodeModules,
  packageName
) => {
  const source = findPnpmPackage(sourceNodeModules, packageName);
  if (!source) {
    throw new Error(`Could not find ${packageName} in node_modules/.pnpm`);
  }
  const segments = packageName.split('/');
  const target =
    segments.length === 1
      ? path.join(targetNodeModules, packageName)
      : path.join(targetNodeModules, segments[0], segments[1]);
  await mkdir(path.dirname(target), { recursive: true });
  if (!existsSync(target)) {
    await symlink(source, target);
  }
};

const findPnpmPackage = (sourceNodeModules, packageName) => {
  const pnpmDir = path.join(sourceNodeModules, '.pnpm');
  const encodedName = packageName.replace('/', '+');
  const entries = spawnSync(
    'find',
    [pnpmDir, '-maxdepth', '1', '-type', 'd', '-name', `${encodedName}@*`],
    {
      encoding: 'utf8',
    }
  );
  const dir = entries.stdout.split('\n').filter(Boolean).sort().at(-1);
  if (!dir) {
    return null;
  }
  return path.join(dir, 'node_modules', packageName);
};

const loadModules = async repoRoot => {
  const jiti = createJiti(pathToFileURL(path.join(repoRoot, 'bench.mjs')).href);
  return {
    exportUtils: await jiti.import(path.join(repoRoot, 'src/export-utils.ts')),
    compiler: await jiti.import(path.join(repoRoot, 'src/babel.ts')),
    pluginUtils: await jiti.import(path.join(repoRoot, 'src/plugin-utils.ts')),
    routeChunks: await jiti.import(path.join(repoRoot, 'src/route-chunks.ts')),
  };
};

const createSamples = () =>
  Array.from({ length: sampleCount }, (_, index) => {
    const shared =
      index % 3 === 0
        ? `const shared${index} = (value: number) => value + ${index};`
        : '';
    return {
      path: `/app/routes/bench-${index}.tsx`,
      code: `
        import { helper${index} } from "./helpers";
        import { serverOnly${index} } from "./data.server";
        ${shared}

        type LoaderData${index} = { value: number };

        export const loader = async () => {
          return serverOnly${index}();
        };

        export const action = async () => {
          return serverOnly${index}();
        };

        export const clientLoader = async () => {
          const value = helper${index}(${index});
          return ${shared ? `shared${index}(value)` : 'value'};
        };

        export const clientAction = async () => {
          return helper${index}(${index + 1});
        };

        export function HydrateFallback() {
          return <div data-route="${index}">Loading</div>;
        }

        export function ErrorBoundary() {
          return <div>Error</div>;
        }

        export default function Route(props: LoaderData${index}) {
          return <main>{props.value}</main>;
        }
      `,
    };
  });

const hrtimeMs = start => Number(process.hrtime.bigint() - start) / 1e6;

const measure = async fn => {
  const start = process.hrtime.bigint();
  await fn();
  return hrtimeMs(start);
};

const runForRepo = async (label, repoRoot) => {
  const { exportUtils, compiler, pluginUtils, routeChunks } =
    await loadModules(repoRoot);
  const samples = createSamples();

  for (let i = 0; i < 20; i++) {
    const sample = samples[i % samples.length];
    const code = await exportUtils.transformToEsm(sample.code, sample.path);
    await exportUtils.getExportNames(code);
  }

  const transformed = new Map();
  const transformMs = await measure(async () => {
    for (let i = 0; i < iterations; i++) {
      const sample = samples[i % samples.length];
      const code = await exportUtils.transformToEsm(sample.code, sample.path);
      transformed.set(sample.path, code);
    }
  });

  const exportScanMs = await measure(async () => {
    for (let i = 0; i < iterations; i++) {
      const sample = samples[i % samples.length];
      await exportUtils.getExportNames(transformed.get(sample.path));
    }
  });

  const routeTransformMs = await measure(async () => {
    for (let i = 0; i < iterations; i++) {
      const sample = samples[i % samples.length];
      const code = transformed.get(sample.path);
      const ast = compiler.parse(code, { sourceType: 'module' });
      pluginUtils.removeExports(ast, [
        'loader',
        'action',
        'middleware',
        'headers',
      ]);
      pluginUtils.transformRoute(ast);
      pluginUtils.removeUnusedImports(ast);
      compiler.generate(ast, { sourceMaps: true, filename: sample.path });
    }
  });

  const routeChunkMs = await measure(async () => {
    const cache = new Map();
    const config = {
      splitRouteModules: true,
      appDirectory: '/app',
      rootRouteFile: 'root.tsx',
    };
    for (let i = 0; i < iterations; i++) {
      const sample = samples[i % samples.length];
      const code = transformed.get(sample.path);
      await routeChunks.detectRouteChunksIfEnabled(
        cache,
        config,
        sample.path,
        code
      );
      await routeChunks.getRouteChunkIfEnabled(
        cache,
        config,
        sample.path,
        'main',
        code
      );
      await routeChunks.getRouteChunkIfEnabled(
        cache,
        config,
        sample.path,
        'clientLoader',
        code
      );
    }
  });

  return {
    label,
    transformMs,
    exportScanMs,
    routeTransformMs,
    routeChunkMs,
    totalMs: transformMs + exportScanMs + routeTransformMs + routeChunkMs,
  };
};

const format = value => value.toFixed(2).padStart(10);

const printComparison = (before, after) => {
  const rows = [
    ['transform', before.transformMs, after.transformMs],
    ['export scan', before.exportScanMs, after.exportScanMs],
    ['route transform', before.routeTransformMs, after.routeTransformMs],
    ['route chunks', before.routeChunkMs, after.routeChunkMs],
    ['total', before.totalMs, after.totalMs],
  ];
  console.log(
    `Benchmark: ${iterations} iterations across ${sampleCount} TSX route samples`
  );
  console.log(`Node: ${process.version}`);
  console.log('');
  console.log('metric              before ms   after ms   speedup');
  for (const [name, oldMs, newMs] of rows) {
    const speedup = oldMs / newMs;
    console.log(
      `${name.padEnd(18)}${format(oldMs)}${format(newMs)}${`${speedup.toFixed(2)}x`.padStart(10)}`
    );
  }
};

const repoRoot = process.cwd();
const compareHead = process.argv.includes('--compare-head');

if (compareHead) {
  const oldRepo = await createOldCheckout(repoRoot);
  const before = await runForRepo('before', oldRepo);
  const after = await runForRepo('after', repoRoot);
  printComparison(before, after);
} else {
  const result = await runForRepo('current', repoRoot);
  console.log(JSON.stringify(result, null, 2));
}
