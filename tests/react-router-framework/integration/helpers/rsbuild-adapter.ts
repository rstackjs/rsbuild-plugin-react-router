import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import url from "node:url";
import path from "pathe";
import stripIndent from "strip-indent";

import type { TemplateName } from "./rsbuild.js";
export { prepareFixtureProjectDependencies } from "./fixture-workspace-dependencies.js";

// Templates that author their OWN rsbuild.config.ts in the template directory
// (see integration/helpers/<name>/rsbuild.config.ts). The synthesizer below
// must never generate a config for these: a synthesized config would be the
// wrong bundler mode. `rsc-preview` is the data-mode RSC bundler template — it
// ships an rsbuild.config.ts wired for `rsbuild-plugin-rsc` directly, NOT the
// framework-mode `pluginReactRouterRSC`. Keep this in sync with the
// TemplateName union in ./rsbuild.ts.
const TEMPLATES_SHIPPING_OWN_CONFIG: ReadonlySet<TemplateName> = new Set<TemplateName>([
  "rsc-preview",
]);

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
      // Safety net only: the corpus should author rsbuild.config.ts directly.
      const passthrough =
        typeof contents === "string" &&
        contents.includes("rsbuild-plugin-react-router");
      console.warn(
        `[rsbuild-adapter] Intercepted Vite config fixture "${filename}"` +
          (passthrough
            ? " (renamed to rsbuild.config.ts)."
            : " and replaced it with a generic rsbuild config; per-test bundler options were DISCARDED.") +
          " Author rsbuild.config.ts in the test fixture instead.",
      );
      normalized["rsbuild.config.ts"] = passthrough
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
  const configExists = existsSync(rsbuildConfigPath);

  if (templateName != null && TEMPLATES_SHIPPING_OWN_CONFIG.has(templateName)) {
    // This template is expected to carry its own rsbuild.config.ts. Never
    // synthesize one — a generic synthesized config would be the wrong bundler
    // mode (e.g. framework-mode `pluginReactRouterRSC` instead of the
    // data-mode `rsbuild-plugin-rsc` setup rsc-preview needs). If the shipped
    // config is missing, that is a corpus/template regression, so fail loudly
    // and name the offending template rather than silently writing a
    // wrong-mode config.
    if (!configExists) {
      throw new Error(
        `[rsbuild-adapter] Template "${templateName}" is expected to ship its ` +
          `own rsbuild.config.ts, but none was found at ${rsbuildConfigPath}. ` +
          `Restore the template's rsbuild.config.ts instead of relying on the ` +
          `synthesizer — a synthesized config would be the wrong bundler mode.`,
      );
    }
    return;
  }

  if (!configExists) {
    // Framework-mode templates don't ship a config; synthesize the right one.
    // Only the framework RSC template (`rsc-framework`) gets
    // `pluginReactRouterRSC`; every other framework template gets the standard
    // `pluginReactRouter`. Matching the exact template name (rather than a
    // loose `includes("rsc")`) avoids conflating rsc-framework with the
    // data-mode rsc-preview template handled above.
    await writeFile(
      rsbuildConfigPath,
      templateName === "rsc-framework"
        ? rsbuildRscConfig({ port })
        : rsbuildConfig({ port }),
      "utf8",
    );
  }
}

async function writePackageJson(projectDir: string, templateName?: TemplateName) {
  const isRscTemplate = templateName?.includes("rsc") ?? false;
  const source = await readPackageJson(projectDir);
  // The production server entry differs per template, so the "start" script has
  // to match the actual entry file. Nothing in the harness actually runs this
  // script — framework fixtures are served via react-router-serve (see
  // reactRouterServe in rsbuild.ts) and rsc-preview is served by invoking
  // server.js directly (see integration/rsc/utils.ts) — but we keep it pointed
  // at the correct file so the generated package.json isn't a trap:
  //   - rsc-framework ships start.js
  //   - rsc-preview   ships server.js (NOT start.js)
  // A loose `isRscTemplate ? node start.js` conflated the two and wrote a
  // dangling `node start.js` for rsc-preview.
  const startScript =
    templateName === "rsc-framework"
      ? "HOST=127.0.0.1 node start.js"
      : templateName === "rsc-preview"
        ? "HOST=127.0.0.1 node server.js"
        : "HOST=127.0.0.1 react-router-serve ./build/server/static/js/app.js";
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
      start: startScript,
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
      "@rsbuild/plugin-less": "1.6.4",
      "@rsbuild/plugin-mdx": "^1.1.3",
      "@rsbuild/plugin-react": "2.1.0",
      "@rsbuild/plugin-sass": "1.5.3",
      "@rsbuild/plugin-svgr": "2.0.4",
      "@rsbuild/plugin-tailwindcss": "2.0.3",
      "@types/node": "^25.0.10",
      "@types/react": "^19.2.10",
      "@types/react-dom": "^19.2.3",
      "@vanilla-extract/webpack-plugin": "^2.3.27",
      rsbuild: "npm:@rsbuild/core@2.1.0",
      "rsbuild-plugin-react-router": `file:${repoRoot}`,
      tailwindcss: "4.3.2",
      // rsbuild-plugin-rsc version pin. It is pre-1.0, so EVERY 0.x minor is a
      // breaking change — bump all of these locations together:
      //   1. package.json          -> dependencies["rsbuild-plugin-rsc"]
      //   2. package.json          -> peerDependencies["rsbuild-plugin-rsc"]
      //   3. scripts/sync-react-router-framework-tests.mjs -> packageVersionByName["rsbuild-plugin-rsc"]
      //        (the source of truth for the fixture package.jsons — a sync
      //         rewrites them from this map)
      //   4. this file (rsbuild-adapter.ts) -> synthesized devDependency below
      //   5. tests/react-router-framework/integration/helpers/rsc-framework/package.json
      //   6. tests/react-router-framework/integration/helpers/rsc-preview/package.json
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
