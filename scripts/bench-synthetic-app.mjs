#!/usr/bin/env node
import { spawn } from 'node:child_process';
import {
  copyFile,
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  allowPositionals: false,
  strict: true,
  options: {
    app: {
      type: 'string',
      default: 'benchmarks/synthetic-web-bundler-benchmark',
    },
    out: { type: 'string', default: '.benchmark/results/synthetic-app' },
    profile: { type: 'string', default: 'cold' },
    runs: { type: 'string', default: '1' },
    'plugin-root': { type: 'string', default: process.cwd() },
    'skip-install': { type: 'boolean', default: false },
    'skip-plugin-build': { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
  },
});

const workspaceRoot = process.cwd();
const appRoot = path.resolve(workspaceRoot, values.app);
const pluginRoot = path.resolve(workspaceRoot, values['plugin-root']);
const outDir = path.resolve(workspaceRoot, values.out);
const pluginImport = 'rsbuild-plugin-react-router';
const stagedPluginPackage = path.join(appRoot, 'node_modules', pluginImport);

const benchmarkArgs = [
  `--runs=${values.runs}`,
  `--profile=${values.profile}`,
  `--out=${outDir}`,
];

const prepareCommands = [
  ...(!values['skip-plugin-build']
    ? [{ cwd: pluginRoot, command: 'pnpm', args: ['build'] }]
    : []),
  ...(!values['skip-install']
    ? [
        {
          cwd: appRoot,
          command: 'pnpm',
          args: ['install', '--frozen-lockfile'],
        },
      ]
    : []),
];
const benchmarkCommand = {
  cwd: appRoot,
  command: 'pnpm',
  args: ['benchmark:rsbuild', '--', ...benchmarkArgs],
  env: {
    SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE: '1',
    SYNTHETIC_REACT_ROUTER_PLUGIN_IMPORT: pluginImport,
  },
};
const commands = [...prepareCommands, benchmarkCommand];

if (values['dry-run']) {
  console.log(
    JSON.stringify(
      {
        appRoot,
        pluginRoot,
        stagedPluginPackage,
        pluginImport,
        outDir,
        commands,
      },
      null,
      2
    )
  );
  process.exit(0);
}

const started = Date.now();
await mkdir(outDir, { recursive: true });
const existingBenchmarkFiles = new Set(await findBenchmarkJsonFiles(outDir));

for (const { cwd, command, args, env } of prepareCommands) {
  await run(command, args, cwd, env);
}

await stagePluginPackage();
await run(
  benchmarkCommand.command,
  benchmarkCommand.args,
  benchmarkCommand.cwd,
  benchmarkCommand.env
);

const generatedFiles = (await findBenchmarkJsonFiles(outDir)).filter(
  file => !existingBenchmarkFiles.has(file)
);
if (generatedFiles.length === 0) {
  throw new Error(`No rsbuild benchmark JSON files were written to ${outDir}`);
}

await writeFile(
  path.join(outDir, 'latest.json'),
  `${JSON.stringify(
    {
      benchmark: 'embedded-synthetic-rsbuild',
      generatedAt: new Date().toISOString(),
      durationSeconds: (Date.now() - started) / 1000,
      appRoot,
      pluginRoot,
      stagedPluginPackage,
      pluginImport,
      outputDirectory: outDir,
      generatedFiles,
      command: {
        runs: Number(values.runs),
        profile: values.profile,
      },
    },
    null,
    2
  )}\n`
);

console.log(
  `Synthetic app benchmark manifest written to ${outDir}/latest.json`
);

function run(command, args, cwd, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      shell: process.platform === 'win32',
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(' ')} failed with ${code ?? signal} in ${cwd}`
        )
      );
    });
  });
}

async function stagePluginPackage() {
  await mkdir(path.dirname(stagedPluginPackage), { recursive: true });
  await rm(stagedPluginPackage, { force: true, recursive: true });
  await mkdir(stagedPluginPackage, { recursive: true });
  await copyFile(
    path.join(pluginRoot, 'package.json'),
    path.join(stagedPluginPackage, 'package.json')
  );
  await cp(
    path.join(pluginRoot, 'dist'),
    path.join(stagedPluginPackage, 'dist'),
    {
      recursive: true,
    }
  );
}

async function findBenchmarkJsonFiles(directory) {
  const files = await readdir(directory);
  const candidates = files
    .filter(file => file.endsWith('-rsbuild.json'))
    .sort();

  const validFiles = [];
  for (const file of candidates) {
    const payload = JSON.parse(
      await readFile(path.join(directory, file), 'utf8')
    );
    if (Array.isArray(payload.summaries)) {
      validFiles.push(file);
    }
  }
  return validFiles;
}
