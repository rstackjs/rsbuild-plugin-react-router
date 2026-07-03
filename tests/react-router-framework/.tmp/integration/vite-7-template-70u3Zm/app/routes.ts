import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("splat/*", "routes/splat.tsx")
] satisfies RouteConfig;