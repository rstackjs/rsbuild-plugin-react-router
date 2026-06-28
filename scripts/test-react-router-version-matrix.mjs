#!/usr/bin/env node
import { spawn } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const rootDir = process.cwd();
const versions = (process.env.RR_COMPAT_VERSIONS ?? '7.13.0,8.0.1')
  .split(',')
  .map(version => version.trim())
  .filter(Boolean);

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? rootDir,
      env: {
        ...process.env,
        COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
        ...options.env,
      },
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });

    let stdout = '';
    let stderr = '';
    if (options.capture) {
      child.stdout?.on('data', chunk => {
        stdout += chunk;
      });
      child.stderr?.on('data', chunk => {
        stderr += chunk;
      });
    }

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(' ')} failed with exit code ${code}\n${stderr}`
        )
      );
    });
  });

const writeFixture = async ({ appDir, version, tarball }) => {
  await mkdir(path.join(appDir, 'app', 'routes'), { recursive: true });
  const writeAppFile = (file, contents) =>
    writeFile(path.join(appDir, file), contents);

  await writeAppFile(
    'package.json',
    JSON.stringify(
      {
        private: true,
        type: 'module',
        scripts: {
          build: 'rsbuild build',
        },
        dependencies: {
          '@react-router/dev': version,
          '@react-router/node': version,
          '@rsbuild/core': '2.1.0',
          '@rsbuild/plugin-react': '2.1.0',
          react: '^19.2.4',
          'react-dom': '^19.2.4',
          'react-router': version,
          'rsbuild-plugin-react-router': `file:${tarball}`,
        },
        devDependencies: {
          '@types/node': '^25.0.10',
          '@types/react': '^19.2.10',
          '@types/react-dom': '^19.2.3',
          typescript: '^5.9.3',
        },
      },
      null,
      2
    ) + '\n'
  );

  await writeAppFile(
    'rsbuild.config.ts',
    `import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';

export default defineConfig({
  plugins: [pluginReactRouter(), pluginReact()],
});
`
  );

  await writeAppFile(
    'react-router.config.ts',
    `export default {
  ssr: true,
  routeDiscovery: { mode: 'initial' },
  splitRouteModules: true,
  subResourceIntegrity: true,
  prerender: { paths: ['/'], concurrency: 1 },
};
`
  );

  await writeAppFile(
    path.join('app', 'root.tsx'),
    `import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

export default function Root() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
`
  );

  await writeAppFile(
    path.join('app', 'routes.ts'),
    `import { index } from '@react-router/dev/routes';

export default [index('routes/index.tsx')];
`
  );

  await writeAppFile(
    path.join('app', 'routes', 'index.tsx'),
    `export function loader() {
  return { message: 'React Router ${version}' };
}

export default function Index() {
  return <main>React Router ${version} compatibility</main>;
}
`
  );
};

const assertFile = async file => {
  try {
    await access(file);
  } catch {
    throw new Error(`Expected ${file} to exist`);
  }
};

const assertBrowserManifest = async clientDir => {
  const jsDir = path.join(clientDir, 'static', 'js');
  const files = await readdir(jsDir, { recursive: true });
  const hasBrowserManifest = files.some(
    file =>
      file.startsWith('manifest-') ||
      file === path.join('virtual', 'react-router', 'browser-manifest.js')
  );
  if (!hasBrowserManifest) {
    throw new Error(`Expected ${jsDir} to contain a React Router manifest`);
  }
};

const main = async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'rr-version-matrix-'));
  try {
    const packResult = await run(
      'npm',
      ['pack', '--json', '--pack-destination', tempRoot],
      { capture: true }
    );
    const [packInfo] = JSON.parse(packResult.stdout);
    const tarball = path.join(tempRoot, packInfo.filename);

    for (const version of versions) {
      const appDir = path.join(tempRoot, `rr-${version}`);
      await mkdir(appDir, { recursive: true });
      await writeFixture({ appDir, version, tarball });
      await run('pnpm', ['install'], { cwd: appDir });
      await run('pnpm', ['build'], { cwd: appDir });

      await assertFile(path.join(appDir, 'build', 'client', 'index.html'));
      await assertFile(path.join(appDir, 'build', 'server', 'index.js'));
      await assertBrowserManifest(path.join(appDir, 'build', 'client'));

      console.log(`React Router ${version} package smoke passed.`);
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
};

await main();
