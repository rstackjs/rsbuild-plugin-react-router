import { type RouteConfig, route } from "@react-router/dev/routes"

export default [
  route("parent", "routes/parent.tsx", [
    route("current", "routes/current.tsx")
  ]),
  route("other", "routes/other.tsx"),
] satisfies RouteConfig