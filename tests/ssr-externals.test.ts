import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getSsrExternals } from '../src/ssr-externals';

describe('getSsrExternals', () => {
  it('includes linked packages resolved outside node_modules', () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-externals-'));
    try {
      const nodeModules = join(root, 'node_modules');
      mkdirSync(nodeModules, { recursive: true });

      const linkedPkg = join(root, 'linked-react-router');
      mkdirSync(linkedPkg, { recursive: true });
      writeFileSync(
        join(linkedPkg, 'package.json'),
        JSON.stringify({ name: 'react-router' })
      );
      symlinkSync(linkedPkg, join(nodeModules, 'react-router'), 'dir');

      const scopedDir = join(nodeModules, '@react-router');
      mkdirSync(scopedDir, { recursive: true });
      const nodePkg = join(scopedDir, 'node');
      mkdirSync(nodePkg, { recursive: true });
      writeFileSync(
        join(nodePkg, 'package.json'),
        JSON.stringify({ name: '@react-router/node' })
      );

      const externals = getSsrExternals(root);
      expect(externals).toContain('react-router');
      expect(externals).not.toContain('@react-router/node');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
