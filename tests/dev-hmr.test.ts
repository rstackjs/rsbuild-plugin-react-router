import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import {
  createDevHdrRevisionSignal,
  generateDevHmrRuntimeModule,
  resolveReactRefreshRuntimePath,
} from '../src/dev-hmr';

describe('createDevHdrRevisionSignal', () => {
  it('writes the revision file on ensure() and increments on bump()', () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-dev-hmr-'));
    try {
      const filePath = join(root, '.react-router', 'hdr-revision.mjs');
      const signal = createDevHdrRevisionSignal({ filePath });

      signal.ensure();
      expect(readFileSync(filePath, 'utf8')).toBe('export default 0;\n');

      signal.bump();
      expect(readFileSync(filePath, 'utf8')).toBe('export default 1;\n');

      signal.bump();
      expect(readFileSync(filePath, 'utf8')).toBe('export default 2;\n');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('generateDevHmrRuntimeModule', () => {
  it('accepts hot updates for the hdr revision path and exposes the runtime contract', () => {
    const code = generateDevHmrRuntimeModule({
      reactRefreshRuntimePath: '/node_modules/react-refresh/runtime.js',
      hdrRevisionFilePath: '/app/.react-router/hdr-revision.mjs',
    });

    expect(code).toContain(
      'import.meta.webpackHot.accept(\n    "/app/.react-router/hdr-revision.mjs"'
    );
    expect(code).toContain('export function registerReactRouterRouteExports');
    expect(code).toContain('export function scheduleReactRouterRouteUpdate');
  });
});

describe('resolveReactRefreshRuntimePath', () => {
  it('returns undefined for a directory with no @rsbuild/plugin-react', () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-dev-hmr-no-plugin-'));
    try {
      expect(resolveReactRefreshRuntimePath(root)).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
