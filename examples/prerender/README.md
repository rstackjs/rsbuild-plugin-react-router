# Static Prerendering Example

This example demonstrates using `rsbuild-plugin-react-router` with **static prerendering** to generate HTML files for specific routes at build time.

## What is Static Prerendering?

Static prerendering generates HTML files for specified routes at build time, enabling:

- **Faster initial page loads** - HTML is ready to serve immediately
- **Better SEO** - Search engines can index the prerendered content
- **Static hosting** - Deploy to any static hosting service
- **Hybrid approach** - Combine prerendering with client-side routing

## Configuration

Prerendering is configured in `react-router.config.ts`:

```typescript
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

### Prerender Options

- **Array of paths**: Explicitly list paths to prerender
- **`true`**: Automatically prerender all static routes (routes without params)
- **Object with paths**: `{ paths: [...], unstable_concurrency: 2 }`

## Build Output

After building, you'll have a static site with HTML files for each prerendered path:

```
build/
└── client/
    ├── index.html              # Prerendered /
    ├── about/
    │   └── index.html          # Prerendered /about
    ├── docs/
    │   ├── index.html          # Prerendered /docs
    │   ├── getting-started/
    │   │   └── index.html      # Prerendered /docs/getting-started
    │   └── advanced/
    │       └── index.html      # Prerendered /docs/advanced
    ├── projects/
    │   └── index.html          # Prerendered /projects
    └── static/
        ├── js/                 # JavaScript bundles
        └── css/                # CSS files
```

## How It Works

1. **Build time**: The plugin renders each specified path using the server build
2. **HTML generation**: Complete HTML with hydration data is saved for each path
3. **Server removal**: The server build is removed (since we're using `ssr: false`)
4. **Deployment**: The `build/client` directory can be deployed to any static host

## When to Use Prerendering

**Use prerendering when:**
- You have known, static routes (no dynamic params)
- SEO is important for those routes
- You want faster initial page loads
- You're deploying to static hosting

**Don't prerender:**
- Routes with dynamic parameters (`:id`, `*`)
- Routes that require real-time data
- Routes behind authentication

## Comparison: SPA vs Prerendering

| Feature | SPA Mode | Prerendering |
|---------|----------|--------------|
| `index.html` only | Yes | No |
| Multiple HTML files | No | Yes |
| SEO for all routes | Limited | Full |
| Initial load speed | Slower | Faster |
| Build time | Faster | Slower |

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

### Building

```bash
pnpm run build
```

### Serving the Build

```bash
pnpm run start
```

## Running E2E Tests

```bash
pnpm run test:e2e
```

Tests verify:
- HTML files generated for all prerender paths
- No server directory after build
- Prerendered HTML contains hydration data
- Client-side navigation works after hydration
- Browser history navigation works
- Non-prerendered routes fall back to client-side routing

---

Built with React Router and Rsbuild.
