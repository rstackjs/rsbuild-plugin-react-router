import type { RouteConfig } from '@react-router/dev/routes';

// Kept separate so the dev-route-watch E2E covers route-config dependencies,
// not the direct reload-server watch on app/routes.ts.
export default [] satisfies RouteConfig;
