import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { sync as spawnSync } from "cross-spawn";
import url from "node:url";
import path from "pathe";
import stripIndent from "strip-indent";

import type { TemplateName } from "./vite.js";

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

export const normalizeFixtureFiles = <T>(
  files: Record<string, T> = {}
): Record<string, T> => {
  const normalized: Record<string, T> = {};
  const isRscConfig = Object.values(files).some(
    contents =>
      typeof contents === "string" && contents.includes("reactRouterRSC")
  );

  for (const [filename, contents] of Object.entries(files)) {
    if (/^vite\.config\.[cm]?[jt]s$/.test(filename)) {
      normalized["rsbuild.config.ts"] =
        typeof contents === "string" &&
        contents.includes("rsbuild-plugin-react-router")
          ? contents
          : ((isRscConfig ? rsbuildRscConfig() : rsbuildConfig()) as T);
      continue;
    }
    normalized[filename] = contents;
  }

  return normalized;
};

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

  await Promise.all(
    ["vite.config.ts", "vite.config.js", "vite.config.mjs"].map(file =>
      rm(path.join(projectDir, file), { force: true })
    )
  );

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

export function installFixtureProject(projectDir: string) {
  if (existsSync(path.join(projectDir, "node_modules"))) {
    return;
  }

  const install = spawnSync("pnpm", ["install", "--ignore-workspace", "--silent"], {
    cwd: projectDir,
    env: {
      ...process.env,
      COREPACK_ENABLE_DOWNLOAD_PROMPT: "0",
    },
  });

  if (install.error || install.status) {
    throw install.error ?? new Error(install.stderr.toString("utf8"));
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
      rsbuild: "npm:@rsbuild/core@2.1.0",
      "rsbuild-plugin-react-router": `file:${repoRoot}`,
      ...(isRscTemplate ? { "rsbuild-plugin-rsc": "^0.1.1" } : {}),
      typescript: "^5.9.3",
      "vite-env-only": "^3.0.3",
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
