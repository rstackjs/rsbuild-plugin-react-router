import { expect, test, type Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDirectory = join(__dirname, '../../app');
const aboutRoutePath = join(appDirectory, 'routes/about.tsx');
const aboutCssPath = join(appDirectory, 'routes/about.css');
const originalAboutRoute = readFileSync(aboutRoutePath, 'utf8');
const originalAboutCss = readFileSync(aboutCssPath, 'utf8');
const aboutRouteWithCssImport = (revision: string) => `import './about.css';

export default function About() {
  return (
    <main>
      <h1>About CSS HMR Probe</h1>
      <div data-testid="css-hmr-probe" className="css-hmr-probe">
        CSS HMR probe
      </div>
    </main>
  );
}
// ${revision}
`;
const aboutRouteWithoutCssImport = (revision: string) =>
  aboutRouteWithCssImport(revision).replace("import './about.css';\n\n", '');
const aboutCssProbe = `.css-hmr-probe {
  color: rgb(255, 0, 0);
}
`;

const writeFileIfChanged = (path: string, contents: string) => {
  if (readFileSync(path, 'utf8') !== contents) {
    writeFileSync(path, contents);
  }
};

const restoreAboutRoute = () => {
  writeFileIfChanged(aboutRoutePath, originalAboutRoute);
  writeFileIfChanged(aboutCssPath, originalAboutCss);
};

const readProbeColor = async (page: Page) => {
  try {
    return await page.evaluate(() => {
      const probe = document.querySelector('[data-testid="css-hmr-probe"]');
      return probe ? getComputedStyle(probe).color : 'missing';
    });
  } catch (cause) {
    if (
      cause instanceof Error &&
      cause.message.includes('Execution context was destroyed')
    ) {
      return 'navigating';
    }
    throw cause;
  }
};

const readProbeState = async (page: Page) => {
  try {
    return await page.evaluate(() => {
      const probe = document.querySelector('[data-testid="css-hmr-probe"]');
      const manifest = (window as any).__reactRouterManifest;
      return {
        color: probe ? getComputedStyle(probe).color : 'missing',
        links: Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .map(link => (link as HTMLLinkElement).href)
          .sort(),
        manifestCss: manifest?.routes?.['routes/about']?.css ?? null,
        manifestModule: manifest?.routes?.['routes/about']?.module ?? null,
        manifestVersion: manifest?.version ?? null,
      };
    });
  } catch (cause) {
    if (
      cause instanceof Error &&
      cause.message.includes('Execution context was destroyed')
    ) {
      return { color: 'navigating' };
    }
    throw cause;
  }
};

test.describe('lazy compilation', () => {
  test.setTimeout(90000);

  test.beforeEach(() => {
    restoreAboutRoute();
  });

  test.afterEach(() => {
    restoreAboutRoute();
  });

  test('activates a lazy route entry without reloading the document', async ({
    page,
  }) => {
    test.skip(process.env.RR_LAZY_COMPILATION !== 'full');
    const errors: string[] = [];
    const lazyTriggerRequests: string[] = [];
    const socketFrames: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (request.url().includes('/_rspack/lazy/trigger')) {
        lazyTriggerRequests.push(request.url());
      }
    });
    page.on('websocket', socket => {
      socket.on('framereceived', ({ payload }) => {
        socketFrames.push(String(payload));
      });
    });
    await page.addInitScript(() => {
      const key = 'full-lazy-document-loads';
      sessionStorage.setItem(
        key,
        String(Number(sessionStorage.getItem(key) ?? 0) + 1)
      );
    });

    await page.goto('/');
    const clientFeaturesRouteAsset = await page.request.get(
      '/static/js/routes/client-features.js'
    );
    expect(clientFeaturesRouteAsset.ok()).toBe(true);
    expect(await clientFeaturesRouteAsset.text()).toContain(
      'lazy-compilation-proxy'
    );
    await page.getByRole('link', { name: 'Client Features' }).click();

    await expect(page).toHaveURL('/client-features', { timeout: 60000 });
    await expect(
      page.getByRole('heading', { name: 'Client Features' })
    ).toBeVisible();
    await expect(page.getByTestId('loader-source')).toHaveText('client');
    expect(
      await page.evaluate(() =>
        sessionStorage.getItem('full-lazy-document-loads')
      )
    ).toBe('1');
    expect(lazyTriggerRequests.length).toBeGreaterThan(0);
    expect(socketFrames.join('\n')).not.toContain('full-reload');
    expect(errors).toEqual([]);
  });

  test('hydrates with entries:true while manifest route modules stay synchronous', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');

    await page.waitForFunction(() => {
      return (window as any).__reactRouterRouteModules !== undefined;
    });

    const initialRouteModules = await page.evaluate(() => {
      const modules = (window as any).__reactRouterRouteModules ?? {};
      return Object.fromEntries(
        Object.entries(modules).map(([routeId, moduleValue]) => [
          routeId,
          Object.keys(moduleValue as Record<string, unknown>).sort(),
        ])
      );
    });
    expect(initialRouteModules.root).toContain('default');
    expect(initialRouteModules['routes/home']).toContain('default');

    const manifestRouteModules = await page.evaluate(() => {
      const manifest = (window as any).__reactRouterManifest;
      return Object.fromEntries(
        Object.entries(manifest.routes).map(([routeId, route]) => [
          routeId,
          (route as { module: string }).module,
        ])
      );
    });
    const rootRouteAsset = await page.request.get(manifestRouteModules.root);
    expect(await rootRouteAsset.text()).not.toContain(
      'lazy-compilation-proxy'
    );

    const documentRequests: string[] = [];
    page.on('request', (request) => {
      if (
        request.isNavigationRequest() &&
        request.frame() === page.mainFrame()
      ) {
        documentRequests.push(request.url());
      }
    });

    await page.locator('a[href="/about"]').first().click();

    await expect(page).toHaveURL('/about');
    await expect(
      page.locator('h1:has-text("About This Demo")')
    ).toBeVisible();
    expect(documentRequests).toEqual([]);
    expect(errors.join('\n')).not.toMatch(/hydration|Hydration|Component/);
  });

  test('full reloads when active lazy route CSS import is removed and re-added', async ({
    page,
  }) => {
    writeFileSync(aboutRoutePath, aboutRouteWithCssImport('with-css-1'));
    writeFileSync(aboutCssPath, aboutCssProbe);

    const documentRequests: string[] = [];
    const stylesheetRequests: string[] = [];
    const stylesheetResponses: string[] = [];
    page.on('request', request => {
      if (
        request.isNavigationRequest() &&
        request.frame() === page.mainFrame()
      ) {
        documentRequests.push(request.url());
      }
      if (
        request.resourceType() === 'stylesheet' ||
        new URL(request.url()).pathname.endsWith('.css')
      ) {
        stylesheetRequests.push(request.url());
      }
    });
    page.on('response', response => {
      const url = response.url();
      if (
        response.request().resourceType() === 'stylesheet' ||
        new URL(url).pathname.endsWith('.css')
      ) {
        stylesheetResponses.push(`${response.status()} ${url}`);
      }
    });

    await page.goto('/about');
    await expect(
      page.getByRole('heading', { name: 'About CSS HMR Probe' })
    ).toBeVisible();
    await expect
      .poll(() => readProbeColor(page), { timeout: 60000 })
      .toBe('rgb(255, 0, 0)');

    const documentRequestsBeforeRemoval = documentRequests.length;
    writeFileSync(
      aboutRoutePath,
      aboutRouteWithoutCssImport('without-css-2')
    );

    await expect
      .poll(
        async () => {
          const reloads =
            documentRequests.length - documentRequestsBeforeRemoval;
          const color = await readProbeColor(page);
          return reloads > 0 && color !== 'rgb(255, 0, 0)'
            ? 'cleared'
            : `reloads:${reloads};color:${color}`;
        },
        { timeout: 60000 }
      )
      .toBe('cleared');
    // The removal path intentionally hard reloads. Wait for the dev socket to
    // reconnect before testing the re-add transition.
    await page.waitForTimeout(1200);

    const stylesheetRequestsBeforeReAdd = stylesheetRequests.length;
    const documentRequestsBeforeReAdd = documentRequests.length;
    writeFileSync(aboutRoutePath, aboutRouteWithCssImport('with-css-3'));

    await expect
      .poll(
        async () => {
          const state = await readProbeState(page);
          const reloads = documentRequests.length - documentRequestsBeforeReAdd;
          return state.color === 'rgb(255, 0, 0)' &&
            stylesheetRequests.length > stylesheetRequestsBeforeReAdd &&
            reloads > 0
            ? 'loaded'
            : JSON.stringify({
                ...state,
                reloads,
                stylesheetRequestCount: stylesheetRequests.length,
                stylesheetResponses: stylesheetResponses.slice(-5),
              });
        },
        { timeout: 60000 }
      )
      .toBe('loaded');
  });
});
