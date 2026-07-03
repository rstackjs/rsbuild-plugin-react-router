import { type RouteConfig, route } from "@react-router/dev/routes";

const routes: RouteConfig = [];
if (import.meta.env.VITE_ENV_ROUTE === "dotenv") {
  routes.push(route("dotenv", "routes/dotenv.tsx"));
}

export default routes