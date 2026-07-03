import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("parent1/:parent1", "routes/parent1.tsx", [
    route("parent2/:parent2", "routes/parent2.tsx", [
      route("current", "routes/current.tsx")
    ])
  ])
] satisfies RouteConfig;