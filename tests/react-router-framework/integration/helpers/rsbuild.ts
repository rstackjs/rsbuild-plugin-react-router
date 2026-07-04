import type { ChildProcess } from "node:child_process";
import { sync as spawnSync, spawn } from "cross-spawn";
import { existsSync, globSync } from "node:fs";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { platform } from "node:os";
import type { Readable } from "node:stream";
import url from "node:url";
import path from "pathe";
import stripIndent from "strip-indent";
import waitOn from "wait-on";
import getPort from "get-port";
import shell from "shelljs";
import dedent from "dedent";
import type { Page } from "@playwright/test";
import { test as base, expect } from "@playwright/test";
import type { Config } from "@react-router/dev/config";
import {
  finalizeFixtureProject,
  installFixtureProject,
  normalizeFixtureFiles,
  reactRouterServeBin,
  rsbuildBin,
} from "./rsbuild-adapter.js";

const nodeRequire = createRequire(import.meta.url);

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "../..");
const TMP_DIR = path.join(root, ".tmp/integration");

export const reactRouterConfig = (
  // Don't support function configs due to JSON.stringify()
  config: Omit<Partial<Config>, "buildEnd" | "presets" | "serverBundles"> = {},
) => {
  if (
    typeof config.prerender === "function" ||
    (typeof config.prerender === "object" &&
      !Array.isArray(config.prerender) &&
      typeof config.prerender.paths === "function")
  ) {
    throw new Error("reactRouterConfig() does not support prerender functions");
  }

  return dedent`
    import type { Config } from "@react-router/dev/config";

    export default ${JSON.stringify(config, null, 2)} satisfies Config;
  `;
};

type RsbuildConfigServerArgs = {
  port: number;
};

type RsbuildConfigBuildArgs = {
  assetsInlineLimit?: number;
  assetsDir?: string;
  cssCodeSplit?: boolean;
};

type RsbuildConfigBaseArgs = {
  templateName?: TemplateName;
  base?: string;
  mdx?: boolean;
  vanillaExtract?: boolean;
};

type RsbuildConfigArgs = (
  | RsbuildConfigServerArgs
  | { [K in keyof RsbuildConfigServerArgs]?: never }
) &
  RsbuildConfigBuildArgs &
  RsbuildConfigBaseArgs;

const configSection = (name: string, entries: string[]) =>
  entries.length > 0
    ? [`${name}: {`, ...entries.map((entry) => `  ${entry}`), `},`]
    : [];

const CSS_CODE_SPLIT_NOTE =
  '// Vite "build.cssCodeSplit: false" is not mapped: rsbuild always extracts CSS and these fixtures only assert that styles are applied.';

/**
 * Emits rsbuild.config.ts contents for test fixtures.
 *
 * Vite -> rsbuild option mappings used by the corpus:
 * - `base` -> `output.assetPrefix` + `dev.assetPrefix`. We intentionally do
 *   not use rsbuild `server.base` (React Router's `basename` handles route
 *   prefixing and the plugin's dev SSR middleware serves all paths).
 * - `server.port` + `strictPort` -> `server.port` + `server.strictPort`
 * - `build.assetsInlineLimit` -> `output.dataUriLimit`
 * - `build.assetsDir` -> `output.distPath.assets`
 * - vanilla-extract Vite plugin -> `@vanilla-extract/webpack-plugin` via
 *   `tools.rspack`
 * - MDX rollup plugin -> `@rsbuild/plugin-mdx`
 *
 * Intentionally unmapped Vite options:
 * - `server.hmr.port`: rsbuild serves the HMR websocket on the dev server port
 * - `server.fs.allow`: Vite-only static file serving restriction
 * - `build.cssCodeSplit`: see CSS_CODE_SPLIT_NOTE
 * - `vite-tsconfig-paths`: rsbuild resolves tsconfig `paths` natively
 */
export const rsbuildConfig = {
  // Emits the `server` section of an rsbuild config object literal so tests
  // can compose their own rsbuild.config.ts strings.
  server: async ({ port }: RsbuildConfigServerArgs) => {
    return dedent`
      server: {
        port: ${port},
        strictPort: true,
      },
    `;
  },
  // Emits the `output` section of an rsbuild config object literal.
  build: ({
    assetsInlineLimit,
    assetsDir,
    cssCodeSplit,
  }: RsbuildConfigBuildArgs = {}) => {
    return [
      ...configSection("output", [
        ...(assetsInlineLimit !== undefined
          ? [`dataUriLimit: ${assetsInlineLimit}, // Vite: build.assetsInlineLimit`]
          : []),
        ...(assetsDir !== undefined
          ? [
              `distPath: { assets: ${JSON.stringify(assetsDir)} }, // Vite: build.assetsDir`,
            ]
          : []),
      ]),
      ...(cssCodeSplit === false ? [CSS_CODE_SPLIT_NOTE] : []),
    ].join("\n");
  },
  // Emits a complete rsbuild.config.ts.
  basic: async (args: RsbuildConfigArgs = {}) => {
    const isRsc = args.templateName?.includes("rsc") ?? false;
    const routerPlugin = isRsc ? "pluginReactRouterRSC" : "pluginReactRouter";

    const imports = [
      `import { defineConfig } from "@rsbuild/core";`,
      ...(args.mdx ? [`import { pluginMdx } from "@rsbuild/plugin-mdx";`] : []),
      `import { pluginReact } from "@rsbuild/plugin-react";`,
      `import { ${routerPlugin} } from "rsbuild-plugin-react-router";`,
      ...(args.vanillaExtract
        ? [
            `import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";`,
          ]
        : []),
    ];

    const config = [
      ...configSection("server", [
        ...(args.port !== undefined
          ? [`port: ${args.port},`, `strictPort: true,`]
          : []),
      ]),
      ...configSection("dev", [
        ...(args.base !== undefined
          ? [`assetPrefix: ${JSON.stringify(args.base)}, // Vite: base (dev)`]
          : []),
      ]),
      ...configSection("output", [
        ...(args.base !== undefined
          ? [`assetPrefix: ${JSON.stringify(args.base)}, // Vite: base`]
          : []),
        ...(args.assetsInlineLimit !== undefined
          ? [`dataUriLimit: ${args.assetsInlineLimit}, // Vite: build.assetsInlineLimit`]
          : []),
        ...(args.assetsDir !== undefined
          ? [
              `distPath: { assets: ${JSON.stringify(args.assetsDir)} }, // Vite: build.assetsDir`,
            ]
          : []),
      ]),
      ...(args.vanillaExtract
        ? [
            `// vanilla-extract via @vanilla-extract/webpack-plugin.`,
            `// - identifiers: "debug" keeps class names deterministic across the`,
            `//   client and server compilations (SSR markup must match client CSS).`,
            `// - optimization.sideEffects is disabled so side-effect-only .css.ts`,
            `//   imports (compiled to virtual CSS imports) survive the fixture's`,
            `//   "sideEffects": false package flag.`,
            `tools: {`,
            `  rspack: {`,
            `    plugins: [new VanillaExtractPlugin({ identifiers: "debug" })],`,
            `    optimization: { sideEffects: false },`,
            `  },`,
            `},`,
          ]
        : []),
      ...(args.cssCodeSplit === false ? [CSS_CODE_SPLIT_NOTE] : []),
      `plugins: [pluginReact(), ${args.mdx ? "pluginMdx(), " : ""}${routerPlugin}()],`,
    ];

    return [
      ...imports,
      "",
      "export default defineConfig({",
      ...config.map((line) => `  ${line}`),
      "});",
      "",
    ].join("\n");
  },
};

export const EXPRESS_SERVER = (args: {
  port: number;
  base?: string;
  customLogic?: string;
  templateName?: TemplateName;
}) => {
  if (args.templateName?.includes("rsc")) {
    return String.raw`
      import { createRequestListener } from "@remix-run/node-fetch-server";
      import express from "express";

      const app = express();

      ${args?.customLogic || ""}

      if (process.env.NODE_ENV === "production") {
        app.use(${JSON.stringify(args.base || "/")}, express.static("build/client", { index: false }));
        let build = (await import("./build/server/index.js")).default;
        app.all("*", createRequestListener(build.fetch));
      } else {
        throw new Error("Custom RSC dev servers need an Rsbuild dev-server adapter");
      }

      const port = ${args.port};
      app.listen(port, () => console.log('http://localhost:' + port));
    `;
  }

  return String.raw`
    import { createRequestHandler } from "@react-router/express";
    import express from "express";

    const app = express();

    if (process.env.NODE_ENV === "production") {
      app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" })
      );
    } else {
      throw new Error("Custom dev servers need an Rsbuild dev-server adapter");
    }
    app.use(express.static("build/client", { maxAge: "1h" }));

    ${args?.customLogic || ""}

    app.all(
      "*",
      createRequestHandler({
        build: await import("./build/server/static/js/app.js"),
      })
    );

    const port = ${args.port};
    app.listen(port, () => console.log('http://localhost:' + port));
  `;
};

type FrameworkModeBundlerTemplateName =
  | "rsbuild-template"
  | "vite-plugin-cloudflare-template";

type FrameworkModeRscTemplateName = "rsc-framework";

type FrameworkModeCloudflareTemplateName = "vite-plugin-cloudflare-template";

export type RscBundlerTemplateName = "rsc-preview";

export type TemplateName =
  | FrameworkModeBundlerTemplateName
  | FrameworkModeRscTemplateName
  | FrameworkModeCloudflareTemplateName
  | RscBundlerTemplateName;

// Collapsed from the upstream Vite 7/Vite 8 template pair: the Vite major
// version split is meaningless for rsbuild, so suites parameterized over
// these templates run once.
export const bundlerTemplates = [
  { templateName: "rsbuild-template", templateDisplayName: "rsbuild" },
] as const satisfies Array<{
  templateName: FrameworkModeBundlerTemplateName;
  templateDisplayName: string;
}>;

export const rscBundlerTemplates = [
  { templateName: "rsc-preview", templateDisplayName: "RSC (rsbuild)" },
] as const satisfies Array<{
  templateName: RscBundlerTemplateName;
  templateDisplayName: string;
}>;

export async function createProject(
  files: Record<string, string> = {},
  templateName: TemplateName = "rsbuild-template",
) {
  let projectName = `rr-${Math.random().toString(32).slice(2)}`;
  let projectDir = path.join(TMP_DIR, projectName);
  await mkdir(projectDir, { recursive: true });

  // base template
  let templateDir = path.resolve(__dirname, templateName);
  await cp(templateDir, projectDir, { errorOnExist: true, recursive: true });

  // user-defined files
  await Promise.all(
    Object.entries(normalizeFixtureFiles(files)).map(async ([filename, contents]) => {
      let filepath = path.join(projectDir, filename);
      await mkdir(path.dirname(filepath), { recursive: true });
      await writeFile(filepath, stripIndent(contents));
    }),
  );

  await finalizeFixtureProject({ projectDir, templateName });
  installFixtureProject(projectDir);

  return projectDir;
}

// Avoid "Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env
// being set" in vite-ecosystem-ci which breaks empty stderr assertions. To fix
// this, we always ensure that only NO_COLOR is set after spreading process.env.
const colorEnv = {
  FORCE_COLOR: undefined,
  NO_COLOR: "1",
} as const;

export const build = ({
  cwd,
  env = {},
}: {
  cwd: string;
  env?: Record<string, string>;
}) => {
  let nodeBin = process.argv[0];
  installFixtureProject(cwd);

  return spawnSync(nodeBin, [rsbuildBin, "build"], {
    cwd,
    env: {
      ...process.env,
      ...colorEnv,
      ...env,
    },
  });
};

const formatBuildFailure = (result: ReturnType<typeof build>) => {
  const stdout = result.stdout?.toString("utf8").trim();
  const stderr = result.stderr?.toString("utf8").trim();
  return [
    `Expected Rsbuild build to exit successfully, got status=${result.status} signal=${result.signal}`,
    stdout ? `stdout:\n${stdout}` : "stdout: <empty>",
    stderr ? `stderr:\n${stderr}` : "stderr: <empty>",
  ].join("\n\n");
};

export const reactRouterServe = async ({
  cwd,
  port,
  serverBundle,
  basename,
}: {
  cwd: string;
  port: number;
  serverBundle?: string;
  basename?: string;
}) => {
  let nodeBin = process.argv[0];
  const isRscFixture =
    !serverBundle &&
    existsSync(path.join(cwd, "start.js")) &&
    existsSync(path.join(cwd, "build/server/index.js"));
  const args = isRscFixture
    ? ["start.js"]
    : [
        reactRouterServeBin,
        `build/server/${serverBundle ? serverBundle + "/" : ""}static/js/app.js`,
      ];
  let serveProc = spawn(nodeBin, args, {
    cwd,
    stdio: "pipe",
    env: { NODE_ENV: "production", PORT: port.toFixed(0) },
  });
  await waitForServer(serveProc, { port, basename });
  return () => serveProc.kill();
};

export const wranglerPagesDev = async ({
  cwd,
  port,
}: {
  cwd: string;
  port: number;
}) => {
  let nodeBin = process.argv[0];
  let wranglerBin = nodeRequire.resolve("wrangler/bin/wrangler.js", {
    paths: [cwd],
  });

  let proc = spawn(
    nodeBin,
    [wranglerBin, "pages", "dev", "./build/client", "--port", String(port)],
    {
      cwd,
      stdio: "pipe",
      env: { NODE_ENV: "production" },
    },
  );
  await waitForServer(proc, { port, host: "127.0.0.1" });
  return () => proc.kill();
};

type ServerArgs = {
  cwd: string;
  port: number;
  env?: Record<string, string>;
  basename?: string;
};

export const createDev =
  (nodeArgs: string[]) =>
  async ({ cwd, port, env, basename }: ServerArgs): Promise<() => unknown> => {
    installFixtureProject(cwd);
    const args =
      nodeArgs[0] === rsbuildBin && nodeArgs[1] === "dev"
        ? [...nodeArgs, "--port", String(port)]
        : nodeArgs;
    let proc = node(args, { cwd, env });
    await waitForServer(proc, { port, basename });
    return () => proc.kill();
  };

export const dev = createDev([rsbuildBin, "dev", "--host", "localhost"]);
export const customDev = createDev(["./server.mjs"]);

export const rsbuildPreview = async ({
  cwd,
  port,
}: {
  cwd: string;
  port: number;
}) => {
  return reactRouterServe({ cwd, port });
};

// Used for testing errors thrown on build when we don't want to start and
// wait for the server
export const rsbuildDevCmd = ({ cwd }: { cwd: string }) => {
  let nodeBin = process.argv[0];
  installFixtureProject(cwd);
  // `rsbuild dev` is a persistent server and never exits on its own
  // (unlike Vite's validate-and-exit startup failures this helper was
  // written for). The timeout guard keeps an assumed-to-exit spawn from
  // blocking a whole suite run indefinitely.
  return spawnSync(nodeBin, [rsbuildBin, "dev"], {
    cwd,
    env: { ...process.env },
    timeout: 30_000,
    killSignal: "SIGTERM",
  });
};

declare module "@playwright/test" {
  interface Page {
    errors: Error[];
  }
}

export type Files = (args: { port: number }) => Promise<Record<string, string>>;
type Fixtures = {
  page: Page;
  dev: (
    files: Files,
    templateName?: TemplateName,
  ) => Promise<{
    port: number;
    cwd: string;
  }>;
  customDev: (
    files: Files,
    templateName?: TemplateName,
  ) => Promise<{
    port: number;
    cwd: string;
  }>;
  reactRouterServe: (files: Files) => Promise<{
    port: number;
    cwd: string;
  }>;
  rsbuildPreview: (
    files: Files,
    templateName?: TemplateName,
  ) => Promise<{
    port: number;
    cwd: string;
  }>;
  wranglerPagesDev: (files: Files) => Promise<{
    port: number;
    cwd: string;
  }>;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    page.errors = [];
    page.on("pageerror", (error: Error) => page.errors.push(error));
    await use(page);
  },
  // eslint-disable-next-line no-empty-pattern
  dev: async ({}, use) => {
    let stop: (() => unknown) | undefined;
    await use(async (files, template) => {
      let port = await getPort();
      let cwd = await createProject(await files({ port }), template);
      stop = await dev({ cwd, port });
      return { port, cwd };
    });
    stop?.();
  },
  // eslint-disable-next-line no-empty-pattern
  customDev: async ({}, use) => {
    let stop: (() => unknown) | undefined;
    await use(async (files, template) => {
      let port = await getPort();
      let cwd = await createProject(await files({ port }), template);
      stop = await customDev({ cwd, port });
      return { port, cwd };
    });
    stop?.();
  },
  // eslint-disable-next-line no-empty-pattern
  reactRouterServe: async ({}, use) => {
    let stop: (() => unknown) | undefined;
    await use(async (files) => {
      let port = await getPort();
      let cwd = await createProject(await files({ port }));
      let result = build({ cwd });
      expect(result.status, formatBuildFailure(result)).toBe(0);
      stop = await reactRouterServe({ cwd, port });
      return { port, cwd };
    });
    stop?.();
  },
  // eslint-disable-next-line no-empty-pattern
  rsbuildPreview: async ({}, use) => {
    let stop: (() => unknown) | undefined;
    await use(async (files, template) => {
      let port = await getPort();
      let cwd = await createProject(await files({ port }), template);
      let result = build({ cwd });
      expect(result.status, formatBuildFailure(result)).toBe(0);
      stop = await rsbuildPreview({ cwd, port });
      return { port, cwd };
    });
    stop?.();
  },
  // eslint-disable-next-line no-empty-pattern
  wranglerPagesDev: async ({}, use) => {
    let stop: (() => unknown) | undefined;
    await use(async (files) => {
      let port = await getPort();
      let cwd = await createProject(
        await files({ port }),
        "vite-plugin-cloudflare-template",
      );
      let result = build({ cwd });
      expect(result.status, formatBuildFailure(result)).toBe(0);
      stop = await wranglerPagesDev({ cwd, port });
      return { port, cwd };
    });
    stop?.();
  },
});

function node(
  args: string[],
  options: { cwd: string; env?: Record<string, string> },
) {
  let nodeBin = process.argv[0];
  let nodeOptions = [
    process.env.NODE_OPTIONS,
    "--experimental-vm-modules",
    "--experimental-global-webcrypto",
  ]
    .filter(Boolean)
    .join(" ");

  let proc = spawn(nodeBin, args, {
    cwd: options.cwd,
    env: {
      ...process.env,
      ...colorEnv,
      NODE_OPTIONS: nodeOptions,
      ...options.env,
    },
    stdio: "pipe",
  });
  return proc;
}

async function waitForServer(
  proc: ChildProcess & { stdout: Readable; stderr: Readable },
  args: { port: number; host?: string; basename?: string },
) {
  let devStdout = bufferize(proc.stdout);
  let devStderr = bufferize(proc.stderr);

  await waitOn({
    resources: [
      `http://${args.host ?? "localhost"}:${args.port}${
        args.basename ?? "/"
      }`,
    ],
    timeout: platform() === "win32" ? 20000 : 10000,
  }).catch((err) => {
    let stdout = devStdout();
    let stderr = devStderr();
    proc.kill();
    throw new Error(
      [
        err.message,
        "",
        "exit code: " + proc.exitCode,
        "stdout: " + stdout ? `\n${stdout}\n` : "<empty>",
        "stderr: " + stderr ? `\n${stderr}\n` : "<empty>",
      ].join("\n"),
    );
  });
}

function bufferize(stream: Readable): () => string {
  let buffer = "";
  stream.on("data", (data) => (buffer += data.toString()));
  return () => buffer;
}

export function createEditor(projectDir: string) {
  return async function edit(
    file: string,
    transform: (contents: string) => string,
  ) {
    let filepath = path.join(projectDir, file);
    let contents = await readFile(filepath, "utf8");
    await writeFile(filepath, transform(contents), "utf8");

    return async function revert() {
      await writeFile(filepath, contents, "utf8");
    };
  };
}

export function grep(cwd: string, pattern: RegExp): string[] {
  let assetFiles = globSync("**/*.@(js|jsx|ts|tsx)", { cwd }).map((file) =>
    path.resolve(cwd, file),
  );

  let lines = shell
    .grep("-l", pattern, assetFiles)
    .stdout.trim()
    .split("\n")
    .filter((line) => line.length > 0);
  return lines;
}
