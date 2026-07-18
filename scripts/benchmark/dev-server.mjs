import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

// Rsbuild 2.x announces per-environment readiness with a trailing
// `(<environment>)` token, e.g. `ready   built in 0.51s (node)` /
// `ready   built in 0.74s (web)`. The environment name is captured
// generically (any identifier); which environments to wait for is decided by
// the caller via `readyEnvironments`.
const READY_LOG_PATTERN = /ready\s+built in .*?\(([\w:-]+)\)/gi;

const MAX_CAPTURED_OUTPUT_CHARS = 128 * 1024;

export const appendNodeOption = (value, option) => {
  const options = (value ?? '').split(/\s+/).filter(Boolean);
  return options.includes(option)
    ? options.join(' ')
    : [...options, option].join(' ');
};

export const stripAnsi = value => value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');

export const createOutputTail = (limit = MAX_CAPTURED_OUTPUT_CHARS) => {
  let output = '';

  return {
    append(chunk) {
      output += chunk.toString();
      if (output.length > limit) {
        output = output.slice(-limit);
      }
    },
    read() {
      return output;
    },
  };
};

export const createReadyLogObserver = onReady => {
  const buffers = new Map([
    ['stdout', ''],
    ['stderr', ''],
  ]);

  return {
    observe(stream, chunk) {
      const text = `${buffers.get(stream) ?? ''}${chunk}`;
      const lines = text.split(/\r?\n/);
      buffers.set(stream, lines.pop() ?? '');

      for (const match of stripAnsi(lines.join('\n')).matchAll(
        READY_LOG_PATTERN
      )) {
        onReady(match[1].toLowerCase());
      }
    },
  };
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDevRoute = async ({
  origin,
  routePath,
  timeoutMs,
  retryDelayMs = 0,
}) => {
  const startedAt = performance.now();
  let lastError = null;

  while (performance.now() - startedAt < timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
        ms: performance.now() - startedAt,
        bytes: body.byteLength,
      };
    } catch (error) {
      lastError = error;
      if (retryDelayMs <= 0) {
        break;
      }
      await delay(retryDelayMs);
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    path: routePath,
    status: null,
    ok: false,
    ms: performance.now() - startedAt,
    bytes: null,
    error:
      lastError?.name === 'AbortError'
        ? `Timed out after ${timeoutMs} ms`
        : (lastError?.stack ?? lastError?.message ?? String(lastError)),
  };
};

export const fetchDevRoutes = async ({
  origin,
  routePaths,
  timeoutMs,
  retryDelayMs = 0,
}) => {
  const requests = [];
  for (const routePath of routePaths) {
    requests.push(
      await fetchDevRoute({ origin, routePath, timeoutMs, retryDelayMs })
    );
  }
  return requests;
};

export const createFileUpdate = async ({
  file,
  marker = '__benchmarkUpdateMarker',
}) => {
  const source = await readFile(file, 'utf8');
  const pattern = new RegExp(`\\nexport const ${marker} = \\d+;\\n$`);
  await writeFile(
    file,
    `${source.replace(pattern, '')}\nexport const ${marker} = ${Date.now()};\n`
  );
  return () => writeFile(file, source);
};

export const stopProcessTree = (child, { onError } = {}) =>
  new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) {
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
          onError?.(error);
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

export const runDevServerBenchmark = async ({
  command,
  args,
  cwd,
  env = {},
  shell = process.platform === 'win32',
  // The exact set of environments that must print a ready line before startup
  // is considered complete. The caller derives this from the fixture (the
  // plugin builds `web` + `node` dev environments for both ssr and spa apps).
  readyEnvironments,
  origin,
  routePaths = [],
  routeTimeoutMs,
  routeRetryDelayMs = 0,
  updateFile,
  updateRoutePaths = [],
  updateMarker,
  timeoutMs,
  captureOutput = true,
  stopAfterReady = true,
}) =>
  new Promise(resolve => {
    const startedAt = performance.now();
    const requiredReady = new Set(readyEnvironments);
    const readyCounts = new Map();
    const output = createOutputTail();
    const readyObserver = createReadyLogObserver(environment => {
      readyCounts.set(environment, (readyCounts.get(environment) ?? 0) + 1);
    });

    let stdout = '';
    let stderr = '';
    let ready = false;
    let readyMs = null;
    let routeTotalMs = null;
    let routeRequests = [];
    let updateMs = null;
    let updateRouteTotalMs = null;
    let updateRouteRequests = [];
    let readyTask = null;
    let statusAfterReady = 0;
    let timedOut = false;
    let settled = false;
    let stopping = false;

    const child = spawn(command, args, {
      cwd,
      detached: process.platform !== 'win32',
      env: { ...process.env, ...env },
      shell,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const appendError = error => {
      stderr += `${error.stack ?? error.message}\n`;
    };

    const stopChild = () => {
      if (child.exitCode !== null || child.signalCode !== null || stopping) {
        return;
      }
      stopping = true;
      void stopProcessTree(child, { onError: appendError });
    };

    const finish = (status, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutTimer);
      resolve({
        status,
        signal,
        stdout,
        stderr,
        output: output.read(),
        wallMs: performance.now() - startedAt,
        readyMs,
        routeTotalMs,
        routeRequests,
        updateMs,
        updateRouteTotalMs,
        updateRouteRequests,
        timedOut,
      });
    };

    const isReadyPastBaseline = baselineCounts =>
      [...requiredReady].every(
        environment =>
          (readyCounts.get(environment) ?? 0) >
          (baselineCounts.get(environment) ?? 0)
      );

    const waitForNextReady = baselineCounts =>
      new Promise((resolveReady, rejectReady) => {
        const check = () => {
          if (
            settled ||
            timedOut ||
            child.exitCode !== null ||
            child.signalCode !== null
          ) {
            clearInterval(interval);
            rejectReady(
              new Error('Dev server exited before update rebuild completed.')
            );
            return true;
          }
          if (isReadyPastBaseline(baselineCounts)) {
            clearInterval(interval);
            resolveReady();
            return true;
          }
          return false;
        };
        const interval = setInterval(check, 25);
        check();
      });

    const handleReady = async () => {
      readyMs = performance.now() - startedAt;

      if (routePaths.length > 0) {
        const routeStartedAt = performance.now();
        routeRequests = await fetchDevRoutes({
          origin,
          routePaths,
          timeoutMs: routeTimeoutMs,
          retryDelayMs: routeRetryDelayMs,
        });
        routeTotalMs = performance.now() - routeStartedAt;
        if (routeRequests.some(request => !request.ok)) {
          statusAfterReady = 1;
        }
      }

      if (updateFile) {
        let restoreUpdateFile = null;
        const updateStartedAt = performance.now();
        const baselineCounts = new Map(readyCounts);
        try {
          restoreUpdateFile = await createFileUpdate({
            file: updateFile,
            marker: updateMarker,
          });
          await waitForNextReady(baselineCounts);
          updateMs = performance.now() - updateStartedAt;

          if (updateRoutePaths.length > 0) {
            const updateRouteStartedAt = performance.now();
            updateRouteRequests = await fetchDevRoutes({
              origin,
              routePaths: updateRoutePaths,
              timeoutMs: routeTimeoutMs,
              retryDelayMs: routeRetryDelayMs,
            });
            updateRouteTotalMs = performance.now() - updateRouteStartedAt;
            if (updateRouteRequests.some(request => !request.ok)) {
              statusAfterReady = 1;
            }
          }
        } catch (error) {
          statusAfterReady = 1;
          appendError(error);
        } finally {
          if (restoreUpdateFile) {
            await restoreUpdateFile();
          }
        }
      }

      if (stopAfterReady) {
        stopChild();
      }
    };

    const observe = stream => chunk => {
      const text = String(chunk);
      output.append(text);
      if (stream === 'stdout') {
        stdout += text;
        if (captureOutput) {
          process.stdout.write(text);
        }
      } else {
        stderr += text;
        if (captureOutput) {
          process.stderr.write(text);
        }
      }
      readyObserver.observe(stream, text);

      if (
        !ready &&
        [...requiredReady].every(environment => readyCounts.has(environment))
      ) {
        ready = true;
        readyTask = handleReady();
      }
    };

    child.stdout?.on('data', observe('stdout'));
    child.stderr?.on('data', observe('stderr'));

    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      // Fail loudly about *why* we timed out: report which expected
      // environments never printed a ready line vs. which did, so a renamed
      // or removed dev environment surfaces as an actionable message instead
      // of an opaque hang.
      if (!ready) {
        const awaiting = [...requiredReady].filter(
          environment => !readyCounts.has(environment)
        );
        const seen = [...readyCounts.keys()];
        appendError(
          new Error(
            `Dev server did not become ready within ${timeoutMs} ms. ` +
              `Awaiting ready lines for environment(s): ` +
              `[${awaiting.join(', ')}]. ` +
              `Environments observed ready: [${seen.join(', ') || '(none)'}]. ` +
              `Readiness is matched against rsbuild ` +
              `"ready built in ... (<env>)" lines; if the plugin renamed a ` +
              `dev environment, update the expected environments in ` +
              `benchmarks/cases.mts.`
          )
        );
      }
      stopChild();
    }, timeoutMs);
    timeoutTimer.unref?.();

    child.on('error', error => {
      appendError(error);
      finish(1, null);
    });
    child.on('exit', (code, signal) => {
      if (ready) {
        readyTask?.then(
          () =>
            finish(
              stopping || code === null || code === 0 ? statusAfterReady : code,
              signal
            ),
          error => {
            appendError(error);
            finish(1, signal);
          }
        );
        return;
      }
      finish(code ?? 1, signal);
    });
  });
