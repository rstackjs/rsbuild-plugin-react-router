import * as assert from "node:assert";
import ts from "typescript";
import { describe, expect, it } from "@rstest/core";

import { transformRscRouteModule } from "../../../../src/rsc-route-transforms";
import type { RouteChunkConfig } from "../../../../src/route-chunks";
import { removeExports, removeUnusedImports } from "../../../../src/route-export-pruning";
import { generate, parse } from "../../../../src/yuku";

const routeChunkConfig: RouteChunkConfig = {
  splitRouteModules: false,
  appDirectory: "/app",
  rootRouteFile: "root.tsx",
};

const routeChunkCache = new Map();
const plugin = {
  getRouteIdForFile() {
    return "test-route-id";
  },
  isRootRouteModule() {
    return false;
  },
  async transformToJs(code: string, filename: string) {
    return await ts.transpile(code, {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
    });
  },
  async transform(_code: string, id: string) {
    const [resourcePath, resourceQuery] = id.split("?");
    const code = await plugin.transformToJs(_code, resourcePath);
    return await transformRscRouteModule({
      code,
      resourcePath,
      resourceQuery: resourceQuery ? `?${resourceQuery}` : undefined,
      isRootRoute: plugin.isRootRouteModule(resourcePath),
      routeId: plugin.getRouteIdForFile(resourcePath)!,
      routeChunkCache,
      routeChunkConfig,
      isServerEnvironment: this.environment.name === "rsc",
      isDev: this.environment.mode === "dev",
    });
  },
};

function createClientRouteModuleForOptimizeDepsScan(code: string) {
  const ast = parse(code, { sourceType: "module" });
  removeExports(ast, [
    "ServerComponent",
    "ServerLayout",
    "ServerHydrateFallback",
    "ServerErrorBoundary",
    "loader",
    "action",
    "middleware",
    "headers",
  ]);
  removeUnusedImports(ast);
  return generate(ast);
}

const js = String.raw;

const fullClientModule = js`
  import "./side-effect.css";
  import { client } from "./client";
  import { server } from "./server";
  import { shared } from "./shared";
  export function loader() { console.log(server, shared); }
  export function action() { console.log(server, shared); }
  export function headers() { console.log(server, shared); }
  export function clientLoader() { console.log(client, shared); }
  export function clientAction() { console.log(client, shared); }
  export function links() { console.log(client, shared); }
  export function meta() { console.log(client, shared); }
  export default function Route() { console.log(client, shared); }
  export function Layout() { console.log(client, shared); }
  export function ErrorBoundary() { console.log(client, shared); }
  export function HydrateFallback() { console.log(client, shared); }
`;

const fullServerModule = js`
  import "./side-effect.css";
  import { client } from "./client";
  import { server } from "./server";
  import { shared } from "./shared";
  export function loader() { console.log(server, shared); }
  export function action() { console.log(server, shared); }
  export function headers() { console.log(server, shared); }
  export function clientLoader() { console.log(client, shared); }
  export function clientAction() { console.log(client, shared); }
  export function links() { console.log(client, shared); }
  export function meta() { console.log(client, shared); }
  export function ServerComponent() { console.log(server, shared); }
  export function ServerLayout() { console.log(server, shared); }
  export function ServerErrorBoundary() { console.log(server, shared); }
  export function ServerHydrateFallback() { console.log(server, shared); }
`;

const mixedModule = js`
  import "./side-effect.css";
  import { client } from "./client";
  import { server } from "./server";
  import { shared } from "./shared";
  export function loader() { console.log(server, shared); }
  export function action() { console.log(server, shared); }
  export function headers() { console.log(server, shared); }
  export function clientLoader() { console.log(client, shared); }
  export function clientAction() { console.log(client, shared); }
  export function links() { console.log(client, shared); }
  export function meta() { console.log(client, shared); }
  export function ServerComponent() { console.log(server, shared); }
  export function Layout() { console.log(client, shared); }
  export function ErrorBoundary() { console.log(client, shared); }
  export function HydrateFallback() { console.log(client, shared); }
`;

const unsplittableModule = js`
  import "./side-effect.css";
  import { client } from "./client";
  import { server } from "./server";
  import { shared } from "./shared";
  export const test = "test";
  export function loader() { console.log(server, shared); }
  export function action() { console.log(server, shared); }
  export function headers() { console.log(server, shared); }
  export function clientLoader() { console.log(client, shared, test); }
  export function clientAction() { console.log(client, shared, test); }
  export function links() { console.log(client, shared); }
  export function meta() { console.log(client, shared); }
  export default function Route() { console.log(client, shared); }
  export function Layout() { console.log(client, shared); }
  export function ErrorBoundary() { console.log(client, shared); }
  export function HydrateFallback() { console.log(client, shared, test); }
`;

const transform = plugin.transform.bind({
  environment: { name: "rsc" },
} as any);

function withSharedChunkHmr(lines: string[]) {
  return [
    ...lines,
    "",
    'import * as ___EnsureClientRouteModuleForHMR_REACT___ from "react";',
    "export function EnsureClientRouteModuleForHMR___() { return ___EnsureClientRouteModuleForHMR_REACT___.createElement(___EnsureClientRouteModuleForHMR_REACT___.Fragment, null) }",
    "",
  ];
}

// Intentional divergence from upstream: the rsbuild/rspack RSC flavor isolates
// route data exports (`links`/`meta`/`handle`/`shouldRevalidate`) into a
// dedicated CSS-free `?client-route-module=data` chunk instead of grouping them
// into the `route` chunk. This keeps that chunk's client-manifest `cssFiles`
// empty so the native rspack `RscServerPlugin` never wraps the data functions
// in a CSS-injecting component wrapper. If a sync reintroduces `=route` targets
// for `links`/`meta`, restore the `=data` form.
describe("route entry", () => {
  describe("client environment", () => {
    const transform = plugin.transform.bind({
      environment: { name: "client" },
    } as any);

    it("transforms full client modules", async () => {
      const transformed = await transform(fullClientModule, "/test.js");
      assert.ok(transformed);
      expect(transformed.code).toBe(
        [
          '"use client";',
          'import * as React from "react";',
          'export const clientLoader = async (...args) => import("/test.js?client-route-module=clientLoader").then(mod => mod.clientLoader(...args));',
          'export const clientAction = async (...args) => import("/test.js?client-route-module=clientAction").then(mod => mod.clientAction(...args));',
          'export { links } from "/test.js?client-route-module=data";',
          'export { meta } from "/test.js?client-route-module=data";',
          'export { default } from "/test.js?client-route-module=route";',
          'export { Layout } from "/test.js?client-route-module=route";',
          'export { ErrorBoundary } from "/test.js?client-route-module=route";',
          'export const HydrateFallback = React.lazy(() => import("/test.js?client-route-module=HydrateFallback").then(mod => ({ default: mod.HydrateFallback })));\n',
        ].join("\n"),
      );
    });

    it("transforms full server modules", async () => {
      const transformed = await transform(fullServerModule, "/test.js");
      assert.ok(transformed);
      expect(transformed.code).toBe(
        [
          '"use client";',
          'export const clientLoader = async (...args) => import("/test.js?client-route-module=clientLoader").then(mod => mod.clientLoader(...args));',
          'export const clientAction = async (...args) => import("/test.js?client-route-module=clientAction").then(mod => mod.clientAction(...args));',
          'export { links } from "/test.js?client-route-module=data";',
          'export { meta } from "/test.js?client-route-module=data";\n',
        ].join("\n"),
      );
    });

    it("transforms mixed modules", async () => {
      const transformed = await transform(mixedModule, "/test.js");
      assert.ok(transformed);
      expect(transformed.code).toBe(
        [
          '"use client";',
          'import * as React from "react";',
          'export const clientLoader = async (...args) => import("/test.js?client-route-module=clientLoader").then(mod => mod.clientLoader(...args));',
          'export const clientAction = async (...args) => import("/test.js?client-route-module=clientAction").then(mod => mod.clientAction(...args));',
          'export { links } from "/test.js?client-route-module=data";',
          'export { meta } from "/test.js?client-route-module=data";',
          'export { Layout } from "/test.js?client-route-module=route";',
          'export { ErrorBoundary } from "/test.js?client-route-module=route";',
          'export const HydrateFallback = React.lazy(() => import("/test.js?client-route-module=HydrateFallback").then(mod => ({ default: mod.HydrateFallback })));\n',
        ].join("\n"),
      );
    });

    it("transforms unsplittable modules", async () => {
      const transformed = await transform(unsplittableModule, "/test.js");
      assert.ok(transformed);
      expect(transformed.code).toBe(
        [
          '"use client";',
          'import * as React from "react";',
          'export { test } from "/test.js?client-route-module=shared";',
          'export const clientLoader = async (...args) => import("/test.js?client-route-module=route").then(mod => mod.clientLoader(...args));',
          'export const clientAction = async (...args) => import("/test.js?client-route-module=route").then(mod => mod.clientAction(...args));',
          'export { links } from "/test.js?client-route-module=data";',
          'export { meta } from "/test.js?client-route-module=data";',
          'export { default } from "/test.js?client-route-module=route";',
          'export { Layout } from "/test.js?client-route-module=route";',
          'export { ErrorBoundary } from "/test.js?client-route-module=route";',
          'export const HydrateFallback = React.lazy(() => import("/test.js?client-route-module=route").then(mod => ({ default: mod.HydrateFallback })));\n',
        ].join("\n"),
      );
    });
  });

  describe("server environment", () => {
    // Intentional divergence from the upstream Vite oracle: the rsbuild
    // flavor streams `entryCssFiles` links (via the `'use server-entry'`
    // mechanism) instead of upstream's `import.meta.viteRsc.loadCss()`.
    function withCss(name: string) {
      return [
        `import { ${name} as ${name}WithoutClientChunk } from "/test.js?server-route-module=";`,
        `export function ${name}(props) {`,
        `  return React.createElement(React.Fragment, null,`,
        `    ...(${name}WithoutClientChunk.entryCssFiles ?? []).map(href =>`,
        `      React.createElement("link", { key: href, rel: "stylesheet", href: href, precedence: "default" })),`,
        `    React.createElement(EnsureClientRouteModuleForHMR___, null),`,
        `    React.createElement(${name}WithoutClientChunk, props),`,
        `  );`,
        `}`,
      ];
    }

    it("transforms full client modules", async () => {
      const transformed = await transform(fullClientModule, "/test.js");
      assert.ok(transformed);
      expect(transformed.code).toBe(
        [
          'export { loader } from "/test.js?server-route-module=";',
          'export { action } from "/test.js?server-route-module=";',
          'export { headers } from "/test.js?server-route-module=";',
          'export { clientLoader } from "/test.js?client-route-module=clientLoader";',
          'export { clientAction } from "/test.js?client-route-module=clientAction";',
          'export { links } from "/test.js?client-route-module=data";',
          'export { meta } from "/test.js?client-route-module=data";',
          'export { default } from "/test.js?client-route-module=route";',
          'export { Layout } from "/test.js?client-route-module=route";',
          'export { ErrorBoundary } from "/test.js?client-route-module=route";',
          'export { HydrateFallback } from "/test.js?client-route-module=HydrateFallback";\n',
        ].join("\n"),
      );
    });

    it("transforms full server modules", async () => {
      const transformed = await transform(fullServerModule, "/test.js");
      assert.ok(transformed);

      expect(transformed.code).toBe(
        [
          'import * as React from "react";',
          'import { EnsureClientRouteModuleForHMR___ } from "/test.js?client-route-module=shared";',
          'export { loader } from "/test.js?server-route-module=";',
          'export { action } from "/test.js?server-route-module=";',
          'export { headers } from "/test.js?server-route-module=";',
          'export { clientLoader } from "/test.js?client-route-module=clientLoader";',
          'export { clientAction } from "/test.js?client-route-module=clientAction";',
          'export { links } from "/test.js?client-route-module=data";',
          'export { meta } from "/test.js?client-route-module=data";',
          ...withCss("ServerComponent"),
          ...withCss("ServerLayout"),
          ...withCss("ServerErrorBoundary"),
          ...withCss("ServerHydrateFallback"),
        ].join("\n") + "\n",
      );
    });

    it("transforms mixed modules", async () => {
      const transformed = await transform(mixedModule, "/test.js");
      assert.ok(transformed);
      expect(transformed.code).toBe(
        [
          'import * as React from "react";',
          'import { EnsureClientRouteModuleForHMR___ } from "/test.js?client-route-module=shared";',
          'export { loader } from "/test.js?server-route-module=";',
          'export { action } from "/test.js?server-route-module=";',
          'export { headers } from "/test.js?server-route-module=";',
          'export { clientLoader } from "/test.js?client-route-module=clientLoader";',
          'export { clientAction } from "/test.js?client-route-module=clientAction";',
          'export { links } from "/test.js?client-route-module=data";',
          'export { meta } from "/test.js?client-route-module=data";',
          ...withCss("ServerComponent"),
          'export { Layout } from "/test.js?client-route-module=route";',
          'export { ErrorBoundary } from "/test.js?client-route-module=route";',
          'export { HydrateFallback } from "/test.js?client-route-module=HydrateFallback";',
        ].join("\n") + "\n",
      );
    });

    it("transforms unsplittable modules", async () => {
      const transformed = await transform(unsplittableModule, "/test.js");
      assert.ok(transformed);
      expect(transformed.code).toBe(
        [
          'export { test } from "/test.js?server-route-module=";',
          'export { loader } from "/test.js?server-route-module=";',
          'export { action } from "/test.js?server-route-module=";',
          'export { headers } from "/test.js?server-route-module=";',
          'export { clientLoader } from "/test.js?client-route-module=route";',
          'export { clientAction } from "/test.js?client-route-module=route";',
          'export { links } from "/test.js?client-route-module=data";',
          'export { meta } from "/test.js?client-route-module=data";',
          'export { default } from "/test.js?client-route-module=route";',
          'export { Layout } from "/test.js?client-route-module=route";',
          'export { ErrorBoundary } from "/test.js?client-route-module=route";',
          'export { HydrateFallback } from "/test.js?client-route-module=route";\n',
        ].join("\n"),
      );
    });
  });
});

describe("server-route-module", () => {
  it("transforms full client modules", async () => {
    const transformed = await transform(
      fullClientModule,
      "/test.js?server-route-module=",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        'import "./side-effect.css";',
        'import { server } from "./server";',
        'import { shared } from "./shared";',
        "export function loader() {\n  console.log(server, shared);\n}",
        "export function action() {\n  console.log(server, shared);\n}",
        "export function headers() {\n  console.log(server, shared);\n}",
      ].join("\n"),
    );
  });

  it("transforms full server modules", async () => {
    const transformed = await transform(
      fullServerModule,
      "/test.js?server-route-module=",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        // rsbuild flavor: server-component modules carry `'use server-entry'`
        // so the rspack RSC runtime records `entryCssFiles` for them.
        "'use server-entry';",
        'import "./side-effect.css";',
        'import { server } from "./server";',
        'import { shared } from "./shared";',
        "export function loader() {\n  console.log(server, shared);\n}",
        "export function action() {\n  console.log(server, shared);\n}",
        "export function headers() {\n  console.log(server, shared);\n}",
        "export function ServerComponent() {\n  console.log(server, shared);\n}",
        "export function ServerLayout() {\n  console.log(server, shared);\n}",
        "export function ServerErrorBoundary() {\n  console.log(server, shared);\n}",
        "export function ServerHydrateFallback() {\n  console.log(server, shared);\n}",
      ].join("\n"),
    );
  });

  it("transforms mixed modules", async () => {
    const transformed = await transform(
      mixedModule,
      "/test.js?server-route-module=",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        "'use server-entry';",
        'import "./side-effect.css";',
        'import { server } from "./server";',
        'import { shared } from "./shared";',
        "export function loader() {\n  console.log(server, shared);\n}",
        "export function action() {\n  console.log(server, shared);\n}",
        "export function headers() {\n  console.log(server, shared);\n}",
        "export function ServerComponent() {\n  console.log(server, shared);\n}",
      ].join("\n"),
    );
  });
});

describe("client-route-module=shared", () => {
  it("transforms full client modules", async () => {
    const transformed = await transform(
      fullClientModule,
      "/test.js?client-route-module=shared",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      withSharedChunkHmr([
        '"use client";',
        'import "./side-effect.css";',
      ]).join("\n"),
    );
  });

  it("transforms full server modules", async () => {
    const transformed = await transform(
      fullServerModule,
      "/test.js?client-route-module=shared",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      withSharedChunkHmr([
        '"use client";',
        'import "./side-effect.css";',
      ]).join("\n"),
    );
  });

  it("transforms mixed modules", async () => {
    const transformed = await transform(
      mixedModule,
      "/test.js?client-route-module=shared",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      withSharedChunkHmr([
        '"use client";',
        'import "./side-effect.css";',
      ]).join("\n"),
    );
  });

  it("transforms unsplittable modules", async () => {
    const transformed = await transform(
      unsplittableModule,
      "/test.js?client-route-module=shared",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      withSharedChunkHmr([
        '"use client";',
        'import "./side-effect.css";',
        'export const test = "test";',
      ]).join("\n"),
    );
  });
});

describe("client-route-module=clientLoader", () => {
  it("transforms full client modules", async () => {
    const transformed = await transform(
      fullClientModule,
      "/test.js?client-route-module=clientLoader",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        '"use client";',
        'import "./side-effect.css";',
        'import { client } from "./client";',
        'import { shared } from "./shared";',
        "export function clientLoader() {\n  console.log(client, shared);\n}",
      ].join("\n"),
    );
  });

  it("transforms full server modules", async () => {
    const transformed = await transform(
      fullServerModule,
      "/test.js?client-route-module=clientLoader",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        '"use client";',
        'import "./side-effect.css";',
        'import { client } from "./client";',
        'import { shared } from "./shared";',
        "export function clientLoader() {\n  console.log(client, shared);\n}",
      ].join("\n"),
    );
  });

  it("transforms mixed modules", async () => {
    const transformed = await transform(
      mixedModule,
      "/test.js?client-route-module=clientLoader",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        '"use client";',
        'import "./side-effect.css";',
        'import { client } from "./client";',
        'import { shared } from "./shared";',
        "export function clientLoader() {\n  console.log(client, shared);\n}",
      ].join("\n"),
    );
  });
});

describe("client-route-module=clientAction", () => {
  it("transforms full client modules", async () => {
    const transformed = await transform(
      fullClientModule,
      "/test.js?client-route-module=clientAction",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        '"use client";',
        'import "./side-effect.css";',
        'import { client } from "./client";',
        'import { shared } from "./shared";',
        "export function clientAction() {\n  console.log(client, shared);\n}",
      ].join("\n"),
    );
  });

  it("transforms full server modules", async () => {
    const transformed = await transform(
      fullServerModule,
      "/test.js?client-route-module=clientAction",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        '"use client";',
        'import "./side-effect.css";',
        'import { client } from "./client";',
        'import { shared } from "./shared";',
        "export function clientAction() {\n  console.log(client, shared);\n}",
      ].join("\n"),
    );
  });

  it("transforms mixed modules", async () => {
    const transformed = await transform(
      mixedModule,
      "/test.js?client-route-module=clientAction",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        '"use client";',
        'import "./side-effect.css";',
        'import { client } from "./client";',
        'import { shared } from "./shared";',
        "export function clientAction() {\n  console.log(client, shared);\n}",
      ].join("\n"),
    );
  });
});

describe("client-route-module=HydrateFallback", () => {
  it("transforms full client modules", async () => {
    const transformed = await transform(
      fullClientModule,
      "/test.js?client-route-module=HydrateFallback",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        '"use client";',
        'import "./side-effect.css";',
        'import { client } from "./client";',
        'import { shared } from "./shared";',
        "export function HydrateFallback() {\n  console.log(client, shared);\n}",
      ].join("\n"),
    );
  });

  it("transforms mixed modules", async () => {
    const transformed = await transform(
      mixedModule,
      "/test.js?client-route-module=HydrateFallback",
    );
    assert.ok(transformed);
    expect(transformed.code).toBe(
      [
        '"use client";',
        'import "./side-effect.css";',
        'import { client } from "./client";',
        'import { shared } from "./shared";',
        "export function HydrateFallback() {\n  console.log(client, shared);\n}",
      ].join("\n"),
    );
  });
});

describe("optimizeDeps scan", () => {
  it("removes server-only route exports before scanning client deps", () => {
    let transformed = createClientRouteModuleForOptimizeDepsScan(js`
      import { clientOnly } from "./client";
      import { serverOnly } from "server-only-package";
      import { shared } from "./shared";

      export async function loader() {
        return serverOnly();
      }

      export async function action() {
        return serverOnly();
      }

      export function ServerComponent() {
        return serverOnly();
      }

      export const meta = () => [{ title: shared }];

      export default function Route() {
        return clientOnly(shared);
      }
    `);

    expect(transformed.code).toContain(
      'import { clientOnly } from "./client";',
    );
    expect(transformed.code).toContain('import { shared } from "./shared";');
    expect(transformed.code).toContain("export const meta");
    expect(transformed.code).toContain("export default function Route");
    expect(transformed.code).not.toContain("server-only-package");
    expect(transformed.code).not.toContain("serverOnly");
    expect(transformed.code).not.toContain("loader");
    expect(transformed.code).not.toContain("action");
    expect(transformed.code).not.toContain("ServerComponent");
  });
});
