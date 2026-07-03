
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();
if (process.env.NODE_ENV !== "production") {
  throw new Error("Custom dev servers need an Rsbuild dev-server adapter");
}
app.use("/mybase/", express.static("build/client"));
app.all(
  "/notmybase/*",
  createRequestHandler({
    build: await import("./build/server/index.js"),
  })
);
app.get("*", (_req, res) => {
  res.setHeader("content-type", "text/html")
  res.end('React Router app is at <a href="/notmybase/">/notmybase/</a>');
});

const port = 38505;
app.listen(port, () => console.log('http://localhost:' + port));
    