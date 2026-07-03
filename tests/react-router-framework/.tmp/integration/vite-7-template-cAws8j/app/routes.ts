import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("only-required/:id/:id", "routes/only-required.tsx"),
  route("only-optional/:id?/:id?", "routes/only-optional.tsx"),
  route("optional-then-required/:id?/:id", "routes/optional-then-required.tsx"),
  route("required-then-optional/:id/:id?", "routes/required-then-optional.tsx"),
] satisfies RouteConfig;