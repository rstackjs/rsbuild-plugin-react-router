import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createLogger } from '@rsbuild/core';
import { startServerBuildWorker } from '../src/server-build-worker-client';
import { describe, expect, it, rstest } from '@rstest/core';
import {
  SPA_FALLBACK_REQUEST_PATH,
  extractRscFlightData,
  getRscHtmlFilePath,
  getRscPayloadFilePath,
  getRscPrerenderRequests,
  normalizeRscPrerenderBasename,
  runReactRouterRscPrerenderBuild,
} from '../src/rsc-prerender';

// Mock responses for artifact rendering; real worker lifecycle behavior is
// covered by server-build-worker.test.ts and spa-build-process-test.ts.
rstest.mock('../src/server-build-worker-client', () => ({
  startServerBuildWorker: rstest.fn(async () => ({
    handler: async () => new Response(null, { status: 500 }),
    close: async () => {},
  })),
}));

const flightScript = (chunk: string) =>
  `<script>(self.__FLIGHT_DATA||=[]).push(${JSON.stringify(chunk)})</script>`;

describe('normalizeRscPrerenderBasename', () => {
  it('defaults to a root basename', () => {
    expect(normalizeRscPrerenderBasename('')).toBe('/');
    expect(normalizeRscPrerenderBasename('/')).toBe('/');
  });

  it('appends a trailing slash when missing', () => {
    expect(normalizeRscPrerenderBasename('/base')).toBe('/base/');
    expect(normalizeRscPrerenderBasename('/base/')).toBe('/base/');
  });
});

describe('getRscPrerenderRequestPaths', () => {
  it('returns the prerender paths for ssr builds', () => {
    expect(
      getRscPrerenderRequests({
        prerenderPaths: ['/', '/about'],
        ssr: true,
        basename: '/',
      }).map(r => r.requestPath)
    ).toEqual(['/', '/about']);
  });

  it('adds the SPA fallback document when ssr is disabled', () => {
    expect(
      getRscPrerenderRequests({
        prerenderPaths: ['/'],
        ssr: false,
        basename: '/',
      }).map(r => r.requestPath)
    ).toEqual(['/', SPA_FALLBACK_REQUEST_PATH]);
  });

  it('prerenders only the SPA fallback for ssr:false without prerender paths', () => {
    expect(
      getRscPrerenderRequests({
        prerenderPaths: [],
        ssr: false,
        basename: '/',
      }).map(r => r.requestPath)
    ).toEqual([SPA_FALLBACK_REQUEST_PATH]);
  });

  it('joins paths with the basename', () => {
    expect(
      getRscPrerenderRequests({
        prerenderPaths: ['/', '/products/1'],
        ssr: true,
        basename: '/base',
      }).map(r => r.requestPath)
    ).toEqual(['/base/', '/base/products/1']);
  });

  it('keeps basename request paths separate from artifact paths', () => {
    expect(
      getRscPrerenderRequests({
        prerenderPaths: [],
        ssr: false,
        basename: '/base',
      })
    ).toEqual([
      {
        requestPath: '/base/__spa-fallback.html',
        artifactPath: SPA_FALLBACK_REQUEST_PATH,
      },
    ]);
  });

  it('deduplicates paths', () => {
    expect(
      getRscPrerenderRequests({
        prerenderPaths: ['/', '/'],
        ssr: true,
        basename: '/',
      }).map(r => r.requestPath)
    ).toEqual(['/']);
  });
});

describe('extractRscFlightData', () => {
  it('returns null when the document has no flight data', () => {
    expect(extractRscFlightData('<html><body>hi</body></html>')).toBeNull();
  });

  it('extracts a single flight chunk', () => {
    const html = `<html><body>${flightScript('chunk-a')}</body></html>`;
    expect(extractRscFlightData(html)).toBe('chunk-a');
  });

  it('concatenates multiple flight chunks in order', () => {
    const html = [
      '<html><body>',
      flightScript('chunk-a'),
      '<div>content</div>',
      flightScript('chunk-b'),
      '</body></html>',
    ].join('');
    expect(extractRscFlightData(html)).toBe('chunk-achunk-b');
  });

  it('decodes JSON-escaped chunk contents', () => {
    const chunk = '1:{"a":"line\nbreak \\"quoted\\""}\n';
    const html = flightScript(chunk);
    expect(extractRscFlightData(html)).toBe(chunk);
  });
});

describe('getRscHtmlFilePath', () => {
  it('maps the root path to index.html', () => {
    expect(getRscHtmlFilePath('/')).toBe('/index.html');
  });

  it('maps nested paths to a nested index.html', () => {
    expect(getRscHtmlFilePath('/products/1')).toBe('/products/1/index.html');
    expect(getRscHtmlFilePath('/about/')).toBe('/about/index.html');
  });

  it('maps the SPA fallback request to a top-level file', () => {
    expect(getRscHtmlFilePath(SPA_FALLBACK_REQUEST_PATH)).toBe(
      '__spa-fallback.html'
    );
  });
});

describe('getRscPayloadFilePath', () => {
  it('maps the root path to _.rsc', () => {
    expect(getRscPayloadFilePath('/')).toBe('_.rsc');
  });

  it('maps nested paths to <path>.rsc', () => {
    expect(getRscPayloadFilePath('/products/1')).toBe('/products/1.rsc');
  });

  it('maps the SPA fallback request to __spa-fallback.rsc', () => {
    expect(getRscPayloadFilePath(SPA_FALLBACK_REQUEST_PATH)).toBe(
      '__spa-fallback.rsc'
    );
  });
});

describe('runReactRouterRscPrerenderBuild', () => {
  it.each(['/', '/base'])(
    'accepts a 404 SPA fallback with basename %s',
    async basename => {
      const buildDirectory = await mkdtemp(
        resolve(tmpdir(), 'rsbuild-rsc-fallback-')
      );
      const html = `<html><body>${flightScript('fallback-data')}</body></html>`;
      const handler = rstest.fn(
        async () =>
          new Response(html, {
            status: 404,
            headers: { 'content-type': 'text/html' },
          })
      );
      const close = rstest.fn(async () => {});
      rstest
        .mocked(startServerBuildWorker)
        .mockResolvedValueOnce({ description: undefined, handler, close });
      try {
        await runReactRouterRscPrerenderBuild({
          api: { logger: createLogger({ level: 'silent' }) },
          hasWebEnvironment: true,
          buildDirectory,
          ssr: false,
          prerenderConfig: false,
          prerenderPaths: [],
          basename,
        });
        expect(
          await readFile(
            resolve(buildDirectory, 'client/__spa-fallback.html'),
            'utf8'
          )
        ).toBe(html);
        expect(
          await readFile(
            resolve(buildDirectory, 'client/__spa-fallback.rsc'),
            'utf8'
          )
        ).toBe('fallback-data');
        expect(close).toHaveBeenCalledOnce();
      } finally {
        await rm(buildDirectory, { recursive: true, force: true });
      }
    }
  );

  it('escapes RSC redirect destinations without consuming their body', async () => {
    const buildDirectory = await mkdtemp(
      resolve(tmpdir(), 'rsbuild-rsc-redirect-')
    );
    rstest.mocked(startServerBuildWorker).mockResolvedValueOnce({
      description: undefined,
      handler: async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.error(new Error('redirect body must not be read'));
            },
          }),
          {
            status: 302,
            headers: { location: '/target?x="<script>bad</script>&y=1' },
          }
        ),
      close: async () => {},
    });
    try {
      await runReactRouterRscPrerenderBuild({
        api: { logger: createLogger({ level: 'silent' }) },
        hasWebEnvironment: true,
        buildDirectory,
        ssr: true,
        prerenderConfig: ['/about'],
        prerenderPaths: ['/about'],
        basename: '/',
      });
      const html = await readFile(
        resolve(buildDirectory, 'client/about/index.html'),
        'utf8'
      );
      expect(html).toContain(
        'href="/target?x=&quot;&lt;script&gt;bad&lt;/script&gt;&amp;y=1"'
      );
      expect(html).not.toContain('<script>');
    } finally {
      await rm(buildDirectory, { recursive: true, force: true });
    }
  });

  it.each([404, 500])(
    'reports a failed %s RSC response without duplicating the path',
    async status => {
      rstest.mocked(startServerBuildWorker).mockResolvedValueOnce({
        description: undefined,
        handler: async () => new Response(null, { status }),
        close: async () => {},
      });
      const buildDirectory = await mkdtemp(
        resolve(tmpdir(), 'rsbuild-rsc-prerender-')
      );

      try {
        await expect(
          runReactRouterRscPrerenderBuild({
            api: { logger: createLogger({ level: 'silent' }) },
            hasWebEnvironment: true,
            buildDirectory,
            ssr: true,
            prerenderConfig: true,
            prerenderPaths: ['/about'],
            basename: '/',
          })
        ).rejects.toMatchObject({
          message: `Prerender: Received a ${status} status code from the RSC server while prerendering the \`/about\` path.`,
        });
      } finally {
        await rm(buildDirectory, { recursive: true, force: true });
      }
    }
  );
});
