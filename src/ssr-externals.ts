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

export function resolvePackageJson(
  name: string,
  rootDirectory: string
): string | null {
  try {
    return requireFromHere.resolve(`${name}/package.json`, {
      paths: [rootDirectory],
    });
  } catch {
    return null;
  }
}

export function getSsrExternals(rootDirectory: string): string[] {
  return REACT_ROUTER_EXTERNALS.filter(name => {
    const resolved = resolvePackageJson(name, rootDirectory);
    if (resolved === null) return false;
    let packageJsonPath = resolved;
    try {
      packageJsonPath = realpathSync(packageJsonPath);
    } catch {}
    return !packageJsonPath.split(sep).includes('node_modules');
  });
}
