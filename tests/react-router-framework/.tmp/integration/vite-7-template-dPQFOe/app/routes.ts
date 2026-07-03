import path from "node:path";
import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("optional-static/opt?", "routes/optional-static.tsx"),
  route("no-params", "routes/no-params.tsx"),
  route("required-param/:req", "routes/required-param.tsx"),
  route("optional-param/:opt?", "routes/optional-param.tsx"),
  route("/leading-and-trailing-slash/", "routes/leading-and-trailing-slash.tsx"),
  route("some-other-route", "routes/some-other-route.tsx"),
] satisfies RouteConfig;