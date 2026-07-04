import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequestListener } from "@remix-run/node-fetch-server";
import express from "express";
import build from "./build/server/index.js";

const app = express();
const clientBuildDirectory = "build/client";
const base = process.env.VITE_BASE || "/";

app.use(base, express.static(clientBuildDirectory, { index: false }));

// Serve prerendered documents, mirroring the React Router RSC Vite plugin's
// preview server middleware (`<path>/index.html` written at build time).
app.use(base, async (req, res, next) => {
  try {
    const htmlFileBase = (
      req.path +
      (req.path.endsWith("/") ? "" : "/") +
      "index.html"
    ).slice(1);
    const htmlFilePath = path.join(clientBuildDirectory, htmlFileBase);
    if (existsSync(htmlFilePath)) {
      res.setHeader("Content-Type", "text/html");
      res.end(await readFile(htmlFilePath, "utf-8"));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (_, res) => {
  res.status(404);
  res.send("Not Found");
});

// SPA fallback for `ssr: false` builds: serve the prerendered fallback shell
// (or its RSC payload) instead of hitting the server, mirroring the upstream
// preview server behavior.
app.use(base, async (req, res, next) => {
  try {
    const fallbackFilePath = path.join(
      clientBuildDirectory,
      req.path.endsWith(".rsc") ? "__spa-fallback.rsc" : "__spa-fallback.html",
    );
    if (existsSync(fallbackFilePath)) {
      res.statusCode = 404;
      res.setHeader(
        "Content-Type",
        req.path.endsWith(".rsc") ? "text/x-component" : "text/html",
      );
      res.end(await readFile(fallbackFilePath, "utf-8"));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
});

app.use(createRequestListener(build.fetch));

const port = process.env.PORT || 3000;
app.listen(port);
console.log(`Server listening on port ${port} (http://localhost:${port})`);
