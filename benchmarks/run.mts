import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { benchmarkCases, runBenchmarkCase } from './cases.mts';

const harnessRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const parseInteger = (
  value: string,
  option: '--iterations' | '--warmup',
  minimum: number
) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum) {
    throw new Error(
      `${option} must be a ${minimum === 0 ? 'non-negative' : 'positive'} integer.`
    );
  }
  return parsed;
};

const median = (samplesMs: number[]) => {
  const samples = [...samplesMs].sort((left, right) => left - right);
  const middle = Math.floor(samples.length / 2);
  return samples.length % 2 === 0
    ? (samples[middle - 1] + samples[middle]) / 2
    : samples[middle];
};

const writeJsonAtomically = async (file: string, value: unknown) => {
  const directory = path.dirname(file);
  const temporaryFile = path.join(
    directory,
    `.${path.basename(file)}.${process.pid}.tmp`
  );

  await mkdir(directory, { recursive: true });
  await writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporaryFile, file);
};

const parseRunnerOptions = (argv: string[]) => {
  const { values } = parseArgs({
    args: argv,
    allowPositionals: false,
    strict: true,
    options: {
      'plugin-root': { type: 'string', default: process.cwd() },
      out: {
        type: 'string',
        default: path.join('.benchmark', 'results', 'local.json'),
      },
      iterations: { type: 'string', default: '3' },
      warmup: { type: 'string', default: '1' },
      case: { type: 'string', multiple: true },
    },
  });
  const selectedIds = values.case ?? benchmarkCases.map(({ id }) => id);
  const selectedCases = [];
  const seenIds = new Set<string>();

  for (const id of selectedIds) {
    const definition = benchmarkCases.find(candidate => candidate.id === id);
    if (!definition) {
      throw new Error(`Unknown benchmark case "${id}".`);
    }
    if (seenIds.has(id)) {
      throw new Error(`Duplicate benchmark case "${id}".`);
    }
    seenIds.add(id);
    selectedCases.push(definition);
  }

  return {
    iterations: parseInteger(values.iterations, '--iterations', 1),
    warmup: parseInteger(values.warmup, '--warmup', 0),
    out: path.resolve(values.out),
    pluginRoot: path.resolve(values['plugin-root']),
    selectedCases,
  };
};

export const run = async (
  argv: string[],
  executeCase: typeof runBenchmarkCase = runBenchmarkCase
) => {
  const { iterations, warmup, out, pluginRoot, selectedCases } =
    parseRunnerOptions(argv);
  const cases = [];
  const workRoot = path.join(harnessRoot, '.benchmark', 'local-work');

  for (const [caseIndex, definition] of selectedCases.entries()) {
    const samplesMs = [];

    for (let runIndex = 0; runIndex < warmup + iterations; runIndex += 1) {
      const result = await executeCase(definition, {
        pluginRoot,
        workRoot,
        port: 43000 + caseIndex * 100 + runIndex,
      });
      if (!Number.isFinite(result.wallMs)) {
        throw new Error(
          `Benchmark case "${definition.id}" produced a non-finite sample.`
        );
      }
      if (runIndex >= warmup) {
        samplesMs.push(result.wallMs);
      }
    }

    cases.push({
      id: definition.id,
      samplesMs,
      medianMs: median(samplesMs),
    });
  }

  await writeJsonAtomically(out, { version: 1, pluginRoot, cases });
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  void run(process.argv.slice(2)).catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
