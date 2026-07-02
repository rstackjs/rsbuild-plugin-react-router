import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  appendNodeOption,
  createOutputTail,
  runDevServerBenchmark,
} from '../../../scripts/benchmark/dev-server.mjs';
import {
  expandProfiles,
  formatMarkdown,
  isReactRouterPerformanceLoggingEnabled,
  parseArgs,
  parseReactRouterPerformanceLogs,
  summarizeResults,
} from './benchmark-rsbuild-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { out, profile, runs } = parseArgs(process.argv.slice(2));
const logReactRouterPerformance = isReactRouterPerformanceLoggingEnabled();
const syntheticRoutes = readPositiveIntegerEnv('SYNTHETIC_ROUTES', 355);
const devRoutePaths = createDevRoutePaths(syntheticRoutes);
const devPortBase = 44000;
const devTimeoutMs = readPositiveIntegerEnv(
  'SYNTHETIC_DEV_TIMEOUT_MS',
  300_000
);
const devRouteTimeoutMs = readPositiveIntegerEnv(
  'SYNTHETIC_DEV_ROUTE_TIMEOUT_MS',
  30_000
);

await run(process.execPath, [path.join(root, 'scripts/generate-app.mjs')]);

const results = [];
const selectedProfiles = expandProfiles(profile);

for (const selectedProfile of selectedProfiles) {
  if (selectedProfile === 'warm') {
    await clean();
    await build('warmup');
  }

  for (let index = 1; index <= runs; index += 1) {
    if (selectedProfile === 'cold') {
      await clean();
    }
    if (selectedProfile === 'dev') {
      const result = await dev(`${selectedProfile} ${index}/${runs}`, {
        port: devPortBase + index - 1,
        run: index,
      });
      results.push(result);
      console.log(
        `rsbuild dev ${index}/${runs}: ready ${(result.readyMs / 1000).toFixed(
          2
        )}s, routes ${(result.routeTotalMs / 1000).toFixed(
          2
        )}s, update ${(result.updateMs / 1000).toFixed(2)}s`
      );
    } else {
      const started = performance.now();
      const buildLogs = await build(`${selectedProfile} ${index}/${runs}`);
      const durationSeconds = (performance.now() - started) / 1000;
      const result = {
        mode: 'rsbuild',
        profile: selectedProfile,
        run: index,
        durationSeconds,
      };
      const reactRouterPerformance = parseReactRouterPerformanceLogs(buildLogs);
      if (logReactRouterPerformance || reactRouterPerformance.length > 0) {
        result.reactRouterPerformance = reactRouterPerformance;
      }
      results.push(result);
      console.log(
        `rsbuild ${selectedProfile} ${index}/${runs}: ${durationSeconds.toFixed(
          2
        )}s`
      );
    }
  }
}

const generatedAt = new Date().toISOString();
const summaries = summarizeResults(results);
const payload = {
  generatedAt,
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
  runs,
  profile,
  results,
  summaries,
};
const stamp = generatedAt.replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z');
const output = path.resolve(root, out);
await fs.mkdir(output, { recursive: true });
await fs.writeFile(
  path.join(output, `${stamp}-rsbuild.json`),
  `${JSON.stringify(payload, null, 2)}\n`
);
const markdown = formatMarkdown(payload);
await fs.writeFile(path.join(output, `${stamp}-rsbuild.md`), markdown);
console.log(markdown);

async function clean() {
  await Promise.all(
    [
      path.join(root, 'dist', 'rsbuild'),
      path.join(root, '.react-router'),
      path.join(root, '.cache'),
      path.join(root, 'node_modules/.cache'),
    ].map(target => fs.rm(target, { force: true, recursive: true }))
  );
}

async function build(label) {
  console.log(`Starting rsbuild build (${label})...`);
  return run(
    rsbuildBinary(),
    ['build', '--config', 'rsbuild.config.ts'],
    {
      ...process.env,
      NODE_ENV: 'production',
      SYNTHETIC_BUILD_DIR: 'dist/rsbuild',
    },
    true
  );
}

async function dev(label, { port, run: runIndex }) {
  console.log(`Starting rsbuild dev (${label})...`);
  await clean();
  const benchmark = await runDevServer({
    port,
    routePaths: devRoutePaths,
    updateFile: path.join(root, 'app/generated/routes/route-0000.tsx'),
  });
  return {
    mode: 'rsbuild',
    profile: 'dev',
    run: runIndex,
    durationSeconds: benchmark.wallMs / 1000,
    readyMs: benchmark.readyMs,
    routeTotalMs: benchmark.routeTotalMs,
    updateMs: benchmark.updateMs,
    routeRequests: benchmark.routeRequests,
    updateRouteRequests: benchmark.updateRouteRequests,
  };
}

async function runDevServer({ port, routePaths, updateFile }) {
  const origin = `http://localhost:${port}`;
  const benchmarkEnv = {
    NODE_ENV: 'development',
    NODE_OPTIONS: appendNodeOption(
      process.env.NODE_OPTIONS,
      '--experimental-vm-modules'
    ),
  };
  if (logReactRouterPerformance) {
    benchmarkEnv.SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE = '1';
  }

  const benchmark = await runDevServerBenchmark({
    command: rsbuildBinary(),
    args: ['dev', '--config', 'rsbuild.config.ts', '--port', String(port)],
    cwd: root,
    env: benchmarkEnv,
    readyEnvironments: ['web', 'node'],
    origin,
    routePaths,
    routeTimeoutMs: devRouteTimeoutMs,
    routeRetryDelayMs: 250,
    updateFile,
    updateMarker: '__syntheticBenchmarkHmrProbe',
    updateRoutePaths: ['/feature/0000'],
    timeoutMs: devTimeoutMs,
  });

  if (benchmark.status !== 0) {
    const details = benchmark.output
      .trim()
      .split(/\r?\n/)
      .slice(-120)
      .join('\n');
    throw new Error(
      [
        `rsbuild dev failed with ${benchmark.status ?? benchmark.signal}`,
        details,
      ]
        .filter(Boolean)
        .join('\n\n')
    );
  }

  return {
    wallMs: benchmark.wallMs,
    readyMs: benchmark.readyMs,
    routeTotalMs: benchmark.routeTotalMs,
    updateMs: benchmark.updateMs,
    routeRequests: benchmark.routeRequests,
    updateRouteRequests: benchmark.updateRouteRequests,
  };
}

function readPositiveIntegerEnv(name, fallback) {
  const value = process.env[name];
  if (value == null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function createDevRoutePaths(routeCount) {
  const featureIndexes = [0, 10, 100]
    .filter(index => index < routeCount)
    .map(index => `/feature/${String(index).padStart(4, '0')}`);
  return ['/', ...new Set(featureIndexes)];
}

function rsbuildBinary() {
  return path.join(
    root,
    'node_modules/.bin',
    `rsbuild${process.platform === 'win32' ? '.cmd' : ''}`
  );
}

function run(command, args, env = process.env, quiet = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      shell: process.platform === 'win32',
      stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    const output = createOutputTail();
    if (quiet) {
      child.stdout.on('data', chunk => {
        output.append(chunk);
      });
      child.stderr.on('data', chunk => {
        output.append(chunk);
      });
    }
    child.on('error', reject);
    child.on('exit', (code, signal) =>
      code === 0
        ? resolve(output.read())
        : reject(
            new Error(
              [
                `${command} exited with ${code ?? signal}`,
                output.read().trim().split(/\r?\n/).slice(-120).join('\n'),
              ]
                .filter(Boolean)
                .join('\n\n')
            )
          )
    );
  });
}
