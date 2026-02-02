import type { RouteConfigEntry } from '@react-router/dev/routes';

export default [
  { path: '/', file: 'routes/index.tsx' },
  { path: 'client-only', file: 'routes/client-only.tsx' },
] satisfies RouteConfigEntry[];
