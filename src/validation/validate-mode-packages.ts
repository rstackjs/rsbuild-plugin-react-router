import { createRequire } from 'node:module';
import { resolve } from 'node:path';

export function validateReactRouterModePackages(root: string): void {
  const require = createRequire(resolve(root, 'package.json'));
  for (const name of ['react-router', '@react-router/dev']) {
    let version: string;
    try {
      version = require(`${name}/package.json`).version;
    } catch {
      throw new Error(
        `[react-router] Install ${name}@^7.13.0 or ^8.0.0 in the application. Optional peers are required when this mode starts.`
      );
    }
    const [major, minor] = version.split('.').map(Number);
    if (!(major === 8 || (major === 7 && minor >= 13))) {
      throw new Error(
        `[react-router] Unsupported ${name}@${version}. Use pluginRemix2() from rsbuild-plugin-react-router/remix2 for native Remix 2.`
      );
    }
  }
}
