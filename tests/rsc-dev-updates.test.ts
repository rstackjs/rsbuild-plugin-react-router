import { createStubRsbuild } from '@scripts/test-helper';
import { describe, expect, it, rstest } from '@rstest/core';
import { pluginReactRouter } from '../src';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('RSC development revalidation', () => {
  it('retains helper updates across subsequent client edits without retaining old route suppression', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'rr-rsc-update-'));
    const client = join(directory, 'client.tsx');
    writeFileSync(client, '"use client"; export const value = 1;');
    rstest.useFakeTimers();
    try {
      const rsbuild = await createStubRsbuild({ rsbuildConfig: {} });
      rsbuild.addPlugins([pluginReactRouter({ rsc: true })]);
      await rsbuild.unwrapConfig();
      const sockWrite = rstest.fn();
      rsbuild.onBeforeStartDevServer.mock.calls[1][0]({
        server: { sockWrite },
      });
      const finish = (file: string) => {
        rsbuild.onAfterEnvironmentCompile.mock.calls[1][0]({
          environment: { name: 'node' },
          stats: {
            hasErrors: () => false,
            compilation: { compiler: { modifiedFiles: new Set([file]) } },
          },
        });
      };
      const route = join(process.cwd(), 'app/routes/index.tsx');
      finish(route);
      await rstest.advanceTimersByTimeAsync(1_001);
      expect(sockWrite).not.toHaveBeenCalled();
      finish(route);
      finish('/app/helper.ts');
      await rstest.advanceTimersByTimeAsync(1_001);
      expect(sockWrite).toHaveBeenCalledOnce();
      finish('/app/helper.ts');
      finish(client);
      await rstest.advanceTimersByTimeAsync(1_001);
      expect(sockWrite).toHaveBeenCalledTimes(2);
    } finally {
      rstest.useRealTimers();
      rmSync(directory, { recursive: true, force: true });
    }
  });
  it.each(['node', 'web'])(
    'waits for %s to recover before revalidating',
    async environment => {
      rstest.useFakeTimers();
      try {
        const rsbuild = await createStubRsbuild({ rsbuildConfig: {} });
        rsbuild.addPlugins([pluginReactRouter({ rsc: true })]);
        await rsbuild.unwrapConfig();
        const sockWrite = rstest.fn();
        rsbuild.onBeforeStartDevServer.mock.calls[1][0]({
          server: { sockWrite },
        });
        const finish = (name: string, failed = false) => {
          const handler = rsbuild.onAfterEnvironmentCompile.mock.calls[1][0];
          handler({
            environment: { name },
            stats: {
              hasErrors: () => failed,
              compilation: {
                compiler: { modifiedFiles: new Set(['/app/helper.ts']) },
              },
            },
          });
        };
        const start = (name: string) => {
          for (const [handler] of rsbuild.onBeforeEnvironmentCompile.mock
            .calls) {
            handler({ environment: { name } });
          }
        };
        const invalid = new Map<string, () => void>();
        rsbuild.onAfterCreateCompiler.mock.calls.at(-1)![0]({
          compiler: {
            compilers: ['node', 'web'].map(name => ({
              options: { name },
              hooks: {
                invalid: {
                  tap: (_plugin: string, callback: () => void) =>
                    invalid.set(name, callback),
                },
              },
            })),
          },
        });

        finish('node');
        invalid.get(environment)!();
        await rstest.advanceTimersByTimeAsync(1_001);
        expect(sockWrite).not.toHaveBeenCalled();
        start(environment);
        await rstest.advanceTimersByTimeAsync(1_001);
        expect(sockWrite).not.toHaveBeenCalled();
        finish(environment, true);
        finish(environment === 'node' ? 'web' : 'node');
        await rstest.advanceTimersByTimeAsync(1_001);
        expect(sockWrite).not.toHaveBeenCalled();

        start(environment);
        finish(environment);
        await rstest.advanceTimersByTimeAsync(1_001);
        expect(sockWrite).toHaveBeenCalledExactlyOnceWith('custom', {
          event: 'rsc:update',
          data: { revalidate: true },
        });
      } finally {
        rstest.useRealTimers();
      }
    }
  );
});
