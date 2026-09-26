import { test, expect } from '@playwright/test';
import getPort from 'get-port';
import {
  createProject,
  createEditor,
  dev,
  rsbuildConfig,
} from './helpers/rsbuild.js';

test('CSS preloads cannot revive edited bytes after exact restoration', async ({
  page,
}) => {
  const port = await getPort();
  const original = '.sentinel { color: rgb(255, 0, 0); outline: none; }';
  const edited = '.sentinel { color: rgb(0, 0, 255); outline: 2px dashed; }';
  const cwd = await createProject({
    'rsbuild.config.ts': await rsbuildConfig.basic({ port }),
    'app/style.css': original,
    'app/routes/_index.tsx': `
      import '../style.css';
      import { useEffect, useState } from 'react';
      export default function Index() {
        const [ready, setReady] = useState(false);
        useEffect(() => setReady(true), []);
        return <><input aria-label="Draft" /><h1 className="sentinel" data-ready={ready}>CSS</h1></>;
      }
    `,
  });
  const stop = await dev({ cwd, port });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const cssUrl = () =>
    page.evaluate(
      () =>
        (window as any).__reactRouterManifest.routes['routes/_index']
          .css[0] as string
    );
  try {
    await page.goto(`http://localhost:${port}/`);
    await expect(page.locator('h1')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('h1')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await page.getByLabel('Draft').fill('preserved draft');
    await page.evaluate(() => {
      (window as any).__cssDocument = document;
    });
    const firstUrl = await cssUrl();
    const firstBytes = await page.evaluate(
      url => fetch(url).then(r => r.text()),
      firstUrl
    );
    const edit = createEditor(cwd);
    await edit('app/style.css', () => edited);
    await expect(page.locator('h1')).toHaveCSS('color', 'rgb(0, 0, 255)');
    await expect.poll(cssUrl).not.toBe(firstUrl);
    const editedUrl = await cssUrl();
    expect(
      await page.evaluate(url => fetch(url).then(r => r.text()), firstUrl)
    ).toBe(firstBytes);
    await page.evaluate(
      url =>
        new Promise<void>((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'style';
          link.href = url;
          link.onload = () => {
            link.remove();
            resolve();
          };
          link.onerror = () => {
            link.remove();
            reject(new Error('CSS preload failed'));
          };
          document.head.append(link);
        }),
      editedUrl
    );
    await edit('app/style.css', () => original);
    await expect(page.locator('h1')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect.poll(cssUrl).toBe(firstUrl);
    await page.evaluate(
      url =>
        new Promise<void>((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = url;
          link.onload = () => resolve();
          link.onerror = () => reject(new Error('CSS remount failed'));
          document.head.append(link);
        }),
      await cssUrl()
    );
    await expect(page.locator('h1')).toHaveCSS('color', 'rgb(255, 0, 0)');
    await expect(page.locator('h1')).toHaveCSS('outline-style', 'none');
    await expect(page.getByLabel('Draft')).toHaveValue('preserved draft');
    expect(
      await page.evaluate(() => document === (window as any).__cssDocument)
    ).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    if (errors.length) console.error(errors);
    stop();
  }
});
