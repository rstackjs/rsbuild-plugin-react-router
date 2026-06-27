import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDirectory = join(__dirname, '../../app');
const aboutRoutePath = join(appDirectory, 'routes/about.tsx');
const aboutCssPath = join(appDirectory, 'routes/about.css');
const dynamicCssComponentPath = join(
  appDirectory,
  'routes/dynamic-css-widget.tsx'
);
const originalAboutRoute = readFileSync(aboutRoutePath, 'utf8');
const originalAboutCss = readFileSync(aboutCssPath, 'utf8');
const aboutRouteWithCssImport = `import './about.css';

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
`;
const aboutRouteWithoutCssImport = aboutRouteWithCssImport.replace(
  "import './about.css';\n\n",
  ''
);
const aboutCssProbe = `.css-hmr-probe {
  color: rgb(255, 0, 0);
}
`;
const dynamicCssWidget = `import './about.css';

export function DynamicCssWidget() {
  return (
    <div data-testid="dynamic-css-widget" className="css-hmr-probe">
      Dynamic CSS widget
    </div>
  );
}
`;
const aboutRouteWithDynamicCssImport = `import { useState } from 'react';
import './about.css';

export default function About() {
  const [showWidget, setShowWidget] = useState(false);
  const [Widget, setWidget] = useState<null | (() => JSX.Element)>(null);

  return (
    <main>
      <h1>About Dynamic CSS Probe</h1>
      <div data-testid="css-hmr-probe" className="css-hmr-probe">
        Route CSS probe
      </div>
      <button
        type="button"
        onClick={async () => {
          const mod = await import('./dynamic-css-widget');
          setWidget(() => mod.DynamicCssWidget);
          setShowWidget(true);
        }}
      >
        Load dynamic CSS widget
      </button>
      {showWidget && Widget ? <Widget /> : null}
    </main>
  );
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
  if (existsSync(dynamicCssComponentPath)) {
    rmSync(dynamicCssComponentPath);
  }
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
    writeFileSync(aboutRoutePath, aboutRouteWithCssImport);
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
    writeFileSync(aboutRoutePath, aboutRouteWithoutCssImport);

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

    const stylesheetRequestsBeforeReAdd = stylesheetRequests.length;
    const documentRequestsBeforeReAdd = documentRequests.length;
    writeFileSync(aboutRoutePath, aboutRouteWithCssImport);

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

  test('keeps route CSS applied when the same CSS is dynamically imported', async ({
    page,
  }) => {
    writeFileSync(aboutRoutePath, aboutRouteWithDynamicCssImport);
    writeFileSync(dynamicCssComponentPath, dynamicCssWidget);
    writeFileSync(aboutCssPath, aboutCssProbe);

    const documentRequests: string[] = [];
    page.on('request', request => {
      if (
        request.isNavigationRequest() &&
        request.frame() === page.mainFrame()
      ) {
        documentRequests.push(request.url());
      }
    });

    await page.goto('/about');
    await expect(
      page.getByRole('heading', { name: 'About Dynamic CSS Probe' })
    ).toBeVisible();
    await expect
      .poll(() => readProbeColor(page), { timeout: 60000 })
      .toBe('rgb(255, 0, 0)');

    const documentRequestsBeforeClick = documentRequests.length;
    await page
      .getByRole('button', { name: 'Load dynamic CSS widget' })
      .click();

    await expect(page.getByTestId('dynamic-css-widget')).toBeVisible();
    await expect
      .poll(() => readProbeColor(page), { timeout: 60000 })
      .toBe('rgb(255, 0, 0)');
    expect(documentRequests.length).toBe(documentRequestsBeforeClick);
  });
});
