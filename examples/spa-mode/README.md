# SPA Mode Example

This example demonstrates using `rsbuild-plugin-react-router` in **SPA (Single Page Application) mode** with `ssr: false`.

## What is SPA Mode?

SPA mode disables server-side rendering, generating a static `index.html` that can be deployed to any static hosting service like:

- Netlify
- Vercel (static)
- GitHub Pages
- AWS S3 + CloudFront
- Any static file server

## Features

- ⚡️ Client-side routing only
- 📦 Static build output (no server required)
- 🔄 Pre-rendered `index.html` with hydration data
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling

## Configuration

SPA mode is enabled in `react-router.config.ts`:

```typescript
import type { Config } from '@react-router/dev/config';

export default {
  ssr: false,
} satisfies Config;
```

## Key Differences from SSR Mode

1. **No server directory** - After build, only `build/client/` is generated
2. **Static index.html** - Pre-rendered HTML with embedded hydration data
3. **No manifest requests** - Route discovery is set to `initial` mode
4. **Client-side only** - All data loading happens in the browser

## Getting Started

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:3001`.

### Building for Production

Create a production build:

```bash
pnpm run build
```

This generates static files in `build/client/`:

```
build/
└── client/
    ├── index.html          # Pre-rendered entry point
    ├── static/
    │   ├── js/             # JavaScript bundles
    │   └── css/            # CSS files
    └── ...
```

### Serving the Build

Serve the static files locally:

```bash
pnpm run start
```

Or deploy the `build/client/` directory to any static hosting service.

## Running E2E Tests

The e2e tests verify SPA-specific behavior:

```bash
pnpm run test:e2e
```

Tests verify:
- ✅ `index.html` is generated with hydration data
- ✅ No server directory after build
- ✅ Client-side navigation works
- ✅ No `/__manifest` requests (route discovery is `initial`)
- ✅ Deep linking works
- ✅ Browser back/forward navigation works

## When to Use SPA Mode

Choose SPA mode when:
- You need static hosting only
- SEO is not a primary concern
- Initial page load time is acceptable
- You want simpler deployment

Choose SSR mode when:
- SEO is important
- You need faster initial page loads
- You have server-side data requirements

---

Built with ❤️ using React Router and Rsbuild.
