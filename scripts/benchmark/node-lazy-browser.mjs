import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const repo = fileURLToPath(new URL('../../', import.meta.url));
const options = {
  iterations: 10,
  warmup: 1,
  'stock-repo': '',
  out: '.benchmark/node-lazy-browser.json',
  format: 'all',
  count: 'all',
};
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index].replace(/^--/, '');
  assert.ok(Object.hasOwn(options, key), `Unknown option: ${key}`);
  options[key] = ['iterations', 'warmup'].includes(key)
    ? Number(process.argv[index + 1])
    : process.argv[index + 1];
}
assert.ok(Number.isInteger(options.iterations) && options.iterations > 0);
assert.ok(Number.isInteger(options.warmup) && options.warmup >= 0);
assert.ok(['all', 'cjs', 'esm'].includes(options.format));
assert.ok(['all', '100', '1000'].includes(options.count));
const out = resolve(repo, options.out);
await mkdir(dirname(out), { recursive: true });
const result = {
  generatedAt: new Date().toISOString(),
  host: {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    cpu: cpus()[0]?.model,
  },
  methodology: {
    ...options,
    workload:
      'Issue #155 generated fixture: index page becomes interactive, then catalog/17 in a second tab.',
    timing:
      'Default watchers, module census disabled, fresh fixture/output/server/browser per trial. OS filesystem caches are not flushed. Browser launch precedes the startup clock. Startup and request metrics are separate.',
    order: 'Reverse arm order on alternating iterations; warmups excluded.',
    controls:
      'eager and candidate use the same checkout and dependencies; stock uses the supplied pre-PR checkout. All arms assert HTTP 200, SSR content, hydrated click handlers, retained text/document, and no activation reload/HDR message.',
  },
  samples: [],
  summaries: [],
};
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};
for (const format of options.format === 'all'
  ? ['cjs', 'esm']
  : [options.format]) {
  for (const count of options.count === 'all'
    ? [100, 1000]
    : [Number(options.count)]) {
    const arms = options['stock-repo']
      ? ['stock', 'eager', 'candidate']
      : ['eager', 'candidate'];
    for (
      let iteration = -options.warmup;
      iteration < options.iterations;
      iteration++
    ) {
      const pair = [];
      for (const side of Math.abs(iteration) % 2 ? [...arms].reverse() : arms) {
        const args = [
          resolve(repo, 'scripts/verify-react-lazy-catalog.mjs'),
          '--side',
          side,
          '--format',
          format,
          '--count',
          String(count),
          '--timing',
        ];
        if (side === 'stock')
          args.push('--stock-repo', resolve(options['stock-repo']));
        let stdout;
        try {
          ({ stdout } = await run(process.execPath, args, {
            cwd: repo,
            timeout: 180_000,
            maxBuffer: 10 * 1024 * 1024,
          }));
        } catch (error) {
          await writeFile(
            `${out}.failure.json`,
            JSON.stringify(
              {
                format,
                count,
                side,
                iteration,
                stdout: error.stdout,
                stderr: error.stderr,
                message: error.message,
              },
              null,
              2
            )
          );
          throw error;
        }
        const evidence = JSON.parse(stdout.trim());
        assert.equal(evidence.result, 'passed');
        const sample = { iteration, warmup: iteration < 0, ...evidence };
        pair.push(sample);
        result.samples.push(sample);
        await writeFile(out, JSON.stringify(result, null, 2) + '\n');
        console.error(
          `${format} ${count} ${side} ${iteration}: index interactive ${sample.timings.startupInteractiveMs.toFixed(1)}ms; requested SSR ${sample.timings.firstContentMs.toFixed(1)}ms; request interactive ${sample.timings.requestInteractiveMs.toFixed(1)}ms`
        );
      }
      assert.ok(
        pair.every(sample => sample.inputHash === pair[0].inputHash),
        'identical generated input for every arm'
      );
      assert.deepEqual(
        pair.find(sample => sample.side === 'eager').versions,
        pair.find(sample => sample.side === 'candidate').versions,
        'identical packages for opt-in comparison'
      );
    }
    for (const side of arms) {
      const samples = result.samples.filter(
        sample =>
          sample.format === format &&
          sample.count === count &&
          sample.side === side &&
          !sample.warmup
      );
      const timings = Object.fromEntries(
        Object.keys(samples[0].timings).map(key => {
          const values = samples.map(sample => sample.timings[key]);
          return [
            key,
            {
              median: median(values),
              min: Math.min(...values),
              max: Math.max(...values),
            },
          ];
        })
      );
      result.summaries.push({
        format,
        count,
        side,
        measured: samples.length,
        timings,
      });
    }
    await writeFile(out, JSON.stringify(result, null, 2) + '\n');
  }
}
console.log(JSON.stringify(result.summaries, null, 2));
