import { describe, expect, it } from '@rstest/core';
import {
  ensureFederationAsyncStartup,
  isolateFederationContainerRuntime,
} from '../src/federation';

describe('federation helpers', () => {
  it.each([undefined, {}, []])(
    'keeps a consuming host in the app runtime when exposes is %j',
    exposes => {
      const config = {
        optimization: { runtimeChunk: 'single' as const },
        plugins: [{
          name: 'ModuleFederationPlugin',
          _options: { name: 'root', exposes },
          apply() {},
        }],
      };
      isolateFederationContainerRuntime(config);
      expect(config.optimization.runtimeChunk).toBe('single');
    }
  );

  it('enables async startup on module federation plugins', () => {
    const moduleFederationPlugin = {
      name: 'ModuleFederationPlugin',
      options: { experiments: { asyncStartup: false } },
    };

    ensureFederationAsyncStartup({
      plugins: [moduleFederationPlugin, { name: 'OtherPlugin' }],
    });

    expect(moduleFederationPlugin.options.experiments.asyncStartup).toBe(true);
  });

  it('enables async startup on enhanced Rspack federation plugins', () => {
    const rspackModuleFederationPlugin = {
      name: 'RspackModuleFederationPlugin',
      _options: { experiments: { asyncStartup: false } },
    };

    ensureFederationAsyncStartup({
      plugins: [rspackModuleFederationPlugin],
    });

    expect(
      rspackModuleFederationPlugin._options.experiments.asyncStartup
    ).toBe(true);
  });
});
