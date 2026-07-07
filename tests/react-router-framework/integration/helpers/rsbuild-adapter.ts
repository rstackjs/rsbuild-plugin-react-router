import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import url from "node:url";
import path from "pathe";
import stripIndent from "strip-indent";

import type { TemplateName } from "./rsbuild.js";
export { prepareFixtureProjectDependencies } from "./fixture-workspace-dependencies.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../..");
const reactRouterVersion = "^8.0.1";

export const rsbuildBin = "node_modules/@rsbuild/core/bin/rsbuild.js";
export const reactRouterServeBin =
  "node_modules/@react-router/serve/dist/cli.js";

type RsbuildConfigOptions = {
  port?: number;
  base?: string;
};

export const rsbuildConfig = ({ port, base }: RsbuildConfigOptions = {}) =>
  stripIndent(`
    import { defineConfig } from "@rsbuild/core";
    import { pluginMdx } from "@rsbuild/plugin-mdx";
    import { pluginReact } from "@rsbuild/plugin-react";
    import { pluginReactRouter } from "rsbuild-plugin-react-router";

    export default defineConfig({
      ${port ? `server: { port: ${port}, host: "localhost" },` : ""}
      ${base ? `output: { assetPrefix: ${JSON.stringify(base)} },` : ""}
      plugins: [pluginReact(), pluginMdx(), pluginReactRouter()],
    });
  `);

export const rsbuildRscConfig = ({
  port,
  base,
}: RsbuildConfigOptions = {}) =>
  stripIndent(`
    import { defineConfig } from "@rsbuild/core";
    import { pluginMdx } from "@rsbuild/plugin-mdx";
    import { pluginReact } from "@rsbuild/plugin-react";
    import { pluginReactRouterRSC } from "rsbuild-plugin-react-router";

    export default defineConfig({
      ${port ? `server: { port: ${port}, host: "localhost" },` : ""}
      ${base ? `output: { assetPrefix: ${JSON.stringify(base)} },` : ""}
      plugins: [pluginReact(), pluginMdx(), pluginReactRouterRSC()],
    });
  `);

export async function finalizeFixtureProject({
  projectDir,
  port,
  templateName,
}: {
  projectDir: string;
  port?: number;
  templateName?: TemplateName;
}) {
  await writePackageJson(projectDir, templateName);
  await writeTsconfig(projectDir);

  const rsbuildConfigPath = path.join(projectDir, "rsbuild.config.ts");
  if (!existsSync(rsbuildConfigPath)) {
    await writeFile(
      rsbuildConfigPath,
      templateName?.includes("rsc")
        ? rsbuildRscConfig({ port })
        : rsbuildConfig({ port }),
      "utf8",
    );
  }
}

async function writePackageJson(projectDir: string, templateName?: TemplateName) {
  const isRscTemplate = templateName?.includes("rsc") ?? false;
  const source = await readPackageJson(projectDir);
  const packageJson = {
    ...source,
    name: source.name ?? `rr-rsbuild-${Math.random().toString(32).slice(2)}`,
    private: true,
    sideEffects: source.sideEffects ?? false,
    type: "module",
    scripts: {
      dev:
        'NODE_OPTIONS="--experimental-vm-modules --experimental-global-webcrypto" rsbuild dev --host localhost',
      build: "rsbuild build",
      start: isRscTemplate
        ? "HOST=127.0.0.1 node start.js"
        : "HOST=127.0.0.1 react-router-serve ./build/server/static/js/app.js",
      typecheck: "react-router typegen && tsc",
    },
    dependencies: {
      "@remix-run/node-fetch-server": "^0.13.3",
      "@react-router/express": reactRouterVersion,
      "@react-router/node": reactRouterVersion,
      "@react-router/serve": reactRouterVersion,
      "@vanilla-extract/css": "^1.20.1",
      express: "^4.22.2",
      isbot: "^5.1.40",
      react: "^19.2.4",
      "react-dom": "^19.2.4",
      "react-router": reactRouterVersion,
      ...(isRscTemplate ? { "react-server-dom-rspack": "0.0.2" } : {}),
      "serialize-javascript": "^6.0.1",
    },
    devDependencies: {
      "@react-router/dev": reactRouterVersion,
      "@react-router/fs-routes": reactRouterVersion,
      "@react-router/remix-routes-option-adapter": reactRouterVersion,
      "@rsbuild/core": "2.1.0",
      "@rsbuild/plugin-mdx": "^1.1.3",
      "@rsbuild/plugin-react": "2.1.0",
      "@types/node": "^25.0.10",
      "@types/react": "^19.2.10",
      "@types/react-dom": "^19.2.3",
      "@vanilla-extract/webpack-plugin": "^2.3.27",
      rsbuild: "npm:@rsbuild/core@2.1.0",
      "rsbuild-plugin-react-router": `file:${repoRoot}`,
      ...(isRscTemplate ? { "rsbuild-plugin-rsc": "^0.1.1" } : {}),
      typescript: "^5.9.3",
    },
    engines: {
      node: ">=22.22.0",
    },
  };

  await writeFile(
    path.join(projectDir, "package.json"),
    JSON.stringify(packageJson, null, 2) + "\n",
    "utf8"
  );
}

async function readPackageJson(projectDir: string): Promise<Record<string, any>> {
  try {
    return JSON.parse(
      await readFile(path.join(projectDir, "package.json"), "utf8")
    );
  } catch {
    return {};
  }
}

async function writeTsconfig(projectDir: string) {
  const tsconfigPath = path.join(projectDir, "tsconfig.json");
  await mkdir(projectDir, { recursive: true });
  await writeFile(
    tsconfigPath,
    JSON.stringify(
      {
        include: ["env.d.ts", "**/*.ts", "**/*.tsx", ".react-router/types/**/*"],
        compilerOptions: {
          lib: ["DOM", "DOM.Iterable", "ES2022"],
          types: ["node"],
          target: "ES2022",
          module: "ES2022",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          rootDirs: [".", ".react-router/types/"],
          baseUrl: ".",
          paths: {
            "~/*": ["./app/*"],
          },
          esModuleInterop: true,
          resolveJsonModule: true,
          allowJs: true,
          noEmit: true,
          skipLibCheck: true,
          strict: true,
        },
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
}
