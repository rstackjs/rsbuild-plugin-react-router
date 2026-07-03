import { createRequestListener } from "@remix-run/node-fetch-server";
import express from "express";

const port = process.env.PORT ?? 3000
const hmrPort = process.env.HMR_PORT ?? 3001

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
  app.all("*", createRequestListener((await import("./build/server/index.js")).default.fetch));
} else {
  throw new Error("Custom RSC dev servers need an Rsbuild dev-server adapter");
}

app.listen(port, () => console.log('http://localhost:' + port));