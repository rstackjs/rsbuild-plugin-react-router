import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route(":lang.xml", "routes/param-with-ext.tsx"),
  route(":user?.pdf", "routes/optional-param-with-ext.tsx"),
] satisfies RouteConfig;