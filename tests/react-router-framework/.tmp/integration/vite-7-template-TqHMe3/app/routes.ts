import path from "node:path";
import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("absolute/:id", path.resolve(import.meta.dirname, "routes/absolute.tsx")),
] satisfies RouteConfig;