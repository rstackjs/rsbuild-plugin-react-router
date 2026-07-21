import path from 'node:path';
import { describe, expect, it } from '@rstest/core';
import { resolvePathWithinRoot } from './react-router-framework/integration/helpers/safe-path.js';

describe('React Router framework fixture paths', () => {
  const root = path.resolve('/tmp/fixture/build/client');

  it('resolves request paths beneath the client build directory', () => {
    expect(resolvePathWithinRoot(root, '/')).toBe(root);
    expect(resolvePathWithinRoot(root, '/about', 'index.html')).toBe(
      path.join(root, 'about', 'index.html')
    );
    expect(resolvePathWithinRoot(root, '/route.data')).toBe(
      path.join(root, 'route.data')
    );
  });

  it('rejects request paths that escape the client build directory', () => {
    expect(resolvePathWithinRoot(root, '/../secret')).toBeUndefined();
    expect(
      resolvePathWithinRoot(root, '/nested/../../../secret', 'index.html')
    ).toBeUndefined();
  });
});
