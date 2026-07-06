import { describe, expect, it, rstest } from '@rstest/core';
import type { Rspack } from '@rsbuild/core';
import {
  isEagerDynamicImportMode,
  warnOnEagerDynamicImportMode,
} from '../src/warnings/warn-on-eager-dynamic-import-mode';

const rspackConfig = (
  config: Partial<Rspack.Configuration>
): Rspack.Configuration => config as Rspack.Configuration;

describe('warnOnEagerDynamicImportMode', () => {
  it('warns when Rspack eager dynamic import mode is enabled', () => {
    const warn = rstest.fn();

    const warned = warnOnEagerDynamicImportMode(
      rspackConfig({
        module: {
          parser: {
            javascript: {
              dynamicImportMode: 'eager',
            },
          },
        },
      }),
      warn
    );

    expect(warned).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain(
      'dynamicImportMode: "eager"'
    );
  });

  it('does not warn for non-eager dynamic import modes', () => {
    const warn = rstest.fn();

    const warned = warnOnEagerDynamicImportMode(
      rspackConfig({
        module: {
          parser: {
            javascript: {
              dynamicImportMode: 'lazy',
            },
          },
        },
      }),
      warn
    );

    expect(warned).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('detects eager mode only from javascript parser options', () => {
    expect(
      isEagerDynamicImportMode(
        rspackConfig({
          module: {
            parser: {
              javascript: {
                dynamicImportMode: 'eager',
              },
            },
          },
        })
      )
    ).toBe(true);
    expect(isEagerDynamicImportMode(rspackConfig({}))).toBe(false);
  });
});
