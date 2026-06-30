import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';
import { parseArgs as parseCliArgs } from 'node:util';
import { Effect } from 'effect';
import { execa } from 'execa';
import {
  runScriptEffect,
  tryScriptPromise,
  tryScriptSync,
} from './script-effect.mts';

const DEFAULT_SUPPORT_REPO =
  '/home/zack/Downloads/openai-support/synthetic-build-repro/synthetic-web-bundler-benchmark';
const DEFAULT_RESULT_DIR = '.benchmark/results/support-repro';
const DEFAULT_WORKDIR = '.benchmark/support-repro/workdir';
const DEFAULT_SUPPORT_MODES = 'rsbuild-optimized';
const PLUGIN_PACKAGE_NAME = 'rsbuild-plugin-react-router';

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type PackagePlacement = 'dependencies' | 'devDependencies' | undefined;

type SupportReproOptions = {
  dryRun: boolean;
  logPerformance: boolean;
  modes: string;
  out: string;
  packageSpec: string;
  profile: string;
  repo: string;
  rspackProfile?: string;
  runs: number;
  skipBuild: boolean;
  workdir: string;
};

type SupportReproCliOptions = SupportReproOptions & { help: boolean };

type InstalledPackage = {
  placement: PackagePlacement;
  spec?: string;
};

type CommandSpec = {
  command: string;
  args: string[];
  cwd: string;
  env?: Record<string, string>;
};

const usage = `Run the exact synthetic support-repo Rsbuild benchmark.

Usage:
  pnpm bench:support-repro [options]

Options:
  --repo=<path>            Support benchmark repo. Defaults to REACT_ROUTER_SUPPORT_BENCHMARK_REPO or ${DEFAULT_SUPPORT_REPO}
  --workdir=<path>         Disposable local copy to run. Default: ${DEFAULT_WORKDIR}
  --runs=<count>           Number of support benchmark runs. Default: 3
  --profile=<name>         Support benchmark profile: cold, warm, or both. Default: cold
  --modes=<list>           Support benchmark modes. Default: ${DEFAULT_SUPPORT_MODES}
  --package=<spec>         local, installed, or a package spec. Default: local
  --skip-build             Skip building this plugin before packing --package=local
  --rspack-profile=<name>  Pass RSPACK_PROFILE to the support benchmark
  --out=<path>             Write wrapper metadata. Default: ${DEFAULT_RESULT_DIR}
  --dry-run                Print the benchmark command without running it
  --help                   Show this help
`;

export const parseSupportReproArgs = (
  argv: readonly string[],
  env: NodeJS.ProcessEnv = process.env
): Effect.Effect<SupportReproCliOptions, Error, never> =>
  tryScriptSync(() => {
    const args = argv[0] === '--' ? argv.slice(1) : argv;
    const { values } = parseCliArgs({
      args: [...args],
      allowPositionals: false,
      options: {
        'dry-run': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        'log-performance': { type: 'boolean', default: true },
        modes: { type: 'string', default: DEFAULT_SUPPORT_MODES },
        out: { type: 'string', default: DEFAULT_RESULT_DIR },
        package: { type: 'string', default: 'local' },
        profile: { type: 'string', default: 'cold' },
        repo: {
          type: 'string',
          default:
            env.REACT_ROUTER_SUPPORT_BENCHMARK_REPO ?? DEFAULT_SUPPORT_REPO,
        },
        'rspack-profile': { type: 'string' },
        runs: { type: 'string', default: '3' },
        'skip-build': { type: 'boolean', default: false },
        workdir: { type: 'string', default: DEFAULT_WORKDIR },
      },
      strict: true,
    });

    const runs = Number(values.runs);
    if (!Number.isInteger(runs) || runs < 1) {
      throw new Error('--runs must be a positive integer.');
    }

    return {
      dryRun: values['dry-run'] ?? false,
      help: values.help ?? false,
      logPerformance: values['log-performance'] ?? true,
      modes: values.modes ?? DEFAULT_SUPPORT_MODES,
      out: values.out ?? DEFAULT_RESULT_DIR,
      packageSpec: values.package ?? 'local',
      profile: values.profile ?? 'cold',
      repo: resolve(values.repo ?? DEFAULT_SUPPORT_REPO),
      rspackProfile: values['rspack-profile'],
      runs,
      skipBuild: values['skip-build'] ?? false,
      workdir: values.workdir ?? DEFAULT_WORKDIR,
    };
  });

const readPackageJson = (
  repo: string
): Effect.Effect<PackageJson, Error, never> =>
  tryScriptPromise(async () => {
    const contents = await readFile(join(repo, 'package.json'), 'utf8');
    return JSON.parse(contents) as PackageJson;
  });

const validateSupportRepo = (repo: string): Effect.Effect<void, Error, never> =>
  readPackageJson(repo).pipe(
    Effect.flatMap(pkg =>
      tryScriptSync(() => {
        if (!pkg.scripts?.['benchmark:rsbuild-modes']) {
          throw new Error(
            `${repo} is missing the benchmark:rsbuild-modes script.`
          );
        }
      })
    )
  );

const findInstalledPackage = (pkg: PackageJson): InstalledPackage => {
  const dependencySpec = pkg.dependencies?.[PLUGIN_PACKAGE_NAME];
  if (dependencySpec) {
    return { placement: 'dependencies', spec: dependencySpec };
  }
  const devDependencySpec = pkg.devDependencies?.[PLUGIN_PACKAGE_NAME];
  if (devDependencySpec) {
    return { placement: 'devDependencies', spec: devDependencySpec };
  }
  return { placement: undefined };
};

const ignoredSupportRepoEntries = new Set([
  '.git',
  '.react-router',
  'benchmark-results',
  'dist',
  'node_modules',
]);

export const isCopiedSupportEntry = (entryName: string): boolean => {
  if (ignoredSupportRepoEntries.has(entryName)) {
    return false;
  }
  if (entryName.startsWith('.rspack-profile-')) {
    return false;
  }
  return true;
};

const removeTree = (target: string): Effect.Effect<void, Error, never> =>
  tryScriptPromise(() =>
    rm(target, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    })
  );

export const materializeSupportBenchmarkRepo = ({
  sourceRepo,
  workdir,
}: {
  sourceRepo: string;
  workdir: string;
}): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    yield* validateSupportRepo(sourceRepo);
    yield* removeTree(workdir);
    yield* tryScriptPromise(() => mkdir(workdir, { recursive: true }));
    const entries = yield* tryScriptPromise(() =>
      readdir(sourceRepo, { withFileTypes: true })
    );
    yield* Effect.forEach(
      entries.filter(entry => isCopiedSupportEntry(entry.name)),
      entry =>
        tryScriptPromise(() =>
          cp(join(sourceRepo, entry.name), join(workdir, entry.name), {
            dereference: false,
            errorOnExist: false,
            force: true,
            recursive: true,
          })
        )
    );
    yield* validateSupportRepo(workdir);
  });

const listResultFiles = (
  repo: string
): Effect.Effect<Set<string>, Error, never> =>
  tryScriptPromise(async () => {
    const resultDir = join(repo, 'benchmark-results');
    try {
      const files = await readdir(resultDir);
      return new Set(files.filter(file => file.includes('rsbuild-modes')));
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return new Set<string>();
      }
      throw error;
    }
  });

const relativeResultFiles = (repo: string, files: Set<string>): string[] =>
  [...files]
    .sort()
    .map(file => relative(repo, join(repo, 'benchmark-results', file)));

const runCommand = ({
  command,
  args,
  cwd,
  env,
}: CommandSpec): Effect.Effect<void, Error, never> =>
  tryScriptPromise(async () => {
    await execa(command, args, {
      cwd,
      env,
      stderr: 'inherit',
      stdout: 'inherit',
      stdin: 'ignore',
    });
  });

const packLocalPlugin = ({
  root,
  skipBuild,
}: {
  root: string;
  skipBuild: boolean;
}): Effect.Effect<string, Error, never> =>
  Effect.gen(function* () {
    if (!skipBuild) {
      yield* runCommand({ command: 'pnpm', args: ['build'], cwd: root });
    }

    const packDir = join(
      root,
      '.benchmark',
      'support-repro',
      `package-${Date.now()}`
    );
    yield* removeTree(packDir);
    yield* tryScriptPromise(() => mkdir(packDir, { recursive: true }));
    yield* runCommand({
      command: 'pnpm',
      args: ['pack', '--pack-destination', packDir],
      cwd: root,
    });

    const files = yield* tryScriptPromise(() => readdir(packDir));
    const tarball = files.find(file => file.endsWith('.tgz'));
    if (!tarball) {
      return yield* Effect.fail(
        new Error(`pnpm pack did not create a tarball in ${packDir}.`)
      );
    }
    return join(packDir, tarball);
  });

const installPackage = ({
  repo,
  spec,
  placement,
}: {
  repo: string;
  spec: string;
  placement: PackagePlacement;
}): Effect.Effect<void, Error, never> => {
  const args =
    placement === 'dependencies' ? ['add', spec] : ['add', '--save-dev', spec];
  return runCommand({ command: 'pnpm', args, cwd: repo });
};

const resolvePackageSpec = ({
  options,
  root,
}: {
  options: SupportReproOptions;
  root: string;
}): Effect.Effect<string | undefined, Error, never> => {
  if (options.packageSpec === 'installed') {
    return Effect.succeed(undefined);
  }
  if (options.packageSpec !== 'local') {
    return Effect.succeed(options.packageSpec);
  }
  if (options.dryRun) {
    return Effect.succeed('local');
  }
  return packLocalPlugin({ root, skipBuild: options.skipBuild });
};

const benchmarkCommand = ({
  options,
  repo,
}: {
  options: SupportReproOptions;
  repo: string;
}): CommandSpec => {
  const env: Record<string, string> = {};
  if (options.logPerformance) {
    env.SYNTHETIC_REACT_ROUTER_LOG_PERFORMANCE = '1';
  }
  if (options.rspackProfile) {
    env.RSPACK_PROFILE = options.rspackProfile;
  }

  return {
    command: 'pnpm',
    args: [
      'benchmark:rsbuild-modes',
      '--',
      `--runs=${options.runs}`,
      `--profile=${options.profile}`,
      `--modes=${options.modes}`,
    ],
    cwd: repo,
    env,
  };
};

const installBenchmarkDependencies = ({
  original,
  packageSpec,
  workdir,
}: {
  original: InstalledPackage;
  packageSpec?: string;
  workdir: string;
}): Effect.Effect<void, Error, never> => {
  if (packageSpec) {
    return installPackage({
      repo: workdir,
      spec: packageSpec,
      placement: original.placement,
    });
  }
  return runCommand({
    command: 'pnpm',
    args: ['install', '--frozen-lockfile'],
    cwd: workdir,
  });
};

const writeMetadata = ({
  afterFiles,
  beforeFiles,
  durationSeconds,
  options,
  packageSpec,
  root,
  workdir,
}: {
  afterFiles: Set<string>;
  beforeFiles: Set<string>;
  durationSeconds: number;
  options: SupportReproOptions;
  packageSpec?: string;
  root: string;
  workdir: string;
}): Effect.Effect<void, Error, never> =>
  tryScriptPromise(async () => {
    const outDir = resolve(root, options.out);
    const generatedFiles = [...afterFiles].filter(
      file => !beforeFiles.has(file)
    );
    await mkdir(outDir, { recursive: true });
    await writeFile(
      join(outDir, 'latest.json'),
      `${JSON.stringify(
        {
          benchmark: 'support-rsbuild-modes',
          command: benchmarkCommand({ options, repo: workdir }),
          durationSeconds,
          generatedFiles: relativeResultFiles(workdir, new Set(generatedFiles)),
          generatedAt: new Date().toISOString(),
          packageSpec: packageSpec ?? 'installed',
          sourceRepo: options.repo,
          workdir,
        },
        null,
        2
      )}\n`
    );
  });

export const supportReproBenchmarkEffect = (
  options: SupportReproOptions,
  root = process.cwd()
): Effect.Effect<void, Error, never> =>
  Effect.gen(function* () {
    const workdir = resolve(root, options.workdir);
    yield* validateSupportRepo(options.repo);

    const packageSpec = yield* resolvePackageSpec({ options, root });
    const command = benchmarkCommand({ options, repo: workdir });

    console.log(
      [
        `Support source: ${options.repo}`,
        `Support workdir: ${workdir}`,
        `Package: ${packageSpec ?? 'installed package'}`,
        `Command: ${command.command} ${command.args.join(' ')}`,
        options.dryRun ? 'Dry run: benchmark not executed' : undefined,
      ]
        .filter(Boolean)
        .join('\n')
    );

    yield* materializeSupportBenchmarkRepo({
      sourceRepo: options.repo,
      workdir,
    });
    const original = findInstalledPackage(yield* readPackageJson(workdir));
    const beforeFiles = yield* listResultFiles(workdir);
    const started = performance.now();

    if (!options.dryRun) {
      yield* installBenchmarkDependencies({
        original,
        packageSpec,
        workdir,
      });
      yield* runCommand(command);
    }

    const durationSeconds = (performance.now() - started) / 1000;
    const afterFiles = yield* listResultFiles(workdir);
    yield* writeMetadata({
      afterFiles,
      beforeFiles,
      durationSeconds,
      options,
      packageSpec,
      root,
      workdir,
    });
  });

export const runSupportReproBenchmark = async (
  argv = process.argv.slice(2)
): Promise<void> => {
  const options = await runScriptEffect(parseSupportReproArgs(argv));
  if (options.help) {
    console.log(usage);
    return;
  }
  await runScriptEffect(supportReproBenchmarkEffect(options));
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runSupportReproBenchmark().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
