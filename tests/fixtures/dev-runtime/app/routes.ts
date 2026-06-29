import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/index.tsx'),
  route('other', 'routes/other.tsx'),
] satisfies RouteConfig;
