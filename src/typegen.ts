import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { RsbuildPluginAPI } from '@rsbuild/core';
import type { ResultPromise } from 'execa';
import * as Effect from 'effect/Effect';
import {
  createDelayedPluginTask,
  type PluginEffectRuntime,
  PluginScope,
  tryPluginPromise,
} from './effect-runtime.js';
import { resolvePackageJson } from './ssr-externals.js';

// Quiet period with no dev compiles before the typegen watch starts. Long
// enough that route-load and HMR compile bursts (each rescheduling the task)
// finish before the typegen process competes for CPU on small machines.
const TYPEGEN_IDLE_DELAY_MS = 10_000;

type Execa = typeof import('execa').execa;
type LoadExeca = () => Promise<Execa>;

export type ReactRouterTypegenRunner = {
  startWatch(): Promise<void>;
  closeWatch(): Promise<void>;
  runBuild(): Promise<void>;
};

const loadDefaultExeca: LoadExeca = async () => {
  const { execa } = await import('execa');
  return execa;
};

type TypegenCommand = {
  command: string;
  args: string[];
};

// The `react-router` CLI bin is provided by `@react-router/dev`. Spawning it
// directly through `process.execPath` skips the npx bootstrap (npm config
// load and package resolution), which otherwise costs several hundred ms of
// CPU during dev-server startup and every production build.
const resolveDirectTypegenCommand = (
  appDirectory: string
): TypegenCommand | undefined => {
  const packageJsonPath = resolvePackageJson('@react-router/dev', appDirectory);
  if (!packageJsonPath) {
    // `@react-router/dev` is not resolvable from the app directory; the
    // caller falls back to spawning through npx.
    return undefined;
  }
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      bin?: string | Record<string, string>;
    };
    const binRelativePath =
      typeof packageJson.bin === 'string'
        ? packageJson.bin
        : packageJson.bin?.['react-router'];
    if (!binRelativePath) {
      return undefined;
    }
    return {
      command: process.execPath,
      args: [resolve(dirname(packageJsonPath), binRelativePath)],
    };
  } catch {
    return undefined;
  }
};

export const createReactRouterTypegenRunner = (
  loadExeca: LoadExeca = loadDefaultExeca,
  appDirectory?: string
): ReactRouterTypegenRunner => {
  let typegenProcess: ResultPromise | undefined;
  let typegenCommand: TypegenCommand | undefined;
  let watchGeneration = 0;

  const getTypegenCommand = (): TypegenCommand => {
    typegenCommand ??= (appDirectory
      ? resolveDirectTypegenCommand(appDirectory)
      : undefined) ?? {
      command: 'npx',
      args: ['--yes', 'react-router'],
    };
    return typegenCommand;
  };

  const observeWatchExit = (process: ResultPromise): void => {
    void process
      .catch(() => undefined)
      .finally(() => {
        if (typegenProcess === process) {
          typegenProcess = undefined;
        }
      });
  };

  return {
    async startWatch(): Promise<void> {
      if (typegenProcess) {
        return;
      }

      const generation = watchGeneration;
      const execa = await loadExeca();
      if (typegenProcess || generation !== watchGeneration) {
        return;
      }
      const { command, args } = getTypegenCommand();
      const process = execa(command, [...args, 'typegen', '--watch'], {
        stdio: 'inherit',
        detached: false,
        cleanup: true,
      });
      typegenProcess = process;
      observeWatchExit(process);
    },

    async closeWatch(): Promise<void> {
      watchGeneration += 1;
      const process = typegenProcess;
      typegenProcess = undefined;
      if (!process) {
        return;
      }

      process.kill('SIGTERM');
      await process.catch(() => undefined);
    },

    async runBuild(): Promise<void> {
      const execa = await loadExeca();
      const { command, args } = getTypegenCommand();
      await execa(command, [...args, 'typegen'], {
        stdio: 'inherit',
      });
    },
  };
};

export const registerReactRouterTypegen = async (
  api: RsbuildPluginAPI,
  {
    runtime,
    runner,
    devWatchDelayMs = TYPEGEN_IDLE_DELAY_MS,
    appDirectory,
  }: {
    runtime: PluginEffectRuntime;
    runner?: ReactRouterTypegenRunner;
    devWatchDelayMs?: number;
    appDirectory?: string;
  }
): Promise<void> => {
  const resolvedRunner =
    runner ?? createReactRouterTypegenRunner(loadDefaultExeca, appDirectory);

  if (api.context.action !== 'build') {
    let devWatchStarted = false;
    const devWatchTask = createDelayedPluginTask({
      runtime,
      delayMs: devWatchDelayMs,
      run: () =>
        tryPluginPromise(() => {
          devWatchStarted = true;
          return resolvedRunner.startWatch();
        }).pipe(Effect.asVoid),
      onError(error) {
        api.logger.warn(
          `[react-router] Failed to start React Router typegen watch: ${error}`
        );
      },
    });
    const closeWatchEffect = () =>
      devWatchTask
        .cancelEffect()
        .pipe(
          Effect.zipRight(
            Effect.orDie(tryPluginPromise(() => resolvedRunner.closeWatch()))
          )
        );
    await runtime.runPromise(
      Effect.flatMap(PluginScope, pluginScope =>
        pluginScope.acquire(Effect.void, closeWatchEffect)
      )
    );
    // Reschedule on every compile so the typegen watch only starts after a
    // quiet period with no compiles. Starting it during the initial compile
    // burst competes with HMR rebuilds for CPU on small machines.
    api.onAfterDevCompile(() => {
      if (devWatchStarted) {
        return;
      }
      devWatchTask.reschedule();
    });
  }

  api.onBeforeBuild(() => resolvedRunner.runBuild());
};
