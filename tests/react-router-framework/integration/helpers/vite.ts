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
  rsbuildConfig,
  rsbuildRscConfig,
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

type ViteConfigServerArgs = {
  port: number;
  fsAllow?: string[];
};

type ViteConfigBuildArgs = {
  assetsInlineLimit?: number;
  assetsDir?: string;
  cssCodeSplit?: boolean;
};

type ViteConfigBaseArgs = {
  templateName?: TemplateName;
  base?: string;
  envDir?: string;
  mdx?: boolean;
  vanillaExtract?: boolean;
};

type ViteConfigArgs = (
  | ViteConfigServerArgs
  | { [K in keyof ViteConfigServerArgs]?: never }
) &
  ViteConfigBuildArgs &
  ViteConfigBaseArgs;

export const viteConfig = {
  server: async (args: ViteConfigServerArgs) => {
    let { port, fsAllow } = args;
    let hmrPort = await getPort();
    let text = dedent`
      server: {
        port: ${port},
        strictPort: true,
        hmr: { port: ${hmrPort} },
        fs: { allow: ${fsAllow ? JSON.stringify(fsAllow) : "undefined"} }
      },
    `;
    return text;
  },
  build: ({
    assetsInlineLimit,
    assetsDir,
    cssCodeSplit,
  }: ViteConfigBuildArgs = {}) => {
    return dedent`
      build: {
        assetsInlineLimit: ${assetsInlineLimit ?? "undefined"},
        assetsDir: ${assetsDir ? `"${assetsDir}"` : "undefined"},
        cssCodeSplit: ${
          cssCodeSplit !== undefined ? cssCodeSplit : "undefined"
        },
      },
    `;
  },
  basic: async (args: ViteConfigArgs) => {
    return args.templateName?.includes("rsc")
      ? rsbuildRscConfig({ port: args.port, base: args.base })
      : rsbuildConfig({ port: args.port, base: args.base });
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

type FrameworkModeViteMajorTemplateName =
  | "vite-7-template"
  | "vite-8-template"
  | "vite-plugin-cloudflare-template";

type FrameworkModeRscTemplateName = "rsc-vite-framework";

type FrameworkModeCloudflareTemplateName = "vite-plugin-cloudflare-template";

export type RscBundlerTemplateName = "rsc-vite";

export type TemplateName =
  | FrameworkModeViteMajorTemplateName
  | FrameworkModeRscTemplateName
  | FrameworkModeCloudflareTemplateName
  | RscBundlerTemplateName;

export const viteMajorTemplates = [
  { templateName: "vite-7-template", templateDisplayName: "Vite 7" },
  { templateName: "vite-8-template", templateDisplayName: "Vite 8" },
] as const satisfies Array<{
  templateName: FrameworkModeViteMajorTemplateName;
  templateDisplayName: string;
}>;

export const rscBundlerTemplates = [
  { templateName: "rsc-vite", templateDisplayName: "RSC (Vite)" },
] as const satisfies Array<{
  templateName: RscBundlerTemplateName;
  templateDisplayName: string;
}>;

export async function createProject(
  files: Record<string, string> = {},
  templateName: TemplateName = "vite-7-template",
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

export const vitePreview = async ({
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
export const viteDevCmd = ({ cwd }: { cwd: string }) => {
  let nodeBin = process.argv[0];
  installFixtureProject(cwd);
  return spawnSync(nodeBin, [rsbuildBin, "dev"], {
    cwd,
    env: { ...process.env },
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
  vitePreview: (
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
  vitePreview: async ({}, use) => {
    let stop: (() => unknown) | undefined;
    await use(async (files, template) => {
      let port = await getPort();
      let cwd = await createProject(await files({ port }), template);
      let result = build({ cwd });
      expect(result.status, formatBuildFailure(result)).toBe(0);
      stop = await vitePreview({ cwd, port });
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
