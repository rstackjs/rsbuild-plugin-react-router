import type { RsbuildPluginAPI } from '@rsbuild/core';
import type { ResultPromise } from 'execa';
import { Effect } from 'effect';
import {
  runPluginEffect,
  tryPluginPromise,
  tryPluginSync,
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
    void runPluginEffect(
      tryPluginPromise(() => process).pipe(
        Effect.catchAll(() => Effect.void),
        Effect.zipRight(
          tryPluginSync(() => {
            if (typegenProcess === process) {
              typegenProcess = undefined;
            }
          })
        )
      )
    );
  };

  return {
    startWatch(): Promise<void> {
      return runPluginEffect(
        tryPluginSync(() => typegenProcess).pipe(
          Effect.flatMap(activeProcess => {
            if (activeProcess) {
              return Effect.void;
            }
            return tryPluginPromise(loadExeca).pipe(
              Effect.flatMap(execa =>
                tryPluginSync(() =>
                  execa(
                    'npx',
                    ['--yes', 'react-router', 'typegen', '--watch'],
                    {
                      stdio: 'inherit',
                      detached: false,
                      cleanup: true,
                    }
                  )
                )
              ),
              Effect.flatMap(process =>
                tryPluginSync(() => {
                  typegenProcess = process;
                  observeWatchExit(process);
                })
              )
            );
          })
        )
      );
    },

    closeWatch(): Promise<void> {
      return runPluginEffect(
        tryPluginSync(() => {
          const process = typegenProcess;
          typegenProcess = undefined;
          return process;
        }).pipe(
          Effect.flatMap(process => {
            if (!process) {
              return Effect.void;
            }
            return tryPluginSync(() => {
              process.kill('SIGTERM');
            }).pipe(
              Effect.zipRight(
                tryPluginPromise(() => process).pipe(
                  Effect.catchAll(() => Effect.void),
                  Effect.asVoid
                )
              )
            );
          })
        )
      );
    },

    runBuild(): Promise<void> {
      return runPluginEffect(
        tryPluginPromise(loadExeca).pipe(
          Effect.flatMap(execa =>
            tryPluginPromise(() =>
              execa('npx', ['--yes', 'react-router', 'typegen'], {
                stdio: 'inherit',
              })
            )
          ),
          Effect.asVoid
        )
      );
    },
  };
};

export const registerReactRouterTypegen = (
  api: RsbuildPluginAPI,
  runner: ReactRouterTypegenRunner = createReactRouterTypegenRunner()
): void => {
  let devWatchStarted = false;

  api.onAfterDevCompile(() => {
    if (devWatchStarted) {
      return;
    }
    devWatchStarted = true;
    void runner.startWatch().catch(error => {
      api.logger.warn(
        `[react-router] Failed to start React Router typegen watch: ${error}`
      );
    });
  });

  api.onCloseDevServer(() => runner.closeWatch());

  api.onBeforeBuild(() => runner.runBuild());
};
