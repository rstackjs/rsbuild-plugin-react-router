import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("client-component/:id", "routes/client-component.tsx")
] satisfies RouteConfig;