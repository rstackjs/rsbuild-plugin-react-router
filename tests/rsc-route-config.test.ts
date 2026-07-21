import { describe, expect, it } from '@rstest/core';
import { createRscRouteConfig } from '../src/rsc-route-config';

describe('RSC route config', () => {
  it('preserves declared sibling order', () => {
    const code = createRscRouteConfig({
      appDirectory: '/app',
      routes: {
        root: { id: 'root', file: 'root.tsx' },
        'routes/b': {
          id: 'routes/b',
          parentId: 'root',
          path: 'b',
          file: 'routes/b.tsx',
        },
        'routes/a': {
          id: 'routes/a',
          parentId: 'root',
          path: 'a',
          file: 'routes/a.tsx',
        },
      },
    });

    expect(code.indexOf('id: "routes/b"')).toBeLessThan(
      code.indexOf('id: "routes/a"')
    );
  });
});
