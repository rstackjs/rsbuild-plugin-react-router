import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequestListener } from "@remix-run/node-fetch-server";
import express from "express";
import build from "./build/server/index.js";

const app = express();
const clientBuildDirectory = path.resolve("build/client");
const base = process.env.RSBUILD_BASE || "/";

const resolveClientBuildPath = (requestPath, ...segments) => {
  const candidatePath = path.resolve(
    clientBuildDirectory,
    `.${requestPath}`,
    ...segments,
  );
  if (
    candidatePath !== clientBuildDirectory &&
    !candidatePath.startsWith(`${clientBuildDirectory}${path.sep}`)
  ) {
    return undefined;
  }
  return candidatePath;
};

app.use(base, express.static(clientBuildDirectory, { index: false }));

// Serve prerendered documents, mirroring the Rsbuild RSC integration's
// preview server middleware (`<path>/index.html` written at build time).
app.use(base, async (req, res, next) => {
  try {
    const htmlFilePath = resolveClientBuildPath(req.path, "index.html");
    if (htmlFilePath && existsSync(htmlFilePath)) {
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
