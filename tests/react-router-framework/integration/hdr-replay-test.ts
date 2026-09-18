import fs from 'node:fs';
import path from 'node:path';
import { expect } from '@playwright/test';
import { test, createEditor, rsbuildConfig } from './helpers/rsbuild.js';
import { server } from './helpers/express.js';

for (const mode of ['dev', 'custom server']) {
  test(`HDR replays fresh loader data after reconnect without a browser rebuild: ${mode}`, async ({
    page,
    context,
    dev,
    customDev,
  }) => {
    const start = mode === 'dev' ? dev : customDev;
    const { cwd, port } = await start(async ({ port }) => {
      const config =
        "import { appendFileSync } from 'node:fs';\n" +
        (await rsbuildConfig.basic({ port }));
      return {
        'server.mjs': server().replace(
          'process.env.PORT ?? 3000',
          String(port)
        ),
        'rsbuild.config.ts': config.replace(
          'plugins: [',
          `plugins: [{
        name: 'record-compilations',
        setup(api) {
          api.onAfterEnvironmentCompile(({ environment }) => {
            appendFileSync('.test-compilations', environment.name + '\\n');
          });
        },
      },`
        ),
        'app/value.server.ts': 'export const message = "original";',
        'app/routes/_index.tsx': `
        import { useEffect, useState } from 'react';
        import { useLoaderData } from 'react-router';
        import { message } from '../value.server';
        export const loader = () => ({ message });
        export default function Index() {
          const data = useLoaderData();
          const [hydrated, setHydrated] = useState(false);
          useEffect(() => setHydrated(true), []);
          return <><p data-message>{data.message}</p><input aria-label="retained input" />
            <p data-hydrated>{String(hydrated)}</p></>;
        }
      `,
      };
    });
    await page.addInitScript(() => {
      const NativeWebSocket = window.WebSocket;
      (window as any).__testSockets = [];
      window.WebSocket = class extends NativeWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          super(url, protocols);
          (window as any).__testSockets.push(this);
        }
      };
    });
    await page.goto(`http://localhost:${port}/`);
    await expect(page.locator('[data-hydrated]')).toHaveText('true');
    await page.getByLabel('retained input').fill('keep this');
    await page.evaluate(() => {
      (window as any).__documentMarker = 'retained';
    });
    const compilations = () =>
      fs
        .readFileSync(path.join(cwd, '.test-compilations'), 'utf8')
        .trim()
        .split('\n');
    const browserCompiles = compilations().filter(
      name => name === 'web'
    ).length;
    await context.setOffline(true);
    await page.evaluate(() => {
      for (const socket of (window as any).__testSockets) socket.close();
    });
    await createEditor(cwd)('app/value.server.ts', source =>
      source.replace('original', 'updated')
    );
    await expect
      .poll(async () => {
        const response = await fetch(`http://localhost:${port}/`);
        return response.text();
      })
      .toContain('updated');
    await createEditor(cwd)('app/value.server.ts', source =>
      source.replace('updated', 'latest')
    );
    await expect
      .poll(async () => {
        const response = await fetch(`http://localhost:${port}/`);
        return response.text();
      })
      .toContain('latest');
    await expect(page.locator('[data-message]')).toHaveText('original');
    await context.setOffline(false);
    await expect(page.locator('[data-message]')).toHaveText('latest', {
      timeout: 30000,
    });
    await expect(page.getByLabel('retained input')).toHaveValue('keep this');
    expect(await page.evaluate(() => (window as any).__documentMarker)).toBe(
      'retained'
    );
    expect(compilations().filter(name => name === 'web')).toHaveLength(
      browserCompiles
    );
    expect(
      fs.existsSync(path.join(cwd, '.react-router/hdr-revision.mjs'))
    ).toBe(false);
  });
}
