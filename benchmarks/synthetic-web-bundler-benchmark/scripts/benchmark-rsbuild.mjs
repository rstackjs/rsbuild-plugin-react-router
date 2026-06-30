import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  createReadyLogObserver,
  formatMarkdown,
  isReactRouterPerformanceLoggingEnabled,
  parseArgs,
  parseReactRouterPerformanceLogs,
  summarizeResults,
} from './benchmark-rsbuild-utils.mjs';

const MAX_CAPTURED_OUTPUT_CHARS = 128 * 1024;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { out, profile, runs } = parseArgs(process.argv.slice(2));
const logReactRouterPerformance = isReactRouterPerformanceLoggingEnabled();
const devRoutePaths = ['/', '/feature/0000', '/feature/0010', '/feature/0100'];
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
const selectedProfiles =
  profile === 'both'
    ? ['cold', 'warm']
    : profile === 'all'
      ? ['cold', 'dev']
      : [profile];

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
  const started = performance.now();
  const origin = `http://localhost:${port}`;
  const originalSource = await fs.readFile(updateFile, 'utf8');
  const benchmarkEnv = {
    ...process.env,
    NODE_ENV: 'development',
    NODE_OPTIONS: appendNodeOption(
      process.env.NODE_OPTIONS,
      '--experimental-vm-modules'
    ),
  };
  if (logReactRouterPerformance) {
    benchmarkEnv.SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE = '1';
  }
  const child = spawn(
    rsbuildBinary(),
    ['dev', '--config', 'rsbuild.config.ts', '--port', String(port)],
    {
      cwd: root,
      detached: process.platform !== 'win32',
      env: benchmarkEnv,
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  const output = createOutputTail();
  const readyCounts = new Map([
    ['web', 0],
    ['node', 0],
  ]);
  let exitStatus = null;
  const waiters = new Set();
  const readyObserver = createReadyLogObserver(environment => {
    readyCounts.set(environment, (readyCounts.get(environment) ?? 0) + 1);
  });

  const observe = stream => chunk => {
    const text = chunk.toString();
    output.append(text);
    process.stdout.write(text);
    readyObserver.observe(stream, text);
    for (const waiter of waiters) {
      waiter.check();
    }
  };

  child.stdout.on('data', observe('stdout'));
  child.stderr.on('data', observe('stderr'));
  child.on('exit', (code, signal) => {
    exitStatus = code ?? signal;
    for (const waiter of waiters) {
      waiter.check();
    }
  });

  try {
    await waitForReady({
      readyCounts,
      waiters,
      getExitStatus: () => exitStatus,
    });
    const readyMs = performance.now() - started;
    const routeStarted = performance.now();
    const routeRequests = await fetchRoutes({ origin, routePaths });
    const routeTotalMs = performance.now() - routeStarted;

    const updateStarted = performance.now();
    await fs.writeFile(
      updateFile,
      `${originalSource}\nexport const __syntheticBenchmarkHmrProbe = ${Date.now()};\n`
    );
    await waitForReady({
      readyCounts,
      waiters,
      getExitStatus: () => exitStatus,
    });
    const updateMs = performance.now() - updateStarted;
    const updateRouteRequests = await fetchRoutes({
      origin,
      routePaths: ['/feature/0000'],
    });

    return {
      wallMs: performance.now() - started,
      readyMs,
      routeTotalMs,
      updateMs,
      routeRequests,
      updateRouteRequests,
    };
  } catch (error) {
    const details = output.read().trim().split(/\r?\n/).slice(-120).join('\n');
    throw new Error(
      [`rsbuild dev failed with ${exitStatus ?? error.message}`, details]
        .filter(Boolean)
        .join('\n\n'),
      { cause: error }
    );
  } finally {
    await fs.writeFile(updateFile, originalSource);
    await stopChild(child);
  }
}

function waitForReady({ readyCounts, waiters, getExitStatus }) {
  const baseline = new Map(readyCounts);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      waiters.delete(waiter);
      reject(new Error(`Timed out after ${devTimeoutMs} ms`));
    }, devTimeoutMs);
    timeout.unref?.();

    const waiter = {
      check() {
        const exitStatus = getExitStatus();
        if (exitStatus !== null) {
          clearTimeout(timeout);
          waiters.delete(waiter);
          reject(new Error(`Dev server exited with ${exitStatus}`));
          return;
        }
        if (
          (readyCounts.get('web') ?? 0) > (baseline.get('web') ?? 0) &&
          (readyCounts.get('node') ?? 0) > (baseline.get('node') ?? 0)
        ) {
          clearTimeout(timeout);
          waiters.delete(waiter);
          resolve();
        }
      },
    };
    waiters.add(waiter);
    waiter.check();
  });
}

async function fetchRoutes({ origin, routePaths }) {
  const requests = [];
  for (const routePath of routePaths) {
    requests.push(await fetchRoute({ origin, routePath }));
  }
  if (requests.some(request => !request.ok)) {
    throw new Error(
      `Dev route request failed: ${requests
        .filter(request => !request.ok)
        .map(request => `${request.path} -> ${request.status}`)
        .join(', ')}`
    );
  }
  return requests;
}

async function fetchRoute({ origin, routePath }) {
  const started = performance.now();
  let lastError = null;

  while (performance.now() - started < devRouteTimeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), devRouteTimeoutMs);
    timeout.unref?.();
    try {
      const response = await fetch(new URL(routePath, origin), {
        signal: controller.signal,
      });
      const body = await response.arrayBuffer();
      return {
        path: routePath,
        status: response.status,
        ok: response.ok,
        ms: performance.now() - started,
        bytes: body.byteLength,
      };
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 250));
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    path: routePath,
    status: null,
    ok: false,
    ms: performance.now() - started,
    bytes: null,
    error: lastError?.message ?? String(lastError),
  };
}

function appendNodeOption(value, option) {
  const options = (value ?? '').split(/\s+/).filter(Boolean);
  return options.includes(option)
    ? options.join(' ')
    : [...options, option].join(' ');
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

function stopChild(child) {
  return new Promise(resolve => {
    if (child.exitCode !== null) {
      resolve();
      return;
    }
    const signalChild = signal => {
      try {
        if (process.platform === 'win32' || !child.pid) {
          child.kill(signal);
        } else {
          process.kill(-child.pid, signal);
        }
      } catch (error) {
        if (error?.code !== 'ESRCH') {
          throw error;
        }
      }
    };
    const timeout = setTimeout(() => {
      signalChild('SIGKILL');
      resolve();
    }, 5_000);
    timeout.unref?.();
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    signalChild('SIGTERM');
  });
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

function createOutputTail() {
  let output = '';

  return {
    append(chunk) {
      output += chunk.toString();
      if (output.length > MAX_CAPTURED_OUTPUT_CHARS) {
        output = output.slice(-MAX_CAPTURED_OUTPUT_CHARS);
      }
    },
    read() {
      return output;
    },
  };
}
