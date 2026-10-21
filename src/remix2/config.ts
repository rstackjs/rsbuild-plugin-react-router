import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Remix2PluginOptions, ResolvedRemix2Config } from './types.js';

const versions: Record<string, string> = {
  '@remix-run/dev': '2.11.2',
  '@remix-run/node': '2.11.2',
  '@remix-run/react': '2.11.2',
  '@remix-run/server-runtime': '2.11.2',
  '@remix-run/router': '1.19.1',
  'react-router': '6.26.1',
  'react-router-dom': '6.26.1',
};

export function applicationRequire(root: string): NodeJS.Require {
  return createRequire(resolve(root, 'package.json'));
}

export function remix2PackageAliases(root: string): Record<string, string> {
  const require = applicationRequire(root);
  const aliases = Object.fromEntries(
    [...Object.keys(versions), 'react', 'react-dom'].map(name => [
      name,
      dirname(require.resolve(`${name}/package.json`)),
    ])
  );
  const react = aliases['@remix-run/react'];
  const deepAliases: Record<string, string> = {};
  for (const name of [
    'components',
    'entry',
    'links',
    'markup',
    'invariant',
    'routeModules',
  ]) {
    for (const extension of ['', '.js']) {
      deepAliases[`@remix-run/react/dist/${name}${extension}$`] = resolve(
        react,
        `dist/esm/${name}.js`
      );
    }
  }
  return { ...deepAliases, ...aliases };
}

export function validateRemix2Packages(root: string): void {
  const require = applicationRequire(root);
  for (const [name, version] of Object.entries(versions)) {
    let installed: string;
    try {
      installed = require(`${name}/package.json`).version;
    } catch {
      throw new Error(
        `[remix2] Install ${name}@${version} in the application.`
      );
    }
    if (installed !== version) {
      throw new Error(
        `[remix2] Expected ${name}@${version}, received ${installed}. Native Remix 2 cannot use RR7/8 aliases.`
      );
    }
  }
}

export function validateRemix2Config(config: ResolvedRemix2Config): void {
  for (const flag of [
    'unstable_singleFetch',
    'unstable_lazyRouteDiscovery',
  ] as const) {
    if (config.future[flag]) {
      throw new Error(
        `[remix2] future.${flag} is not supported. Disable it explicitly.`
      );
    }
  }
  if (!['esm', 'cjs'].includes(config.serverModuleFormat)) {
    throw new Error('[remix2] serverModuleFormat must be "esm" or "cjs".');
  }
  for (const file of [config.entryClientFilePath, config.entryServerFilePath]) {
    if (!existsSync(file))
      throw new Error(`[remix2] Entry file does not exist: ${file}`);
  }
}

export async function resolveRemix2Config(
  root: string,
  mode: 'development' | 'production',
  options: Remix2PluginOptions
): Promise<ResolvedRemix2Config> {
  validateRemix2Packages(root);
  if (options.config) {
    validateRemix2Config(options.config);
    return options.config;
  }
  const file = ['.js', '.cjs', '.mjs']
    .map(ext => resolve(root, `remix.config${ext}`))
    .find(existsSync);
  const imported = file
    ? await import(`${pathToFileURL(file).href}?t=${statSync(file).mtimeMs}`)
    : {};
  const raw = imported.default ?? imported;
  const app = resolve(root, raw.appDirectory || 'app');
  const hasServerEntry = ['.js', '.jsx', '.ts', '.tsx'].some(ext =>
    existsSync(resolve(app, `entry.server${ext}`))
  );
  if (!hasServerEntry) {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    if (!pkg.dependencies?.isbot) {
      throw new Error(
        '[remix2] The native default server entry requires isbot in application dependencies. Declare and install isbot, or provide entry.server. Config resolution never installs dependencies.'
      );
    }
  }
  const require = applicationRequire(root);
  const resolver = require('@remix-run/dev/dist/config.js') as {
    resolveConfig(
      raw: unknown,
      context: { rootDirectory: string; serverMode: string }
    ): Promise<ResolvedRemix2Config>;
  };
  const config = await resolver.resolveConfig(raw, {
    rootDirectory: root,
    serverMode: mode,
  });
  validateRemix2Config(config);
  return config;
}
