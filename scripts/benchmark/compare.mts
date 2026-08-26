import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  compareBenchmarkResults,
  renderBenchmarkComment,
} from './compare-model.mts';

const readJson = async (file: string) =>
  JSON.parse(await readFile(file, 'utf8'));

const requiredOption = (value: string | undefined, option: string) => {
  if (!value) {
    throw new Error(`${option} is required.`);
  }
  return path.resolve(value);
};

export const run = async (argv: string[]) => {
  const { values } = parseArgs({
    args: argv,
    allowPositionals: false,
    strict: true,
    options: {
      base: { type: 'string' },
      head: { type: 'string' },
      out: { type: 'string' },
    },
  });
  const baseFile = requiredOption(values.base, '--base');
  const headFile = requiredOption(values.head, '--head');
  const outDirectory = requiredOption(values.out, '--out');
  const [base, head] = await Promise.all([
    readJson(baseFile),
    readJson(headFile),
  ]);
  const report = compareBenchmarkResults(base, head);

  await mkdir(outDirectory, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(outDirectory, 'report.json'),
      `${JSON.stringify(report, null, 2)}\n`
    ),
    writeFile(
      path.join(outDirectory, 'comment.md'),
      renderBenchmarkComment(report)
    ),
  ]);
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
