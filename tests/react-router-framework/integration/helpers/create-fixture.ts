import { existsSync, readFileSync } from "node:fs";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";
import { Readable } from "node:stream";
import url from "node:url";
import { createRequire } from "node:module";
import express from "express";
import getPort from "get-port";
import stripIndent from "strip-indent";
import { sync as spawnSync, spawn } from "cross-spawn";
import type { JsonObject } from "type-fest";

import type {
  ServerBuild,
  createRequestHandler,
  UNSAFE_decodeViaTurboStream,
} from "react-router";
import { UNSAFE_SingleFetchRedirectSymbol as HarnessSingleFetchRedirectSymbol } from "react-router";
import type { createRequestHandler as createExpressRequestHandler } from "@react-router/express";
import { createReadableStreamFromReadable } from "@react-router/node";

import { type TemplateName, rsbuildConfig, reactRouterConfig } from "./rsbuild.js";
import {
  finalizeFixtureProject,
  prepareFixtureProjectDependencies,
  reactRouterServeBin,
  rsbuildBin,
} from "./rsbuild-adapter.js";
import {
  assertResourceGuardrail,
  killProcessGroup,
  withFrameworkTestRunEnv,
} from "./test-resource-guard.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const root = path.join(__dirname, "../..");
const TMP_DIR = path.join(root, ".tmp", "integration");
const ServerMode = {
  Development: "development",
  Production: "production",
  Test: "test",
} as const;
type ServerMode = (typeof ServerMode)[keyof typeof ServerMode];
type ReactRouterRuntime = {
  createRequestHandler: typeof createRequestHandler;
  UNSAFE_decodeViaTurboStream: typeof UNSAFE_decodeViaTurboStream;
};
type ReactRouterExpressRuntime = {
  createRequestHandler: typeof createExpressRequestHandler;
};

async function importFixtureModule<T>(projectDir: string, specifier: string) {
  const require = createRequire(path.join(projectDir, "package.json"));
  return import(url.pathToFileURL(require.resolve(specifier)).href) as Promise<T>;
}

// Re-key fixture redirect symbols onto the harness SingleFetchRedirect symbol.
function normalizeSingleFetchRedirectSymbol(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  const record = value as Record<PropertyKey, unknown>;
  for (const symbol of Object.getOwnPropertySymbols(record)) {
    if (
      symbol !== HarnessSingleFetchRedirectSymbol &&
      symbol.description === HarnessSingleFetchRedirectSymbol.description
    ) {
      record[HarnessSingleFetchRedirectSymbol] = record[symbol];
      delete record[symbol];
    }
  }
  return record;
}

export async function spawnTestServer({
  command,
  regex,
  validate,
  env = {},
  cwd,
  timeout = 20000,
}: {
  command: string[];
  regex: RegExp;
  validate?: (matches: RegExpMatchArray) => void | Promise<void>;
  env?: Record<string, string>;
  cwd?: string;
  timeout?: number;
}): Promise<{ stop: VoidFunction }> {
  return new Promise((accept, reject) => {
    assertResourceGuardrail();
    let serverProcess = spawn(command[0], command.slice(1), {
      env: withFrameworkTestRunEnv({ ...process.env, ...env }),
      cwd,
      detached: process.platform !== "win32",
      stdio: "pipe",
    });

    let started = false;
    let settled = false;
    let stdout = "";
    const fail = (error: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(rejectTimeout);
      killProcessGroup(serverProcess);
      reject(error);
    };
    let rejectTimeout = setTimeout(() => {
      fail(new Error(`Timed out waiting for server to start (${timeout}ms)`));
    }, timeout);

    serverProcess.stderr.pipe(process.stderr);
    serverProcess.stdout.on("data", (chunk: Buffer) => {
      if (started) return;
      let newChunk = chunk.toString();
      stdout += newChunk;
      let match = stdout.match(regex);
      if (match) {
        clearTimeout(rejectTimeout);
        started = true;

        Promise.resolve(validate?.(match))
          .then(() => {
            settled = true;
            accept({
              stop: () => {
                killProcessGroup(serverProcess);
              },
            });
          })
          .catch((error: unknown) => {
            fail(error);
          });
      }
    });

    serverProcess.on("error", (error: unknown) => {
      fail(error);
    });
    serverProcess.on("exit", (code, signal) => {
      if (!started) {
        fail(
          new Error(
            `Server exited before startup with code=${code} signal=${signal}`,
          ),
        );
      }
    });
  });
}

export interface FixtureInit {
  buildStdio?: Writable;
  files?: { [filename: string]: string };
  useReactRouterServe?: boolean;
  spaMode?: boolean;
  prerender?: boolean;
  port?: number;
  templateName?: TemplateName;
}

export type Fixture = Awaited<ReturnType<typeof createFixture>>;
export type AppFixture = Awaited<ReturnType<typeof createAppFixture>>;

export const js = String.raw;
export const mdx = String.raw;
export const css = String.raw;
export function json(value: JsonObject) {
  return JSON.stringify(value, null, 2);
}

const defaultTemplateName = "rsbuild-template" satisfies TemplateName;

export async function createFixture(init: FixtureInit, mode?: ServerMode) {
  let templateName = init.templateName ?? defaultTemplateName;
  let projectDir = await createFixtureProject(init, mode);
  let buildPath = url.pathToFileURL(
    path.join(
      projectDir,
      templateName === "rsc-framework"
        ? "build/server/index.js"
        : "build/server/static/js/app.js",
    ),
  ).href;
  let reactRouterRuntime = await importFixtureModule<ReactRouterRuntime>(
    projectDir,
    "react-router",
  );

  let getBrowserAsset = async (asset: string) => {
    return readFile(
      path.join(projectDir, "public", asset.replace(/^\//, "")),
      "utf8",
    );
  };

  if (init.spaMode) {
    return {
      projectDir,
      build: null,
      isSpaMode: init.spaMode,
      prerender: init.prerender,
      requestDocument() {
        let html = readFileSync(
          path.join(projectDir, "build/client/index.html"),
        );
        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
          },
        });
      },
      requestResource() {
        throw new Error("Cannot requestResource in SPA Mode tests");
      },
      requestSingleFetchData: () => {
        throw new Error("Cannot requestSingleFetchData in SPA Mode tests");
      },
      postDocument: () => {
        throw new Error("Cannot postDocument in SPA Mode tests");
      },
      getBrowserAsset,
      useReactRouterServe: init.useReactRouterServe,
    };
  }

  if (init.prerender) {
    return {
      projectDir,
      build: null,
      isSpaMode: init.spaMode,
      prerender: init.prerender,
      requestDocument(href: string) {
        let pathname = new URL(href, "test://test").pathname;
        let file =
          (pathname.endsWith("/") ? pathname : pathname + "/") + "index.html";
        let clientDir = path.join(projectDir, "build", "client");
        let mainPath = path.join(clientDir, file);
        let fallbackPath = path.join(clientDir, "__spa-fallback.html");
        let fallbackPath2 = path.join(clientDir, "index.html");
        let html = existsSync(mainPath)
          ? readFileSync(mainPath)
          : existsSync(fallbackPath)
            ? readFileSync(fallbackPath)
            : readFileSync(fallbackPath2);
        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
          },
        });
      },
      requestResource(href: string) {
        let data = readFileSync(path.join(projectDir, "build/client", href));
        return new Response(data);
      },
      async requestSingleFetchData(href: string) {
        let data = readFileSync(path.join(projectDir, "build/client", href));
        let stream = createReadableStreamFromReadable(Readable.from(data));
        return {
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          data: normalizeSingleFetchRedirectSymbol(
            (await reactRouterRuntime.UNSAFE_decodeViaTurboStream(stream, global))
              .value,
          ),
        };
      },
      postDocument: () => {
        throw new Error("Cannot postDocument in Prerender tests");
      },
      getBrowserAsset,
      useReactRouterServe: init.useReactRouterServe,
    };
  }

  let build: ServerBuild | null = null;
  type RequestHandler = (request: Request) => Promise<Response>;
  let handler: RequestHandler;
  if (templateName === "rsc-framework") {
    handler = (await import(buildPath))?.default?.fetch;
    if (typeof handler !== "function") {
      throw new Error(
          "Expected a default request handler function export in Rsbuild RSC Framework Mode server build",
      );
    }
  } else {
    build = (await import(buildPath)) as ServerBuild;
    handler = reactRouterRuntime.createRequestHandler(
      build,
      mode || ServerMode.Production,
    );
  }

  let requestDocument = async (href: string, init?: RequestInit) => {
    let url = new URL(href, "test://test");
    let request = new Request(url.toString(), {
      ...init,
      signal: init?.signal || new AbortController().signal,
    });
    return handler(request);
  };

  let requestResource = async (href: string, init?: RequestInit) => {
    init = init || {};
    init.signal = init.signal || new AbortController().signal;
    let url = new URL(href, "test://test");
    let request = new Request(url.toString(), init);
    return handler(request);
  };

  let requestSingleFetchData = async (href: string, init?: RequestInit) => {
    init = init || {};
    init.signal = init.signal || new AbortController().signal;
    let url = new URL(href, "test://test");
    let request = new Request(url.toString(), init);
    let response = await handler(request);
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.body
        ? normalizeSingleFetchRedirectSymbol(
            (
              await reactRouterRuntime.UNSAFE_decodeViaTurboStream(
                response.body!,
                global,
              )
            ).value,
          )
        : null,
    };
  };

  let postDocument = async (href: string, data: URLSearchParams | FormData) => {
    return requestDocument(href, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type":
          data instanceof URLSearchParams
            ? "application/x-www-form-urlencoded"
            : "multipart/form-data",
      },
    });
  };

  return {
    templateName,
    projectDir,
    build,
    handler,
    isSpaMode: init.spaMode,
    prerender: init.prerender,
    requestDocument,
    requestResource,
    requestSingleFetchData,
    postDocument,
    getBrowserAsset,
    useReactRouterServe: init.useReactRouterServe,
  };
}

/**
 * @deprecated Use `integration/helpers/rsbuild.ts`'s `test` instead
 *
 * This implementation sometimes runs a request handler in memory, forcing tests to manually manage stdout/stderr
 * which has caused many integration tests to leak noisy logs for expected errors.
 * It also means that sometimes the CLI is skipped over in those tests, missing out on code paths that should be tested.
 */
export async function createAppFixture(fixture: Fixture, mode?: ServerMode) {
  let startAppServer = async (): Promise<{
    port: number;
    stop: VoidFunction;
  }> => {
    if (fixture.useReactRouterServe) {
      let port = await getPort();
      const templateName = fixture.templateName ?? "rsbuild-template";
      const serverBuildPath = templateName.includes("rsc")
        ? "build/server/index.js"
        : "build/server/static/js/app.js";
      let { stop } = await spawnTestServer({
        cwd: fixture.projectDir,
        command: [
          process.argv[0],
          reactRouterServeBin,
          serverBuildPath,
        ],
        env: {
          NODE_ENV: mode || "production",
          PORT: port.toFixed(0),
        },
        regex: /\[react-router-serve\] http:\/\/localhost:(\d+)\s/,
        validate: (matches) => {
          let parsedPort = parseInt(matches[1], 10);
          if (port !== parsedPort) {
            throw new Error(
              `Expected react-router-serve to start on port ${port}, but it started on port ${parsedPort}`,
            );
          }
        },
      });
      return { stop, port };
    }

    if (fixture.isSpaMode) {
      return new Promise(async (accept) => {
        let port = await getPort();
        let app = express();
        app.use(express.static(path.join(fixture.projectDir, "build/client")));
        app.get("*", (_, res) =>
          res.sendFile(
            path.join(fixture.projectDir, "build/client/index.html"),
          ),
        );
        let server = app.listen(port);
        accept({ stop: server.close.bind(server), port });
      });
    }

    if (fixture.prerender) {
      return new Promise(async (accept) => {
        let port = await getPort();
        let app = express();
        app.use(
          express.static(path.join(fixture.projectDir, "build", "client")),
        );
        app.get("*", (req, res, next) => {
          let dir = path.join(fixture.projectDir, "build", "client");
          let filePath;
          if (req.path.endsWith(".data")) {
            filePath = path.join(dir, req.path);
          } else {
            let mainPath = path.join(dir, req.path, "index.html");
            let fallbackPath = path.join(dir, "__spa-fallback.html");
            let fallbackPath2 = path.join(dir, "index.html");
            filePath = existsSync(mainPath)
              ? mainPath
              : existsSync(fallbackPath)
                ? fallbackPath
                : fallbackPath2;
          }
          if (existsSync(filePath)) {
            res.sendFile(filePath, next);
          } else {
            // Avoid a built-in console error from `sendFile` on 404's
            res.status(404).send("Not found");
          }
        });
        let server = app.listen(port);
        accept({ stop: server.close.bind(server), port });
      });
    }

    if (fixture.templateName.includes("rsc")) {
      let port = await getPort();
      let { stop } = await spawnTestServer({
        cwd: fixture.projectDir,
        command: [process.argv[0], "start.js"],
        env: {
          NODE_ENV: mode || "production",
          PORT: port.toFixed(0),
        },
        regex: /Server listening on port (\d+)\s/,
        validate: (matches) => {
          let parsedPort = parseInt(matches[1], 10);
          if (port !== parsedPort) {
            throw new Error(
              `Expected RSC Framework Mode build server to start on port ${port}, but it started on port ${parsedPort}`,
            );
          }
        },
      });
      return { stop, port };
    }

    const build = fixture.build;
    if (!build) {
      return Promise.reject(
        new Error("Cannot start app server without a build"),
      );
    }

    return new Promise(async (accept) => {
      let port = await getPort();
      let app = express();
      let { createRequestHandler: createExpressHandler } =
        await importFixtureModule<ReactRouterExpressRuntime>(
          fixture.projectDir,
          "@react-router/express",
        );
      app.use(express.static(path.join(fixture.projectDir, "build/client")));

      app.all(
        "*",
        createExpressHandler({
          build,
          mode: mode || ServerMode.Production,
        }),
      );

      let server = app.listen(port);

      accept({ stop: server.close.bind(server), port });
    });
  };

  let start = async () => {
    let { stop, port } = await startAppServer();

    let serverUrl = `http://localhost:${port}`;

    return {
      serverUrl,
      /**
       * Shuts down the fixture app, **you need to call this
       * at the end of a test** or `afterAll` if the fixture is initialized in a
       * `beforeAll` block. Also make sure to `app.close()` or else you'll
       * have memory leaks.
       */
      close: () => {
        return stop();
      },
    };
  };

  return start();
}

////////////////////////////////////////////////////////////////////////////////

export async function createFixtureProject(
  init: FixtureInit = {},
  mode?: ServerMode,
): Promise<string> {
  let templateName = init.templateName ?? defaultTemplateName;
  let integrationTemplateDir = path.resolve(__dirname, templateName);
  let projectName = `rr-${templateName}-${Math.random().toString(32).slice(2)}`;
  let projectDir = path.join(TMP_DIR, projectName);
  let port = init.port ?? (await getPort());

  await mkdir(projectDir, { recursive: true });
  await cp(integrationTemplateDir, projectDir, { recursive: true });

  let hasBundlerConfig = Object.keys(init.files ?? {}).some(
    (filename) => filename.startsWith("rsbuild.config."),
  );

  let hasReactRouterConfig = Object.keys(init.files ?? {}).some((filename) =>
    filename.startsWith("react-router.config."),
  );

  let { spaMode } = init;

  await writeTestFiles(
    {
      ...(hasBundlerConfig
        ? {}
        : {
            "rsbuild.config.ts": await rsbuildConfig.basic({
              port,
              templateName,
            }),
          }),
      ...(hasReactRouterConfig
        ? {}
        : {
            "react-router.config.ts": reactRouterConfig({
              ssr: !spaMode,
            }),
      }),
      ...init.files,
    },
    projectDir,
  );

  await finalizeFixtureProject({ projectDir, port, templateName });
  prepareFixtureProjectDependencies(projectDir, templateName);

  reactRouterBuild(
    projectDir,
    init.buildStdio,
    mode,
  );

  return projectDir;
}

function reactRouterBuild(
  projectDir: string,
  buildStdio?: Writable,
  mode?: ServerMode,
) {
  // ESM configs must be imported in production mode when runtime mode is tested.
  mode = mode === ServerMode.Test ? ServerMode.Production : mode;

  let buildArgs: string[] = [rsbuildBin, "build"];

  let buildSpawn = spawnSync("node", buildArgs, {
    cwd: projectDir,
    env: withFrameworkTestRunEnv({
      ...process.env,
      NODE_ENV: mode || ServerMode.Production,
    }),
  });

  if (buildStdio) {
    buildStdio.write(buildSpawn.stdout.toString("utf-8"));
    buildStdio.write(buildSpawn.stderr.toString("utf-8"));
    buildStdio.end();
  }

  if (buildSpawn.error || buildSpawn.status) {
    console.error(buildSpawn.stderr.toString("utf-8"));
    throw buildSpawn.error || new Error(`Build failed, check the output above`);
  }
}

async function writeTestFiles(
  files: Record<string, string> | undefined,
  dir: string,
) {
  await Promise.all(
    Object.entries(files ?? {}).map(async ([filename, file]) => {
      let filePath = path.join(dir, filename);
      await mkdir(path.dirname(filePath), { recursive: true });

      await writeFile(filePath, stripIndent(file));
    }),
  );
}
