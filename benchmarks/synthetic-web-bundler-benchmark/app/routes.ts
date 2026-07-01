import { index, type RouteConfig } from "@react-router/dev/routes";
import { generatedRoutes } from "./generated/route-config";

export default [index("routes/home.tsx"), ...generatedRoutes] satisfies RouteConfig;
