import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
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

await run(process.execPath, [path.join(root, 'scripts/generate-app.mjs')]);

const results = [];
const selectedProfiles = profile === 'both' ? ['cold', 'warm'] : [profile];

for (const selectedProfile of selectedProfiles) {
  if (selectedProfile === 'warm') {
    await clean();
    await build('warmup');
  }

  for (let index = 1; index <= runs; index += 1) {
    if (selectedProfile === 'cold') {
      await clean();
    }
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
