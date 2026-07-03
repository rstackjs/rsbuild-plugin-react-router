import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("server-component/:id", "routes/server-component.tsx")
] satisfies RouteConfig;