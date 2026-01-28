import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { sep } from 'node:path';

const REACT_ROUTER_EXTERNALS = [
  'react-router',
  'react-router-dom',
  '@react-router/architect',
  '@react-router/cloudflare',
  '@react-router/dev',
  '@react-router/express',
  '@react-router/node',
  '@react-router/serve',
];

const requireFromHere = createRequire(import.meta.url);

function resolvePackageJson(name: string, rootDirectory: string): string | null {
  try {
    return requireFromHere.resolve(`${name}/package.json`, {
      paths: [rootDirectory],
    });
  } catch {
    return null;
  }
}

function safeRealpath(pathname: string): string {
  try {
    return realpathSync(pathname);
  } catch {
    return pathname;
  }
}

function isPathInNodeModules(pathname: string): boolean {
  return pathname.split(sep).includes('node_modules');
}

export function getSsrExternals(rootDirectory: string): string[] {
  const externals: string[] = [];

  for (const name of REACT_ROUTER_EXTERNALS) {
    const resolved = resolvePackageJson(name, rootDirectory);
    if (!resolved) {
      continue;
    }

    const realPath = safeRealpath(resolved);
    if (!isPathInNodeModules(realPath)) {
      externals.push(name);
    }
  }

  return externals;
}
