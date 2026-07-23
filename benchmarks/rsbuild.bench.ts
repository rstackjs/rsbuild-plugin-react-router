import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bench } from 'vitest';
import { benchmarkCases, runBenchmarkCase } from './cases.mts';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const options = {
  pluginRoot: path.resolve(process.env.BENCHMARK_PLUGIN_ROOT ?? projectRoot),
  workRoot: path.resolve(
    process.env.BENCHMARK_WORK_ROOT ??
      path.join(projectRoot, '.benchmark', 'codspeed-work')
  ),
};

for (const benchmarkCase of benchmarkCases) {
  bench(benchmarkCase.id, async () => runBenchmarkCase(benchmarkCase, options));
}
