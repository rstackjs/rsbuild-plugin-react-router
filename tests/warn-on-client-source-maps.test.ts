import { describe, expect, it, rstest } from '@rstest/core';
import type { NormalizedConfig } from '@rsbuild/core';
import {
  isSourceMapEnabled,
  warnOnClientSourceMaps,
} from '../src/warnings/warn-on-client-source-maps';

const normalizedConfig = (
  config: Record<string, unknown>
): NormalizedConfig => config as NormalizedConfig;

describe('warnOnClientSourceMaps', () => {
  it('does not warn in non-production mode', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      normalizedConfig({
        mode: 'development',
        output: { sourceMap: { js: 'source-map', css: false } },
        environments: {},
      }),
      warn
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns when web environment source maps are enabled in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      normalizedConfig({
        mode: 'production',
        output: { sourceMap: false },
        environments: { web: { output: { sourceMap: { js: 'source-map' } } } },
      }),
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
      normalizedConfig({
        mode: 'production',
        output: { sourceMap: true },
        environments: {},
      }),
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('warns when output.sourceMap is a string in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      normalizedConfig({
        mode: 'production',
        output: { sourceMap: 'source-map' },
        environments: {},
      }),
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('treats string output.sourceMap values as enabled', () => {
    expect(isSourceMapEnabled('source-map')).toBe(true);
    expect(isSourceMapEnabled('hidden-source-map')).toBe(true);
  });

  it('does not warn when source maps are disabled in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      normalizedConfig({
        mode: 'production',
        output: { sourceMap: false },
        environments: { web: { output: { sourceMap: false } } },
      }),
      warn
    );
    expect(warn).not.toHaveBeenCalled();
  });
  it('warns when rspack devtool enables source maps in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      normalizedConfig({
        mode: 'production',
        output: { sourceMap: false },
        tools: { rspack: { devtool: 'source-map' } },
        environments: {},
      }),
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('warns when web environment devtool enables source maps in production', () => {
    const warn = rstest.fn();
    warnOnClientSourceMaps(
      normalizedConfig({
        mode: 'production',
        output: { sourceMap: false },
        environments: {
          web: { tools: { rspack: { devtool: 'inline-source-map' } } },
        },
      }),
      warn
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
