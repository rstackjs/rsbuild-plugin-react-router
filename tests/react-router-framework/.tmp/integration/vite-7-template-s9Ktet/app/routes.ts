import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("products/:id", "routes/product.tsx")
] satisfies RouteConfig;