# RSC Mode Example

This example is a small React Router RSC Framework Mode app wired for `rsbuild-plugin-react-router`.

It includes:

- `pluginReactRouter({ rsc: true })` in `rsbuild.config.ts`
- RSC-safe React Router config without `splitRouteModules` or `subResourceIntegrity`
- A server-first index route using `ServerComponent`
- A loader that returns a React element rendered on the server
- A `"use client"` island mounted inside the server-first route
- A client-first route for soft navigation coverage
- A Playwright smoke test for dev and production mode

## Commands

```sh
pnpm run dev
pnpm run build
pnpm run test:e2e
```

## Notes

This example uses `react-server-dom-rspack` and `rsbuild-plugin-rsc` for a Rsbuild/Rspack-native RSC runtime.
