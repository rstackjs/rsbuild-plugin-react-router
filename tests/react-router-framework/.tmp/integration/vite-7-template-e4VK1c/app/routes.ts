import { type RouteConfig, route } from "@react-router/dev/routes";
export default [
  route("base/:base", "routes/base.tsx", [
    route("home/:home", "routes/route.tsx", { id: "home" }),
    route("changelog/:changelog", "routes/route.tsx", { id: "changelog" }),
    route("splat/*", "routes/route.tsx", { id: "splat" }),
  ]),
  route("other/:other", "routes/route.tsx", { id: "other" })
] satisfies RouteConfig;