import type { RsbuildPluginAPI } from '@rsbuild/core';
import type { ResultPromise } from 'execa';

export const registerReactRouterTypegen = (api: RsbuildPluginAPI): void => {
  let typegenProcess: ResultPromise | undefined;

  api.onBeforeStartDevServer(async () => {
    if (typegenProcess) {
      return;
    }
    const { execa } = await import('execa');
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
    process
      .catch(() => {
        // Ignore errors when the process is killed on server shutdown.
      })
      .finally(() => {
        if (typegenProcess === process) {
          typegenProcess = undefined;
        }
      });
  });

  api.onCloseDevServer(async () => {
    const process = typegenProcess;
    typegenProcess = undefined;
    if (!process) {
      return;
    }
    process.kill('SIGTERM');
    await process.catch(() => undefined);
  });

  api.onBeforeBuild(async () => {
    const { execa } = await import('execa');
    await execa('npx', ['--yes', 'react-router', 'typegen'], {
      stdio: 'inherit',
    });
  });
};
