
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
} else {
  throw new Error("Custom dev servers need an Rsbuild dev-server adapter");
}
app.use(express.static("build/client", { maxAge: "1h" }));



app.all(
  "*",
  createRequestHandler({
    build: await import("./build/server/static/js/app.js"),
  })
);

const port = 38477;
app.listen(port, () => console.log('http://localhost:' + port));
  