import { describe, expect, it } from 'vitest';
import { validatePluginOrderFromConfig } from '../src/validation/validate-plugin-order';

describe('validatePluginOrderFromConfig', () => {
  it('errors when rsbuild:mdx comes after rsbuild:react-router', () => {
    const issues = validatePluginOrderFromConfig({
      plugins: [{ name: 'rsbuild:react-router' }, { name: 'rsbuild:mdx' }],
    } as any);

    expect(issues.some(i => i.kind === 'error')).toBe(true);
  });

  it('warns when rsbuild:react is missing', () => {
    const issues = validatePluginOrderFromConfig({
      plugins: [{ name: 'rsbuild:react-router' }],
    } as any);

    expect(issues.some(i => i.kind === 'warn')).toBe(true);
  });

  it('no issues for a typical ordering', () => {
    const issues = validatePluginOrderFromConfig({
      plugins: [
        { name: 'rsbuild:mdx' },
        { name: 'rsbuild:react-router' },
        { name: 'rsbuild:react' },
      ],
    } as any);

    expect(issues).toHaveLength(0);
  });
});

