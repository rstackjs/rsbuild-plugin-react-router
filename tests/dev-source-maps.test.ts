import { describe, expect, it, rstest } from '@rstest/core';
import {
  registerDevServerSourceMaps,
  remapDevServerStack,
} from '../src/dev-source-maps.js';

describe('dev source maps', () => {
  it('lazily reads source maps from in-memory compilation assets', () => {
    const source = rstest.fn(() =>
      Buffer.from(
        JSON.stringify({
          version: 3,
          file: 'static/js/app.js',
          sources: ['/project/app/error-stacktrace.tsx'],
          sourcesContent: ['throw new Error("test")'],
          names: [],
          mappings: 'AAAA',
        })
      )
    );

    registerDevServerSourceMaps({
      outputOptions: { path: '/project/build/server' },
      getAssets: () =>
        [
          {
            name: 'static/js/app.js',
            source: { map: () => null },
            info: {},
          },
          {
            name: 'static/js/app.js.map',
            source: { buffer: source },
            info: {},
          },
        ] as never,
    });

    expect(source).not.toHaveBeenCalled();
    expect(
      remapDevServerStack(
        'at TestRoute (/project/build/server/static/js/app.js:1:1)'
      )
    ).toBe('at TestRoute (/project/app/error-stacktrace.tsx:1:1)');
    expect(source).toHaveBeenCalledTimes(1);

    remapDevServerStack(
      'at TestRoute (/project/build/server/static/js/app.js:1:1)'
    );
    expect(source).toHaveBeenCalledTimes(1);
  });
});
