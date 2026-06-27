import type { RsbuildDevServer, Rspack } from '@rsbuild/core';
import { rstest } from '@rstest/core';
import {
  createReactRouterDevRuntime,
  type ReactRouterDevRuntime,
} from '../src/dev-generation';
import {
  createDevManifest,
  type DevManifestCss,
} from './dev-runtime-fixtures';

export const captureWeb = (
  runtime: ReactRouterDevRuntime,
  compilation: Rspack.Compilation,
  marker: string,
  css?: DevManifestCss
) => {
  runtime.captureWeb(compilation, {
    'static/js/app': createDevManifest(marker, css),
  });
};

export const createDevRuntimeHarness = (
  loadBundle: (entryName: string) => Promise<unknown> | unknown,
  options: {
    onCssAssetOwnershipChanged?: (change: 'removed' | 'restored') => void;
    onRouteManifestChanged?: () => void;
  } = {}
) => {
  const errors: Error[] = [];
  const warnings: string[] = [];
  const loadBundleMock = rstest.fn(loadBundle);
  const server = {
    environments: {
      node: { loadBundle: loadBundleMock },
    },
  } as unknown as RsbuildDevServer;
  const runtime = createReactRouterDevRuntime({
    server,
    buildPlan: {
      defaultEntryName: 'static/js/app',
      entryNames: ['static/js/app'],
    },
    onEvaluationError: error => errors.push(error),
    onCssAssetOwnershipChanged: options.onCssAssetOwnershipChanged,
    onRouteManifestChanged: options.onRouteManifestChanged,
    onWarning: warning => warnings.push(warning),
  });
  return { errors, loadBundle: loadBundleMock, runtime, server, warnings };
};
