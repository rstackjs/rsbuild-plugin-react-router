import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import {
  formatMarkdown,
  getModeBuildConfig,
  isReactRouterPerformanceLoggingEnabled,
  parseArgs,
  parseReactRouterPerformanceLogs,
  summarizeResults,
} from './rsbuild-mode-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { modes, out, profile, runs } = parseArgs(process.argv.slice(2));
const logReactRouterPerformance = isReactRouterPerformanceLoggingEnabled();

await run(process.execPath, [path.join(root, 'scripts/generate-app.mjs')]);

const results = [];
const selectedProfiles = profile === 'both' ? ['cold', 'warm'] : [profile];

for (const selectedProfile of selectedProfiles) {
  for (const mode of modes) {
    if (selectedProfile === 'warm') {
      await clean(mode);
      await build(mode, 'warmup');
    }

    for (let index = 1; index <= runs; index += 1) {
      if (selectedProfile === 'cold') {
        await clean(mode);
      }
      const started = performance.now();
      const buildLogs = await build(
        mode,
        `${selectedProfile} ${index}/${runs}`
      );
      const durationSeconds = (performance.now() - started) / 1000;
      const result = {
        mode,
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
        `${mode} ${selectedProfile} ${index}/${runs}: ${durationSeconds.toFixed(
          2
        )}s`
      );
    }
  }
}

const generatedAt = new Date().toISOString();
const summaries = selectedProfiles.flatMap(selectedProfile =>
  summarizeResults(
    results.filter(result => result.profile === selectedProfile)
  ).map(summary => ({ ...summary, profile: selectedProfile }))
);
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
  path.join(output, `${stamp}-rsbuild-modes.json`),
  `${JSON.stringify(payload, null, 2)}\n`
);
const markdown = formatMarkdown(payload);
await fs.writeFile(path.join(output, `${stamp}-rsbuild-modes.md`), markdown);
console.log(markdown);

async function clean(mode) {
  await Promise.all(
    [
      path.join(root, 'dist', mode),
      path.join(root, '.react-router'),
      path.join(root, '.cache'),
      path.join(root, 'node_modules/.cache'),
    ].map(target => fs.rm(target, { force: true, recursive: true }))
  );
}

async function build(mode, label) {
  console.log(`Starting ${mode} build (${label})...`);
  const modeConfig = getModeBuildConfig(mode);

  return run(
    rsbuildBinary(),
    ['build', '--config', modeConfig.config],
    buildEnv(mode),
    true
  );
}

function buildEnv(mode, extra = {}) {
  const modeConfig = getModeBuildConfig(mode);
  return {
    ...process.env,
    ...modeConfig.env,
    ...extra,
    NODE_ENV: 'production',
    SYNTHETIC_BUILD_DIR: `dist/${mode}`,
  };
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
      stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    let output = '';
    if (quiet) {
      child.stdout.on('data', chunk => {
        output += chunk.toString();
      });
      child.stderr.on('data', chunk => {
        output += chunk.toString();
      });
    }
    child.on('error', reject);
    child.on('exit', (code, signal) =>
      code === 0
        ? resolve(output)
        : reject(
            new Error(
              [
                `${command} exited with ${code ?? signal}`,
                output.trim().split(/\r?\n/).slice(-120).join('\n'),
              ]
                .filter(Boolean)
                .join('\n\n')
            )
          )
    );
  });
}
