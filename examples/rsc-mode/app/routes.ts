import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('client', 'routes/client.tsx'),
] satisfies RouteConfig;
