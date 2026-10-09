import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { cpus, platform, arch, release } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createReactLazyCatalogFixture } from '../fixtures/react-lazy-catalog.mjs';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const options = {
  iterations: 10,
  warmup: 1,
  out: '.benchmark/node-lazy.json',
  format: 'all',
  count: 'all',
};
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index].replace(/^--/, '');
  assert.ok(Object.hasOwn(options, key), `Unknown option: ${key}`);
  options[key] = ['out', 'format', 'count'].includes(key)
    ? process.argv[index + 1]
    : Number(process.argv[index + 1]);
}
assert.ok(Number.isInteger(options.iterations) && options.iterations > 0);
assert.ok(Number.isInteger(options.warmup) && options.warmup >= 0);
assert.ok(['all', 'cjs', 'esm'].includes(options.format));
assert.ok(['all', '100', '1000'].includes(options.count));

async function measure(format, count, lazy) {
  const root = await mkdtemp(join(repo, 'tests/.tmp-node-lazy-bench-'));
  let child;
  let exited;
  let logs = '';
  const errors = [];
  try {
    await createReactLazyCatalogFixture(root, count, format);
    const start = performance.now();
    let onReady;
    const ready = new Promise((accept, reject) => {
      onReady = { accept, reject };
    });
    child = spawn(
      process.execPath,
      [
        '--experimental-vm-modules',
        join(repo, 'scripts/verify-react-lazy-catalog.mjs'),
        '--server',
        lazy ? 'candidate' : 'stock',
        root,
      ],
      {
        cwd: repo,
        env: {
          ...process.env,
          ROUTER_STOCK_REPO: repo,
          ROUTER_CATALOG_BENCHMARK: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      }
    );
    const timer = setTimeout(
      () => onReady.reject(new Error(`Server timeout: ${logs}`)),
      120_000
    );
    child.stdout.on('data', data => {
      logs = (logs + data).slice(-50_000);
    });
    child.stderr.on('data', data => {
      logs = (logs + data).slice(-50_000);
    });
    child.on('error', error => onReady.reject(error));
    child.on('message', message => {
      if (message.event === 'ready')
        onReady.accept({ ...message, startupMs: performance.now() - start });
      if (message.event === 'error') errors.push(message.message);
    });
    exited = new Promise(accept =>
      child.on('exit', (code, signal) => {
        onReady.reject(
          new Error(`Server exited (${code}, ${signal}): ${logs}`)
        );
        accept({ code, signal });
      })
    );
    const server = await ready.finally(() => clearTimeout(timer));
    const request = async item => {
      const began = performance.now();
      const response = await fetch(`${server.url}/catalog/${item}`, {
        signal: AbortSignal.timeout(60_000),
      });
      const headersMs = performance.now() - began;
      const body = await response.text();
      const completeMs = performance.now() - began;
      assert.equal(response.status, 200);
      const hasRequestedItem = body.includes(`>Optional item ${item}</p>`);
      if (!hasRequestedItem) {
        await writeFile(
          `${out}.failure.json`,
          JSON.stringify(
            { format, count, lazy, item, body, errors, logs },
            null,
            2
          )
        );
      }
      assert.ok(
        hasRequestedItem,
        'original SSR response includes requested content'
      );
      return { headersMs, completeMs };
    };
    const first = await request(17);
    const startupThroughFirstResponseMs = performance.now() - start;
    const repeated = [];
    for (let index = 0; index < 5; index++) repeated.push(await request(17));
    const second = await request(18);
    assert.deepEqual(errors, []);
    return {
      format,
      count,
      lazy,
      versions: server.versions,
      startupMs: server.startupMs,
      firstResponseHeadersMs: first.headersMs,
      firstResponseCompleteMs: first.completeMs,
      startupThroughFirstResponseMs,
      repeatedResponseCompleteMs: repeated.map(value => value.completeMs),
      secondColdResponseCompleteMs: second.completeMs,
    };
  } finally {
    if (child?.connected) child.send({ event: 'close' });
    if (child && exited) {
      const timer = setTimeout(() => child.kill('SIGKILL'), 10_000);
      await exited;
      clearTimeout(timer);
    }
    await rm(root, { recursive: true, force: true });
  }
}

function distribution(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return {
    median:
      sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2,
    min: sorted[0],
    max: sorted.at(-1),
  };
}

const result = {
  generatedAt: new Date().toISOString(),
  host: {
    platform: platform(),
    arch: arch(),
    release: release(),
    cpu: cpus()[0]?.model,
    node: process.version,
  },
  methodology: {
    ...options,
    comparison:
      'Same checkout, packages and generated app; only unstableServerLazyCompilation changes.',
    isolation:
      'Fresh fixture, output directory and Node process for each sample; OS filesystem caches are not flushed.',
    order:
      'Alternating eager/lazy pairs; warmup pairs excluded from summaries.',
    instrumentation:
      'Module census disabled; default watcher settings. Compilation census is verified separately by native and browser tests.',
    startup:
      'Process launch through initial compilation and loading the SSR runtime, ready to serve SSR.',
    request:
      'Direct HTTP GET to catalog/17 immediately after server readiness; full SSR body, no browser hydration.',
    repeated:
      'Five subsequent requests to the same item, then a first request to catalog/18.',
  },
  samples: [],
  summaries: [],
};
const out = resolve(repo, options.out);
await mkdir(dirname(out), { recursive: true });
for (const format of options.format === 'all'
  ? ['cjs', 'esm']
  : [options.format]) {
  for (const count of options.count === 'all'
    ? [100, 1000]
    : [Number(options.count)]) {
    for (
      let iteration = -options.warmup;
      iteration < options.iterations;
      iteration++
    ) {
      const pair = [];
      for (const lazy of Math.abs(iteration) % 2
        ? [true, false]
        : [false, true]) {
        const sample = {
          iteration,
          warmup: iteration < 0,
          ...(await measure(format, count, lazy)),
        };
        pair.push(sample);
        result.samples.push(sample);
        console.error(
          `${format} ${count} ${lazy ? 'lazy' : 'eager'} ${iteration}: startup ${sample.startupMs.toFixed(1)}ms; first SSR ${sample.firstResponseCompleteMs.toFixed(1)}ms`
        );
        await writeFile(out, JSON.stringify(result, null, 2) + '\n');
      }
      assert.deepEqual(
        pair[0].versions,
        pair[1].versions,
        'both sides use identical packages'
      );
    }
    for (const lazy of [false, true]) {
      const samples = result.samples.filter(
        sample =>
          sample.format === format &&
          sample.count === count &&
          sample.lazy === lazy &&
          !sample.warmup
      );
      const metrics = {};
      for (const metric of [
        'startupMs',
        'firstResponseHeadersMs',
        'firstResponseCompleteMs',
        'startupThroughFirstResponseMs',
        'secondColdResponseCompleteMs',
      ]) {
        metrics[metric] = distribution(samples.map(sample => sample[metric]));
      }
      metrics.repeatedResponseCompleteMs = distribution(
        samples.map(
          sample => distribution(sample.repeatedResponseCompleteMs).median
        )
      );
      result.summaries.push({
        format,
        count,
        lazy,
        samples: samples.length,
        metrics,
      });
    }
    await writeFile(out, JSON.stringify(result, null, 2) + '\n');
  }
}
console.log(JSON.stringify(result.summaries, null, 2));
const report = [
  '# Node lazy compilation: eager versus lazy',
  '',
  `${options.iterations} measured pairs per scenario, ${options.warmup} excluded warmup pair(s). Alternating order; fresh process and fixture each time; identical dependencies. OS filesystem caches are not flushed.`,
  '',
  `Host: ${result.host.platform} ${result.host.arch}; ${result.host.cpu}; Node ${result.host.node}.`,
  '',
  'Median milliseconds. Startup includes initial compilation and loading the SSR runtime. First SSR is the complete response to a direct request immediately after readiness, including the requested optional component. Total is measured from process launch through that response. Repeat is the median of five further requests per sample. Default watcher settings; module census disabled. These HTTP timings do not include browser hydration.',
  '',
  '| Format | Optional modules | Mode | Startup | First SSR | Total | Repeat SSR | Second cold SSR |',
  '| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |',
  ...result.summaries.map(
    ({ format, count, lazy, metrics }) =>
      `| ${format} | ${count} | ${lazy ? 'lazy' : 'eager'} | ${['startupMs', 'firstResponseCompleteMs', 'startupThroughFirstResponseMs', 'repeatedResponseCompleteMs', 'secondColdResponseCompleteMs'].map(metric => metrics[metric].median.toFixed(1)).join(' | ')} |`
  ),
  '',
  'Every sample asserts HTTP 200 and real SSR content for both cold requests and all repeated requests. Compiled-module counts and browser state are verified separately, outside timed runs. Raw JSON includes all warmup and measured samples, package versions, ranges, and the five repeat timings.',
  '',
];
await writeFile(`${out}.md`, report.join('\n'));
