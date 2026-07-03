import { createRequestHandler } from "react-router";
export default createRequestHandler(
  () => import("virtual:react-router/server-build")
);