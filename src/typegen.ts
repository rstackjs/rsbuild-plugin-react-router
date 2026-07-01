import type { RsbuildPluginAPI } from '@rsbuild/core';
import type { ResultPromise } from 'execa';
import * as Effect from 'effect/Effect';
import {
  createDelayedPluginTask,
  DEV_BACKGROUND_STARTUP_DELAY_MS,
  tryPluginPromise,
} from './effect-runtime.js';

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

export const createReactRouterTypegenRunner = (
  loadExeca: LoadExeca = loadDefaultExeca
): ReactRouterTypegenRunner => {
  let typegenProcess: ResultPromise | undefined;

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

      const execa = await loadExeca();
      const process = execa(
        'npx',
        ['--yes', 'react-router', 'typegen', '--watch'],
        {
          stdio: 'inherit',
          detached: false,
          cleanup: true,
        }
      );
      typegenProcess = process;
      observeWatchExit(process);
    },

    async closeWatch(): Promise<void> {
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
      await execa('npx', ['--yes', 'react-router', 'typegen'], {
        stdio: 'inherit',
      });
    },
  };
};

export const registerReactRouterTypegen = (
  api: RsbuildPluginAPI,
  runner: ReactRouterTypegenRunner = createReactRouterTypegenRunner(),
  devWatchDelayMs: number = DEV_BACKGROUND_STARTUP_DELAY_MS
): void => {
  let devWatchScheduled = false;
  const devWatchTask = createDelayedPluginTask({
    delayMs: devWatchDelayMs,
    run: () => tryPluginPromise(() => runner.startWatch()).pipe(Effect.asVoid),
    onError(error) {
      api.logger.warn(
        `[react-router] Failed to start React Router typegen watch: ${error}`
      );
    },
  });

  if (api.context.action !== 'build') {
    api.onAfterDevCompile(() => {
      if (devWatchScheduled) {
        return;
      }
      devWatchScheduled = true;
      devWatchTask.schedule();
    });
  }

  api.onCloseDevServer(async () => {
    await devWatchTask.cancel();
    await runner.closeWatch();
  });

  api.onBeforeBuild(() => runner.runBuild());
};
