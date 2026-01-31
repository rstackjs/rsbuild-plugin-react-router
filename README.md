# rsbuild-plugin-react-router

<p align="center">
  <a href="https://rsbuild.dev" target="blank"><img src="https://github.com/web-infra-dev/rsbuild/assets/7237365/84abc13e-b620-468f-a90b-dbf28e7e9427" alt="Rsbuild Logo" /></a>
</p>

A Rsbuild plugin that provides seamless integration with React Router, supporting both client-side routing and server-side rendering (SSR).

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

## Installation

```bash
npm install rsbuild-plugin-react-router
# or
yarn add rsbuild-plugin-react-router
# or
pnpm add rsbuild-plugin-react-router
```

## Local development

For the federation examples and Playwright e2e tests, use Node 22 and the
repo-pinned pnpm version:

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@9.15.3 --activate
```

## Usage

Add the plugin to your `rsbuild.config.ts`:

```ts
import { defineConfig } from '@rsbuild/core';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [
      pluginReactRouter({
        // Optional: Enable custom server mode
        customServer: false,
        // Optional: Specify server output format
        serverOutput: "commonjs",
        // Optional: enable experimental support for module federation
        federation: false
      }), 
      pluginReact()
    ],
  };
});
```

## Configuration

The plugin uses a two-part configuration system:

1. **Plugin Options** (in `rsbuild.config.ts`):
```ts
pluginReactRouter({
  /**
   * Whether to disable automatic middleware setup for custom server implementation.
   * Enable this when you want to handle server setup manually.
   * @default false
   */
  customServer?: boolean,

  /**
   * Specify the output format for server-side code.
   * Options: "commonjs" | "module"
   * @default "module"
   */
  serverOutput?: "commonjs" | "module"
  /**
   * Enable experimental support for module federation
   * @default false
   */
  federation?: boolean
})

When Module Federation is enabled, configure your Federation plugin with
`experiments.asyncStartup: true` to avoid requiring entrypoint `import()` hacks.
See the Module Federation examples under `examples/federation`.

When Module Federation is enabled, some runtimes may expose server build exports
as async getters. The dev server resolves these exports automatically. For
production, use a custom server or an adapter that resolves async exports before
passing the build to React Router's request handler.
```

2. **React Router Configuration** (in `react-router.config.*`):
```ts
import type { Config } from '@react-router/dev/config';

export default {
  /**
   * Whether to enable Server-Side Rendering (SSR) support.
   * @default true
   */
  ssr: true,

  /**
   * The file name for the server build output.
   * @default "index.js"
   */
  serverBuildFile: "index.js",

  /**
   * The output format for the server build.
   * Options: "esm" | "cjs"
   * @default "esm"
   */
  serverModuleFormat: "esm",

  /**
   * Split server bundles by route branch (advanced).
   */
  serverBundles: async ({ branch }) => branch[0]?.id ?? "main",

  /**
   * Hook called after the build completes.
   */
  buildEnd: async ({ buildManifest, reactRouterConfig }) => {
    console.log(buildManifest, reactRouterConfig);
  },

  /**
   * Build directory for output files
   * @default 'build'
   */
  buildDirectory: 'dist',

  /**
   * Application source directory
   * @default 'app'
   */
  appDirectory: 'app',

  /**
   * Base URL path
   * @default '/'
   */
  basename: '/my-app',
} satisfies Config;
```

All configuration options are optional and will use sensible defaults if not specified.

### Config File Resolution

The plugin will look for `react-router.config` with any supported JS/TS extension, in this order:

- `react-router.config.tsx`
- `react-router.config.ts`
- `react-router.config.mts`
- `react-router.config.jsx`
- `react-router.config.js`
- `react-router.config.mjs`

If none are found, it falls back to defaults.

### Framework Mode

React Router Framework Mode is implemented as a Vite plugin. This Rsbuild
plugin targets Data Mode only and does not support Framework Mode.

### FAQ

#### rsbuild-plugin-react-router vs ModernJS

This plugin is a lightweight adapter to run React Router on Rsbuild. It does
not aim to replace ModernJS or its higher-level framework features. If your
goal is a full framework or advanced microfrontend support, ModernJS may be
a better fit.

### SPA Mode (`ssr: false`)

React Router's SPA Mode still requires a build-time server render of the root route to generate a hydratable `index.html` (this is how the official React Router Vite plugin works).

When `ssr: false`:

- The plugin builds both `web` and `node` internally.
- It generates `build/client/index.html` by running the server build once (requesting `basename` with the `X-React-Router-SPA-Mode: yes` header).
- It removes `build/server` after generating `index.html`, so the output is deployable as static assets.

**Important:** In SPA mode, use `clientLoader` instead of `loader` for data loading since there's no server at runtime.

### Static Prerendering

For static sites with multiple pages, you can prerender specific routes at build time:

```ts
// react-router.config.ts
import type { Config } from '@react-router/dev/config';

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
} satisfies Config;
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
} satisfies Config;
```

For large sites, you can tune prerender concurrency:

```ts
export default {
  ssr: false,
  prerender: {
    paths: ['/','/about'],
    unstable_concurrency: 4,
  },
} satisfies Config;
```

### Default Configuration Values

If no configuration is provided, the following defaults will be used:

```ts
// Plugin defaults (rsbuild.config.ts)
{
  customServer: false
}

// Router defaults (react-router.config.ts)
{
  ssr: true,
  buildDirectory: 'build',
  appDirectory: 'app',
  basename: '/'
}
```

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
        customServer: true
      }), 
      pluginReact()
    ],
  };
});
```

When using a custom server, you'll need to:

1. Create a server handler (`server/index.ts`):
```ts
import { createRequestHandler } from '@react-router/express';

export const app = createRequestHandler({
  build: () => import('virtual/react-router/server-build'),
  getLoadContext() {
    // Add custom context available to your loaders/actions
    return {
      // ... your custom context
    };
  },
});
```

2. Set up your server entry point (`server.js`):
```js
import { createRsbuild, loadConfig } from '@rsbuild/core';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  if (isDev) {
    const config = await loadConfig();
    const rsbuild = await createRsbuild({
      rsbuildConfig: config.content,
    });
    const devServer = await rsbuild.createDevServer();
    app.use(devServer.middlewares);

    app.use(async (req, res, next) => {
      try {
        const bundle = await devServer.environments.node.loadBundle('app');
        await bundle.app(req, res, next);
      } catch (e) {
        next(e);
      }
    });

    const port = Number.parseInt(process.env.PORT || '3000', 10);
    const server = app.listen(port, () => {
      console.log(`Development server is running on http://localhost:${port}`);
      devServer.afterListen();
    });
    devServer.connectWebSocket({ server });
  } else {
    // Production mode
    app.use(express.static(path.join(__dirname, 'build/client'), {
      index: false
    }));

    // Load the server bundle
    const serverBundle = await import('./build/server/static/js/app.js');
    // Mount the server app after static file handling
    app.use(async (req, res, next) => {
      try {
        await serverBundle.default.app(req, res, next);
      } catch (e) {
        next(e);
      }
    });

    const port = Number.parseInt(process.env.PORT || '3000', 10);
    app.listen(port, () => {
      console.log(`Production server is running on http://localhost:${port}`);
    });
  }
}

startServer().catch(console.error);
```

3. Update your `package.json` scripts:
```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "rsbuild build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

The custom server setup allows you to:
- Add custom middleware
- Handle API routes
- Integrate with databases
- Implement custom authentication
- Add server-side caching
- And more!

## Cloudflare Workers Deployment

To deploy your React Router app to Cloudflare Workers:

1. **Configure Rsbuild** (`rsbuild.config.ts`):
```ts
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginReactRouter } from 'rsbuild-plugin-react-router';

export default defineConfig({
  environments: {
    node: {
      performance: {
        chunkSplit: { strategy: 'all-in-one' },
      },
      tools: {
        rspack: {
          experiments: { outputModule: true },
          externalsType: 'module',
          output: {
            chunkFormat: 'module',
            chunkLoading: 'import',
            workerChunkLoading: 'import',
            wasmLoading: 'fetch',
            library: { type: 'module' },
            module: true,
          },
          resolve: {
            conditionNames: ['workerd', 'worker', 'browser', 'import', 'require'],
          },
        },
      },
    },
  },
  plugins: [pluginReactRouter({customServer: true}), pluginReact()],
});
```

2. **Configure Wrangler** (`wrangler.toml`):
```toml
workers_dev = true
name = "my-react-router-worker"
compatibility_date = "2024-11-18"
main = "./build/server/static/js/app.js"
assets = { directory = "./build/client/" }

[vars]
VALUE_FROM_CLOUDFLARE = "Hello from Cloudflare"

# Optional build configuration
# [build]
# command = "npm run build"
# watch_dir = "app"
```

3. **Create Worker Entry** (`server/index.ts`):
```ts
import { createRequestHandler } from 'react-router';

declare global {
  interface CloudflareEnvironment extends Env {}
  interface ImportMeta {
    env: {
      MODE: string;
    };
  }
}

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: ExecutionContext;
    };
  }
}

// @ts-expect-error - virtual module provided by React Router at build time
import * as serverBuild from 'virtual/react-router/server-build';

const requestHandler = createRequestHandler(serverBuild, import.meta.env.MODE);

export default {
  fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
```

4. **Update Package Dependencies**:
```json
{
  "dependencies": {
    "@react-router/node": "^7.1.3",
    "@react-router/serve": "^7.1.3",
    "react-router": "^7.1.3"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241112.0",
    "@react-router/cloudflare": "^7.1.3",
    "@react-router/dev": "^7.1.3",
    "wrangler": "^3.106.0"
  }
}
```

5. **Setup Deployment Scripts** (`package.json`):
```json
{
  "scripts": {
    "build": "rsbuild build",
    "deploy": "npm run build && wrangler deploy",
    "dev": "rsbuild dev",
    "start": "wrangler dev"
  }
}
```

### Key Configuration Notes:

- The `workers_dev = true` setting enables deployment to workers.dev subdomain
- `main` points to your Worker's entry point in the build output
- `assets` directory specifies where your static client files are located
- Environment variables can be set in the `[vars]` section
- The `compatibility_date` should be kept up to date
- TypeScript types are provided via `@cloudflare/workers-types`
- Development can be done locally using `wrangler dev`
- Deployment is handled through `wrangler deploy`

### Development Workflow:

1. Local Development:
   ```bash
   # Start local development server
   npm run dev
   # or
   npm start
   ```

2. Production Deployment:
   ```bash
   # Build and deploy
   npm run deploy
   ```

## Development

The plugin automatically:
- Runs type generation during development and build
- Sets up development server with live reload
- Handles route-based code splitting
- Manages client and server builds

## React Router Framework Mode

React Router "Framework Mode" wraps Data Mode using a Vite plugin. This Rsbuild plugin currently targets React Router's Data Mode build/runtime model and does not implement the Vite plugin layer (type-safe href, route module splitting, etc.).

## Examples

The repository includes several examples demonstrating different use cases:

| Example | Description | Port | Command |
|---------|-------------|------|---------|
| [default-template](./examples/default-template) | Standard SSR setup with React Router | 3000 | `pnpm dev` |
| [spa-mode](./examples/spa-mode) | Single Page Application (`ssr: false`) | 3001 | `pnpm dev` |
| [prerender](./examples/prerender) | Static prerendering for multiple routes | 3002 | `pnpm dev` |
| [custom-node-server](./examples/custom-node-server) | Custom Express server with SSR | 3003 | `pnpm dev` |
| [cloudflare](./examples/cloudflare) | Cloudflare Workers deployment | 3004 | `pnpm dev` |
| [client-only](./examples/client-only) | `.client` modules with SSR hydration | 3010 | `pnpm dev` |
| [epic-stack](./examples/epic-stack) | Full-featured Epic Stack example | 3005 | `pnpm dev` |
| [federation/epic-stack](./examples/federation/epic-stack) | Module Federation host | 3006 | `pnpm dev` |
| [federation/epic-stack-remote](./examples/federation/epic-stack-remote) | Module Federation remote | 3007 | `pnpm dev` |

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
