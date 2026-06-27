import { describe, expect, it } from '@rstest/core';
import { runPluginEffect, tryPluginSync } from '../src/effect-runtime';

describe('effect runtime helpers', () => {
  it('preserves typed errors at promise boundaries', async () => {
    const error = new Error('typed failure');

    await expect(runPluginEffect(tryPluginSync(() => {
      throw error;
    }))).rejects.toBe(error);
  });

  it('normalizes synchronous thrown causes to errors', async () => {
    await expect(
      runPluginEffect(
        tryPluginSync(() => {
          throw 'dev runtime failed';
        })
      )
    ).rejects.toThrow('dev runtime failed');
  });
});
