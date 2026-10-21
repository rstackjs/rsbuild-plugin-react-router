# Native Remix 2 reference

`rsbuild-plugin-react-router/remix2` exports `pluginRemix2`. This entry compiles the native Remix 2 protocol. It does not translate Remix imports to React Router 7 or 8.

```ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginRemix2 } from 'rsbuild-plugin-react-router/remix2';

export default defineConfig({
  plugins: [pluginRemix2(), pluginReact()],
});
```

## Runtime requirements

The initial supported versions are `@remix-run/dev`, `@remix-run/node`, `@remix-run/react`, and `@remix-run/server-runtime` at `2.11.2`. React Router and React Router DOM must be `6.26.1`, and `@remix-run/router` must be `1.19.1`. The isolated acceptance fixture uses React and React DOM `18.3.1`.

The package marks mode-specific framework peers optional. The selected plugin validates its required packages at startup. Installing this package does not force `@react-router/node` into a native Remix application.

Rsbuild `2.2.8` requires Node `^20.19.0` or `>=22.12.0`. ESM development bundle evaluation also requires `--experimental-vm-modules`.

## Configuration

Without `config`, the plugin reads `remix.config.js`, `.cjs`, or `.mjs` through the application's native Remix resolver. Native file routes, ignored route files, custom route definitions, resolved entry paths, and future flags come from that resolver.

The plugin checks the default server entry's `isbot` dependency before invoking the resolver. Missing `isbot` produces an error without modifying package manifests or installing dependencies. Custom application entries remain unchanged.

`config` accepts a structurally typed `ResolvedRemix2Config`. Entry and output paths in this object are absolute. `relativeAssetsBuildDirectory` retains the native server-build value. `serverModuleFormat` is the only format setting and accepts `esm` or `cjs`.

`serverDependenciesToBundle`, `serverConditions`, `serverMainFields`, and `watchPaths` retain their native meanings. `watchPaths` and Remix configuration changes restart development compilation. Server-only source changes also rebuild the browser half of the generation. Route topology changes require a restart.

`future.unstable_singleFetch` and `future.unstable_lazyRouteDiscovery` are rejected initially. The supported request protocol uses `_data`, native actions, redirects, and deferred responses. Route `export *` is rejected because server export pruning cannot safely infer that boundary. Explicit named re-exports are supported.

## Extension hooks

`transformManifest(draft)` receives the entry assets and route metadata before `version` and `url` exist. It returns the extended draft. The plugin hashes that result and publishes identical extensions in browser and server manifests.

`transformClientRoute({ code, route, serverExports })` receives browser code after removing `loader`, `action`, and `headers`. `serverExports` describes the original module. The plugin analyzes the returned code to compute client loader, client action, and error boundary flags. The hook must preserve user client exports and must not restore server exports.

Each route ID has its own browser module and hook invocation, even when multiple IDs share a file. Server routes still share the original module. Ordinary browser imports of a route file receive pruned source without a route-specific hook.

`REMIX2_ASSETS_MODULE_ID` is `virtual/remix2/assets`. Its `assets` export is the same manifest used by the generated server build. A custom integration can alias an assets consumer to this module without importing the full server entry and creating a cycle.

## Client-only modules

App imports ending in `.client`, `.client.js`, `.client.ts`, `.client.jsx`, or `.client.tsx` become empty CommonJS modules on the server. Named imports are undefined and the default import is an empty object. Browser compilation keeps the original code. This matches Remix 2.11.2's classic compiler, including extensionless imports.

Package imports keep their own semantics. The classic compiler does not empty `.client` directories or `.client.mjs` and `.client.cjs` files. Those conventions belong to the stock Vite compiler.

## Development and custom servers

The default development server uses the application's actual `@remix-run/node.createRequestHandler`. A generation contains its evaluated native server build and matching browser manifest.

The development server retains immutable browser assets from every successfully published generation until it closes. This includes content-hashed chunks and native manifests, so a document already executing an older server build can finish and hydrate after a rebuild. Rspack's immutable asset metadata determines retention. Current-generation assets take precedence for mutable filenames, which are not retained after replacement. Failed or superseded attempts do not enter the retained asset store.

Retention stores asset bytes by compiler filename, not old server builds or compilations. Memory grows with distinct immutable assets during a development session. There is no generation limit or expiration that could break a slow document. Closing the server clears the in-memory assets. Production output is unchanged.

`createDevServer()` waits for the first complete generation. A first compilation or evaluation failure rejects readiness. A failed rebuild retains the previous generation. Successful browser changes trigger a full document reload through a native-mode event stream. React Router 7 HMR and component wrappers are not used.

Requests awaiting a superseded browser attempt advance to the newest paired generation. A fatal compiler-hook error settles pending requests and retains the last complete generation. Rspack stops its watchers after such an error, so restart the development server to resume compilation.

`customServer: true` disables the request middleware. It publishes browser assets and the server bundle to disk only after a successful paired build. The entry file is written last through an atomic rename. A local `package.json` identifies the server output as ESM or CommonJS.

The same in-memory asset retention applies when custom servers use Rsbuild's middleware. Disk publication already leaves old hashed browser files in place. External static servers own their serving and cleanup policies. Closing Rsbuild releases in-memory ownership but does not delete published files.

```ts
import { createRequestHandler } from '@remix-run/node';
import { loadRemix2ServerBuild } from 'rsbuild-plugin-react-router/remix2';

const devServer = await rsbuild.createDevServer();
const handler = createRequestHandler(
  () => loadRemix2ServerBuild(devServer),
  'development'
);
```

The public loading API works across the package's ESM and CommonJS entrypoints. Prefer it when the custom server can share the Rsbuild process.

GuluX's current `fs.watch(bundlePath)` listener handles only `change`, not `rename`. Atomic entry replacement therefore requires a GuluX watcher change or explicit integration notification. Do not rely on the existing file watcher to reload these outputs. A directory watcher that handles rename and reattaches, or the public loading API above, avoids watching a replaced inode. The plugin's fixture does not establish actual GuluX watcher compatibility.

TTArk still owns CSP helpers, external hydration, CSS imports, regional output, `global.ttarkVar`, and recovery rendering. These are not policies of this compiler mode.

## Verification

```sh
pnpm build
node scripts/test-remix2-isolated.mts plugin
```

The runner packs the plugin and installs the fixture outside the workspace. It checks every native runtime copy, custom entry hashes, package interoperability, declarations, failure behavior, development generations, HTTP responses, and Chromium behavior. The fixture is excluded from the pnpm workspace so the workspace router override cannot replace its exact router version.
