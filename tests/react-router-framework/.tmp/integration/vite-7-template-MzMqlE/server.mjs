import { createRequestHandler } from "@react-router/express";
import express from "express";

const port = process.env.PORT ?? 3000
const hmrPort = process.env.HMR_PORT ?? 3001

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.all("*", createRequestHandler({
    build: await import("./build/index.js"),
  }));
} else {
  throw new Error("Custom dev servers need an Rsbuild dev-server adapter");
}

app.listen(port, () => console.log('http://localhost:' + port));