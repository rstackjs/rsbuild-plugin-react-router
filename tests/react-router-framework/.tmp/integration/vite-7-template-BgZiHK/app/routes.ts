import { type RouteConfig, route, layout } from "@react-router/dev/routes";

export default [
  route("parent/:p", "routes/parent.tsx", [
    route("route/:r", "routes/route.tsx", [
      route("child1/:c1a/:c1b", "routes/child1.tsx"),
      route("child2/:c2a/:c2b", "routes/child2.tsx")
    ]),
  ]),
  layout("routes/layout.tsx", [
    route("in-layout1/:id", "routes/in-layout1.tsx"),
    route("in-layout2/:id/:other", "routes/in-layout2.tsx")
  ])
] satisfies RouteConfig;