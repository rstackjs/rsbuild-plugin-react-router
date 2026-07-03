import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("outside/:id", "../node_modules/external_dependency/index.js"),
] satisfies RouteConfig;