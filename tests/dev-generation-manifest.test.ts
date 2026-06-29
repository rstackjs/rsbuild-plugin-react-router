import { describe, expect, it } from '@rstest/core';
import { createDevRuntimeHarness as createHarness } from './dev-generation-fixtures';
import {
  createBuild,
  createCompilation,
  createDevManifest,
  createGraphStats,
  graphIdentity,
  noKnownChanges,
} from './dev-runtime-fixtures';

describe('React Router development runtime manifest publishing', () => {
  it('publishes a validated server build pinned to its exact web manifest', async () => {
    const rawBuild = createBuild('raw');
    const { runtime } = createHarness(() => rawBuild);
    const web = createCompilation('web');
    const node = createCompilation('node');
    const manifest = createDevManifest('web-1');

    runtime.beginAttempt();
    runtime.captureWeb(web, { 'static/js/app': manifest });
    const waiting = runtime.load();
    await runtime.finishAttempt(
      createGraphStats(web, node),
      noKnownChanges,
      graphIdentity(web, node)
    );

    const committed = await waiting;
    expect(committed).not.toBe(rawBuild);
    expect(committed.assets).toEqual(manifest);
    expect(committed.assets).not.toBe(manifest);
  });
});
