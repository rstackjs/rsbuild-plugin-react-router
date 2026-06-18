import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { ensureRestartMarker } from '../src/index';

describe('route watch restart marker', () => {
  it('creates the restart marker when missing', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    try {
      const markerPath = join(root, 'build/.react-router-route-watch');

      await ensureRestartMarker(markerPath);

      expect(readFileSync(markerPath, 'utf8')).not.toBe('');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not rewrite an existing restart marker on dev server startup', async () => {
    const root = mkdtempSync(join(tmpdir(), 'rr-route-watch-'));
    try {
      const markerPath = join(root, 'build/.react-router-route-watch');
      mkdirSync(join(root, 'build'), { recursive: true });
      writeFileSync(markerPath, 'existing');

      await ensureRestartMarker(markerPath);

      expect(readFileSync(markerPath, 'utf8')).toBe('existing');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
