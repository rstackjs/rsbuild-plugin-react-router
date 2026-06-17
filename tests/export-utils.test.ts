import { describe, expect, it } from '@rstest/core';
import { parse } from '../src/babel';
import { transformToEsm } from '../src/export-utils';

describe('export-utils', () => {
  describe('transformToEsm', () => {
    it('preserves arrow function object return parentheses', async () => {
      const code = `
        const items = [{ pathname: '/', data: 'Home' }];
        export const labels = items.map((item) => ({
          to: item.pathname,
          label: item.data,
        }));
      `;

      const transformed = await transformToEsm(code, 'route.tsx');

      expect(transformed).toContain('=> ({');
      expect(() => parse(transformed, { sourceType: 'module' })).not.toThrow();
    });
  });
});
