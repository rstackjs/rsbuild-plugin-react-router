import { accessSync, existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import {
  assertNoViteConfigFiles,
  finalizeFixtureProject,
} from './react-router-framework/integration/helpers/rsbuild-adapter.js';
import { rsbuildConfig } from './react-router-framework/integration/helpers/rsbuild-config.js';

describe('React Router framework fixture adapter', () => {
  beforeEach(() => {
    rstest.mocked(existsSync).mockImplementation(file => {
      try {
        accessSync(file);
        return true;
      } catch {
        return false;
      }
    });
  });

  afterEach(() => {
    rstest.mocked(existsSync).mockReturnValue(true);
  });

  it.each([
    'vite.config.ts',
    'vite.config.js',
    'vite.config.cjs',
    'vite.config.mjs',
    'vite.config.cts',
    'vite.config.mts',
  ])('rejects unsupported fixture config %s', filename => {
    expect(() => assertNoViteConfigFiles({ [filename]: 'config' })).toThrow(
      `[rsbuild-adapter] Unsupported fixture config "${filename}". Author rsbuild.config.ts explicitly so test-specific options are preserved.`
    );
  });

  it('returns ordinary fixture files and rsbuild.config.ts unchanged', () => {
    const files = {
      'app/root.tsx': 'export default function Root() {}',
      'rsbuild.config.ts': 'export default {};',
    };

    expect(assertNoViteConfigFiles(files)).toBe(files);
  });

  it('preserves an authored tsconfig.json', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'rr-rsbuild-adapter-'));
    const authored = JSON.stringify({
      include: ['custom/**/*'],
      compilerOptions: {
        moduleDetection: 'force',
        types: ['custom-runtime'],
        paths: { '#custom/*': ['./src/*'] },
      },
    });

    try {
      await writeFile(join(projectDir, 'tsconfig.json'), authored);

      await finalizeFixtureProject({ projectDir });

      expect(await readFile(join(projectDir, 'tsconfig.json'), 'utf8')).toBe(
        authored
      );
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it('creates the default tsconfig.json when it is missing', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'rr-rsbuild-adapter-'));

    try {
      await finalizeFixtureProject({ projectDir });

      const tsconfig = JSON.parse(
        await readFile(join(projectDir, 'tsconfig.json'), 'utf8')
      );
      expect(tsconfig.include).toEqual([
        'env.d.ts',
        '**/*.ts',
        '**/*.tsx',
        '.react-router/types/**/*',
      ]);
      expect(tsconfig.compilerOptions.rootDirs).toEqual([
        '.',
        '.react-router/types/',
      ]);
      expect(tsconfig.compilerOptions.paths).toEqual({
        '~/*': ['./app/*'],
      });
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });

  it.each([
    ['rsbuild-template', 'pluginReactRouter'],
    ['rsc-framework', 'pluginReactRouterRSC'],
  ] as const)(
    'creates the %s config with %s',
    async (templateName, routerPlugin) => {
      const projectDir = await mkdtemp(join(tmpdir(), 'rr-rsbuild-adapter-'));

      try {
        await finalizeFixtureProject({
          projectDir,
          port: 4173,
          templateName,
        });

        const config = await readFile(
          join(projectDir, 'rsbuild.config.ts'),
          'utf8'
        );
        expect(config).toContain(
          `import { ${routerPlugin} } from "rsbuild-plugin-react-router";`
        );
        expect(config).toContain(
          'import { pluginMdx } from "@rsbuild/plugin-mdx";'
        );
        expect(config).toContain('pluginMdx()');
        expect(config).toContain(`${routerPlugin}()`);
        expect(config).toContain('port: 4173');
        expect(config).toContain('strictPort: true');
      } finally {
        await rm(projectDir, { recursive: true, force: true });
      }
    }
  );

  it('retains every supplied Rsbuild config option', async () => {
    const config = await rsbuildConfig.basic({
      port: 4173,
      templateName: 'rsbuild-template',
      base: '/base/',
      assetsInlineLimit: 512,
      assetsDir: 'static',
      cssCodeSplit: false,
      defineNodeEnv: true,
      envPrefixes: ['PUBLIC_'],
      mdx: true,
      svgr: true,
      tailwind: true,
      sass: true,
      less: true,
      vanillaExtract: true,
    });

    expect(config).toContain('port: 4173');
    expect(config).toContain('assetPrefix: "/base/"');
    expect(config).toContain('dataUriLimit: 512');
    expect(config).toContain('distPath: { assets: "static" }');
    expect(config).toContain('build.cssCodeSplit: false');
    expect(config).toContain('"process.env.NODE_ENV"');
    expect(config).toContain('loadEnv({ prefixes: ["PUBLIC_"] })');
    expect(config).toContain('pluginMdx()');
    expect(config).toContain('pluginSvgr()');
    expect(config).toContain('pluginTailwindcss()');
    expect(config).toContain('pluginSass()');
    expect(config).toContain('pluginLess()');
    expect(config).toContain('new VanillaExtractPlugin');
  });

  it('preserves the shipped rsc-preview config', async () => {
    const projectDir = await mkdtemp(join(tmpdir(), 'rr-rsbuild-adapter-'));
    const shippedConfig = await readFile(
      join(
        process.cwd(),
        'tests/react-router-framework/integration/helpers/rsc-preview/rsbuild.config.ts'
      ),
      'utf8'
    );

    try {
      const configPath = join(projectDir, 'rsbuild.config.ts');
      await writeFile(configPath, shippedConfig);

      await finalizeFixtureProject({
        projectDir,
        port: 4173,
        templateName: 'rsc-preview',
      });

      expect(await readFile(configPath, 'utf8')).toBe(shippedConfig);
    } finally {
      await rm(projectDir, { recursive: true, force: true });
    }
  });
});
