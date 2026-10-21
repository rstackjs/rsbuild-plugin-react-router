# rsbuild-plugin-react-router

<p align="center">
  <a href="https://rsbuild.dev" target="blank"><img src="https://github.com/web-infra-dev/rsbuild/assets/7237365/84abc13e-b620-468f-a90b-dbf28e7e9427" alt="Rsbuild Logo" /></a>
</p>

React Router Framework Mode for Rsbuild.

## Features

- 🚀 Zero-config setup with sensible defaults
- 🔄 Automatic route generation from file system
- 🖥️ Server-Side Rendering (SSR) support
- 📱 Client-side navigation with SPA mode (`ssr: false`)
- 📄 Static prerendering for hybrid static/dynamic sites
- 🛠️ TypeScript support out of the box
- 🔧 Customizable configuration
- 🎯 Support for route-level code splitting
- ☁️ Cloudflare Workers deployment support
- 🔗 Module Federation support (experimental)

## Framework Mode

The plugin lets an Rsbuild application use the standard React Router Framework
Mode conventions:

- `react-router.config.*` for application configuration
- `app/routes.ts` and `@react-router/dev/routes` for route configuration
- Route Module exports such as `loader`, `action`, `meta`, `links`, and
  `shouldRevalidate`
- generated `./+types/*` types
- standard `entry.client` and `entry.server` entrypoints

Some React Router build-tool integrations are not supported 1:1. See the
configuration and examples below for the currently supported behavior.

## Installation

```bash
npm install rsbuild-plugin-react-router
# or
yarn add rsbuild-plugin-react-router
# or
pnpm add rsbuild-plugin-react-router
```

## Usage

Add the plugin to your `rsbuild.config.ts`:

```ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';

export default defineConfig({
  plugins: [
    pluginReactRouter({
      // options here
    }),
    pluginReact(),
  ],
});
```

Continue using the standard React Router Framework Mode project structure:

```text
app/
  root.tsx
  routes.ts
  routes/
react-router.config.ts
rsbuild.config.ts
```

## Configuration

This plugin requires Rsbuild 2.2.8 or newer. Development hot data revalidation
uses its custom-event connection API and no longer writes an HDR revision file.

For server-only changes, `rsbuild build --environment node` can reuse the
finalized browser manifest from a previous full build in the same project.
Keep the browser output and build cache. Run a full build after changing routes
or browser assets, or adding or removing a route's `loader` or `action` export.
Node-only builds check the compiled exports against the cached manifest. If the
manifest is missing or incompatible, the build fails and asks for a full build.

React Router application settings live in `react-router.config.*`. The Rsbuild
plugin only needs options for Rsbuild-specific behavior.

### Plugin Options

```ts
pluginReactRouter({
  typegen: true,
  customServer: false,
  lazyCompilation: true,
  unstableLazyCompilationPrewarm: false,
  logPerformance: false,
  federation: false,
  remixCompat: false,
  stripServerOnlyRouteExportsInSpa: false,
});
```

| Option                             | Default     | Description                                                                                                                                                                                                                      |
| ---------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typegen`                          | `true`      | Generates React Router route types during development and builds. Set to `false` when type generation is managed separately.                                                                                                     |
| `customServer`                     | `false`     | Disables the built-in development SSR middleware. Enable this when an app owns the server with `createDevServer()` or an adapter.                                                                                                |
| `serverOutput`                     | Derived     | Emitted Rsbuild server format: `'module'` or `'commonjs'`. When omitted, React Router's `serverModuleFormat` selects the format (`'esm'` -> `'module'`, `'cjs'` -> `'commonjs'`); setting `serverOutput` overrides it.           |
| `lazyCompilation`                  | `true`      | Optional Rsbuild dev lazy-compilation config. When enabled here or through `dev.lazyCompilation`, React Router hydration-critical modules stay eager so the browser manifest and route modules are not replaced by lazy proxies. |
| `unstableLazyCompilationPrewarm`   | `false`     | Experimental prewarm for emitted lazy-compilation proxy modules after dev compiles. Enable with `true` when route JS proxy startup should happen shortly after compiler readiness.                                               |
| `logPerformance`                   | `false`     | Logs structured React Router plugin timing information.                                                                                                                                                                          |
| `parallelRouteTransform`           | `undefined` | Controls worker-thread route transforms. `undefined` and `false` keep transforms inline, `true` uses an automatic worker count, and a positive integer sets the maximum worker count.                                            |
| `onRouteTopologyChange`            | `undefined` | Notification for programmatic/custom dev servers. Recreate the Rsbuild server when route files are added, removed, or moved. The callback is not awaited.                                                                        |
| `federation`                       | `false`     | Enables the plugin's experimental Module Federation integration.                                                                                                                                                                 |
| `remixCompat`                      | `false`     | Aliases supported Remix v2 root imports to the package's React Router compatibility facades. See [Remix source compatibility](#remix-source-compatibility).                                                                      |
| `stripServerOnlyRouteExportsInSpa` | `false`     | For a client-only SPA recovery build, strips `loader`, `action`, `middleware`, and `headers` while preserving explicit client equivalents. See [SPA recovery builds](#spa-recovery-builds).                                      |

### SPA recovery builds

An application that normally builds with SSR can produce a separate, strictly
client-only recovery artifact from the same route sources:

```ts
pluginReactRouter({ stripServerOnlyRouteExportsInSpa: true });
```

This option only applies when React Router is configured with `ssr: false` and
without prerender paths. It removes `loader`, `action`, `middleware`, and
`headers` from both browser and build-time server route modules. Browser and
server manifests therefore report no server loader or action, so recovery
navigations do not issue `.data` requests. `clientLoader`, `clientAction`,
`clientMiddleware`, and the root `HydrateFallback` remain available. A route
with a server loader, action, or middleware must define the corresponding
client export; the build fails with the missing export otherwise.

This does not turn server logic into client logic, synthesize `serverLoader`,
or emit an SSR snapshot. The default SPA validation is unchanged when the
option is absent. Non-root `HydrateFallback` exports remain invalid, and
`ssr: false` prerender builds retain their normal server-export validation.

### Remix source compatibility

Set `remixCompat: true` to keep selected Remix v2 source imports while running
one React Router 7 or 8 runtime:

```ts
pluginReactRouter({ remixCompat: true });
```

The option installs exact build aliases for `@remix-run/react`,
`@remix-run/node`, `react-router-dom`, and `react-router-dom6`. Both DOM package
names resolve to the application's `react-router` installation so an installed
React Router 6 package cannot create a second router context. It does not alias
package prefixes or arbitrary deep imports. The same facades are public package
exports for explicit use. For old import names to work in both TypeScript and
Rsbuild, add runtime modules to the app:

```ts title="app/compat/remix-node.ts"
export * from 'rsbuild-plugin-react-router/compat/remix-node';
```

```ts title="app/compat/remix-react.ts"
export * from 'rsbuild-plugin-react-router/compat/remix-react';
```

Then point the exact TypeScript paths at those modules:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@remix-run/react": ["./app/compat/remix-react.ts"],
      "@remix-run/node": ["./app/compat/remix-node.ts"],
      "react-router-dom6": ["./app/compat/remix-react.ts"],
      "react-router-dom": ["./app/compat/remix-react.ts"]
    }
  }
}
```

Do not point `paths` directly at files under this package's `dist` directory.
Rsbuild also applies TypeScript paths during bundling, so a `.d.ts` target can
be treated as runtime source. The local modules above resolve through the
package exports in both the compiler and bundler.

`compat/remix-react` re-exports React Router's public root API and provides
`RemixBrowser` as `HydratedRouter` plus a `RemixServer` wrapper around
`ServerRouter`. `compat/remix-node` re-exports the public `react-router` and
`@react-router/node` APIs. Both facades add these source-compatible helpers:

- `json(value, init)` returns a real JSON `Response`, preserving status and
  headers.
- `defer(value, init)` delegates to React Router `data(value, init)`. Promises,
  including rejected promises, are streamed by React Router's single-fetch
  protocol and retain response status and headers. It is not Remix's old
  `TypedDeferredData` runtime protocol.

The compatibility boundary is intentionally narrow. It does not support
Remix private context/protocol APIs, package deep imports, `installGlobals`,
legacy upload APIs, Remix config/build conventions, or two router runtimes.
`RemixServer` accepts `abortDelay` to ease source migration but cannot apply it;
the server entry must abort its render stream. The wrapper emits a one-time
warning when the prop is present. RSC mode rejects `remixCompat`.

Lazy compilation applies to the browser build. Server dynamic imports still
compile eagerly; `lazyCompilation` does not enable on-demand SSR compilation.
Supporting suspended SSR imports across rebuilds requires support for retaining
the server runtime and coordinating lazy activations, tracked in [#155](https://github.com/rstackjs/rsbuild-plugin-react-router/issues/155).

When `federation` is enabled, configure the Module Federation plugin with
`experiments.asyncStartup: true` on every compiler (the plugin enforces it) and
keep shared dependencies non-eager. The dev server resolves async server build
exports automatically; production custom servers or adapters should resolve
async exports before passing the build to React Router's request handler
(`resolveReactRouterServerBuild`). Give remote containers an explicit
`filename` (for example `static/js/remote.js`); every other browser chunk keeps
Rsbuild's content hash. Under the hood the plugin gives each container its own
runtime chunk (so importing a container does not start the app's own share
consumes), makes browser route-module entries async so their exports resolve
through the async startup, and keeps server code splitting async-only so the
`@module-federation/node` chunk loader can satisfy the server build's startup.

### React Router Config

Put React Router framework settings in `react-router.config.*`:

```ts
import type { ReactRouterRsbuildConfig } from 'rsbuild-plugin-react-router';

export default {
  ssr: true,
  buildDirectory: 'build',
  appDirectory: 'app',
  basename: '/',
  splitRouteModules: true,
  subResourceIntegrity: false,
} satisfies ReactRouterRsbuildConfig;
```

Use `ReactRouterRsbuildConfig` for Rsbuild projects so plugin-supported
configuration such as `splitRouteModules` stays typed across React Router 7
and 8 releases. The underlying route and config types come from
`@react-router/dev`, which framework-mode apps already install for
`routes.ts` helpers and typegen; it is declared as an optional peer
dependency.

Commonly used options:

| Option                 | Default      | Notes                                                                                                                     |
| ---------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `ssr`                  | `true`       | Set `false` for SPA mode. SPA mode still runs a build-time server render to create `build/client/index.html`.             |
| `buildDirectory`       | `'build'`    | Output root. Client assets go in `<buildDirectory>/client`; server output goes in `<buildDirectory>/server`.              |
| `appDirectory`         | `'app'`      | Directory containing `root`, `routes`, and optional `entry.client` / `entry.server` files.                                |
| `basename`             | `'/'`        | Base URL used for routing, prerender requests, and manifest asset paths.                                                  |
| `serverBuildFile`      | `'index.js'` | Server build file name. It must end in `.js`.                                                                             |
| `serverModuleFormat`   | `'esm'`      | React Router server module format: `'esm'` or `'cjs'`. `serverOutput` can override the emitted Rsbuild server format.     |
| `serverBundles`        | `undefined`  | Advanced server bundle splitting by route branch. Disabled when `ssr: false`.                                             |
| `routeDiscovery`       | React Router | Defaults to lazy discovery for SSR and initial discovery for SPA mode. `routeDiscovery.mode: 'lazy'` is invalid for SPA.  |
| `prerender`            | `undefined`  | `true`, an array of paths, a function, or `{ paths, concurrency }` / `{ paths, unstable_concurrency }`.                   |
| `splitRouteModules`    | `true`       | Splits client route module exports. The legacy `future.v8_splitRouteModules` flag is also accepted.                       |
| `subResourceIntegrity` | `false`      | Emits SRI metadata for browser scripts. The legacy `future.unstable_subResourceIntegrity` flag is normalized to this key. |
| `buildEnd`             | `undefined`  | Hook called after the build with the React Router build manifest and resolved config.                                     |

### Config File Resolution

The plugin will look for `react-router.config` with any supported JS/TS extension, in this order:

- `react-router.config.tsx`
- `react-router.config.ts`
- `react-router.config.mts`
- `react-router.config.jsx`
- `react-router.config.js`
- `react-router.config.mjs`

If none are found, it falls back to defaults.

### FAQ

#### rsbuild-plugin-react-router vs ModernJS

This plugin is a focused React Router Framework Mode adapter for Rsbuild. It
does not aim to replace ModernJS or its higher-level framework features. If
your goal is a broader application framework or advanced microfrontend
support, ModernJS may be a better fit.

### SPA Mode (`ssr: false`)

React Router's SPA Mode still requires a build-time server render of the root route to generate a hydratable `index.html` (this is how this Rsbuild integration mirrors React Router framework behavior).

When `ssr: false`:

- The plugin builds both `web` and `node` internally.
- It generates `build/client/index.html` by running the server build once (requesting `basename` with the `X-React-Router-SPA-Mode: yes` header). The server bundle is evaluated in a worker thread that is terminated afterwards, with `process.env.IS_RR_BUILD_REQUEST === 'yes'` set, so module-scope side effects in your root route's import graph run at build time but cannot keep `rsbuild build` alive. The same applies to prerendering.
- It removes `build/server` after generating `index.html`, so the output is deployable as static assets.

**Important:** In SPA mode, use `clientLoader` instead of `loader` for data loading since there's no server at runtime.

### Static Prerendering

For static sites with multiple pages, you can prerender specific routes at build time:

```ts
// react-router.config.ts
import type { ReactRouterRsbuildConfig } from 'rsbuild-plugin-react-router';

export default {
  ssr: false,
  prerender: [
    '/',
    '/about',
    '/docs',
    '/docs/getting-started',
    '/docs/advanced',
    '/projects',
  ],
} satisfies ReactRouterRsbuildConfig;
```

When `prerender` is specified:

- Each path in the array is rendered at build time
- Static HTML files are generated for each route (e.g., `/about` → `build/client/about/index.html`)
- The server build is removed after prerendering for static deployment
- Non-prerendered routes fall back to client-side routing

You can also use `prerender: true` to prerender all static routes automatically.

`prerender` can also be a function:

```ts
export default {
  ssr: false,
  prerender: ({ getStaticPaths }) =>
    getStaticPaths().filter(path => path !== '/admin'),
} satisfies ReactRouterRsbuildConfig;
```

Prerendering defaults to one path at a time, matching React Router. Use
`concurrency` for larger sites; `unstable_concurrency` is still accepted for
older configs:

```ts
export default {
  ssr: false,
  prerender: {
    paths: ['/', '/about'],
    concurrency: 4,
  },
} satisfies ReactRouterRsbuildConfig;
```

For builds with 256+ routes, detailed file-size reporting is compacted to totals
by default to avoid gzipping and printing thousands of assets. Set
`performance.printFileSize` to an object to customize that output.

Route transform source maps are generated in development only. If you enable
Rsbuild source maps for faster local debugging, prefer a cheap JS map:
`output.sourceMap: { js: 'cheap-module-source-map', css: false }`.

Lazy compilation prewarming is disabled by default. When enabled alongside
`lazyCompilation`, the plugin fetches emitted browser entry and route JS assets,
extracts activation keys from the generated lazy-compilation client calls, and
POSTs those keys to the configured lazy trigger endpoint after dev compiles. It
does not request application routes or run route loaders. Because the key
extraction depends on the generated client code shape, opt in with
`unstableLazyCompilationPrewarm: true`.

Subresource Integrity is disabled by default. Enable it with
`subResourceIntegrity: true` in `react-router.config.*` when the deployed app
should emit integrity metadata for browser scripts. The legacy
`future.unstable_subResourceIntegrity` flag is still accepted and is normalized
to the stable option.

### Route Configuration

Routes can be defined in `app/routes.ts` using the helper functions from `@react-router/dev/routes`:

```ts
import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  // Index route for the home page
  index('routes/home.tsx'),

  // Regular route
  route('about', 'routes/about.tsx'),

  // Nested routes with a layout
  layout('routes/docs/layout.tsx', [
    index('routes/docs/index.tsx'),
    route('getting-started', 'routes/docs/getting-started.tsx'),
    route('advanced', 'routes/docs/advanced.tsx'),
  ]),

  // Routes with dynamic segments
  ...prefix('projects', [
    index('routes/projects/index.tsx'),
    layout('routes/projects/layout.tsx', [
      route(':projectId', 'routes/projects/project.tsx'),
      route(':projectId/edit', 'routes/projects/edit.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
```

The plugin provides several helper functions for defining routes:

- `index()` - Creates an index route
- `route()` - Creates a regular route with a path
- `layout()` - Creates a layout route with nested children
- `prefix()` - Adds a URL prefix to a group of routes

### Route Components

Route components support the following exports:

#### Client-side Exports

- `default` - The route component
- `ErrorBoundary` - Error boundary component
- `HydrateFallback` - Loading component during hydration
- `Layout` - Layout component
- `clientLoader` - Client-side data loading
- `clientAction` - Client-side form actions
- `clientMiddleware` - Client-side middleware
- `handle` - Route handle
- `links` - Prefetch links
- `meta` - Route meta data
- `shouldRevalidate` - Revalidation control

#### Server-side Exports

- `loader` - Server-side data loading
- `action` - Server-side form actions
- `middleware` - Server-side middleware
- `headers` - HTTP headers

### Client/Server-only Modules

- Files ending in `.client.*` are treated as client-only. Their exports are
  stubbed to `undefined` in the server build, so they are safe to import from
  route components for browser-only behavior.
- Files ending in `.server.*` are server-only. If they are imported by code
  compiled for the web environment, the build will fail with a clear error.
  Keep `.server` imports in server entrypoints or other server-only code.

### Asset Prefix

If you configure `output.assetPrefix` in Rsbuild, the plugin uses that value
for the React Router browser manifest and server build `publicPath` so asset
URLs resolve correctly when serving from a CDN or sub-path.

The web environment's own `output.assetPrefix` is passed through to the browser
compiler untouched, so `environments.web.output.assetPrefix: 'auto'` lets the
browser runtime resolve async chunks and stylesheets relative to the loaded
script. The server build and browser manifest need an absolute prefix: they use
the web environment's prefix when it is usable and otherwise fall back to the
root `output.assetPrefix`. A common CDN setup is therefore:

```ts
export default defineConfig({
  output: { assetPrefix: 'https://cdn.example.com/app/' }, // server-rendered URLs
  environments: {
    web: { output: { assetPrefix: 'auto' } }, // browser runtime resolves itself
  },
});
```

The plugin does not set `output.filename`, `chunkFilename`, or `publicPath`
for the web environment. Production browser entries use Rsbuild's default
content-hashed filenames, and `output.filename`, `output.filenameHash`,
`output.distPath`, and `tools.rspack` output settings you configure govern
the emitted files and the manifest URLs that reference them.

Supported browser filename forms differ by mode:

- **Classic mode** accepts any scheme, including `.mjs`/`.cjs` and query-hash
  names such as `[name].js?v=[contenthash:8]`; the browser manifest classifies
  emitted assets by pathname and keeps the full reference.
- **RSC mode** requires every browser JavaScript asset to be named `*.js`
  (hashes are fine, e.g. `[contenthash:8]-[name].js`): rspack's RSC manifest
  only records `.js` files, so the build fails with a clear error for query
  hashes or other extensions.

## Custom Server Setup

The plugin supports two ways to handle server-side rendering:

1. **Default Server Setup**: By default, the plugin automatically sets up the necessary middleware for SSR.

2. **Custom Server Setup**: For more control, you can disable the automatic middleware setup by enabling custom server mode:

```ts
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [
      pluginReactRouter({
        customServer: true,
        onRouteTopologyChange() {
          console.warn('Route topology changed; restart the dev server.');
          process.exitCode = 75;
          setTimeout(() => process.exit(75), 0);
        },
      }),
      pluginReact(),
    ],
  };
});
```

Rsbuild's `reload-server` watcher is owned by the CLI and is not installed by
the programmatic `createDevServer()` API. The sample below therefore treats
route topology changes as a full process restart: do not call `startServer()`
again inside the same process or mount a second dev server on the same Express
app. If you implement in-process replacement instead, route requests through
replaceable middleware and request-handler delegates, always `await` the active
server's `close()` before calling `createDevServer()` again, and do not launch
concurrent replacements.

Create one server entry point (`server.js`) and let it own the React Router
request handler in both development and production. Only the build provider
changes between modes:

```js
import { createRsbuild, loadConfig } from '@rsbuild/core';
import { createRequestHandler } from '@react-router/express';
import {
  loadReactRouterServerBuild,
  resolveReactRouterServerBuild,
} from 'rsbuild-plugin-react-router';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  let devServer;
  let build;

  if (isDev) {
    const config = await loadConfig();
    const rsbuild = await createRsbuild({
      rsbuildConfig: config.content,
    });
    const currentDevServer = await rsbuild.createDevServer();
    devServer = currentDevServer;
    app.use(currentDevServer.middlewares);
    build = () => loadReactRouterServerBuild(currentDevServer);
  } else {
    app.use(
      express.static(path.join(__dirname, 'build/client'), {
        index: false,
      })
    );
    build = await resolveReactRouterServerBuild(
      import('./build/server/static/js/app.js')
    );
  }

  app.use(
    createRequestHandler({
      build,
      mode: isDev ? 'development' : 'production',
      getLoadContext() {
        return {
          // Add custom loader/action context here.
        };
      },
    })
  );

  const port = Number.parseInt(process.env.PORT || '3000', 10);
  const server = app.listen(port, () => {
    const mode = isDev ? 'Development' : 'Production';
    console.log(`${mode} server is running on http://localhost:${port}`);
    devServer?.afterListen();
  });
  devServer?.connectWebSocket({ server });
}

startServer().catch(console.error);
```

`loadReactRouterServerBuild` waits for a complete React Router development
generation. During rebuilds it returns the last successfully evaluated server
build, whose embedded manifest is paired with the selected web compilation.
A failed or incomplete candidate does not replace that last-good pair. The
built-in development middleware uses the same path. Calling
`devServer.environments.node.loadBundle()` directly bypasses this guarantee.

When `serverBundles` is configured, pass its exact Rsbuild entry name as the
optional second argument (for example, `bundle-a/index`). The default build
and every configured bundle are
evaluated and published as one generation; one failing bundle keeps the whole
previous generation active.

### Sharing `createContext()` instances with a custom server

React Router middleware contexts are matched by identity, so a custom server's
`getLoadContext` must use the same `createContext()` instance the routes import.
With a bundled server build that instance lives inside the build. Re-export it
from `app/entry.server.tsx` and read it from `build.entry.module`:

```ts
// app/entry.server.tsx
export { valueContext } from './context';
```

```js
// server.js
getLoadContext: async () => {
  const { valueContext } = (await build()).entry.module;
  return new RouterContextProvider([[valueContext, 'value']]);
},
```

This works in development through `loadReactRouterServerBuild` and in
production through `resolveReactRouterServerBuild`.

`resolveReactRouterServerBuild` accepts an imported production server module,
normalizes ESM and CommonJS namespace shapes, resolves supported asynchronous
build exports, and validates the result before it reaches React Router.

This guarantee covers the eagerly evaluated server entry object and its
embedded manifest. It does not snapshot deferred server chunks, make emitted
client assets immutable, or delay Rsbuild's WebSocket success notification.
Same-path server or client chunks can change before the matching framework
generation commits. Closing that publication gap requires a supported Rsbuild
graph-settled hook plus immutable or staged outputs.

Then update your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development NODE_OPTIONS=\"--experimental-vm-modules\" node server.js",
    "build": "rsbuild build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

## Cloudflare Workers Deployment

Start from the tested [Cloudflare example](./examples/cloudflare). It contains
the complete Rsbuild configuration, Worker entry, Wrangler configuration, and
deployment scripts. The example uses `customServer: true` so the Worker owns
the React Router request handler.

## Development

The plugin automatically:

- Runs type generation during development and build
- Sets up development server with live reload
- Handles route-based code splitting
- Manages client and server builds

For local development, use Node 22 and the repository's pinned pnpm version:

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@9.15.3 --activate
```

### Benchmarking

Run the focused local suite for plugin regression checks:

```bash
pnpm bench
pnpm bench:smoke
pnpm bench:codspeed
```

See the [benchmark guide](./benchmarks/README.md) for JSON output, pull-request
comparisons and comments, `BENCHMARK_PLUGIN_ROOT`, and optional CodSpeed
publication.

## Examples

The repository includes several examples demonstrating different use cases:

| Example                                                                 | Description                             | Port | Command    |
| ----------------------------------------------------------------------- | --------------------------------------- | ---- | ---------- |
| [default-template](./examples/default-template)                         | Standard SSR setup with React Router    | 3000 | `pnpm dev` |
| [spa-mode](./examples/spa-mode)                                         | Single Page Application (`ssr: false`)  | 3001 | `pnpm dev` |
| [prerender](./examples/prerender)                                       | Static prerendering for multiple routes | 3002 | `pnpm dev` |
| [custom-node-server](./examples/custom-node-server)                     | Custom Express server with SSR          | 3003 | `pnpm dev` |
| [cloudflare](./examples/cloudflare)                                     | Cloudflare Workers deployment           | 3004 | `pnpm dev` |
| [client-only](./examples/client-only)                                   | `.client` modules with SSR hydration    | 3010 | `pnpm dev` |
| [react-router-8](./examples/react-router-8)                             | React Router 8 framework-mode SSR       | 3020 | `pnpm dev` |
| [rsc-mode](./examples/rsc-mode)                                         | Experimental RSC Framework Mode         | 3021 | `pnpm dev` |
| [epic-stack](./examples/epic-stack)                                     | Full-featured Epic Stack example        | 3005 | `pnpm dev` |
| [federation/epic-stack](./examples/federation/epic-stack)               | Module Federation host                  | 3006 | `pnpm dev` |
| [federation/epic-stack-remote](./examples/federation/epic-stack-remote) | Module Federation remote                | 3007 | `pnpm dev` |

Each example has unique ports configured to allow running multiple examples simultaneously.

### Running Examples

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm build

# Run any example
cd examples/default-template
pnpm dev
```

### Running E2E Tests

Each example includes Playwright e2e tests:

```bash
cd examples/default-template
pnpm test:e2e
```

## License

MIT
