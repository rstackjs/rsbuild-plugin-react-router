import type { RsbuildConfig } from '@rsbuild/core';

function pluginId(name: string) {
  return `rsbuild:${name}`;
}

function flattenPlugins(input: unknown): Array<{ name?: string }> {
  if (!Array.isArray(input)) return [];
  const out: Array<{ name?: string }> = [];
  for (const item of input) {
    if (!item) continue;
    if (Array.isArray(item)) {
      out.push(...flattenPlugins(item));
      continue;
    }
    if (typeof (item as any)?.then === 'function') {
      // Skip promises - normalized config should already be resolved.
      continue;
    }
    if (typeof item === 'object') {
      out.push(item as any);
    }
  }
  return out;
}

function indexOfPlugin(plugins: Array<{ name?: string }>, names: string[]) {
  return plugins.findIndex(p => (p?.name ? names.includes(p.name) : false));
}

export type PluginOrderIssue =
  | {
      kind: 'error';
      message: string;
    }
  | {
      kind: 'warn';
      message: string;
    };

export function validatePluginOrderFromConfig(
  config: RsbuildConfig
): PluginOrderIssue[] {
  const plugins = flattenPlugins(config.plugins);
  const issues: PluginOrderIssue[] = [];

  // Best-effort port of upstream validate-plugin-order:
  // - `rsbuild:mdx` must be before `rsbuild:react-router` so that route files
  //   can be authored in MDX and still have exports parsed correctly.
  const rrIndex = indexOfPlugin(plugins, ['rsbuild:react-router']);
  const mdxIndex = indexOfPlugin(plugins, [pluginId('mdx')]);
  if (rrIndex >= 0 && mdxIndex >= 0 && mdxIndex > rrIndex) {
    issues.push({
      kind: 'error',
      message:
        `The \"rsbuild:mdx\" plugin should be placed before the React Router plugin ` +
        `in your Rsbuild config. This ensures route modules authored in MDX are ` +
        `compiled before React Router inspects route exports.`,
    });
  }

  // Rsbuild/React Router expectation: user should also include React support
  // (JSX transform + refresh). We can only warn since Rsbuild configs may not
  // use React at all (or may provide a custom JSX pipeline).
  const hasReact = plugins.some(p => p?.name === pluginId('react'));
  if (rrIndex >= 0 && !hasReact) {
    issues.push({
      kind: 'warn',
      message:
        `React Router plugin detected without \"rsbuild:react\". If you are using ` +
        `JSX/TSX route modules, add \"@rsbuild/plugin-react\" to your plugins list.`,
    });
  }

  return issues;
}
