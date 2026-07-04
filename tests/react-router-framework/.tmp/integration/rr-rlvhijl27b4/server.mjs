
import { createRequestListener } from "@remix-run/node-fetch-server";
import express from "express";

const app = express();
if (process.env.NODE_ENV === "production") {
  app.use("/mybase/", express.static("build/client"));
  app.all(
    "/mybase/dashboard/*",
    createRequestListener((await import("./build/server/index.js")).default.fetch),
  );
} else {
  throw new Error("Custom RSC dev servers need an Rsbuild dev-server adapter");
}
app.get("*", (_req, res) => {
  res.setHeader("content-type", "text/html")
  res.end('React Router app is at <a href="/mybase/dashboard/">/mybase/dashboard/</a>');
});

const port = 40683;
app.listen(port, () => console.log('http://localhost:' + port));
    