import { describe, expect, it } from '@rstest/core';
import {
  SPA_FALLBACK_REQUEST_PATH,
  extractRscFlightData,
  getRscHtmlFilePath,
  getRscPayloadFilePath,
  getRscPrerenderRequests,
  normalizeRscPrerenderBasename,
} from '../src/rsc-prerender';

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
