import { describe, expect, it, rstest } from '@rstest/core';
import { warnOnClientSourceMaps } from '../src/warnings/warn-on-client-source-maps';

describe('warnOnClientSourceMaps', () => {
  it('does not warn in non-production mode', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      {
        mode: 'development',
        output: { sourceMap: { js: 'source-map', css: false } },
        environments: {},
      } as any,
      warn
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns when web environment source maps are enabled in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      {
        mode: 'production',
        output: { sourceMap: false },
        environments: { web: { output: { sourceMap: { js: 'source-map' } } } },
      } as any,
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain(
      'Source maps are enabled in production'
    );
  });

  it('warns when output.sourceMap is true in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      {
        mode: 'production',
        output: { sourceMap: true },
        environments: {},
      } as any,
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('warns when output.sourceMap is a string in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      {
        mode: 'production',
        output: { sourceMap: 'source-map' },
        environments: {},
      } as any,
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn when source maps are disabled in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      {
        mode: 'production',
        output: { sourceMap: false },
        environments: { web: { output: { sourceMap: false } } },
      } as any,
      warn
    );
    expect(warn).not.toHaveBeenCalled();
  });
  it('warns when rspack devtool enables source maps in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      {
        mode: 'production',
        output: { sourceMap: false },
        tools: { rspack: { devtool: 'source-map' } },
        environments: {},
      } as any,
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('warns when web environment devtool enables source maps in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      {
        mode: 'production',
        output: { sourceMap: false },
        environments: {
          web: { tools: { rspack: { devtool: 'inline-source-map' } } },
        },
      } as any,
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
