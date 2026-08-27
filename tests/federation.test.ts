import { describe, expect, it } from '@rstest/core';
import { ensureFederationAsyncStartup } from '../src/federation';

describe('federation helpers', () => {
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
